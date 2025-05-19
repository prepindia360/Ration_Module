class CRVManager {
    constructor() {
        this.itemsData = [];
        this.currentCRVNumber = null;
        this.currentCRVId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeDatetime();
        this.loadDropdownData();
        this.setupSearchableDropdowns();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('crvForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveData();
        });

        // Add item button
        document.getElementById('addItemBtn').addEventListener('click', () => {
            this.addItem();
        });

        // Clear all button
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.showConfirmModal('Are you sure you want to clear all data?', () => {
                this.clearAll();
            });
        });

        // Export & Print button
        document.getElementById('exportPrintBtn').addEventListener('click', () => {
            this.exportAndPrint();
        });

        // Quantity input listener for amount calculation
        document.getElementById('quantity').addEventListener('input', () => {
            this.calculateAmount();
        });

        // Item selection listeners
        document.getElementById('itemName').addEventListener('change', () => {
            this.updateItemDetails();
        });

        // Category change listener
        document.getElementById('category').addEventListener('change', () => {
            this.generateCRVNumber();
        });

        // Supplier change listener
        document.getElementById('supplierName').addEventListener('change', () => {
            this.updateSupplierCode();
        });

        // Click outside to close dropdowns
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown-container')) {
                this.closeAllDropdowns();
            }
        });
    }

    initializeDatetime() {
        const now = new Date();
        const formattedDate = this.formatDateForSQL(now);
        document.getElementById('crvDate').value = formattedDate;
    }

    formatDateForSQL(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    }

    formatDateForCRV(date) {
        const year = String(date.getFullYear()).slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${day}${month}${year}`;
    }

    async loadDropdownData() {
        try {
            // Load categories
            const categories = await this.fetchData('api/get_categories.php');
            this.populateDropdown('categoryList', categories, 'cat');

            // Load suppliers
            const suppliers = await this.fetchData('api/get_suppliers.php');
            this.populateDropdown('supplierList', suppliers, 'supplier_name');

            // Load stores
            const stores = await this.fetchData('api/get_stores.php');
            this.populateDropdown('storeList', stores, 'store');

            // Load items
            const items = await this.fetchData('api/get_items.php');
            this.populateDropdown('itemList', items, 'item_name');
        } catch (error) {
            console.error('Error loading dropdown data:', error);
            this.showErrorModal('Failed to load necessary data. Please refresh the page.');
        }
    }

    async fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'Unknown error');
        }
        return result.data;
    }

    populateDropdown(listId, data, displayKey) {
        const list = document.getElementById(listId);
        list.innerHTML = '';
        
        data.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item[displayKey];
            li.dataset.value = JSON.stringify(item);
            li.addEventListener('click', () => {
                this.selectDropdownItem(listId, item, displayKey);
            });
            list.appendChild(li);
        });
    }

    setupSearchableDropdowns() {
        const dropdowns = document.querySelectorAll('.searchable-dropdown');
        
        dropdowns.forEach(dropdown => {
            dropdown.addEventListener('click', () => {
                this.showDropdown(dropdown);
            });

            dropdown.addEventListener('input', () => {
                this.filterDropdown(dropdown);
            });

            dropdown.addEventListener('focus', () => {
                this.showDropdown(dropdown);
            });
        });
    }

    showDropdown(input) {
        const container = input.closest('.dropdown-container');
        const list = container.querySelector('.dropdown-list');
        
        this.closeAllDropdowns();
        list.classList.add('show');
        this.filterDropdown(input);
    }

    closeAllDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown-list');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }

    filterDropdown(input) {
        const container = input.closest('.dropdown-container');
        const list = container.querySelector('.dropdown-list');
        const items = list.querySelectorAll('li');
        const searchTerm = input.value.toLowerCase();

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            const isVisible = text.includes(searchTerm);
            item.style.display = isVisible ? 'block' : 'none';
        });
    }

    selectDropdownItem(listId, item, displayKey) {
        const list = document.getElementById(listId);
        const input = list.closest('.dropdown-container').querySelector('.searchable-dropdown');
        
        input.value = item[displayKey];
        list.classList.remove('show');

        // Trigger specific actions based on dropdown type
        const inputId = input.id;
        if (inputId === 'category') {
            this.generateCRVNumber();
        } else if (inputId === 'supplierName') {
            this.updateSupplierCode(item);
        } else if (inputId === 'itemName') {
            this.updateItemDetails(item);
        }
    }

    async generateCRVNumber() {
        const category = document.getElementById('category').value;
        if (!category) return;

        try {
            const response = await fetch('api/generate_crv_number.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ category })
            });

            const result = await response.json();
            if (result.success) {
                document.getElementById('crvNumber').value = result.crv_number;
                this.currentCRVNumber = result.crv_number;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error generating CRV number:', error);
            this.showErrorModal('Failed to generate CRV number.');
        }
    }

    updateSupplierCode(supplier = null) {
        if (!supplier) {
            const supplierName = document.getElementById('supplierName').value;
            const supplierList = document.getElementById('supplierList');
            const supplierItems = supplierList.querySelectorAll('li');
            
            for (let item of supplierItems) {
                const itemData = JSON.parse(item.dataset.value);
                if (itemData.supplier_name === supplierName) {
                    supplier = itemData;
                    break;
                }
            }
        }

        if (supplier) {
            document.getElementById('supplierCode').value = supplier.supplier_code;
        }
    }

    updateItemDetails(item = null) {
        if (!item) {
            const itemName = document.getElementById('itemName').value;
            const itemList = document.getElementById('itemList');
            const itemItems = itemList.querySelectorAll('li');
            
            for (let listItem of itemItems) {
                const itemData = JSON.parse(listItem.dataset.value);
                if (itemData.item_name === itemName) {
                    item = itemData;
                    break;
                }
            }
        }

        if (item) {
            document.getElementById('itemCode').value = item.item_code;
            document.getElementById('uom').value = item.item_uom;
            document.getElementById('rate').value = item.rate;
            this.calculateAmount();
        }
    }

    calculateAmount() {
        const rate = parseFloat(document.getElementById('rate').value) || 0;
        const quantity = parseFloat(document.getElementById('quantity').value) || 0;
        const amount = rate * quantity;
        
        document.getElementById('amount').value = amount.toFixed(2);
    }

    addItem() {
        const itemName = document.getElementById('itemName').value;
        const itemCode = document.getElementById('itemCode').value;
        const uom = document.getElementById('uom').value;
        const rate = parseFloat(document.getElementById('rate').value) || 0;
        const quantity = parseFloat(document.getElementById('quantity').value) || 0;
        const amount = parseFloat(document.getElementById('amount').value) || 0;

        if (!itemName || !quantity) {
            this.showErrorModal('Please select an item and enter quantity.');
            return;
        }

        const itemData = {
            name: itemName,
            code: itemCode,
            uom: uom,
            rate: rate,
            quantity: quantity,
            amount: amount
        };

        this.itemsData.push(itemData);
        this.updateItemsTable();
        this.clearItemForm();
    }

    updateItemsTable() {
        const tableBody = document.getElementById('itemsTableBody');
        tableBody.innerHTML = '';

        this.itemsData.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${item.uom}</td>
                <td>${item.quantity}</td>
                <td>₹${item.rate.toFixed(2)}</td>
                <td>₹${item.amount.toFixed(2)}</td>
                <td>
                    <button type="button" class="btn btn-danger btn-sm" onclick="crvManager.removeItem(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        this.updateTotalAmount();
    }

    updateTotalAmount() {
        const total = this.itemsData.reduce((sum, item) => sum + item.amount, 0);
        document.getElementById('totalAmount').textContent = total.toFixed(2);
    }

    removeItem(index) {
        this.showConfirmModal('Are you sure you want to remove this item?', () => {
            this.itemsData.splice(index, 1);
            this.updateItemsTable();
        });
    }

    clearItemForm() {
        document.getElementById('itemName').value = '';
        document.getElementById('itemCode').value = '';
        document.getElementById('uom').value = '';
        document.getElementById('rate').value = '';
        document.getElementById('quantity').value = '';
        document.getElementById('amount').value = '';
    }

    clearAll() {
        // Clear form fields
        const form = document.getElementById('crvForm');
        const inputs = form.querySelectorAll('input[type="text"], input[type="number"], input[type="date"]');
        inputs.forEach(input => {
            if (!input.readOnly) {
                input.value = '';
            }
        });

        // Clear items data
        this.itemsData = [];
        this.updateItemsTable();

        // Reset CRV number and date
        this.currentCRVNumber = null;
        this.currentCRVId = null;
        this.initializeDatetime();
        document.getElementById('crvNumber').value = '';

        // Disable export button
        document.getElementById('exportPrintBtn').disabled = true;

        this.showSuccessModal('All data cleared successfully.');
    }

    async saveData() {
        if (!this.validateForm()) {
            return;
        }

        this.showLoading();

        try {
            const formData = this.collectFormData();
            const response = await fetch('api/save_crv.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            this.hideLoading();

            if (result.success) {
                this.currentCRVId = result.crv_id;
                document.getElementById('exportPrintBtn').disabled = false;
                this.showSuccessModal('CRV saved successfully!');
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            this.hideLoading();
            console.error('Error saving CRV:', error);
            this.showErrorModal('Failed to save CRV. Please try again.');
        }
    }

    validateForm() {
        const requiredFields = [
            { id: 'category', name: 'Category' },
            { id: 'supplierName', name: 'Supplier Name' },
            { id: 'store', name: 'Store' }
        ];

        for (let field of requiredFields) {
            const value = document.getElementById(field.id).value.trim();
            if (!value) {
                this.showErrorModal(`${field.name} is required.`);
                return false;
            }
        }

        if (this.itemsData.length === 0) {
            this.showErrorModal('Please add at least one item.');
            return false;
        }

        return true;
    }

    collectFormData() {
        return {
            category: document.getElementById('category').value,
            crv_number: document.getElementById('crvNumber').value,
            crv_date: document.getElementById('crvDate').value,
            supplier_name: document.getElementById('supplierName').value,
            supplier_code: document.getElementById('supplierCode').value,
            party_invoice_no: document.getElementById('partyInvoiceNo').value,
            party_invoice_date: document.getElementById('partyInvoiceDate').value,
            store: document.getElementById('store').value,
            items: this.itemsData,
            total_amount: this.itemsData.reduce((sum, item) => sum + item.amount, 0)
        };
    }

    async exportAndPrint() {
        if (!this.currentCRVId) {
            this.showErrorModal('Please save the CRV first.');
            return;
        }

        this.showLoading();

        try {
            const response = await fetch('api/export_pdf.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ crv_id: this.currentCRVId })
            });

            this.hideLoading();

            if (response.ok) {
                // Check if the response is JSON (error) or PDF
                const contentType = response.headers.get('content-type');
                
                if (contentType && contentType.includes('application/json')) {
                    // It's an error response
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to generate PDF');
                } else if (contentType && contentType.includes('application/pdf')) {
                    // It's a PDF file
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    
                    // Create a link and trigger download
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `CRV_${this.currentCRVNumber.replace(/[\/\s:]/g, '_')}.pdf`;
                    link.click();
                    
                    // Clean up
                    window.URL.revokeObjectURL(url);
                    
                    this.showSuccessModal('PDF exported successfully!');
                } else if (contentType && contentType.includes('text/html')) {
                    // It's an HTML fallback - open in new window
                    const htmlContent = await response.text();
                    const newWindow = window.open('', '_blank');
                    newWindow.document.write(htmlContent);
                    newWindow.document.close();
                    
                    this.showSuccessModal('PDF preview opened. Use your browser\'s print function to save as PDF.');
                } else {
                    throw new Error('Unexpected response format');
                }
            } else {
                // Try to get error message from response
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                } catch (jsonError) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }
        } catch (error) {
            this.hideLoading();
            console.error('Error exporting PDF:', error);
            
            // More detailed error message
            let errorMessage = 'Failed to export PDF: ' + error.message;
            if (error.message.includes('PDF library not found')) {
                errorMessage += '\n\nPlease install a PDF library:\n1. Run: composer require tecnickcom/tcpdf\n2. Or: composer require dompdf/dompdf';
            }
            
            this.showErrorModal(errorMessage);
        }
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.add('show');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('show');
    }

    showSuccessModal(message) {
        document.getElementById('successMessage').textContent = message;
        document.getElementById('successModal').classList.add('show');
    }

    showErrorModal(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorModal').classList.add('show');
    }

    showConfirmModal(message, callback) {
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmModal').classList.add('show');
        
        document.getElementById('confirmAction').onclick = () => {
            this.closeModal('confirmModal');
            callback();
        };
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }
}

// Section toggle functionality
function toggleSection(sectionName) {
    const content = document.getElementById(sectionName + 'Content');
    const toggle = document.getElementById(sectionName + 'Toggle');
    
    content.classList.toggle('collapsed');
    toggle.classList.toggle('collapsed');
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.crvManager = new CRVManager();
});

// Global function to close modals (called from HTML)
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}