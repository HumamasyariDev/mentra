// ============================================================================
// SEGMENTED CONTROL - Copy Length
// ============================================================================

const segmentedButtons = document.querySelectorAll('.segment-btn');

segmentedButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active class from all buttons
        segmentedButtons.forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Optional: Log the selected option
        console.log('Selected:', this.textContent.trim());
    });
});

// ============================================================================
// SEARCH INPUT - Focus/Blur Effects
// ============================================================================

const searchInput = document.querySelector('.search-input');

if (searchInput) {
    searchInput.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
        console.log('Search input focused');
    });

    searchInput.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });

    // Optional: Handle search input changes
    searchInput.addEventListener('input', function(e) {
        console.log('Search query:', e.target.value);
    });
}

// ============================================================================
// ACTION BUTTONS - Sort, Visible, Filters, Grid View
// ============================================================================

const sortBtn = document.querySelector('.action-btn:nth-child(1)');
const visibleBtn = document.querySelector('.action-btn:nth-child(2)');
const filtersBtn = document.querySelector('.action-btn:nth-child(3)');
const gridBtn = document.querySelector('.action-btn:nth-child(4)');

function handleActionButtonClick(btn, label) {
    if (btn) {
        btn.addEventListener('click', function() {
            console.log(`${label} clicked`);
            // Add visual feedback
            this.style.opacity = '0.7';
            setTimeout(() => {
                this.style.opacity = '1';
            }, 200);
        });
    }
}

handleActionButtonClick(sortBtn, 'Sort');
handleActionButtonClick(visibleBtn, 'Visible');
handleActionButtonClick(filtersBtn, 'Filters');
handleActionButtonClick(gridBtn, 'Grid View');

// ============================================================================
// AD CARD MENU BUTTONS
// ============================================================================

const adMenuBtns = document.querySelectorAll('.ad-menu-btn');

adMenuBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log('Ad menu clicked');
        // Could expand to show dropdown menu
        // For now, just provide feedback
        this.style.color = '#4a90e2';
        setTimeout(() => {
            this.style.color = '#95a5a6';
        }, 300);
    });
});

// ============================================================================
// YEAR NAVIGATION BUTTONS
// ============================================================================

const yearNavBtns = document.querySelectorAll('.year-nav-btn');

yearNavBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const direction = this.textContent.includes('←') ? 'prev' : 'next';
        console.log(`Navigate ${direction} year`);
        
        // Add animation feedback
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
});

// ============================================================================
// COMPETITOR BUTTON
// ============================================================================

const competitorBtn = document.querySelector('.btn-competitor');

if (competitorBtn) {
    competitorBtn.addEventListener('click', function() {
        console.log('Add competitor clicked');
        // Could trigger modal or dropdown
    });
}

// ============================================================================
// ICON BUTTONS - Notification, Search, Avatar
// ============================================================================

const notificationBtn = document.querySelector('.notification-btn');
const searchBtn = document.querySelector('.search-btn');
const avatarBtn = document.querySelector('.avatar-btn');

if (notificationBtn) {
    notificationBtn.addEventListener('click', function() {
        console.log('Notifications clicked');
    });
}

if (searchBtn) {
    searchBtn.addEventListener('click', function() {
        console.log('Search icon clicked');
        // Could trigger search modal
    });
}

if (avatarBtn) {
    avatarBtn.addEventListener('click', function() {
        console.log('Avatar clicked - user menu');
        // Could trigger user menu dropdown
    });
}

// ============================================================================
// CARD HOVER ANIMATIONS (Optional Enhancement)
// ============================================================================

const adCards = document.querySelectorAll('.ad-card');

adCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.08)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
    });
});

// ============================================================================
// INITIALIZATION
// ============================================================================

console.log('Dashboard script loaded successfully!');
