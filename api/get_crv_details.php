<?php
require_once '../config/database.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['crv_id']) || empty($input['crv_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'CRV ID is required'
    ]);
    exit;
}

$crvId = (int)$input['crv_id'];

try {
    // Get CRV details
    $crvQuery = "SELECT * FROM RASM_CRV WHERE id = ?";
    $crvStmt = $conn->prepare($crvQuery);
    $crvStmt->bind_param("i", $crvId);
    $crvStmt->execute();
    $crvResult = $crvStmt->get_result();
    
    if ($crvResult->num_rows === 0) {
        throw new Exception("CRV not found");
    }
    
    $crvData = $crvResult->fetch_assoc();
    
    // Get CRV items
    $itemsQuery = "SELECT * FROM RASM_CRV_ITEMS WHERE crv_id = ? ORDER BY id";
    $itemsStmt = $conn->prepare($itemsQuery);
    $itemsStmt->bind_param("i", $crvId);
    $itemsStmt->execute();
    $itemsResult = $itemsStmt->get_result();
    
    $items = [];
    while ($row = $itemsResult->fetch_assoc()) {
        $items[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'crv' => $crvData,
            'items' => $items
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching CRV details: ' . $e->getMessage()
    ]);
}
?>