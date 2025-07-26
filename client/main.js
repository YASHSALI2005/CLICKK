const { app, BrowserWindow } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  // Option A: Load your hosted landing page
  win.loadURL("http://localhost:3000"); // your React app or production link

  // Option B: Load local HTML (if you have index.html)
  // win.loadFile("index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
