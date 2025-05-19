<?php
require_once '../config/database.php';

header('Content-Type: application/json');

try {
    // Get all CRVs with item counts using the view
    $query = "SELECT * FROM vw_crv_summary ORDER BY crv_date DESC";
    $result = $conn->query($query);
    
    $crvs = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $crvs[] = $row;
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $crvs,
        'total' => count($crvs)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching CRV data: ' . $e->getMessage()
    ]);
}
?>