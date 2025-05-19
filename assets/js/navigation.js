// Navigation Enhancement JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    initializeNavigation();
    
    // Handle mobile menu toggle
    handleMobileMenu();
    
    // Add active states based on current page
    setActiveNavigationItem();
});

function initializeNavigation() {
    // Add click handlers for navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (!item.classList.contains('dropdown')) {
            item.addEventListener('click', () => {
                // Remove active class from all items
                navItems.forEach(nav => nav.classList.remove('active'));
                // Add active class to clicked item
                item.classList.add('active');
            });
        }
    });

    // Handle dropdown menus
    const dropdownItems = document.querySelectorAll('.nav-item.dropdown');
    dropdownItems.forEach(dropdown => {
        dropdown.addEventListener('click', (e) => {
            e.preventDefault();
            toggleDropdown(dropdown);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                closeDropdown(dropdown);
            }
        });
    });

    // Handle dropdown item clicks
    const dropdownLinks = document.querySelectorAll('.dropdown-item');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Remove active class from all dropdown items
            dropdownLinks.forEach(item => item.classList.remove('active'));
            // Add active class to clicked item
            link.classList.add('active');
            
            // Close the dropdown after selection
            const dropdown = link.closest('.nav-item.dropdown');
            if (dropdown) {
                closeDropdown(dropdown);
            }
        });
    });
}

function toggleDropdown(dropdown) {
    const isOpen = dropdown.classList.contains('open');
    
    // Close all other dropdowns
    document.querySelectorAll('.nav-item.dropdown').forEach(item => {
        if (item !== dropdown) {
            closeDropdown(item);
        }
    });
    
    // Toggle current dropdown
    if (isOpen) {
        closeDropdown(dropdown);
    } else {
        openDropdown(dropdown);
    }
}

function openDropdown(dropdown) {
    dropdown.classList.add('open');
    const menu = dropdown.querySelector('.dropdown-menu');
    if (menu) {
        menu.style.display = 'block';
        setTimeout(() => {
            menu.style.opacity = '1';
            menu.style.transform = 'translateY(0)';
        }, 10);
    }
}

function closeDropdown(dropdown) {
    dropdown.classList.remove('open');
    const menu = dropdown.querySelector('.dropdown-menu');
    if (menu) {
        menu.style.opacity = '0';
        menu.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            menu.style.display = 'none';
        }, 300);
    }
}

function handleMobileMenu() {
    // Add mobile menu toggle for responsive design
    const header = document.querySelector('.app-header');
    const nav = header.querySelector('.main-nav');
    
    // Create mobile menu button
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    mobileMenuBtn.style.display = 'none';
    
    // Insert mobile menu button
    header.querySelector('.header-left').appendChild(mobileMenuBtn);
    
    // Handle mobile menu toggle
    mobileMenuBtn.addEventListener('click', () => {
        nav.classList.toggle('mobile-open');
        const icon = mobileMenuBtn.querySelector('i');
        icon.className = nav.classList.contains('mobile-open') 
            ? 'fas fa-times' 
            : 'fas fa-bars';
    });
    
    // Show/hide mobile menu button based on screen size
    function handleResize() {
        if (window.innerWidth <= 768) {
            mobileMenuBtn.style.display = 'block';
        } else {
            mobileMenuBtn.style.display = 'none';
            nav.classList.remove('mobile-open');
        }
    }
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
}

function setActiveNavigationItem() {
    const currentPage = window.location.pathname.split('/').pop();
    const pageMap = {
        'index.html': { parent: 'add-data', child: 'Add CRV' },
        '': { parent: 'add-data', child: 'Add CRV' }, // Root path
        'add_items.html': { parent: 'add-data', child: 'Add Items' },
        'add_category.html': { parent: 'add-data', child: 'Add Category' },
        'add_vendor.html': { parent: 'add-data', child: 'Add Vendor' },
        'view_crv.html': { parent: 'transactions', child: 'View CRV' }
    };
    
    const mapping = pageMap[currentPage];
    if (mapping) {
        // Set parent dropdown as active
        const parentItem = document.querySelector(`[data-menu="${mapping.parent}"]`);
        if (parentItem) {
            parentItem.classList.add('active');
        }
        
        // Set child item as active
        const childItems = document.querySelectorAll('.dropdown-item');
        childItems.forEach(item => {
            if (item.textContent.trim().includes(mapping.child)) {
                item.classList.add('active');
            }
        });
    }
}

// Utility function to add CSS for mobile menu
function addMobileMenuStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .mobile-menu-btn {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 5px;
            transition: background 0.3s ease;
        }
        
        .mobile-menu-btn:hover {
            background: rgba(255,255,255,0.1);
        }
        
        @media (max-width: 768px) {
            .main-nav {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: #2c3e50;
                flex-direction: column;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transform: translateY(-100%);
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: 1000;
            }
            
            .main-nav.mobile-open {
                transform: translateY(0);
                opacity: 1;
                visibility: visible;
            }
            
            .nav-item {
                width: 100%;
                padding: 1rem;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            
            .nav-item:last-child {
                border-bottom: none;
            }
            
            .dropdown-menu {
                position: static;
                box-shadow: none;
                border-radius: 0;
                background: rgba(255,255,255,0.1);
                margin-top: 0.5rem;
            }
        }
    `;
    document.head.appendChild(style);
}

// Add mobile menu styles when DOM is loaded
document.addEventListener('DOMContentLoaded', addMobileMenuStyles);

// Breadcrumb functionality
function createBreadcrumb() {
    const breadcrumbContainer = document.createElement('div');
    breadcrumbContainer.className = 'breadcrumb-container';
    
    const breadcrumb = document.createElement('nav');
    breadcrumb.className = 'breadcrumb';
    breadcrumb.setAttribute('aria-label', 'breadcrumb');
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const pageNames = {
        'index.html': ['Home', 'Add Data', 'Add CRV'],
        'add_items.html': ['Home', 'Add Data', 'Add Items'],
        'add_category.html': ['Home', 'Add Data', 'Add Category'],
        'add_vendor.html': ['Home', 'Add Data', 'Add Vendor'],
        'view_crv.html': ['Home', 'Transactions', 'View CRV']
    };
    
    const breadcrumbItems = pageNames[currentPage] || ['Home'];
    
    breadcrumb.innerHTML = breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        return `
            <span class="breadcrumb-item ${isLast ? 'active' : ''}">
                ${isLast ? item : `<a href="#" onclick="navigateToPage('${item}')">${item}</a>`}
                ${!isLast ? '<i class="fas fa-chevron-right"></i>' : ''}
            </span>
        `;
    }).join('');
    
    breadcrumbContainer.appendChild(breadcrumb);
    
    // Insert breadcrumb after page header
    const pageHeader = document.querySelector('.page-header');
    if (pageHeader && !document.querySelector('.breadcrumb-container')) {
        pageHeader.parentNode.insertBefore(breadcrumbContainer, pageHeader);
    }
}

function navigateToPage(pageName) {
    const pageUrls = {
        'Home': 'index.html',
        'Add Data': 'index.html',
        'Add CRV': 'index.html',
        'Add Items': 'add_items.html',
        'Add Category': 'add_category.html',
        'Add Vendor': 'add_vendor.html',
        'Transactions': 'view_crv.html',
        'View CRV': 'view_crv.html'
    };
    
    const url = pageUrls[pageName];
    if (url) {
        window.location.href = url;
    }
}

// Add breadcrumb styles
document.addEventListener('DOMContentLoaded', () => {
    createBreadcrumb();
    
    const style = document.createElement('style');
    style.textContent = `
        .breadcrumb-container {
            background: #ecf0f1;
            padding: 1rem 2rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        
        .breadcrumb {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
        }
        
        .breadcrumb-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .breadcrumb-item a {
            color: #3498db;
            text-decoration: none;
            transition: color 0.3s ease;
        }
        
        .breadcrumb-item a:hover {
            color: #2980b9;
            text-decoration: underline;
        }
        
        .breadcrumb-item.active {
            color: #7f8c8d;
            font-weight: 600;
        }
        
        .breadcrumb-item i {
            font-size: 0.7rem;
            color: #bdc3c7;
        }
    `;
    document.head.appendChild(style);
});