<?php
/**
 * Debug and System Test File for Ration Management System
 * This file tests all connections, APIs, and system components
 */

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Start session for any session-based testing
session_start();

// Include database connection
$db_connection_success = false;
$db_error = '';
try {
    require_once 'config/database.php';
    $db_connection_success = true;
} catch (Exception $e) {
    $db_error = $e->getMessage();
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ration Management System - Debug & Test</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            color: #2c3e50;
            margin-bottom: 30px;
            border-bottom: 3px solid #3498db;
            padding-bottom: 20px;
        }
        .test-section {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: #fafafa;
        }
        .test-section h3 {
            margin-top: 0;
            color: #2c3e50;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 10px;
        }
        .test-item {
            margin: 10px 0;
            padding: 10px;
            border-radius: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        .error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
        }
        .info {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
        }
        .status {
            font-weight: bold;
            padding: 5px 10px;
            border-radius: 3px;
        }
        .status.pass {
            background: #28a745;
            color: white;
        }
        .status.fail {
            background: #dc3545;
            color: white;
        }
        .status.warn {
            background: #ffc107;
            color: #212529;
        }
        .details {
            font-size: 0.9em;
            color: #666;
            margin-top: 5px;
        }
        .api-test {
            background: white;
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            border: 1px solid #ddd;
        }
        .api-result {
            background: #f8f9fa;
            padding: 10px;
            margin-top: 10px;
            border-radius: 3px;
            font-family: monospace;
            font-size: 0.8em;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .btn {
            background: #3498db;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
            font-size: 14px;
        }
        .btn:hover {
            background: #2980b9;
        }
        .btn.test-all {
            background: #27ae60;
            font-size: 16px;
            padding: 12px 25px;
        }
        .system-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }
        .info-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #ddd;
        }
        .info-card h4 {
            margin-top: 0;
            color: #2c3e50;
        }
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #ecf0f1;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #3498db, #2ecc71);
            width: 0%;
            transition: width 0.3s ease;
        }
        .test-log {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            max-height: 300px;
            overflow-y: auto;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔧 Ration Management System - Debug & Test Console</h1>
            <p>Comprehensive system testing and debugging tool</p>
            <button class="btn test-all" onclick="runAllTests()">🚀 Run All Tests</button>
            <button class="btn" onclick="clearLogs()">🗑️ Clear Logs</button>
        </div>

        <!-- Progress Bar -->
        <div class="progress-bar">
            <div class="progress-fill" id="progressBar"></div>
        </div>
        <div id="progressText" style="text-align: center; margin: 10px 0;">Ready to test...</div>

        <!-- Test Log -->
        <div class="test-log" id="testLog">
            === Ration Management System Debug Console ===<br>
            Ready for testing. Click "Run All Tests" to begin.<br>
            <span style="color: #3498db;">[<?= date('Y-m-d H:i:s') ?>]</span> Debug console initialized.<br>
        </div>

        <!-- System Information -->
        <div class="test-section">
            <h3>📊 System Information</h3>
            <div class="system-info">
                <div class="info-card">
                    <h4>Server Environment</h4>
                    <div><strong>PHP Version:</strong> <?= PHP_VERSION ?></div>
                    <div><strong>Server Software:</strong> <?= $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown' ?></div>
                    <div><strong>Document Root:</strong> <?= $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown' ?></div>
                    <div><strong>Script Path:</strong> <?= $_SERVER['SCRIPT_FILENAME'] ?? 'Unknown' ?></div>
                    <div><strong>Memory Limit:</strong> <?= ini_get('memory_limit') ?></div>
                    <div><strong>Max Execution Time:</strong> <?= ini_get('max_execution_time') ?>s</div>
                </div>
                <div class="info-card">
                    <h4>PHP Extensions</h4>
                    <div><strong>MySQLi:</strong> <?= extension_loaded('mysqli') ? '✅ Loaded' : '❌ Not Loaded' ?></div>
                    <div><strong>JSON:</strong> <?= extension_loaded('json') ? '✅ Loaded' : '❌ Not Loaded' ?></div>
                    <div><strong>cURL:</strong> <?= extension_loaded('curl') ? '✅ Loaded' : '❌ Not Loaded' ?></div>
                    <div><strong>GD:</strong> <?= extension_loaded('gd') ? '✅ Loaded' : '❌ Not Loaded' ?></div>
                    <div><strong>OpenSSL:</strong> <?= extension_loaded('openssl') ? '✅ Loaded' : '❌ Not Loaded' ?></div>
                    <div><strong>Session:</strong> <?= extension_loaded('session') ? '✅ Loaded' : '❌ Not Loaded' ?></div>
                </div>
            </div>
        </div>

        <!-- Database Connection Test -->
        <div class="test-section">
            <h3>🗄️ Database Connection Test</h3>
            <?php if ($db_connection_success): ?>
                <div class="test-item success">
                    <span>Database Connection</span>
                    <span class="status pass">PASS</span>
                </div>
                <div class="details">
                    ✅ Successfully connected to database: <?= DB_NAME ?><br>
                    📍 Host: <?= DB_HOST ?><br>
                    👤 User: <?= DB_USER ?><br>
                    🔗 Connection Character Set: <?= $conn->character_set_name() ?>
                </div>
                
                <?php
                // Test database queries
                $table_tests = [
                    'RASM_CAT' => 'SELECT COUNT(*) as count FROM RASM_CAT',
                    'RASM_SUPPLIER' => 'SELECT COUNT(*) as count FROM RASM_SUPPLIER',
                    'RASM_ITEMS_META' => 'SELECT COUNT(*) as count FROM RASM_ITEMS_META',
                    'RASM_STORE' => 'SELECT COUNT(*) as count FROM RASM_STORE',
                    'RASM_CRV_SEQUENCE' => 'SELECT COUNT(*) as count FROM RASM_CRV_SEQUENCE',
                    'RASM_CRV' => 'SELECT COUNT(*) as count FROM RASM_CRV',
                    'RASM_CRV_ITEMS' => 'SELECT COUNT(*) as count FROM RASM_CRV_ITEMS'
                ];
                
                foreach ($table_tests as $table => $query):
                    try {
                        $result = $conn->query($query);
                        $row = $result->fetch_assoc();
                        $count = $row['count'];
                ?>
                        <div class="test-item success">
                            <span>Table: <?= $table ?></span>
                            <span class="status pass"><?= $count ?> records</span>
                        </div>
                <?php
                    } catch (Exception $e) {
                ?>
                        <div class="test-item error">
                            <span>Table: <?= $table ?></span>
                            <span class="status fail">ERROR</span>
                        </div>
                        <div class="details">❌ <?= $e->getMessage() ?></div>
                <?php
                    }
                endforeach;
                ?>
            <?php else: ?>
                <div class="test-item error">
                    <span>Database Connection</span>
                    <span class="status fail">FAIL</span>
                </div>
                <div class="details">❌ <?= $db_error ?></div>
            <?php endif; ?>
        </div>

        <!-- File System Tests -->
        <div class="test-section">
            <h3>📁 File System Tests</h3>
            <?php
            $file_tests = [
                'config/database.php' => 'Database configuration file',
                'assets/css/style.css' => 'Main stylesheet',
                'assets/js/script.js' => 'Main JavaScript file',
                'api/get_categories.php' => 'Categories API',
                'api/get_suppliers.php' => 'Suppliers API',
                'api/get_stores.php' => 'Stores API',
                'api/get_items.php' => 'Items API',
                'api/generate_crv_number.php' => 'CRV Number Generation API',
                'api/save_crv.php' => 'Save CRV API',
                'api/export_pdf.php' => 'PDF Export API',
                'vendor/autoload.php' => 'Composer Autoloader (TCPDF)',
            ];
            
            foreach ($file_tests as $file => $description):
                $exists = file_exists($file);
                $readable = $exists ? is_readable($file) : false;
            ?>
                <div class="test-item <?= $exists ? 'success' : 'error' ?>">
                    <span><?= $description ?></span>
                    <span class="status <?= $exists ? 'pass' : 'fail' ?>">
                        <?= $exists ? 'EXISTS' : 'MISSING' ?>
                    </span>
                </div>
                <div class="details">
                    📍 Path: <?= $file ?><br>
                    <?= $exists ? '✅ File exists' : '❌ File missing' ?>
                    <?= $exists && $readable ? ' | ✅ Readable' : ($exists ? ' | ❌ Not readable' : '') ?>
                    <?php if ($exists): ?>
                        | 📏 Size: <?= number_format(filesize($file)) ?> bytes
                        | 🕒 Modified: <?= date('Y-m-d H:i:s', filemtime($file)) ?>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- API Endpoint Tests -->
        <div class="test-section">
            <h3>🔌 API Endpoint Tests</h3>
            <div id="apiTests">
                <p>Click individual test buttons or "Run All Tests" to test API endpoints.</p>
                
                <div class="api-test">
                    <button class="btn" onclick="testAPI('get_categories')">Test Categories API</button>
                    <div id="api_get_categories" class="api-result" style="display:none;"></div>
                </div>
                
                <div class="api-test">
                    <button class="btn" onclick="testAPI('get_suppliers')">Test Suppliers API</button>
                    <div id="api_get_suppliers" class="api-result" style="display:none;"></div>
                </div>
                
                <div class="api-test">
                    <button class="btn" onclick="testAPI('get_stores')">Test Stores API</button>
                    <div id="api_get_stores" class="api-result" style="display:none;"></div>
                </div>
                
                <div class="api-test">
                    <button class="btn" onclick="testAPI('get_items')">Test Items API</button>
                    <div id="api_get_items" class="api-result" style="display:none;"></div>
                </div>
                
                <div class="api-test">
                    <button class="btn" onclick="testAPI('generate_crv_number')">Test CRV Number Generation</button>
                    <div id="api_generate_crv_number" class="api-result" style="display:none;"></div>
                </div>
            </div>
        </div>

        <!-- Security Tests -->
        <div class="test-section">
            <h3>🔒 Security Tests</h3>
            <div class="test-item <?= !ini_get('display_errors') ? 'success' : 'warning' ?>">
                <span>Error Display (Production)</span>
                <span class="status <?= !ini_get('display_errors') ? 'pass' : 'warn' ?>">
                    <?= !ini_get('display_errors') ? 'DISABLED' : 'ENABLED' ?>
                </span>
            </div>
            <div class="details">
                <?= !ini_get('display_errors') ? '✅ Errors are hidden (good for production)' : '⚠️ Errors are displayed (disable in production)' ?>
            </div>
            
            <div class="test-item <?= file_exists('.htaccess') ? 'success' : 'warning' ?>">
                <span>.htaccess Security File</span>
                <span class="status <?= file_exists('.htaccess') ? 'pass' : 'warn' ?>">
                    <?= file_exists('.htaccess') ? 'EXISTS' : 'MISSING' ?>
                </span>
            </div>
            <div class="details">
                <?= file_exists('.htaccess') ? '✅ Security configurations in place' : '⚠️ Consider adding .htaccess for security' ?>
            </div>
            
            <div class="test-item info">
                <span>Session Security</span>
                <span class="status pass">ACTIVE</span>
            </div>
            <div class="details">
                ✅ Session ID: <?= session_id() ?><br>
                🔒 Session Name: <?= session_name() ?><br>
                ⏰ Session Started: <?= date('Y-m-d H:i:s') ?>
            </div>
        </div>

        <!-- Performance Tests -->
        <div class="test-section">
            <h3>⚡ Performance Tests</h3>
            <div id="performanceTests">
                <button class="btn" onclick="runPerformanceTests()">Run Performance Tests</button>
                <div id="performanceResults"></div>
            </div>
        </div>

        <!-- System Recommendations -->
        <div class="test-section">
            <h3>💡 System Recommendations</h3>
            <div id="recommendations">
                <?php
                $recommendations = [];
                
                // Check PHP version
                if (version_compare(PHP_VERSION, '8.0', '<')) {
                    $recommendations[] = "Consider upgrading to PHP 8.0+ for better performance and security";
                }
                
                // Check memory limit
                $memory_limit = ini_get('memory_limit');
                $memory_bytes = return_bytes($memory_limit);
                if ($memory_bytes < 128 * 1024 * 1024) {
                    $recommendations[] = "Consider increasing memory_limit to at least 128M";
                }
                
                // Check if HTTPS
                if (!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] !== 'on') {
                    $recommendations[] = "Consider implementing HTTPS for secure communication";
                }
                
                // Check for production settings
                if (ini_get('display_errors')) {
                    $recommendations[] = "Disable display_errors in production environment";
                }
                
                if (empty($recommendations)) {
                    echo '<div class="test-item success"><span>✅ No critical recommendations</span></div>';
                } else {
                    foreach ($recommendations as $rec) {
                        echo '<div class="test-item warning"><span>💡 ' . $rec . '</span></div>';
                    }
                }
                
                function return_bytes($val) {
                    $val = trim($val);
                    $last = strtolower($val[strlen($val)-1]);
                    $val = (int)$val;
                    switch($last) {
                        case 'g': $val *= 1024;
                        case 'm': $val *= 1024;
                        case 'k': $val *= 1024;
                    }
                    return $val;
                }
                ?>
            </div>
        </div>
    </div>

    <script>
        let testProgress = 0;
        const totalTests = 7; // Adjust based on number of test categories
        
        function log(message, type = 'info') {
            const logDiv = document.getElementById('testLog');
            const timestamp = new Date().toLocaleString();
            const colors = {
                'info': '#3498db',
                'success': '#27ae60',
                'error': '#e74c3c',
                'warning': '#f39c12'
            };
            logDiv.innerHTML += `<span style="color: ${colors[type]};">[${timestamp}]</span> ${message}<br>`;
            logDiv.scrollTop = logDiv.scrollHeight;
        }
        
        function updateProgress(increment = 0) {
            if (increment) testProgress += increment;
            const percentage = (testProgress / totalTests) * 100;
            document.getElementById('progressBar').style.width = percentage + '%';
            document.getElementById('progressText').textContent = `Testing progress: ${Math.round(percentage)}%`;
        }
        
        function clearLogs() {
            document.getElementById('testLog').innerHTML = `
                === Ration Management System Debug Console ===<br>
                Logs cleared. Ready for new tests.<br>
                <span style="color: #3498db;">[${new Date().toLocaleString()}]</span> Debug console cleared.<br>
            `;
            testProgress = 0;
            updateProgress();
        }
        
        async function testAPI(endpoint) {
            log(`Testing API: ${endpoint}`, 'info');
            const resultDiv = document.getElementById(`api_${endpoint}`);
            resultDiv.style.display = 'block';
            resultDiv.textContent = 'Testing...';
            
            try {
                let url = `api/${endpoint}.php`;
                let options = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                };
                
                // Special handling for CRV number generation (requires POST)
                if (endpoint === 'generate_crv_number') {
                    options.method = 'POST';
                    options.body = JSON.stringify({ category: 'RATION' });
                }
                
                const response = await fetch(url, options);
                const data = await response.json();
                
                if (data.success) {
                    resultDiv.innerHTML = `<strong>✅ SUCCESS</strong>\nResponse: ${JSON.stringify(data, null, 2)}`;
                    log(`API ${endpoint}: SUCCESS`, 'success');
                } else {
                    resultDiv.innerHTML = `<strong>❌ API ERROR</strong>\nError: ${data.message || 'Unknown error'}`;
                    log(`API ${endpoint}: ERROR - ${data.message}`, 'error');
                }
            } catch (error) {
                resultDiv.innerHTML = `<strong>❌ CONNECTION ERROR</strong>\nError: ${error.message}`;
                log(`API ${endpoint}: CONNECTION ERROR - ${error.message}`, 'error');
            }
        }
        
        async function runAllTests() {
            log('🚀 Starting comprehensive system tests...', 'info');
            testProgress = 0;
            updateProgress();
            
            // Test all APIs
            const apis = ['get_categories', 'get_suppliers', 'get_stores', 'get_items', 'generate_crv_number'];
            for (let api of apis) {
                await testAPI(api);
                await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
                updateProgress(1);
            }
            
            // Run performance tests
            await runPerformanceTests();
            updateProgress(1);
            
            // Test frontend functionality
            await testFrontendFeatures();
            updateProgress(1);
            
            log('✅ All tests completed!', 'success');
            updateProgress(0, 100);
        }
        
        async function runPerformanceTests() {
            log('⚡ Running performance tests...', 'info');
            const resultsDiv = document.getElementById('performanceResults');
            resultsDiv.innerHTML = '<h4>Performance Test Results:</h4>';
            
            // Database query performance
            const dbStart = performance.now();
            try {
                const response = await fetch('debug_performance.php');
                const dbEnd = performance.now();
                const dbTime = (dbEnd - dbStart).toFixed(2);
                
                resultsDiv.innerHTML += `
                    <div class="test-item ${dbTime < 1000 ? 'success' : 'warning'}">
                        <span>Database Query Speed</span>
                        <span class="status ${dbTime < 1000 ? 'pass' : 'warn'}">${dbTime}ms</span>
                    </div>
                `;
                log(`Database query time: ${dbTime}ms`, dbTime < 1000 ? 'success' : 'warning');
            } catch (error) {
                resultsDiv.innerHTML += `
                    <div class="test-item error">
                        <span>Database Query Speed</span>
                        <span class="status fail">ERROR</span>
                    </div>
                `;
                log(`Database query error: ${error.message}`, 'error');
            }
            
            // Memory usage test
            const memoryInfo = performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
            } : null;
            
            if (memoryInfo) {
                resultsDiv.innerHTML += `
                    <div class="test-item info">
                        <span>JavaScript Memory Usage</span>
                        <span class="status pass">${memoryInfo.used}MB / ${memoryInfo.limit}MB</span>
                    </div>
                `;
                log(`Memory usage: ${memoryInfo.used}MB used, ${memoryInfo.limit}MB limit`, 'info');
            }
        }
        
        async function testFrontendFeatures() {
            log('🎨 Testing frontend features...', 'info');
            
            // Test if main scripts load
            const scriptsToTest = [
                { name: 'Main CSS', path: 'assets/css/style.css' },
                { name: 'Main JavaScript', path: 'assets/js/script.js' },
                { name: 'Font Awesome', path: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css' }
            ];
            
            for (let script of scriptsToTest) {
                try {
                    const response = await fetch(script.path, { method: 'HEAD' });
                    if (response.ok) {
                        log(`✅ ${script.name}: Loaded successfully`, 'success');
                    } else {
                        log(`❌ ${script.name}: Failed to load (${response.status})`, 'error');
                    }
                } catch (error) {
                    log(`❌ ${script.name}: Connection error - ${error.message}`, 'error');
                }
            }
            
            // Test DOM elements
            if (typeof window !== 'undefined') {
                const requiredElements = [
                    'crvForm',
                    'crvDetailsSection', 
                    'itemEntrySection',
                    'itemsTable'
                ];
                
                requiredElements.forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        log(`✅ Element '${id}': Found`, 'success');
                    } else {
                        log(`❌ Element '${id}': Not found`, 'error');
                    }
                });
            }
        }
        
        // Auto-run basic tests on page load
        document.addEventListener('DOMContentLoaded', function() {
            log('🔧 Debug console loaded successfully', 'success');
            log('💡 Tip: Use "Run All Tests" for comprehensive testing', 'info');
        });
    </script>
</body>
</html>