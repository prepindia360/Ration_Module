<?php
require_once '../config/database.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$requiredFields = ['category', 'crv_number', 'crv_date', 'supplier_name', 'store', 'items', 'total_amount'];
foreach ($requiredFields as $field) {
    if (!isset($input[$field]) || empty($input[$field])) {
        echo json_encode([
            'success' => false,
            'message' => "Field '{$field}' is required"
        ]);
        exit;
    }
}

// Validate items array
if (!is_array($input['items']) || count($input['items']) === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'At least one item is required'
    ]);
    exit;
}

try {
    // Begin transaction
    $conn->begin_transaction();
    
    // Prepare CRV date for SQL
    $crvDate = $input['crv_date'];
    // Convert from DD-MM-YYYY HH:MM:SS to YYYY-MM-DD HH:MM:SS for MySQL
    $dateParts = explode(' ', $crvDate);
    $datePart = $dateParts[0];
    $timePart = isset($dateParts[1]) ? $dateParts[1] : '00:00:00';
    $dateComponents = explode('-', $datePart);
    $sqlDate = $dateComponents[2] . '-' . $dateComponents[1] . '-' . $dateComponents[0] . ' ' . $timePart;
    
    // Convert party invoice date if provided
    $partyInvoiceDate = null;
    if (!empty($input['party_invoice_date'])) {
        $partyInvoiceDate = date('Y-m-d', strtotime($input['party_invoice_date']));
    }
    
    // Insert into RASM_CRV table
    $insertCRVQuery = "INSERT INTO RASM_CRV (
        category, 
        crv_number, 
        crv_date, 
        supplier_name, 
        supplier_code, 
        party_invoice_no, 
        party_invoice_date, 
        store, 
        total_amount,
        created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
    
    $stmt = $conn->prepare($insertCRVQuery);
    $stmt->bind_param(
        "ssssssssd",
        $input['category'],
        $input['crv_number'],
        $sqlDate,
        $input['supplier_name'],
        $input['supplier_code'],
        $input['party_invoice_no'],
        $partyInvoiceDate,
        $input['store'],
        $input['total_amount']
    );
    
    if (!$stmt->execute()) {
        throw new Exception("Error inserting CRV: " . $stmt->error);
    }
    
    $crvId = $conn->insert_id;
    
    // Insert items into RASM_CRV_ITEMS table
    $insertItemQuery = "INSERT INTO RASM_CRV_ITEMS (
        crv_id, 
        item_name, 
        item_code, 
        uom, 
        quantity, 
        rate, 
        amount
    ) VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $itemStmt = $conn->prepare($insertItemQuery);
    
    foreach ($input['items'] as $item) {
        $itemStmt->bind_param(
            "isssddd",
            $crvId,
            $item['name'],
            $item['code'],
            $item['uom'],
            $item['quantity'],
            $item['rate'],
            $item['amount']
        );
        
        if (!$itemStmt->execute()) {
            throw new Exception("Error inserting item: " . $itemStmt->error);
        }
    }
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'CRV saved successfully',
        'crv_id' => $crvId
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    echo json_encode([
        'success' => false,
        'message' => 'Error saving CRV: ' . $e->getMessage()
    ]);
}
?>