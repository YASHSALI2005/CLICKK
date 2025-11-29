<?php
// Simple contact form handler
$formSubmitted = false;
$formError = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $message = trim($_POST['message'] ?? '');

    if ($name === '' || $email === '' || $message === '') {
        $formError = 'Please fill out all required fields.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $formError = 'Please enter a valid email address.';
    } else {
        // In a real app, send email or save to DB here
        $formSubmitted = true;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>IoT Dashboard</title>
    <meta name="description" content="A sleek, responsive landing page built with PHP, HTML, CSS, and JS." />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/styles.css?v=<?php echo urlencode((string)filemtime(__DIR__ . '/assets/css/styles.css')); ?>">
</head>
<body data-api-base="http://10.167.20.71/readings">
        <header class="site-header">
        <div class="container nav-container">
            <a class="brand" href="#home" aria-label="Home">
                <span class="brand-mark">◼</span>
                <span class="brand-text">IOT ENERGY METER</span>
            </a>
            <nav class="primary-nav" aria-label="Primary">
                <button class="hamburger" aria-expanded="false" aria-controls="nav-menu" aria-label="Toggle navigation">
                    <span></span><span></span><span></span>
                </button>
                <ul id="nav-menu">
                    <li><a href="#" id="view-consumption">Energy Consumption</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main id="home">
        <section id="dashboard" class="section section-alt">
            <div class="container">
                <header class="section-header">
                    <h2>Live IoT Dashboard</h2>
                    <p>Voltage, Current, and Power with auto-refresh.</p>
                </header>
                <div class="dash-grid">
                    <div class="card">
                        <h3 class="card-title">Voltage</h3>
                        <div class="gauge" data-min="0" data-max="260" data-unit="V" data-key="voltage">
                            <svg viewBox="0 0 120 70" class="gauge-svg" aria-label="Voltage gauge">
                                <path class="gauge-track" d="M10 60 A50 50 0 1 1 110 60" />
                                <path class="gauge-arc" d="M10 60 A50 50 0 1 1 110 60" />
                                <text x="60" y="58" class="gauge-value">0</text>
                                <text x="60" y="68" class="gauge-unit">V</text>
                            </svg>
                        </div>
                    </div>
                    <div class="card">
                        <h3 class="card-title">Current</h3>
                        <div class="gauge" data-min="0" data-max="30" data-unit="A" data-key="current">
                            <svg viewBox="0 0 120 70" class="gauge-svg" aria-label="Current gauge">
                                <path class="gauge-track" d="M10 60 A50 50 0 1 1 110 60" />
                                <path class="gauge-arc" d="M10 60 A50 50 0 1 1 110 60" />
                                <text x="60" y="58" class="gauge-value">0</text>
                                <text x="60" y="68" class="gauge-unit">A</text>
                            </svg>
                        </div>
                    </div>
                    <div class="card">
                        <h3 class="card-title">Power</h3>
                        <div class="stat">
                            <div class="stat-value" id="stat-power">0 W</div>
                            <div class="stat-sub">P = V × I</div>
                        </div>
                    </div>
                </div>
                <div class="dash-toolbar">
                    <button class="btn btn-ghost" id="btn-refresh" type="button">Refresh</button>
                    <button class="btn" id="btn-monitor" type="button">Start Monitoring</button>
                    <span class="muted" id="last-updated" aria-live="polite"></span>
                    <!-- <div class="spacer"></div> -->
                    <!-- <label class="switch" title="Toggle charger plug state">
                        <input type="checkbox" id="charger-toggle" />
                        <span class="slider"></span>
                    </label> -->
                    <!-- <span class="muted" id="charger-state-label">Stopped</span> -->
                </div>
            </div>
        </section>
        <!-- Electricity Consumption / Bill-like view -->
        <section id="consumption" class="section" style="display:none;">
            <div class="container">
                <header class="section-header">
                    <h2>Electricity Consumption For Single Device</h2>
                    <p>Bill-style summary based on current readings.</p>
                </header>
                <div class="dash-grid">
                    <div class="card">
                        <h3 class="card-title">Summary</h3>
                        <div class="stat">
                            <div class="stat-value" id="summary-amount">₹<span id="consumption-cost">0.00</span></div>
                            <div class="stat-sub">Estimated monthly cost (INR)</div>
                        </div>
                    </div>
                    <div class="card">
                        <h3 class="card-title">Today's Usage</h3>
                        <div class="stat">
                            <div class="stat-value"><span id="consumption-kwh">0.000</span> kWh</div>
                            <div class="stat-sub" id="billing-period">effective rate ₹<span id="unit-rate">0.00</span> per kWh</div>
                        </div>
                    </div>
                    <div class="card">
                        <h3 class="card-title">Details</h3>
                        <div class="table like-bill">
                            <div class="row"><div>Latest meter power</div><div id="detail-power">0 W</div></div>
                            <div class="row"><div>Assumed daily energy</div><div id="detail-daily">0.000 kWh</div></div>
                            <div class="row"><div>Assumed month (30 days)</div><div id="detail-monthly">0.000 kWh</div></div>
                        </div>
                    </div>
                </div>
                <div class="dash-grid" style="margin-top:24px;">
                    <div class="card" style="grid-column: 1 / -1;">
                        <h3 class="card-title">Tariff Breakdown (Illustrative Indian Slabs)</h3>
                        <table class="bill-table" id="tariff-table" style="width:100%; border-collapse: collapse;">
                            <thead>
                                <tr>
                                    <th style="text-align:left; padding:8px;">Slab</th>
                                    <th style="text-align:right; padding:8px;">Units</th>
                                    <th style="text-align:right; padding:8px;">Rate (₹/kWh)</th>
                                    <th style="text-align:right; padding:8px;">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody id="tariff-rows"></tbody>
                            <tfoot>
                                <tr>
                                    <td style="padding:8px; font-weight:600;">Total</td>
                                    <td id="tariff-total-units" style="text-align:right; padding:8px;">0</td>
                                    <td style="padding:8px;"></td>
                                    <td id="tariff-total" style="text-align:right; padding:8px;">0.00</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
                <div class="dash-toolbar">
                    <button class="btn" id="btn-back-dashboard" type="button">Back to Dashboard</button>
                </div>
            </div>
        </section>
    </main>

    <footer class="site-footer">
        <div class="container footer-inner">
            <p>© <?php echo date('Y'); ?> ACPCE. All rights reserved.</p>
            <ul class="footer-links">
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms</a></li>
                <li><a href="#">Support</a></li>
            </ul>
        </div>
    </footer>

    <script src="assets/js/main.js?v=<?php echo urlencode((string)filemtime(__DIR__ . '/assets/js/main.js')); ?>" defer></script>
    <script src="assets/js/dashboard.js?v=<?php echo urlencode((string)filemtime(__DIR__ . '/assets/js/dashboard.js')); ?>" defer></script>
</body>
</html>

