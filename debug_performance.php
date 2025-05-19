<?php
/**
 * Performance Testing Endpoint for Debug Console
 * Tests database performance and server response times
 */

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Set content type
header('Content-Type: application/json');

$start_time = microtime(true);
$tests = [];

try {
    // Include database connection
    require_once 'config/database.php';
    
    // Test 1: Simple query performance
    $query_start = microtime(true);
    $result = $conn->query("SELECT 1");
    $query_end = microtime(true);
    $tests['simple_query'] = [
        'description' => 'Simple SELECT query',
        'execution_time' => ($query_end - $query_start) * 1000,
        'status' => 'success'
    ];
    
    // Test 2: Count all tables
    $count_start = microtime(true);
    $tables = ['RASM_CAT', 'RASM_SUPPLIER', 'RASM_ITEMS_META', 'RASM_STORE', 'RASM_CRV', 'RASM_CRV_ITEMS'];
    $table_counts = [];
    
    foreach ($tables as $table) {
        try {
            $result = $conn->query("SELECT COUNT(*) as count FROM $table");
            $row = $result->fetch_assoc();
            $table_counts[$table] = $row['count'];
        } catch (Exception $e) {
            $table_counts[$table] = 'ERROR: ' . $e->getMessage();
        }
    }
    $count_end = microtime(true);
    
    $tests['table_counts'] = [
        'description' => 'Count records in all tables',
        'execution_time' => ($count_end - $count_start) * 1000,
        'results' => $table_counts,
        'status' => 'success'
    ];
    
    // Test 3: Complex JOIN query performance
    $join_start = microtime(true);
    $complex_query = "
        SELECT 
            c.crv_number,
            c.supplier_name,
            COUNT(ci.id) as item_count,
            SUM(ci.amount) as total_amount
        FROM RASM_CRV c
        LEFT JOIN RASM_CRV_ITEMS ci ON c.id = ci.crv_id
        GROUP BY c.id
        LIMIT 10
    ";
    
    try {
        $result = $conn->query($complex_query);
        $join_results = [];
        while ($row = $result->fetch_assoc()) {
            $join_results[] = $row;
        }
        $join_end = microtime(true);
        
        $tests['complex_query'] = [
            'description' => 'Complex JOIN query with aggregation',
            'execution_time' => ($join_end - $join_start) * 1000,
            'results_count' => count($join_results),
            'sample_results' => array_slice($join_results, 0, 3),
            'status' => 'success'
        ];
    } catch (Exception $e) {
        $join_end = microtime(true);
        $tests['complex_query'] = [
            'description' => 'Complex JOIN query with aggregation',
            'execution_time' => ($join_end - $join_start) * 1000,
            'error' => $e->getMessage(),
            'status' => 'error'
        ];
    }
    
    // Test 4: Database connection stress test
    $stress_start = microtime(true);
    $connection_tests = 0;
    $connection_errors = 0;
    
    for ($i = 0; $i < 10; $i++) {
        try {
            $test_conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
            if ($test_conn->connect_error) {
                $connection_errors++;
            } else {
                $connection_tests++;
                $test_conn->close();
            }
        } catch (Exception $e) {
            $connection_errors++;
        }
    }
    $stress_end = microtime(true);
    
    $tests['connection_stress'] = [
        'description' => '10 rapid database connections',
        'execution_time' => ($stress_end - $stress_start) * 1000,
        'successful_connections' => $connection_tests,
        'failed_connections' => $connection_errors,
        'success_rate' => ($connection_tests / 10) * 100,
        'status' => $connection_errors > 0 ? 'warning' : 'success'
    ];
    
    // Test 5: Memory usage test
    $memory_start = memory_get_usage(true);
    $peak_memory_start = memory_get_peak_usage(true);
    
    // Create some test data to measure memory impact
    $test_data = [];
    for ($i = 0; $i < 1000; $i++) {
        $test_data[] = [
            'id' => $i,
            'name' => 'Test Item ' . $i,
            'description' => str_repeat('Lorem ipsum dolor sit amet ', 10),
            'data' => array_fill(0, 10, rand(1, 1000))
        ];
    }
    
    $memory_end = memory_get_usage(true);
    $peak_memory_end = memory_get_peak_usage(true);
    
    $tests['memory_usage'] = [
        'description' => 'Memory allocation test (1000 items)',
        'memory_before' => $memory_start,
        'memory_after' => $memory_end,
        'memory_used' => $memory_end - $memory_start,
        'peak_memory_before' => $peak_memory_start,
        'peak_memory_after' => $peak_memory_end,
        'memory_formatted' => [
            'used' => formatBytes($memory_end - $memory_start),
            'current_total' => formatBytes($memory_end),
            'peak_total' => formatBytes($peak_memory_end)
        ],
        'status' => 'success'
    ];
    
    // Test 6: File I/O performance
    $io_start = microtime(true);
    $test_file = 'temp_test_' . time() . '.txt';
    $test_content = str_repeat('This is a test line for I/O performance testing.' . PHP_EOL, 100);
    
    try {
        // Write test
        $write_start = microtime(true);
        file_put_contents($test_file, $test_content);
        $write_end = microtime(true);
        
        // Read test
        $read_start = microtime(true);
        $read_content = file_get_contents($test_file);
        $read_end = microtime(true);
        
        // Cleanup
        unlink($test_file);
        $io_end = microtime(true);
        
        $tests['file_io'] = [
            'description' => 'File I/O performance test',
            'total_time' => ($io_end - $io_start) * 1000,
            'write_time' => ($write_end - $write_start) * 1000,
            'read_time' => ($read_end - $read_start) * 1000,
            'file_size' => strlen($test_content),
            'file_size_formatted' => formatBytes(strlen($test_content)),
            'read_success' => strlen($read_content) === strlen($test_content),
            'status' => 'success'
        ];
    } catch (Exception $e) {
        $io_end = microtime(true);
        $tests['file_io'] = [
            'description' => 'File I/O performance test',
            'execution_time' => ($io_end - $io_start) * 1000,
            'error' => $e->getMessage(),
            'status' => 'error'
        ];
    }
    
} catch (Exception $e) {
    $tests['database_connection'] = [
        'description' => 'Database connection test',
        'error' => $e->getMessage(),
        'status' => 'error'
    ];
}

$end_time = microtime(true);
$total_execution_time = ($end_time - $start_time) * 1000;

// Prepare response
$response = [
    'success' => true,
    'total_execution_time' => $total_execution_time,
    'total_execution_time_formatted' => number_format($total_execution_time, 2) . 'ms',
    'server_info' => [
        'php_version' => PHP_VERSION,
        'memory_limit' => ini_get('memory_limit'),
        'max_execution_time' => ini_get('max_execution_time'),
        'current_memory_usage' => formatBytes(memory_get_usage(true)),
        'peak_memory_usage' => formatBytes(memory_get_peak_usage(true)),
        'server_time' => date('Y-m-d H:i:s'),
        'timezone' => date_default_timezone_get()
    ],
    'tests' => $tests,
    'summary' => [
        'total_tests' => count($tests),
        'successful_tests' => count(array_filter($tests, function($test) { return $test['status'] === 'success'; })),
        'failed_tests' => count(array_filter($tests, function($test) { return $test['status'] === 'error'; })),
        'warning_tests' => count(array_filter($tests, function($test) { return $test['status'] === 'warning'; }))
    ]
];

echo json_encode($response, JSON_PRETTY_PRINT);

function formatBytes($bytes, $precision = 2) {
    $units = array('B', 'KB', 'MB', 'GB', 'TB');
    
    for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
        $bytes /= 1024;
    }
    
    return round($bytes, $precision) . ' ' . $units[$i];
}
?>