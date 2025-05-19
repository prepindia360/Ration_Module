class AddItemManager {
    constructor() {
        this.categories = [];
        this.recentItems = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCategories();
        this.loadRecentItems();
        this.setupFormValidation();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('addItemForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveItem();
        });

        // Clear form button
        document.getElementById('clearFormBtn').addEventListener('click', () => {
            this.clearForm();
        });

        // View items button
        document.getElementById('viewItemsBtn').addEventListener('click', () => {
            this.viewAllItems();
        });

        // Category autocomplete
        this.setupCategoryAutocomplete();

        // Auto-generate item code based on name and category
        document.getElementById('itemName').addEventListener('blur', () => {
            this.generateItemCode();
        });

        document.getElementById('itemCategory').addEventListener('blur', () => {
            this.generateItemCode();
        });
    }

    setupCategoryAutocomplete() {
        const categoryInput = document.getElementById('itemCategory');
        const categoryList = document.getElementById('categoryList');

        categoryInput.addEventListener('input', () => {
            this.filterCategories(categoryInput.value);
        });

        categoryInput.addEventListener('focus', () => {
            categoryList.classList.add('show');
            this.filterCategories(categoryInput.value);
        });

        categoryInput.addEventListener('blur', () => {
            setTimeout(() => {
                categoryList.classList.remove('show');
            }, 200);
        });
    }

    filterCategories(searchTerm) {
        const categoryList = document.getElementById('categoryList');
        const filteredCategories = this.categories.filter(cat => 
            cat.cat.toLowerCase().includes(searchTerm.toLowerCase())
        );

        categoryList.innerHTML = filteredCategories.map(cat => 
            `<li onclick="addItemManager.selectCategory('${cat.cat}')">${cat.cat}</li>`
        ).join('');
    }

    selectCategory(categoryName) {
        document.getElementById('itemCategory').value = categoryName;
        document.getElementById('categoryList').classList.remove('show');
        this.generateItemCode();
    }

    async loadCategories() {
        try {
            const response = await fetch('api/get_categories.php');
            const result = await response.json();
            
            if (result.success) {
                this.categories = result.data;
                this.filterCategories('');
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async loadRecentItems() {
        try {
            const response = await fetch('api/get_recent_items.php?limit=10');
            const result = await response.json();
            
            if (result.success) {
                this.recentItems = result.data;
                this.renderRecentItems();
            }
        } catch (error) {
            console.error('Error loading recent items:', error);
        }
    }

    renderRecentItems() {
        const tbody = document.getElementById('recentItemsBody');
        
        if (this.recentItems.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-box" style="font-size: 3rem; color: #bdc3c7;"></i>
                        <p style="margin-top: 1rem; color: #7f8c8d;">No recent items found</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.recentItems.map(item => {
            const createdDate = new Date(item.created_at).toLocaleDateString('en-IN');
            const statusBadge = item.is_active === '1' 
                ? '<span class="status-badge status-active">Active</span>'
                : '<span class="status-badge status-inactive">Inactive</span>';

            return `
                <tr>
                    <td>${item.item_code}</td>
                    <td>${item.item_name}</td>
                    <td>${item.category || item.ration_type || 'N/A'}</td>
                    <td>${item.item_uom}</td>
                    <td>₹${parseFloat(item.rate).toFixed(2)}</td>
                    <td>${statusBadge}</td>
                    <td>${createdDate}</td>
                </tr>
            `;
        }).join('');
    }

    generateItemCode() {
        const itemName = document.getElementById('itemName').value.trim();
        const category = document.getElementById('itemCategory').value.trim();
        const itemCodeField = document.getElementById('itemCode');

        if (itemName && category) {
            // Generate code like: RICE001, SUGAR001, etc.
            const namePrefix = itemName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
            const categoryPrefix = category.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
            const timestamp = Date.now().toString().slice(-3);
            
            let generatedCode = '';
            if (namePrefix.length >= 3) {
                generatedCode = namePrefix + timestamp;
            } else {
                generatedCode = (categoryPrefix + namePrefix).substring(0, 3) + timestamp;
            }

            // Only set if field is empty or user hasn't manually entered a code
            if (!itemCodeField.value || itemCodeField.dataset.autoGenerated === 'true') {
                itemCodeField.value = generatedCode;
                itemCodeField.dataset.autoGenerated = 'true';
            }
        }
    }

    setupFormValidation() {
        // Item code manual entry detection
        document.getElementById('itemCode').addEventListener('input', (e) => {
            e.target.dataset.autoGenerated = 'false';
        });

        // Real-time validation
        const requiredFields = ['itemName', 'itemCode', 'itemCategory', 'itemUOM', 'itemRate'];
        requiredFields.forEach(fieldId => {
            document.getElementById(fieldId).addEventListener('blur', () => {
                this.validateField(fieldId);
            });
        });
    }

    validateField(fieldId) {
        const field = document.getElementById(fieldId);
        const value = field.value.trim();
        
        // Remove existing validation classes
        field.classList.remove('error', 'success');
        
        if (field.required && !value) {
            field.classList.add('error');
            return false;
        } else if (value) {
            field.classList.add('success');
        }

        // Specific validations
        switch (fieldId) {
            case 'itemCode':
                return this.validateItemCode(value);
            case 'itemRate':
                return this.validateRate(value);
            default:
                return true;
        }
    }

    async validateItemCode(code) {
        if (!code) return false;

        try {
            const response = await fetch('api/check_item_code.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ item_code: code })
            });
            
            const result = await response.json();
            const field = document.getElementById('itemCode');
            
            if (result.exists) {
                field.classList.add('error');
                this.showFieldError('itemCode', 'Item code already exists');
                return false;
            } else {
                field.classList.remove('error');
                field.classList.add('success');
                this.clearFieldError('itemCode');
                return true;
            }
        } catch (error) {
            console.error('Error validating item code:', error);
            return true; // Allow submission on validation error
        }
    }

    validateRate(rate) {
        const numRate = parseFloat(rate);
        const field = document.getElementById('itemRate');
        
        if (isNaN(numRate) || numRate <= 0) {
            field.classList.add('error');
            this.showFieldError('itemRate', 'Rate must be a positive number');
            return false;
        } else {
            field.classList.remove('error');
            field.classList.add('success');
            this.clearFieldError('itemRate');
            return true;
        }
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const existingError = field.parentNode.querySelector('.error-message');
        
        if (existingError) {
            existingError.textContent = message;
        } else {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            field.parentNode.appendChild(errorDiv);
        }
    }

    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    async saveItem() {
        // Validate all fields first
        const requiredFields = ['itemName', 'itemCode', 'itemCategory', 'itemUOM', 'itemRate'];
        let isValid = true;

        for (const fieldId of requiredFields) {
            if (!this.validateField(fieldId)) {
                isValid = false;
            }
        }

        if (!isValid) {
            this.showErrorModal('Please fix the validation errors before submitting');
            return;
        }

        // Additional validation
        const itemCode = document.getElementById('itemCode').value.trim();
        if (!(await this.validateItemCode(itemCode))) {
            return;
        }

        this.showLoading();

        try {
            const formData = this.collectFormData();
            const response = await fetch('api/add_item.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            this.hideLoading();

            if (result.success) {
                this.showSuccessModal('Item added successfully!');
                this.clearForm();
                this.loadRecentItems(); // Refresh recent items
            } else {
                throw new Error(result.message || 'Failed to add item');
            }
        } catch (error) {
            this.hideLoading();
            console.error('Error saving item:', error);
            this.showErrorModal('Error saving item: ' + error.message);
        }
    }

    collectFormData() {
        return {
            item_name: document.getElementById('itemName').value.trim(),
            item_code: document.getElementById('itemCode').value.trim(),
            category: document.getElementById('itemCategory').value.trim(),
            ration_type: document.getElementById('rationType').value,
            item_uom: document.getElementById('itemUOM').value,
            rate: parseFloat(document.getElementById('itemRate').value),
            description: document.getElementById('itemDescription').value.trim(),
            is_active: parseInt(document.getElementById('isActive').value)
        };
    }

    clearForm() {
        const form = document.getElementById('addItemForm');
        form.reset();
        
        // Clear validation classes and error messages
        form.querySelectorAll('.form-control').forEach(field => {
            field.classList.remove('error', 'success');
        });
        
        form.querySelectorAll('.error-message').forEach(error => {
            error.remove();
        });

        // Reset auto-generated flag
        document.getElementById('itemCode').dataset.autoGenerated = 'true';
        
        // Focus on first field
        document.getElementById('itemName').focus();
    }

    viewAllItems() {
        // Open a new window or navigate to items list
        window.open('view_items.html', '_blank');
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

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }
}

// Global function for modal closing
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.addItemManager = new AddItemManager();
});

// Add custom styles for validation
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .form-control.error {
            border-color: #e74c3c;
            box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
        }
        .form-control.success {
            border-color: #27ae60;
            box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
        }
        .error-message {
            color: #e74c3c;
            font-size: 0.8rem;
            margin-top: 0.25rem;
            display: block;
        }
        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-active {
            background: #d4edda;
            color: #155724;
        }
        .status-inactive {
            background: #f8d7da;
            color: #721c24;
        }
    `;
    document.head.appendChild(style);
});