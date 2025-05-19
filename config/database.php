<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '1234');
define('DB_NAME', 'samarth_db');

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database if not exists
$sql = "CREATE DATABASE IF NOT EXISTS " . DB_NAME;
if ($conn->query($sql) === TRUE) {
    $conn->select_db(DB_NAME);
} else {
    die("Error creating database: " . $conn->error);
}

// Import SQL file if tables don't exist
$check_table = $conn->query("SHOW TABLES LIKE 'officer_master'");
if ($check_table->num_rows == 0) {
    $sql_file = file_get_contents(__DIR__ . '/../Database_desin_latest (1).sql');
    if ($conn->multi_query($sql_file)) {
        do {
            if ($result = $conn->store_result()) {
                $result->free();
            }
        } while ($conn->next_result());
    } else {
        die("Error importing SQL file: " . $conn->error);
    }
}
?>