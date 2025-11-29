// ExtensionsPanel.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";

/**
 * Minimal extension host + UI:
 * - Downloads VSIX from Open VSX (or any URL that returns .vsix)
 * - Extracts package.json to find browser/main entry
 * - Loads extension JS into a sandboxed Web Worker
 * - Provides a tiny host API (commands/registerCommand, window.showMessage, editor API)
 *
 * Install dependency:
 *   npm install jszip
 *
 * Limitations:
 * - Extensions must include a browser-compatible JS file (UMD/IIFE) that attaches export
 *   by setting `exports.activate = function(context) { ... }` OR define `activate` in top-level.
 * - Many official vscode extensions will NOT work until you provide browser builds for them.
 */

export default function ExtensionsPanel({ editorApi }) {
  // editorApi is optional: an object your main editor uses to perform commands/actions
  // e.g. editorApi = { getText: () => "...", setText: (txt) => {}, openFile: (path)=>{} }
  // If not provided, the host's editor.* commands will no-op.

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [offset, setOffset] = useState(0);
  const [pageSize] = useState(20);
  const abortRef = useRef(null);

  // installed extensions meta (persisted)
  const [installed, setInstalled] = useState(() => {
    try {
      const raw = localStorage.getItem("clickk.installedExtensions");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // worker & command registry
  const workerRef = useRef(null);
  const commandsRef = useRef({}); // { commandId: (args) => {} }

  // create worker (only once)
  useEffect(() => {
    // build worker code
    const workerCode = `
      // simple extension host in worker
      const extensions = {}; // id -> { exports, manifest, active }
      const commands = {}; // commandId -> handler

      // Host API exposed to extension activate()
      function makeContext(extId) {
        return {
          subscriptions: [],
          commands: {
            registerCommand(id, handler) {
              commands[id] = handler;
              return { dispose: () => { delete commands[id]; } };
            }
          },
          window: {
            showInformationMessage: (msg) => {
              postMessage({ type: 'host:showMessage', level: 'info', message: msg });
            },
            showErrorMessage: (msg) => {
              postMessage({ type: 'host:showMessage', level: 'error', message: msg });
            }
          },
          editor: {
            // pass-through editor methods (main thread should implement)
            invoke: (cmd, ...args) => {
              postMessage({ type: 'host:invokeEditor', command: cmd, args });
            }
          }
        };
      }

      // Utility: evaluate JS string as module that populates 'exports' object.
      function evaluateModule(code) {
        const exports = {};
        try {
          // Provide a UMD-style wrapper environment if extension expects 'exports' global
          
          const wrapper = new Function('exports', code);
          wrapper(exports);
        } catch(e) {
          // Try direct eval fallback (not ideal)
          try {
            eval(code);
            // If the extension attached to self.activate or exports.activate, capture it:
            if (typeof self.activate === 'function') {
              return { activate: self.activate, deactivate: self.deactivate };
            }
            return { exports: null, error: 'eval failed to produce exports' };
          } catch (ee) {
            return { error: ee.message || String(ee) };
          }
        }
        return exports;
      }

      onmessage = async (ev) => {
        const { type, payload } = ev.data || {};
        if (type === 'load-extension') {
          const { id, manifest, codeUrl } = payload;
          // fetch code (blob) by codeUrl
          try {
            const res = await fetch(codeUrl);
            const code = await res.text();
            const module = evaluateModule(code);
            let activateFn = module.activate || (module.exports && module.exports.activate) || null;
            let deactivateFn = module.deactivate || (module.exports && module.exports.deactivate) || null;

            if (!activateFn) {
              // sometimes extension attaches to exports.activate after wrapper; try exports property
              const exportsObj = module.exports || module;
              activateFn = exportsObj.activate || null;
              deactivateFn = exportsObj.deactivate || null;
            }

            if (!activateFn) {
              postMessage({ type: 'load-error', id, message: 'Extension has no activate()' });
              return;
            }

            const context = makeContext(id);
            // call activate (catch errors)
            try {
              await activateFn(context);
              extensions[id] = { manifest, active: true, deactivate: deactivateFn || null };
              postMessage({ type: 'loaded', id, manifest });
            } catch (e) {
              postMessage({ type: 'load-error', id, message: e && e.message ? e.message : String(e) });
            }
          } catch (e) {
            postMessage({ type: 'load-error', id, message: e && e.message ? e.message : String(e) });
          }
        }

        if (type === 'invoke-command') {
          const { commandId, args } = payload;
          try {
            const fn = commands[commandId];
            if (fn) {
              const result = await fn(...(args || []));
              postMessage({ type: 'command-result', commandId, result });
            } else {
              postMessage({ type: 'command-not-found', commandId });
            }
          } catch (e) {
            postMessage({ type:'command-error', commandId, message: e && e.message ? e.message : String(e) });
          }
        }
      };
    `;

    const blob = new Blob([workerCode], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const w = new Worker(url);
    workerRef.current = w;

    w.onmessage = (ev) => {
      const { type } = ev.data || {};
      if (type === "host:showMessage") {
        const { level, message } = ev.data;
        // bubble to UI - we simply use alert for demo; main app can do real notifications
        if (level === "error") {
          // you may replace with your app's notification system
          console.error("[extension] error:", message);
          // forward as toast by dispatching a custom event
          window.dispatchEvent(new CustomEvent("clickk:extensionMessage", { detail: { level, message } }));
        } else {
          window.dispatchEvent(new CustomEvent("clickk:extensionMessage", { detail: { level, message } }));
        }
      } else if (type === "host:invokeEditor") {
        const { command, args } = ev.data;
        // forward to editorApi if present
        if (editorApi && typeof editorApi[command] === "function") {
          try {
            editorApi[command](...(args || []));
          } catch (e) { console.error("editorApi invocation failed", e); }
        } else {
          // else emit event for host app
          window.dispatchEvent(new CustomEvent("clickk:extensionEditorInvoke", { detail: { command, args } }));
        }
      } else if (type === "loaded") {
        // extension loaded
        const { id, manifest } = ev.data;
        // main thread can keep record if needed
        postMessageMain({ type: "loaded", id, manifest });
      } else if (type === "load-error") {
        postMessageMain(ev.data);
      } else if (type === "command-result" || type === "command-not-found" || type === "command-error") {
        postMessageMain(ev.data);
      }
    };

    function postMessageMain(msg) {
      // pass through back to main thread by forwarding to `onmessage` handler that created the worker
      // (we already are in worker; to signal main thread we call postMessage)
      postMessage(msg);
    }

    // notify main thread that worker is ready (optional)
    postMessage({ type: "worker-ready" });

    // keep reference URL alive? not needed; browser GC is fine
    return () => {
      w.terminate();
      URL.revokeObjectURL(url);
    };
  }, [editorApi]);

  // handle messages from worker (main thread side)
  useEffect(() => {
    const w = workerRef.current;
    if (!w) return;
    w.onmessage = (ev) => {
      const data = ev.data || {};
      const { type } = data;
      if (type === "worker-ready") {
        // no-op
      } else if (type === "loaded") {
        // persist installed extension as 'active'
        const { id, manifest } = data;
        setInstalled((prev) => {
          const exists = prev.find((p) => p.id === id);
          const result = exists ? prev.map(p => p.id === id ? { ...p, enabled: true, manifest } : p) : [...prev, { id, manifest, enabled: true }];
          localStorage.setItem("clickk.installedExtensions", JSON.stringify(result));
          return result;
        });
      } else if (type === "load-error") {
        alert("Extension load failed: " + (data.message || "unknown"));
      } else if (type === "command-result") {
        // optionally show result
        console.log("command-result", data);
      } else if (type === "command-not-found") {
        console.warn("command not found:", data.commandId);
      } else if (type === "command-error") {
        console.error("command error:", data);
      } else if (type === "host:showMessage") {
        // worker forwarded showMessage - handled above if desired
      }
    };
  }, []);

  // Utility: search Open VSX (as before)
  const fetchSearch = async (q, off) => {
    try {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ q, offset: String(off), size: String(pageSize) });
      const res = await fetch(`/api/extensions/search?${params.toString()}`, {
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (Array.isArray(data && data.extensions) ? data.extensions : []);
      setResults(arr);
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message || "Failed to search");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchSearch(query.trim(), offset), 250);
    return () => clearTimeout(t);
  }, [query, offset]);

  // helper: find browser entry in zip
  async function findBrowserEntry(zip) {
    // common locations: package.json at root inside extension folder
    // look for any package.json file, parse it, then prefer browser/main field
    const files = Object.keys(zip.files);
    for (const path of files) {
      if (path.endsWith("package.json")) {
        try {
          const txt = await zip.file(path).async("string");
          const pkg = JSON.parse(txt);
          // prefer 'browser' field then 'main'
          const entry = pkg.browser || pkg.main || pkg["js"] || null;
          if (entry) {
            // entry path is relative to package.json directory
            const dir = path.slice(0, path.lastIndexOf("/") + 1);
            const entryPath = dir + entry.replace(/^\.\//, "");
            if (zip.file(entryPath)) return { entryPath, pkg, packageJsonPath: path };
          } else {
            // fallback: look for any .js in same dir named like 'extension.js' or 'index.js'
            const dir = path.slice(0, path.lastIndexOf("/") + 1);
            const candidates = ["extension.js", "index.js", "main.js"];
            for (const c of candidates) {
              if (zip.file(dir + c)) return { entryPath: dir + c, pkg, packageJsonPath: path };
            }
          }
        } catch (e) {
          // ignore parse errors and continue
        }
      }
    }
    // final fallback: find any top-level *.js file
    const jsCandidates = files.filter(f => f.endsWith(".js") && !f.includes("__MACOSX"));
    if (jsCandidates.length) {
      return { entryPath: jsCandidates[0], pkg: {}, packageJsonPath: null };
    }
    return null;
  }

  // Download and install extension: returns id (namespace.name) or throws
  const installExtension = async (namespace, name) => {
    setLoading(true);
    try {
      // Open VSX: download URL can be derived from search result; for serverless demo we'll call your backend route
      // Backend should proxy Open VSX to avoid CORS. This component expects `/api/extensions/download?namespace=...&name=...` to return .vsix content
      const params = new URLSearchParams({ namespace, name });
      const res = await fetch(`/api/extensions/download?${params.toString()}`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      const found = await findBrowserEntry(zip);
      if (!found) throw new Error("No browser-compatible entry found in package");
      const entryText = await zip.file(found.entryPath).async("string");

      // create blob url for the JS content
      const codeBlob = new Blob([entryText], { type: "text/javascript" });
      const codeUrl = URL.createObjectURL(codeBlob);

      // determine id from namespace/name
      const id = `${namespace}.${name}`;

      // read package.json if exists
      let manifest = {};
      if (found.packageJsonPath) {
        try {
          manifest = JSON.parse(await zip.file(found.packageJsonPath).async("string"));
        } catch {}
      } else {
        manifest = { name, displayName: name, publisher: namespace };
      }

      // persist a minimal installed record
      const installedRecord = { id, namespace, name, manifest, codeUrl, enabled: true };
      const next = installed.concat([installedRecord]);
      setInstalled(next);
      localStorage.setItem("clickk.installedExtensions", JSON.stringify(next));

      // send to worker to load and activate
      if (workerRef.current) {
        workerRef.current.postMessage({ type: "load-extension", payload: { id, manifest, codeUrl } });
      }

      return id;
    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const onInstall = async (ns, name) => {
    try {
      await installExtension(ns, name);
      alert("Installed (if package included a browser entry). Check console for messages.");
    } catch (e) {
      alert("Install failed: " + (e.message || String(e)));
    }
  };

  // invoke a command registered by any extension via the worker
  const invokeCommand = (commandId, ...args) => {
    if (!workerRef.current) return;
    workerRef.current.postMessage({ type: "invoke-command", payload: { commandId, args } });
  };

  // Show installed list UI
  const pageBack = () => setOffset((o) => Math.max(0, o - pageSize));
  const pageNext = () => setOffset((o) => o + pageSize);

  const items = useMemo(
    () =>
      (Array.isArray(results) ? results : []).map((r) => ({
        key: `${r.namespace}.${r.name}`,
        name: r.displayName || r.name,
        namespace: r.namespace,
        extName: r.name,
        version: r.version,
        description: r.description || "",
        downloads: r.downloadCount || 0,
        rating: r.averageRating || 0,
        publisher: r.namespace,
      })),
    [results]
  );

  // uninstall extension (remove from storage + tell worker to deactivate if needed)
  const uninstall = (id) => {
    if (!confirm("Uninstall " + id + "?")) return;
    const next = installed.filter((i) => i.id !== id);
    setInstalled(next);
    localStorage.setItem("clickk.installedExtensions", JSON.stringify(next));
    // TODO: tell worker to run deactivate (not implemented in worker above for brevity)
    alert("Uninstalled locally. Reload to fully unload extension in this demo.");
  };

  // basic UI
  const rootRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const isNarrow = containerWidth > 0 && containerWidth < 520;

  useEffect(() => {
    if (!rootRef.current) return;
    const el = rootRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cw = Math.floor(entry.contentRect.width || 0);
        setContainerWidth(cw);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={rootRef} style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", minWidth: 0 }}>
      <div style={{ padding: "0 12px 8px 12px" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setOffset(0);
            setQuery(e.target.value);
          }}
          placeholder="Search extensions (Open VSX)…"
          style={{ width: "100%", padding: "6px", borderRadius: 4, border: "1px solid #333", background: "#23272e", color: "#fff" }}
        />
      </div>

      <div style={{ padding: "0 12px", display: "flex", gap: 12, flexDirection: isNarrow ? 'column' : 'row', minWidth: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading && <div style={{ color: "#8aa" }}>Loading…</div>}
          {error && <div style={{ color: "#e57373" }}>{error}</div>}

          <ul className="file-list" style={{ padding: 0, minWidth: 0 }}>
            {items.map((ext) => (
              <li key={ext.key} className="file-item" style={{ alignItems: "flex-start", listStyle: "none", padding: 8, borderBottom: "1px solid #2e2e33" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minWidth: 0 }}>
                    <span style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ext.name}</span>
                    <span style={{ color: "#8aa", fontSize: 12 }}>v{ext.version}</span>
                  </div>
                  <span style={{ color: "#8aa", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>by {ext.publisher}</span>
                  <span style={{ color: "#bcd", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", display: '-webkit-box', WebkitLineClamp: isNarrow ? 2 : 3, WebkitBoxOrient: 'vertical' }}>{ext.description}</span>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6, minWidth: 0 }}>
                    <span style={{ color: "#9ab", fontSize: 12 }}>{ext.downloads.toLocaleString()} installs</span>
                    <span style={{ color: "#9ab", fontSize: 12 }}>★ {ext.rating.toFixed(1)}</span>
                    <div style={{ flex: 1 }}></div>
                    <button
                      onClick={() => onInstall(ext.namespace, ext.extName)}
                      style={{ background: "#22b77f", color: "#fff", border: "1px solid #22b77f", borderRadius: 4, padding: isNarrow ? "4px 8px" : "6px 12px", cursor: "pointer", fontWeight: 700, flexShrink: 0 }}
                    >
                      Install
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px" }}>
            <button
              onClick={pageBack}
              disabled={offset === 0}
              style={{ background: "transparent", color: "#bdbdbd", border: "1px solid #3e3e42", borderRadius: 4, padding: "4px 10px", cursor: "pointer" }}
            >
              Previous
            </button>
            <span style={{ color: "#8aa", fontSize: 12 }}>Results {offset + 1} - {offset + items.length}</span>
            <button
              onClick={pageNext}
              disabled={items.length < pageSize}
              style={{ background: "transparent", color: "#bdbdbd", border: "1px solid #3e3e42", borderRadius: 4, padding: "4px 10px", cursor: "pointer" }}
            >
              Next
            </button>
          </div>
        </div>

        <aside style={{ width: isNarrow ? '100%' : Math.min(320, Math.max(220, Math.floor(containerWidth * 0.4))) + 'px', paddingLeft: isNarrow ? 0 : 12, borderLeft: isNarrow ? 'none' : "1px solid #2e2e33" }}>
          <h4 style={{ margin: "0 0 8px 0" }}>Installed</h4>
          <div style={{ maxHeight: 360, overflow: "auto" }}>
            {installed.length === 0 && <div style={{ color: "#888" }}>No extensions installed</div>}
            {installed.map((it) => (
              <div key={it.id} style={{ border: "1px solid #2c2c30", padding: 8, borderRadius: 6, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{it.manifest.displayName || it.manifest.name || it.id}</div>
                    <div style={{ fontSize: 12, color: "#8aa" }}>{it.manifest.publisher || it.namespace}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => invokeCommand(`${it.id}.exampleCommand`)}
                      style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #444", background: "transparent", color: "#ddd", cursor: "pointer" }}
                    >
                      Run
                    </button>
                    <button onClick={() => uninstall(it.id)} style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #a44", background: "transparent", color: "#f88", cursor: "pointer" }}>
                      Uninstall
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 6 }}>{it.manifest.description || ""}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
