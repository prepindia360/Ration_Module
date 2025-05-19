<?php
require_once '../config/database.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$requiredFields = ['item_name', 'item_code', 'item_uom', 'rate'];
foreach ($requiredFields as $field) {
    if (!isset($input[$field]) || trim($input[$field]) === '') {
        echo json_encode([
            'success' => false,
            'message' => "Field '{$field}' is required"
        ]);
        exit;
    }
}

try {
    // Begin transaction
    $conn->begin_transaction();
    
    // Check if item code already exists
    $checkQuery = "SELECT id FROM RASM_ITEMS_META WHERE item_code = ? OR item_name = ?";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bind_param("ss", $input['item_code'], $input['item_name']);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows > 0) {
        throw new Exception("Item with this code or name already exists");
    }
    
    // Insert new item
    $insertQuery = "INSERT INTO RASM_ITEMS_META (
        item_name, 
        item_code, 
        item_uom, 
        rate, 
        ration_type, 
        category, 
        description, 
        is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($insertQuery);
    $stmt->bind_param(
        "sssdsssi",
        $input['item_name'],
        $input['item_code'],
        $input['item_uom'],
        $input['rate'],
        $input['ration_type'] ?? null,
        $input['category'] ?? null,
        $input['description'] ?? null,
        $input['is_active'] ?? 1
    );
    
    if (!$stmt->execute()) {
        throw new Exception("Error inserting item: " . $stmt->error);
    }
    
    $itemId = $conn->insert_id;
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Item added successfully',
        'item_id' => $itemId
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    echo json_encode([
        'success' => false,
        'message' => 'Error adding item: ' . $e->getMessage()
    ]);
}
?>