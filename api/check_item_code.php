<?php
require_once '../config/database.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['item_code']) || empty($input['item_code'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Item code is required'
    ]);
    exit;
}

try {
    $query = "SELECT id FROM RASM_ITEMS_META WHERE item_code = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $input['item_code']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    echo json_encode([
        'success' => true,
        'exists' => $result->num_rows > 0
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error checking item code: ' . $e->getMessage()
    ]);
}
?>