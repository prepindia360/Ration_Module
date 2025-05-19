@echo off
echo ======================================
echo PDF Library Installation for Ration Management System
echo ======================================

REM Check if Composer is installed
where composer >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Composer is not installed.
    echo Please install Composer first:
    echo Visit: https://getcomposer.org/download/
    pause
    exit /b 1
)

echo ✅ Composer found

REM Check if composer.json exists
if not exist "composer.json" (
    echo 📝 Creating composer.json...
    (
        echo {
        echo     "name": "ration-management-system",
        echo     "description": "Officers Mess Ration Management System",
        echo     "type": "project",
        echo     "require": {
        echo         "php": ">=7.4"
        echo     },
        echo     "minimum-stability": "stable",
        echo     "prefer-stable": true
        echo }
    ) > composer.json
)

echo 🔍 Installing PDF libraries...

REM Try to install TCPDF first
echo Installing TCPDF...
composer require tecnickcom/tcpdf

if %errorlevel% equ 0 (
    echo ✅ TCPDF installed successfully
) else (
    echo ⚠️  TCPDF installation failed, trying DomPDF...
    composer require dompdf/dompdf
    
    if %errorlevel% equ 0 (
        echo ✅ DomPDF installed successfully
    ) else (
        echo ❌ Both PDF libraries failed to install
        echo Please check your internet connection and try manually:
        echo composer require tecnickcom/tcpdf
        echo or
        echo composer require dompdf/dompdf
        pause
        exit /b 1
    )
)

REM Create a test script to verify installation
echo 📝 Creating test script...
(
    echo ^<?php
    echo require_once 'vendor/autoload.php';
    echo.
    echo echo "Testing PDF Libraries...\n";
    echo.
    echo // Test TCPDF
    echo if ^(class_exists^('TCPDF'^)^) {
    echo     echo "✅ TCPDF is available\n";
    echo } else {
    echo     echo "❌ TCPDF not found\n";
    echo }
    echo.
    echo // Test DomPDF
    echo if ^(class_exists^('Dompdf\Dompdf'^)^) {
    echo     echo "✅ DomPDF is available\n";
    echo } else {
    echo     echo "❌ DomPDF not found\n";
    echo }
    echo.
    echo echo "Test completed!\n";
    echo ?^>
) > test_pdf.php

REM Run the test
echo 🧪 Running PDF library test...
php test_pdf.php

REM Clean up test file
del test_pdf.php

echo.
echo ======================================
echo Installation completed!
echo Your Ration Management System should now be able to generate PDFs.
echo ======================================
echo.
echo 💡 Usage Tips:
echo - If TCPDF is installed, PDFs will have the best formatting
echo - If only DomPDF is available, it will use HTML-to-PDF conversion
echo - If no PDF library is available, it will show an HTML version for printing
echo.
echo 🔧 Troubleshooting:
echo - If you get memory errors, increase PHP memory_limit
echo - For permission issues, ensure vendor/ directory is writable
echo - Check your debug.php for detailed system information
echo.
pause