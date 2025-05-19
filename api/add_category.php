<?php
require_once '../config/database.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($input['cat']) || trim($input['cat']) === '') {
    echo json_encode([
        'success' => false,
        'message' => 'Category name is required'
    ]);
    exit;
}

try {
    // Begin transaction
    $conn->begin_transaction();
    
    // Check if category already exists
    $checkQuery = "SELECT id FROM RASM_CAT WHERE cat = ?";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bind_param("s", $input['cat']);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows > 0) {
        throw new Exception("Category already exists");
    }
    
    // Insert new category
    $insertQuery = "INSERT INTO RASM_CAT (cat, description, is_active) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($insertQuery);
    $stmt->bind_param(
        "ssi",
        $input['cat'],
        $input['description'] ?? null,
        $input['is_active'] ?? 1
    );
    
    if (!$stmt->execute()) {
        throw new Exception("Error inserting category: " . $stmt->error);
    }
    
    $categoryId = $conn->insert_id;
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Category added successfully',
        'category_id' => $categoryId
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    echo json_encode([
        'success' => false,
        'message' => 'Error adding category: ' . $e->getMessage()
    ]);
}
?>