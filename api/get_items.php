<?php
require_once '../config/database.php';

header('Content-Type: application/json');

try {
    // Get items from RASM_ITEMS_META table
    $query = "SELECT * FROM RASM_ITEMS_META ORDER BY item_name";
    $result = $conn->query($query);
    
    $items = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $items
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching items: ' . $e->getMessage()
    ]);
}
?>