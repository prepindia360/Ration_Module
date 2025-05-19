<?php
require_once '../config/database.php';

header('Content-Type: application/json');

// Get limit parameter (default 10)
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;

try {
    // Get recent items
    $query = "SELECT * FROM RASM_ITEMS_META ORDER BY created_at DESC LIMIT ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $limit);
    $stmt->execute();
    $result = $stmt->get_result();
    
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
        'message' => 'Error fetching recent items: ' . $e->getMessage()
    ]);
}
?>