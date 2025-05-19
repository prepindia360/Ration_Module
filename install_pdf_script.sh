#!/bin/bash

# PDF Library Installation Script for Ration Management System
# Run this script in your project root directory

echo "======================================"
echo "PDF Library Installation for Ration Management System"
echo "======================================"

# Check if Composer is installed
if ! command -v composer &> /dev/null; then
    echo "❌ Composer is not installed."
    echo "Please install Composer first:"
    echo "Visit: https://getcomposer.org/download/"
    exit 1
fi

echo "✅ Composer found"

# Check if composer.json exists
if [ ! -f "composer.json" ]; then
    echo "📝 Creating composer.json..."
    cat > composer.json << 'EOF'
{
    "name": "ration-management-system",
    "description": "Officers Mess Ration Management System",
    "type": "project",
    "require": {
        "php": ">=7.4"
    },
    "minimum-stability": "stable",
    "prefer-stable": true
}
EOF
fi

echo "🔍 Installing PDF libraries..."

# Try to install TCPDF first
echo "Installing TCPDF..."
composer require tecnickcom/tcpdf

# Check if TCPDF installation was successful
if [ $? -eq 0 ]; then
    echo "✅ TCPDF installed successfully"
else
    echo "⚠️  TCPDF installation failed, trying DomPDF..."
    composer require dompdf/dompdf
    
    if [ $? -eq 0 ]; then
        echo "✅ DomPDF installed successfully"
    else
        echo "❌ Both PDF libraries failed to install"
        echo "Please check your internet connection and try manually:"
        echo "composer require tecnickcom/tcpdf"
        echo "or"
        echo "composer require dompdf/dompdf"
        exit 1
    fi
fi

# Create a test script to verify installation
echo "📝 Creating test script..."
cat > test_pdf.php << 'EOF'
<?php
require_once 'vendor/autoload.php';

echo "Testing PDF Libraries...\n";

// Test TCPDF
if (class_exists('TCPDF')) {
    echo "✅ TCPDF is available\n";
} else {
    echo "❌ TCPDF not found\n";
}

// Test DomPDF
if (class_exists('Dompdf\Dompdf')) {
    echo "✅ DomPDF is available\n";
} else {
    echo "❌ DomPDF not found\n";
}

echo "Test completed!\n";
?>
EOF

# Run the test
echo "🧪 Running PDF library test..."
php test_pdf.php

# Clean up test file
rm test_pdf.php

echo ""
echo "======================================"
echo "Installation completed!"
echo "Your Ration Management System should now be able to generate PDFs."
echo "======================================"
echo ""
echo "💡 Usage Tips:"
echo "- If TCPDF is installed, PDFs will have the best formatting"
echo "- If only DomPDF is available, it will use HTML-to-PDF conversion"
echo "- If no PDF library is available, it will show an HTML version for printing"
echo ""
echo "🔧 Troubleshooting:"
echo "- If you get memory errors, increase PHP memory_limit"
echo "- For permission issues, ensure vendor/ directory is writable"
echo "- Check your debug.php for detailed system information"