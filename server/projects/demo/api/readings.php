<?php
// Mock readings endpoint. Replace with real sensor data source.
header('Content-Type: application/json');
header('Cache-Control: no-store');

// Simple random-ish demo values within realistic ranges
$voltage = 200 + mt_rand(0, 600) / 10; // 200.0 - 260.0 V
$current = mt_rand(0, 300) / 10;       // 0.0 - 30.0 A
$power = $voltage * $current;          // Watts

echo json_encode([
    'voltage' => round($voltage, 1),
    'current' => round($current, 1),
    'power'   => round($power, 1),
]);


