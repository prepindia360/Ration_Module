class ViewCRVManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalItems = 0;
        this.crvData = [];
        this.filteredData = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCategories();
        this.loadCRVData();
    }

    setupEventListeners() {
        // Search button
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.searchCRVs();
        });

        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearFilters();
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadCRVData();
        });

        // Export buttons
        document.getElementById('exportExcelBtn').addEventListener('click', () => {
            this.exportToExcel();
        });

        document.getElementById('exportPDFBtn').addEventListener('click', () => {
            this.exportToPDF();
        });

        // Pagination buttons
        document.getElementById('prevBtn').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderTable();
            }
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderTable();
            }
        });

        // Enter key search
        document.querySelectorAll('#searchCRV, #searchSupplier').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchCRVs();
                }
            });
        });
    }

    async loadCategories() {
        try {
            const response = await fetch('api/get_categories.php');
            const result = await response.json();
            
            if (result.success) {
                const categorySelect = document.getElementById('searchCategory');
                categorySelect.innerHTML = '<option value="">All Categories</option>';
                
                result.data.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.cat;
                    option.textContent = category.cat;
                    categorySelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async loadCRVData() {
        try {
            this.showLoading(true);
            const response = await fetch('api/get_all_crv.php');
            const result = await response.json();
            
            if (result.success) {
                this.crvData = result.data;
                this.filteredData = [...this.crvData];
                this.currentPage = 1;
                this.renderTable();
                this.updateResultsInfo();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error loading CRV data:', error);
            this.showError('Failed to load CRV data');
        } finally {
            this.showLoading(false);
        }
    }

    searchCRVs() {
        const filters = {
            crvNumber: document.getElementById('searchCRV').value.toLowerCase(),
            supplier: document.getElementById('searchSupplier').value.toLowerCase(),
            category: document.getElementById('searchCategory').value,
            status: document.getElementById('searchStatus').value,
            dateFrom: document.getElementById('dateFrom').value,
            dateTo: document.getElementById('dateTo').value
        };

        this.filteredData = this.crvData.filter(crv => {
            // CRV Number filter
            if (filters.crvNumber && !crv.crv_number.toLowerCase().includes(filters.crvNumber)) {
                return false;
            }

            // Supplier filter
            if (filters.supplier && !crv.supplier_name.toLowerCase().includes(filters.supplier)) {
                return false;
            }

            // Category filter
            if (filters.category && crv.category !== filters.category) {
                return false;
            }

            // Status filter
            if (filters.status && crv.status !== filters.status) {
                return false;
            }

            // Date range filter
            if (filters.dateFrom || filters.dateTo) {
                const crvDate = new Date(crv.crv_date).toISOString().split('T')[0];
                
                if (filters.dateFrom && crvDate < filters.dateFrom) {
                    return false;
                }
                
                if (filters.dateTo && crvDate > filters.dateTo) {
                    return false;
                }
            }

            return true;
        });

        this.currentPage = 1;
        this.renderTable();
        this.updateResultsInfo();
    }

    clearFilters() {
        document.getElementById('searchCRV').value = '';
        document.getElementById('searchSupplier').value = '';
        document.getElementById('searchCategory').value = '';
        document.getElementById('searchStatus').value = '';
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
        
        this.filteredData = [...this.crvData];
        this.currentPage = 1;
        this.renderTable();
        this.updateResultsInfo();
    }

    renderTable() {
        const tbody = document.getElementById('crvTableBody');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = this.filteredData.slice(startIndex, endIndex);

        if (pageData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-search" style="font-size: 2rem; color: #bdc3c7;"></i>
                        <p style="margin-top: 1rem; color: #7f8c8d;">No CRVs found</p>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = pageData.map((crv, index) => {
                const serialNo = startIndex + index + 1;
                const date = new Date(crv.crv_date).toLocaleDateString('en-IN');
                const statusBadge = this.getStatusBadge(crv.status);
                
                return `
                    <tr>
                        <td>${serialNo}</td>
                        <td>${crv.crv_number}</td>
                        <td>${date}</td>
                        <td>${crv.category}</td>
                        <td>${crv.supplier_name}</td>
                        <td>${crv.store}</td>
                        <td>₹${parseFloat(crv.total_amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        <td>${statusBadge}</td>
                        <td>${crv.item_count || 0}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-primary btn-sm" onclick="viewCRVManager.viewDetails(${crv.id})" title="View Details">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-info btn-sm" onclick="viewCRVManager.downloadPDF(${crv.id})" title="Download PDF">
                                    <i class="fas fa-download"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        this.updatePagination();
    }

    getStatusBadge(status) {
        const badges = {
            'SAVED': '<span class="status-badge status-saved">Saved</span>',
            'APPROVED': '<span class="status-badge status-approved">Approved</span>',
            'DRAFT': '<span class="status-badge status-draft">Draft</span>',
            'CANCELLED': '<span class="status-badge status-cancelled">Cancelled</span>'
        };
        return badges[status] || `<span class="status-badge">${status}</span>`;
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const pageNumbers = document.getElementById('pageNumbers');

        // Update button states
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;

        // Generate page numbers
        let paginationHTML = '';
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-btn ${i === this.currentPage ? 'active' : ''}" onclick="viewCRVManager.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        pageNumbers.innerHTML = paginationHTML;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderTable();
    }

    updateResultsInfo() {
        document.getElementById('totalCount').textContent = this.crvData.length;
        document.getElementById('showingCount').textContent = this.filteredData.length;
    }

    async viewDetails(crvId) {
        try {
            const response = await fetch('api/get_crv_details.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ crv_id: crvId })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showCRVDetails(result.data);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error loading CRV details:', error);
            this.showError('Failed to load CRV details');
        }
    }

    showCRVDetails(data) {
        const { crv, items } = data;
        const modal = document.getElementById('crvDetailsModal');
        const modalTitle = document.getElementById('modalCRVNumber');
        const modalContent = document.getElementById('crvDetailsContent');

        modalTitle.textContent = `CRV Details - ${crv.crv_number}`;

        const crvDate = new Date(crv.crv_date).toLocaleDateString('en-IN');
        const invoiceDate = crv.party_invoice_date ? new Date(crv.party_invoice_date).toLocaleDateString('en-IN') : 'N/A';

        let itemsHTML = items.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.item_code}</td>
                <td>${item.item_name}</td>
                <td>${item.uom}</td>
                <td>${item.quantity}</td>
                <td>₹${parseFloat(item.rate).toFixed(2)}</td>
                <td>₹${parseFloat(item.amount).toFixed(2)}</td>
            </tr>
        `).join('');

        modalContent.innerHTML = `
            <div class="crv-details-container">
                <div class="details-grid">
                    <div class="detail-card">
                        <h4><i class="fas fa-info-circle"></i> CRV Information</h4>
                        <div class="detail-row"><strong>CRV Number:</strong> ${crv.crv_number}</div>
                        <div class="detail-row"><strong>Date:</strong> ${crvDate}</div>
                        <div class="detail-row"><strong>Category:</strong> ${crv.category}</div>
                        <div class="detail-row"><strong>Store:</strong> ${crv.store}</div>
                        <div class="detail-row"><strong>Status:</strong> ${this.getStatusBadge(crv.status)}</div>
                    </div>
                    
                    <div class="detail-card">
                        <h4><i class="fas fa-truck"></i> Supplier Information</h4>
                        <div class="detail-row"><strong>Name:</strong> ${crv.supplier_name}</div>
                        <div class="detail-row"><strong>Code:</strong> ${crv.supplier_code || 'N/A'}</div>
                        <div class="detail-row"><strong>Invoice No:</strong> ${crv.party_invoice_no || 'N/A'}</div>
                        <div class="detail-row"><strong>Invoice Date:</strong> ${invoiceDate}</div>
                    </div>
                </div>

                <div class="items-section">
                    <h4><i class="fas fa-box"></i> Items (${items.length})</h4>
                    <div class="table-responsive">
                        <table class="details-table">
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>Code</th>
                                    <th>Item Name</th>
                                    <th>UOM</th>
                                    <th>Quantity</th>
                                    <th>Rate</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHTML}
                            </tbody>
                            <tfoot>
                                <tr class="total-row">
                                    <td colspan="6"><strong>Total Amount:</strong></td>
                                    <td><strong>₹${parseFloat(crv.total_amount).toFixed(2)}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                ${crv.remarks ? `
                    <div class="remarks-section">
                        <h4><i class="fas fa-comment"></i> Remarks</h4>
                        <p>${crv.remarks}</p>
                    </div>
                ` : ''}
            </div>
        `;

        // Set up download button
        document.getElementById('downloadCRVBtn').onclick = () => {
            this.downloadPDF(crv.id);
            this.closeModal('crvDetailsModal');
        };

        modal.classList.add('show');
    }

    async downloadPDF(crvId) {
        try {
            const response = await fetch('api/export_pdf.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ crv_id: crvId })
            });

            if (response.ok) {
                const contentType = response.headers.get('content-type');
                
                if (contentType && contentType.includes('application/pdf')) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `CRV_${crvId}.pdf`;
                    link.click();
                    window.URL.revokeObjectURL(url);
                } else {
                    const htmlContent = await response.text();
                    const newWindow = window.open('', '_blank');
                    newWindow.document.write(htmlContent);
                    newWindow.document.close();
                }
            } else {
                throw new Error('Failed to download PDF');
            }
        } catch (error) {
            console.error('Error downloading PDF:', error);
            this.showError('Failed to download PDF');
        }
    }

    async exportToExcel() {
        try {
            const response = await fetch('api/export_excel.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: this.filteredData })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `CRV_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
                link.click();
                window.URL.revokeObjectURL(url);
            } else {
                throw new Error('Failed to export Excel');
            }
        } catch (error) {
            console.error('Error exporting Excel:', error);
            this.showError('Excel export feature coming soon!');
        }
    }

    async exportToPDF() {
        try {
            const response = await fetch('api/export_all_pdf.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: this.filteredData })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `CRV_Report_${new Date().toISOString().split('T')[0]}.pdf`;
                link.click();
                window.URL.revokeObjectURL(url);
            } else {
                throw new Error('Failed to export PDF');
            }
        } catch (error) {
            console.error('Error exporting PDF:', error);
            this.showError('PDF export feature coming soon!');
        }
    }

    showLoading(show) {
        const tableBody = document.getElementById('crvTableBody');
        if (show) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #3498db;"></i>
                        <p style="margin-top: 1rem; color: #666;">Loading CRV data...</p>
                    </td>
                </tr>
            `;
        }
    }

    showError(message) {
        const tableBody = document.getElementById('crvTableBody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #e74c3c;"></i>
                    <p style="margin-top: 1rem; color: #e74c3c;">${message}</p>
                    <button class="btn btn-primary" onclick="viewCRVManager.loadCRVData()">
                        <i class="fas fa-refresh"></i> Retry
                    </button>
                </td>
            </tr>
        `;
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }
}

// Global functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.viewCRVManager = new ViewCRVManager();
});

// Add styles for the modal content
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .crv-details-container {
            max-height: 70vh;
            overflow-y: auto;
        }
        .details-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .detail-card {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid #dee2e6;
        }
        .detail-card h4 {
            margin: 0 0 1rem 0;
            color: #495057;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .detail-row {
            margin: 0.5rem 0;
            padding: 0.25rem 0;
            border-bottom: 1px solid #e9ecef;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .items-section {
            margin: 2rem 0;
        }
        .items-section h4 {
            margin-bottom: 1rem;
            color: #495057;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .table-responsive {
            overflow-x: auto;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }
        .details-table th, .details-table td {
            padding: 0.75rem;
            text-align: left;
            border: 1px solid #dee2e6;
        }
        .details-table th {
            background-color: #f8f9fa;
            font-weight: 600;
        }
        .details-table .total-row {
            background-color: #e9ecef;
            font-weight: bold;
        }
        .remarks-section {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid #dee2e6;
        }
        .remarks-section h4 {
            margin: 0 0 0.5rem 0;
            color: #495057;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .remarks-section p {
            margin: 0;
            color: #6c757d;
        }
        .btn-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #6c757d;
            cursor: pointer;
        }
        .btn-close:hover {
            color: #495057;
        }
        .page-btn {
            padding: 0.5rem 1rem;
            border: 1px solid #ddd;
            background: white;
            cursor: pointer;
            border-radius: 5px;
            margin: 0 2px;
            transition: all 0.3s ease;
        }
        .page-btn:hover:not(.active) {
            background: #f8f9fa;
            border-color: #3498db;
        }
        .page-btn.active {
            background: #3498db;
            color: white;
            border-color: #3498db;
        }
    `;
    document.head.appendChild(style);
});