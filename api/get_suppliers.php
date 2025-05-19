<?php
require_once '../config/database.php';

header('Content-Type: application/json');

try {
    // Get suppliers from RASM_SUPPLIER table
    $query = "SELECT * FROM RASM_SUPPLIER ORDER BY supplier_name";
    $result = $conn->query($query);
    
    $suppliers = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $suppliers[] = $row;
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $suppliers
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching suppliers: ' . $e->getMessage()
    ]);
}
?>