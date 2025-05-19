<?php
require_once '../config/database.php';

header('Content-Type: application/json');

try {
    // Get categories from RASM_CAT table
    $query = "SELECT DISTINCT cat FROM RASM_CAT ORDER BY cat";
    $result = $conn->query($query);
    
    $categories = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $categories[] = $row;
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $categories
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching categories: ' . $e->getMessage()
    ]);
}
?>