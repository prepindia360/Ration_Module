<?php
require_once '../config/database.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['category']) || empty($input['category'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Category is required'
    ]);
    exit;
}

$category = $conn->real_escape_string($input['category']);

try {
    // Begin transaction
    $conn->begin_transaction();
    
    // Check if category exists in sequence table
    $checkQuery = "SELECT current_sequence FROM RASM_CRV_SEQUENCE WHERE category = ?";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bind_param("s", $category);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows > 0) {
        // Category exists, increment sequence
        $row = $result->fetch_assoc();
        $newSequence = $row['current_sequence'] + 1;
        
        $updateQuery = "UPDATE RASM_CRV_SEQUENCE SET current_sequence = ? WHERE category = ?";
        $updateStmt = $conn->prepare($updateQuery);
        $updateStmt->bind_param("is", $newSequence, $category);
        $updateStmt->execute();
    } else {
        // Category doesn't exist, create new entry
        $newSequence = 1;
        $insertQuery = "INSERT INTO RASM_CRV_SEQUENCE (category, current_sequence) VALUES (?, ?)";
        $insertStmt = $conn->prepare($insertQuery);
        $insertStmt->bind_param("si", $category, $newSequence);
        $insertStmt->execute();
    }
    
    // Generate CRV number
    $date = new DateTime();
    $dateFormat = $date->format('dmy'); // DDMMYY format
    $sequenceFormatted = str_pad($newSequence, 3, '0', STR_PAD_LEFT);
    
    $crvNumber = "CRV/{$category}/{$dateFormat}/{$sequenceFormatted}";
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'crv_number' => $crvNumber,
        'sequence' => $newSequence
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    echo json_encode([
        'success' => false,
        'message' => 'Error generating CRV number: ' . $e->getMessage()
    ]);
}
?>