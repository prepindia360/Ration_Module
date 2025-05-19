<?php
require_once '../config/database.php';

// Check if TCPDF is available
if (file_exists('../vendor/tecnickcom/tcpdf/tcpdf.php')) {
    require_once '../vendor/tecnickcom/tcpdf/tcpdf.php';
} elseif (file_exists('../vendor/autoload.php')) {
    require_once '../vendor/autoload.php';
} else {
    // Create a simple PDF without TCPDF if not available
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'PDF library not found. Please install TCPDF via Composer.'
    ]);
    exit;
}


$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['crv_id']) || empty($input['crv_id'])) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'CRV ID is required'
    ]);
    exit;
}

$crvId = (int)$input['crv_id'];

try {
    // Fetch CRV data
    $crvQuery = "SELECT * FROM RASM_CRV WHERE id = ?";
    $crvStmt = $conn->prepare($crvQuery);
    $crvStmt->bind_param("i", $crvId);
    $crvStmt->execute();
    $crvResult = $crvStmt->get_result();
    
    if ($crvResult->num_rows === 0) {
        throw new Exception("CRV not found");
    }
    
    $crvData = $crvResult->fetch_assoc();
    
    // Fetch CRV items
    $itemsQuery = "SELECT * FROM RASM_CRV_ITEMS WHERE crv_id = ? ORDER BY id";
    $itemsStmt = $conn->prepare($itemsQuery);
    $itemsStmt->bind_param("i", $crvId);
    $itemsStmt->execute();
    $itemsResult = $itemsStmt->get_result();
    
    $items = [];
    while ($row = $itemsResult->fetch_assoc()) {
        $items[] = $row;
    }
    
    // Create PDF using TCPDF
    $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
    
    // Set document information
    $pdf->SetCreator('Officers Mess MCEME');
    $pdf->SetAuthor('Officers Mess MCEME');
    $pdf->SetTitle('Cash Receipt Voucher - ' . $crvData['crv_number']);
    $pdf->SetSubject('CRV Document');
    
    // Remove default header/footer
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    
    // Set margins (left, top, right)
    $pdf->SetMargins(15, 15, 15);
    $pdf->SetAutoPageBreak(TRUE, 15);
    
    // Add a page
    $pdf->AddPage();
    
    // Format dates according to your specification
    $printDate = date('d-m-Y H:i:s');
    $crvDateTime = date('d-m-Y H:i:s', strtotime($crvData['crv_date']));
    $crvDateOnly = date('d-m-Y', strtotime($crvData['crv_date']));
    
    // Set font for header - Arial as requested
    $pdf->SetFont('helvetica', 'B', 14); // Using helvetica as Arial equivalent
    
    // Header - OFFICER'S MESS MCEME (Centered, Bold, Arial 14)
    $pdf->Cell(0, 8, "OFFICER'S MESS MCEME", 0, 1, 'C');
    
    // TRIMULGHERRY (Centered, Arial 14)
    $pdf->SetFont('helvetica', '', 14);
    $pdf->Cell(0, 6, 'TRIMULGHERRY', 0, 1, 'C');
    
    // SECUNDERABAD (Centered, Arial 14)
    $pdf->Cell(0, 6, 'SECUNDERABAD', 0, 1, 'C');
    
    // CASH RECEIPT VOUCHER (Centered, Bold, Arial 14)
    $pdf->SetFont('helvetica', 'B', 14);
    $pdf->Cell(0, 8, 'CASH RECEIPT VOUCHER', 0, 1, 'C');
    
    $pdf->Ln(5);
    
    // Printed on: <Date> (Left Aligned)
    $pdf->SetFont('helvetica', '', 11);
    $pdf->Cell(0, 5, 'Printed on: ' . $printDate, 0, 1, 'L');
    
    // Separator line
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);
    $pdf->Ln(8);
    
    // CRV Details section
    $pdf->SetFont('helvetica', '', 11);
    
    // First line: STORE and CRV NUMBER
    $pdf->Cell(90, 6, 'STORE: ' . strtoupper($crvData['store']), 0, 0, 'L');
    $pdf->Cell(90, 6, 'CRV NUMBER: ' . $crvData['crv_number'], 0, 1, 'R');
    
    // Second line: TRN DATETIME and CRV DATE
    $pdf->Cell(90, 6, 'TRN DATETIME: ' . $crvDateTime, 0, 0, 'L');
    $pdf->Cell(90, 6, 'CRV DATE: ' . $crvDateOnly, 0, 1, 'R');
    
    $pdf->Ln(3);
    
    // Separator line
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);
    $pdf->Ln(8);
    
    // Items table header
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->SetFillColor(240, 240, 240);
    $pdf->Cell(15, 8, 'S No', 1, 0, 'C', true);
    $pdf->Cell(25, 8, 'Code', 1, 0, 'C', true);
    $pdf->Cell(50, 8, 'Item Name', 1, 0, 'C', true);
    $pdf->Cell(20, 8, 'UOM', 1, 0, 'C', true);
    $pdf->Cell(20, 8, 'Qty', 1, 0, 'C', true);
    $pdf->Cell(25, 8, 'Rate', 1, 0, 'C', true);
    $pdf->Cell(25, 8, 'Amount', 1, 1, 'C', true);
    
    // Items data
    $pdf->SetFont('helvetica', '', 9);
    $sno = 1;
    foreach ($items as $item) {
        // Check if we need a new page
        if ($pdf->GetY() > 240) {
            $pdf->AddPage();
            // Redraw header on new page
            $pdf->SetFont('helvetica', 'B', 10);
            $pdf->SetFillColor(240, 240, 240);
            $pdf->Cell(15, 8, 'S No', 1, 0, 'C', true);
            $pdf->Cell(25, 8, 'Code', 1, 0, 'C', true);
            $pdf->Cell(50, 8, 'Item Name', 1, 0, 'C', true);
            $pdf->Cell(20, 8, 'UOM', 1, 0, 'C', true);
            $pdf->Cell(20, 8, 'Qty', 1, 0, 'C', true);
            $pdf->Cell(25, 8, 'Rate', 1, 0, 'C', true);
            $pdf->Cell(25, 8, 'Amount', 1, 1, 'C', true);
            $pdf->SetFont('helvetica', '', 9);
        }
        
        $pdf->Cell(15, 6, $sno++, 1, 0, 'C');
        $pdf->Cell(25, 6, $item['item_code'], 1, 0, 'C');
        
        // Handle long item names
        $itemName = strlen($item['item_name']) > 30 ? substr($item['item_name'], 0, 27) . '...' : $item['item_name'];
        $pdf->Cell(50, 6, $itemName, 1, 0, 'L');
        
        $pdf->Cell(20, 6, $item['uom'], 1, 0, 'C');
        $pdf->Cell(20, 6, number_format($item['quantity'], 2), 1, 0, 'R');
        $pdf->Cell(25, 6, number_format($item['rate'], 2), 1, 0, 'R');
        $pdf->Cell(25, 6, number_format($item['amount'], 2), 1, 1, 'R');
    }
    
    $pdf->Ln(5);
    
    // Total Bill Amount
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->Cell(0, 8, 'Total Bill Amount: ₹ ' . number_format($crvData['total_amount'], 2), 0, 1, 'R');
    
    $pdf->Ln(8);
    
    // REMARKS section
    $pdf->SetFont('helvetica', 'B', 11);
    $pdf->Cell(0, 6, 'REMARKS:', 0, 1, 'L');
    $pdf->SetFont('helvetica', '', 10);
    
    // Add remarks if any
    if (!empty($crvData['remarks'])) {
        $pdf->Cell(0, 6, $crvData['remarks'], 0, 1, 'L');
    }
    
    // Add some space for manual remarks
    $pdf->Ln(15);
    
    // Separator line
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);
    $pdf->Ln(8);
    
    // Signature section
    $pdf->SetFont('helvetica', 'B', 10);
    $signatureWidth = 36;


    // Add some space for manual remarks
    $pdf->Ln(5);
    
    // Signature headers
    $pdf->Cell($signatureWidth, 6, 'R/JCO', 1, 0, 'C');
    $pdf->Cell($signatureWidth, 6, 'D/JCO', 1, 0, 'C');
    $pdf->Cell($signatureWidth, 6, 'MESS/JCO', 1, 0, 'C');
    $pdf->Cell($signatureWidth, 6, 'FOOD MEMBER', 1, 0, 'C');
    $pdf->Cell($signatureWidth, 6, 'MESS SECY', 1, 1, 'C');
    

    
    // Clean any output buffer
    if (ob_get_length()) {
        ob_end_clean();
    }
    
    // Set proper headers for PDF download
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="CRV_' . str_replace(['/', ' '], ['_', '_'], $crvData['crv_number']) . '.pdf"');
    header('Cache-Control: private, max-age=0, must-revalidate');
    header('Pragma: public');
    
    // Output PDF
    $pdf->Output('CRV_' . str_replace(['/', ' '], ['_', '_'], $crvData['crv_number']) . '.pdf', 'D');
    
} catch (Exception $e) {
    // Clean any output buffer
    if (ob_get_length()) {
        ob_end_clean();
    }
    
    // Return error as JSON
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Error generating PDF: ' . $e->getMessage()
    ]);
}
?>
?>