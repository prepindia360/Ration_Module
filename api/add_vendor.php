<?php
require_once '../config/database.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$requiredFields = ['supplier_name', 'supplier_code'];
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
    
    // Check if supplier already exists
    $checkQuery = "SELECT id FROM RASM_SUPPLIER WHERE supplier_name = ? OR supplier_code = ?";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bind_param("ss", $input['supplier_name'], $input['supplier_code']);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows > 0) {
        throw new Exception("Supplier with this name or code already exists");
    }
    
    // Insert new supplier
    $insertQuery = "INSERT INTO RASM_SUPPLIER (
        supplier_name, 
        supplier_code, 
        contact_person, 
        supplier_mobile, 
        supplier_email, 
        supplier_address, 
        remark, 
        is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($insertQuery);
    $stmt->bind_param(
        "sssssssi",
        $input['supplier_name'],
        $input['supplier_code'],
        $input['contact_person'] ?? null,
        $input['supplier_mobile'] ?? null,
        $input['supplier_email'] ?? null,
        $input['supplier_address'] ?? null,
        $input['remark'] ?? null,
        $input['is_active'] ?? 1
    );
    
    if (!$stmt->execute()) {
        throw new Exception("Error inserting supplier: " . $stmt->error);
    }
    
    $supplierId = $conn->insert_id;
    
    // Handle specializations if provided
    if (isset($input['specializations']) && is_array($input['specializations'])) {
        $specializations = implode(',', $input['specializations']);
        $updateQuery = "UPDATE RASM_SUPPLIER SET remark = CONCAT(COALESCE(remark, ''), '\nSpecializations: " . $specializations . "') WHERE id = ?";
        $updateStmt = $conn->prepare($updateQuery);
        $updateStmt->bind_param("i", $supplierId);
        $updateStmt->execute();
    }
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Vendor added successfully',
        'supplier_id' => $supplierId
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    echo json_encode([
        'success' => false,
        'message' => 'Error adding vendor: ' . $e->getMessage()
    ]);
}
?>