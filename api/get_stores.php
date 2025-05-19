<?php
require_once '../config/database.php';

header('Content-Type: application/json');

try {
    // Get stores from RASM_STORE table
    $query = "SELECT DISTINCT store FROM RASM_STORE ORDER BY store";
    $result = $conn->query($query);
    
    $stores = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $stores[] = $row;
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $stores
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching stores: ' . $e->getMessage()
    ]);
}
?>