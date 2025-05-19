<?php
require_once '../config/database.php';

header('Content-Type: application/json');

// Get limit parameter (default 50, for recent)
$limit = isset($_GET['recent']) ? (int)$_GET['recent'] : null;

try {
    $query = "SELECT * FROM RASM_SUPPLIER ORDER BY created_at DESC";
    
    if ($limit) {
        $query .= " LIMIT ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $limit);
    } else {
        $stmt = $conn->prepare($query);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $vendors = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $vendors[] = $row;
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $vendors
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching vendors: ' . $e->getMessage()
    ]);
}
?>