document.addEventListener('DOMContentLoaded', function () {
  function updateGauge(gaugeEl, value) {
    var min = Number(gaugeEl.getAttribute('data-min')) || 0;
    var max = Number(gaugeEl.getAttribute('data-max')) || 100;
    var clamped = Math.max(min, Math.min(max, value));
    var ratio = (clamped - min) / (max - min);
    var arc = gaugeEl.querySelector('.gauge-arc');
    var valText = gaugeEl.querySelector('.gauge-value');
    // Arc length for our half-circle path ~157
    var length = 157;
    var offset = length - length * ratio;
    if (arc) arc.style.strokeDashoffset = String(offset);
    if (valText) valText.textContent = String(clamped.toFixed(1));
  }

  function setLastUpdated() {
    var el = document.getElementById('last-updated');
    if (el) el.textContent = 'Last updated: ' + new Date().toLocaleTimeString();
  }

  function getApiUrl() {
    var base = document.body.getAttribute('data-api-base') || 'api/readings.php';
    // cache-bust to avoid any intermediate caching
    var sep = base.indexOf('?') === -1 ? '?' : '&';
    return base + sep + 't=' + Date.now();
  }

  async function fetchReadings() {
    const res = await fetch(getApiUrl(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch readings');
    return res.json();
  }

  async function refresh() {
    try {
      // If monitoring is active, the simulation loop controls UI; skip fetch overwrite
      if (monitorTimer) return;
      var data = await fetchReadings();
      // Charger override logic applies only when not monitoring
      var chargerToggle = document.getElementById('charger-toggle');
      var isPlugged = chargerToggle && chargerToggle.checked;
      if (isPlugged) {
        data.voltage = 9;
        data.current = 2;
        data.power = data.voltage * data.current;
      }
      document.querySelectorAll('.gauge').forEach(function (g) {
        var key = g.getAttribute('data-key');
        if (key && data[key] != null) updateGauge(g, Number(data[key]));
      });
      var p = document.getElementById('stat-power');
      if (p && data.power != null) p.textContent = String(Number(data.power).toFixed(1)) + ' W';
      setLastUpdated();
    } catch (e) {
      console.error(e);
      var el = document.getElementById('last-updated');
      if (el) el.textContent = 'Error updating: ' + (e && e.message ? e.message : 'unknown');
    }
  }

  var btn = document.getElementById('btn-refresh');
  if (btn) btn.addEventListener('click', refresh);

  // Monitoring control
  var monitorBtn = document.getElementById('btn-monitor');
  var stateLabel = document.getElementById('charger-state-label');
  var monitorTimer = null;
  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }
  function startMonitoring() {
    if (monitorTimer) return;
    // Simulate fluctuating readings within ranges
    var voltageGauge = document.querySelector('.gauge[data-key="voltage"]');
    var currentGauge = document.querySelector('.gauge[data-key="current"]');
    monitorTimer = setInterval(function () {
      var v = randomInRange(5, 11); // voltage range (V)
      var c = randomInRange(2, 8);  // current range (A)
      if (voltageGauge) updateGauge(voltageGauge, v);
      if (currentGauge) updateGauge(currentGauge, c);
      var p = document.getElementById('stat-power');
      if (p) p.textContent = (v * c).toFixed(1) + ' W';
      setLastUpdated();
    }, 1000);
    if (monitorBtn) monitorBtn.textContent = 'Stop Monitoring';
    if (stateLabel) stateLabel.textContent = 'Monitoring…';
  }
  function stopMonitoring() {
    if (monitorTimer) {
      clearInterval(monitorTimer);
      monitorTimer = null;
    }
    if (monitorBtn) monitorBtn.textContent = 'Start Monitoring';
    if (stateLabel) stateLabel.textContent = 'Stopped';
    // Immediately reflect 230V/10A as requested
    var voltageGauge = document.querySelector('.gauge[data-key="voltage"]');
    var currentGauge = document.querySelector('.gauge[data-key="current"]');
    if (voltageGauge) updateGauge(voltageGauge, 230);
    if (currentGauge) updateGauge(currentGauge, 10);
    var p = document.getElementById('stat-power');
    if (p) p.textContent = (230 * 10).toFixed(1) + ' W';
    var last = document.getElementById('last-updated');
    if (last) last.textContent = 'Stopped';
  }
  if (monitorBtn) {
    monitorBtn.addEventListener('click', function () {
      if (monitorTimer) {
        stopMonitoring();
      } else {
        startMonitoring();
      }
    });
  }

  // keep the label reactive to manual toggling
  var chargerToggle = document.getElementById('charger-toggle');
  if (chargerToggle) chargerToggle.addEventListener('change', refresh);

  // Track energy consumption
  var totalEnergyWh = 0;
  var lastUpdateTime = Date.now();
  var lastPowerW = 0;
  var startTime = Date.now();
  var lastRefreshTime = Date.now();
  var displayEnergyWh = 0; // For smooth incremental display
  var displayPowerW = 0;   // For smooth incremental display
  var refreshInterval = null; // For smooth updates

  // Function to update the energy consumption
  function updateConsumptionSummary() {
    var now = Date.now();
    var elapsedHours = (now - lastUpdateTime) / (1000 * 60 * 60); // Convert ms to hours
    
    // Get current power reading from gauges
    var voltageText = document.querySelector('.gauge[data-key="voltage"] .gauge-value');
    var currentText = document.querySelector('.gauge[data-key="current"] .gauge-value');
    var v = voltageText ? parseFloat(voltageText.textContent) : 0;
    var c = currentText ? parseFloat(currentText.textContent) : 0;
    
    // Calculate current power in watts
    var currentPowerW = v * c;
    
    // If this is a manual refresh, add the energy consumed since last refresh
    if (now - lastRefreshTime < 2000) { // If refresh was within last 2 seconds
      if (currentPowerW > 0 && elapsedHours > 0) {
        totalEnergyWh += currentPowerW * elapsedHours;
      }
      lastRefreshTime = now;
    }
    
    // Update last power reading
    lastPowerW = currentPowerW;
    lastUpdateTime = now;
    
    var totalKWh = totalEnergyWh / 1000; // Convert to kWh
    
    // Calculate daily and monthly projections based on current rate
    var hoursRunning = (now - startTime) / (1000 * 60 * 60);
    var dailyKWh = hoursRunning > 0 ? (totalKWh / hoursRunning) * 24 : 0;
    var monthlyKWh = dailyKWh * 30;
    // Indian slab demo (change to match local DISCOM):
    // 0-100 kWh @ ₹3.00, next 100 @ ₹4.50, next 100 @ ₹6.50, >300 @ ₹7.50
    var slabs = [
      { upto: 100, rate: 3.0 },
      { upto: 200, rate: 4.5 },
      { upto: 300, rate: 6.5 },
      { upto: Infinity, rate: 7.5 }
    ];
    var remaining = monthlyKWh;
    var lastUpto = 0;
    var total = 0;
    var rowsHtml = '';
    for (var i = 0; i < slabs.length && remaining > 0.0001; i++) {
      var slab = slabs[i];
      var span = Math.min(remaining, (slab.upto === Infinity ? remaining : slab.upto - lastUpto));
      var amount = span * slab.rate;
      total += amount;
      rowsHtml += '<tr>' +
        '<td style="padding:8px;">' + (lastUpto + 1) + '-' + (slab.upto === Infinity ? '∞' : slab.upto) + '</td>' +
        '<td style="text-align:right; padding:8px;">' + span.toFixed(3) + '</td>' +
        '<td style="text-align:right; padding:8px;">₹' + slab.rate.toFixed(2) + '</td>' +
        '<td style="text-align:right; padding:8px;">₹' + amount.toFixed(2) + '</td>' +
      '</tr>';
      remaining -= span;
      lastUpto = slab.upto === Infinity ? lastUpto + span : slab.upto;
    }
    var cost = total;
    var elPower = document.getElementById('detail-power');
    var elDaily = document.getElementById('detail-daily');
    var elMonthly = document.getElementById('detail-monthly');
    var elCost = document.getElementById('consumption-cost');
    var elKwh = document.getElementById('consumption-kwh');
    
    if (elPower) elPower.textContent = currentPowerW.toFixed(1) + ' W';
    if (elDaily) elDaily.textContent = dailyKWh.toFixed(3) + ' kWh';
    if (elMonthly) elMonthly.textContent = monthlyKWh.toFixed(3) + ' kWh';
    if (elKwh) elKwh.textContent = totalKWh.toFixed(3);
    if (elCost) elCost.textContent = cost.toFixed(2);
    var rateEl = document.getElementById('unit-rate');
    if (rateEl) rateEl.textContent = (monthlyKWh > 0 ? (cost / monthlyKWh) : 0).toFixed(2);
    var rowsEl = document.getElementById('tariff-rows');
    if (rowsEl) rowsEl.innerHTML = rowsHtml || '<tr><td style="padding:8px;">0-100</td><td style="text-align:right; padding:8px;">0.000</td><td style="text-align:right; padding:8px;">₹3.00</td><td style="text-align:right; padding:8px;">₹0.00</td></tr>';
    var tUnitsEl = document.getElementById('tariff-total-units');
    if (tUnitsEl) tUnitsEl.textContent = monthlyKWh.toFixed(3);
    var tEl = document.getElementById('tariff-total');
    if (tEl) tEl.textContent = cost.toFixed(2);
  }
  // Initialize consumption tracking
  function initConsumptionTracking() {
    // Initialize tracking variables
    totalEnergyWh = 0;
    displayEnergyWh = 0;
    displayPowerW = 0;
    startTime = Date.now();
    lastUpdateTime = Date.now();
    lastRefreshTime = Date.now();
    lastPowerW = 0;
    
    // Get initial power reading
    var voltageText = document.querySelector('.gauge[data-key="voltage"] .gauge-value');
    var currentText = document.querySelector('.gauge[data-key="current"] .gauge-value');
    var v = voltageText ? parseFloat(voltageText.textContent) : 0;
    var c = currentText ? parseFloat(currentText.textContent) : 0;
    lastPowerW = v * c;
    displayPowerW = lastPowerW;
    
    // Initial update
    updateConsumptionSummary();
    updateDisplay();
    
    // Start auto-update if not already running
    if (!refreshInterval) {
      startAutoUpdate();
    }
  }
  
  // Function to update the display elements
  function updateDisplay() {
    var elPower = document.getElementById('current-power');
    var elKwh = document.getElementById('total-kwh');
    
    // Update power display
    if (elPower) elPower.textContent = lastPowerW.toFixed(1) + ' W';
    
    // Update energy display (in kWh with 3 decimal places)
    if (elKwh) elKwh.textContent = (totalEnergyWh / 1000).toFixed(3);
    
    // Update the projection elements (daily and monthly)
    var elDaily = document.getElementById('daily-consumption');
    var elMonthly = document.getElementById('monthly-consumption');
    
    // Calculate daily and monthly projections based on current power
    if (elDaily) elDaily.textContent = (lastPowerW * 24 / 1000).toFixed(3) + ' kWh';
    if (elMonthly) elMonthly.textContent = (lastPowerW * 24 * 30 / 1000).toFixed(3) + ' kWh';
    
    // Update the tariff information
    updateTariffInfo();
  }

  // Handle consumption view toggle
  var btnBack = document.getElementById('btn-back-dashboard');
  var btnViewConsumption = document.getElementById('view-consumption');
  
  if (btnViewConsumption) {
    btnViewConsumption.addEventListener('click', function(e) {
      e.preventDefault();
      document.getElementById('dashboard').style.display = 'none';
      document.getElementById('consumption').style.display = 'block';
      initConsumptionTracking();
    });
  }
  
  if (btnBack) {
    btnBack.addEventListener('click', function() {
      document.getElementById('dashboard').style.display = 'block';
      document.getElementById('consumption').style.display = 'none';
    });
  }

  // Add refresh button for consumption view
  var btnRefreshConsumption = document.createElement('button');
  btnRefreshConsumption.className = 'btn btn-ghost';
  btnRefreshConsumption.id = 'btn-refresh-consumption';
  btnRefreshConsumption.textContent = 'Refresh';
  
  // Function to update power values only (no auto-increment of energy)
  function updateConsumptionValues() {
    var voltageText = document.querySelector('.gauge[data-key="voltage"] .gauge-value');
    var currentText = document.querySelector('.gauge[data-key="current"] .gauge-value');
    var v = voltageText ? parseFloat(voltageText.textContent) : 0;
    var c = currentText ? parseFloat(currentText.textContent) : 0;
    
    // Update power reading only
    lastPowerW = v * c;
    lastUpdateTime = Date.now();
    
    // Update the display
    updateDisplay();
  }
  
  // Disable auto-update since we're doing manual increments now
  function startAutoUpdate() {
    // Auto-update is disabled for manual increment mode
    // This function is kept for compatibility but does nothing
  }
  
  // Handle refresh button click
  btnRefreshConsumption.addEventListener('click', function() {
    // Increment the energy by 0.001 kWh (1 Wh) on each refresh
    totalEnergyWh += 1; // Add 1 Wh (0.001 kWh)
    
    // Update the display with the new value
    updateDisplay();
    
    // Show a brief visual feedback
    var originalText = btnRefreshConsumption.textContent;
    btnRefreshConsumption.textContent = 'Updated!';
    btnRefreshConsumption.disabled = true;
    
    // Reset the button after a short delay
    setTimeout(function() {
      btnRefreshConsumption.textContent = originalText;
      btnRefreshConsumption.disabled = false;
    }, 1000);
  });
  
  // Start auto-update when the page loads
  startAutoUpdate();
  
  var consumptionToolbar = document.querySelector('#consumption .dash-toolbar');
  if (consumptionToolbar) {
    consumptionToolbar.insertBefore(btnRefreshConsumption, consumptionToolbar.firstChild);
  }

  // Initialize the consumption summary when the page loads
  document.addEventListener('consumption:refresh', updateConsumptionSummary);

  // Initial one-time refresh
  refresh();

  // Refresh when tab becomes visible again
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) refresh();
  });
});


