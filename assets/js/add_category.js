class AddCategoryManager {
    constructor() {
        this.existingCategories = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadExistingCategories();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('addCategoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCategory();
        });

        // Clear form button
        document.getElementById('clearFormBtn').addEventListener('click', () => {
            this.clearForm();
        });

        // View categories button
        document.getElementById('viewCategoriesBtn').addEventListener('click', () => {
            this.viewAllCategories();
        });

        // Category suggestions
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                const description = btn.dataset.desc;
                this.applySuggestion(category, description);
            });
        });

        // Form validation
        document.getElementById('categoryName').addEventListener('input', () => {
            this.validateCategoryName();
        });
    }

    applySuggestion(category, description) {
        document.getElementById('categoryName').value = category;
        document.getElementById('categoryDescription').value = description;
        this.validateCategoryName();
        
        // Add visual feedback
        const btn = document.querySelector(`[data-category="${category}"]`);
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
        }, 150);
    }

    async validateCategoryName() {
        const categoryName = document.getElementById('categoryName').value.trim().toUpperCase();
        const field = document.getElementById('categoryName');
        
        // Clear previous validation
        field.classList.remove('error', 'success');
        this.clearFieldError('categoryName');
        
        if (!categoryName) {
            return false;
        }

        // Check if category exists
        const exists = this.existingCategories.some(cat => 
            cat.cat.toUpperCase() === categoryName
        );

        if (exists) {
            field.classList.add('error');
            this.showFieldError('categoryName', 'Category already exists');
            return false;
        } else {
            field.classList.add('success');
            return true;
        }
    }

    async loadExistingCategories() {
        try {
            const response = await fetch('api/get_categories.php');
            const result = await response.json();
            
            if (result.success) {
                this.existingCategories = result.data;
                this.renderExistingCategories();
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    renderExistingCategories() {
        const categoriesGrid = document.getElementById('categoriesGrid');
        
        if (this.existingCategories.length === 0) {
            categoriesGrid.innerHTML = `
                <div class="loading-placeholder">
                    <i class="fas fa-tags" style="font-size: 3rem; color: #bdc3c7;"></i>
                    <p style="margin-top: 1rem; color: #7f8c8d;">No categories found</p>
                </div>
            `;
            return;
        }

        categoriesGrid.innerHTML = this.existingCategories.map(category => {
            const statusBadge = category.is_active === '1' || category.is_active === 1
                ? '<span class="category-status status-active">Active</span>'
                : '<span class="category-status status-inactive">Inactive</span>';

            const icon = this.getCategoryIcon(category.cat);
            const createdDate = category.created_at 
                ? new Date(category.created_at).toLocaleDateString('en-IN')
                : 'N/A';

            return `
                <div class="category-card">
                    <h4>
                        <i class="${icon}"></i>
                        ${category.cat}
                    </h4>
                    <p>${category.description || 'No description available'}</p>
                    ${statusBadge}
                    <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #6c757d;">
                        Created: ${createdDate}
                    </div>
                </div>
            `;
        }).join('');
    }

    getCategoryIcon(categoryName) {
        const icons = {
            'RATION': 'fas fa-seedling',
            'GROCERY': 'fas fa-shopping-basket',
            'VEGETABLE': 'fas fa-carrot',
            'FRUIT': 'fas fa-apple-alt',
            'MEAT': 'fas fa-drumstick-bite',
            'FISH': 'fas fa-fish',
            'DAIRY': 'fas fa-cheese',
            'BAKERY': 'fas fa-bread-slice',
            'BEVERAGES': 'fas fa-coffee',
            'STATIONARY': 'fas fa-pen',
            'CLEANING': 'fas fa-broom',
            'MEDICAL': 'fas fa-medkit',
            'EQUIPMENT': 'fas fa-tools',
            'MISCELLANEOUS': 'fas fa-ellipsis-h'
        };
        return icons[categoryName.toUpperCase()] || 'fas fa-tag';
    }

    async saveCategory() {
        // Validate form
        if (!this.validateCategoryName()) {
            this.showErrorModal('Please fix the validation errors before submitting');
            return;
        }

        const categoryName = document.getElementById('categoryName').value.trim();
        if (!categoryName) {
            this.showErrorModal('Category name is required');
            return;
        }

        this.showLoading();

        try {
            const formData = this.collectFormData();
            const response = await fetch('api/add_category.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            this.hideLoading();

            if (result.success) {
                this.showSuccessModal('Category added successfully!');
                this.clearForm();
                this.loadExistingCategories(); // Refresh categories list
            } else {
                throw new Error(result.message || 'Failed to add category');
            }
        } catch (error) {
            this.hideLoading();
            console.error('Error saving category:', error);
            this.showErrorModal('Error saving category: ' + error.message);
        }
    }

    collectFormData() {
        return {
            cat: document.getElementById('categoryName').value.trim().toUpperCase(),
            description: document.getElementById('categoryDescription').value.trim(),
            is_active: parseInt(document.getElementById('categoryStatus').value)
        };
    }

    clearForm() {
        const form = document.getElementById('addCategoryForm');
        form.reset();
        
        // Clear validation classes and error messages
        form.querySelectorAll('.form-control').forEach(field => {
            field.classList.remove('error', 'success');
        });
        
        form.querySelectorAll('.error-message').forEach(error => {
            error.remove();
        });
        
        // Focus on first field
        document.getElementById('categoryName').focus();
    }

    viewAllCategories() {
        // Toggle visibility of existing categories section
        const section = document.querySelector('.form-section:last-child');
        section.scrollIntoView({ behavior: 'smooth' });
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
    window.addCategoryManager = new AddCategoryManager();
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
        .vendor-status.status-active {
            background: #d4edda;
            color: #155724;
        }
        .vendor-status.status-inactive {
            background: #f8d7da;
            color: #721c24;
        }
    `;
    document.head.appendChild(style);
});
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
        .suggestion-btn.used {
            background: #e8f5e9;
            border-color: #4caf50;
            color: #2e7d32;
        }
    `;
    document.head.appendChild(style);
});