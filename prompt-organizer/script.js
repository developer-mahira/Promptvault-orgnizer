/**
 * PromptVault - Main Application Script
 * Initializes and manages the entire application
 */

const App = {
    // Current state
    currentView: 'dashboard',
    currentFilter: {
        query: '',
        category: 'all',
        favoritesOnly: false,
        sortBy: 'newest'
    },

    /**
     * Initialize the application
     */
    init() {
        this.initTheme();
        this.initSidebar();
        this.initEventListeners();
        this.loadData();
        this.setupKeyboardShortcuts();
    },

    /**
     * Initialize theme
     */
    initTheme() {
        const theme = Storage.getTheme();
        document.documentElement.setAttribute('data-theme', theme);
        
        const themeToggle = document.getElementById('themeToggle');
        const darkModeToggle = document.getElementById('darkModeToggle');
        
        // Update toggle icons
        if (theme === 'dark') {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            if (darkModeToggle) darkModeToggle.checked = true;
        }
        
        themeToggle?.addEventListener('click', () => this.toggleTheme());
        darkModeToggle?.addEventListener('change', (e) => this.setTheme(e.target.checked ? 'dark' : 'light'));
    },

    /**
     * Toggle theme
     */
    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    },

    /**
     * Set theme
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        Storage.setTheme(theme);
        
        const themeToggle = document.getElementById('themeToggle');
        const darkModeToggle = document.getElementById('darkModeToggle');
        
        if (theme === 'dark') {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            if (darkModeToggle) darkModeToggle.checked = true;
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            if (darkModeToggle) darkModeToggle.checked = false;
        }
    },

    /**
     * Initialize sidebar
     */
    initSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        
        // Check stored state
        const isExpanded = Storage.getSidebarState();
        if (!isExpanded) {
            sidebar.classList.add('collapsed');
        }
        
        sidebarToggle?.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            Storage.setSidebarState(!sidebar.classList.contains('collapsed'));
        });
        
        hamburgerBtn?.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
            
            // Create overlay if not exists
            let overlay = document.querySelector('.sidebar-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                document.body.appendChild(overlay);
            }
            
            overlay.classList.toggle('active');
            
            overlay?.addEventListener('click', () => {
                sidebar.classList.remove('mobile-open');
                overlay.classList.remove('active');
            });
        });
    },

    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view;
                this.switchView(view);
            });
        });
        
        // Sidebar category filters
        document.getElementById('categoryFilters')?.addEventListener('click', (e) => {
            const link = e.target.closest('[data-category]');
            if (link) {
                e.preventDefault();
                const category = link.dataset.category;
                this.filterByCategory(category);
            }
        });
        
        // Category cards
        document.getElementById('categoriesGrid')?.addEventListener('click', (e) => {
            const card = e.target.closest('.category-card');
            if (card) {
                const category = card.dataset.category;
                this.filterByCategory(category);
                this.switchView('all');
            }
        });
        
        // Create prompt button
        document.getElementById('createPromptBtn')?.addEventListener('click', () => this.openCreateModal());
        
        // Search input
        const searchInput = document.getElementById('searchInput');
        let searchTimeout;
        searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.currentFilter.query = e.target.value;
                this.refreshCurrentView();
            }, 300);
        });
        
        // Sort select
        document.getElementById('sortSelect')?.addEventListener('change', (e) => {
            this.currentFilter.sortBy = e.target.value;
            this.refreshCurrentView();
        });
        
        // Export buttons
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportPrompts());
        document.getElementById('settingsExportBtn')?.addEventListener('click', () => this.exportPrompts());
        
        // Import buttons
        document.getElementById('importBtn')?.addEventListener('click', () => this.triggerImport());
        document.getElementById('settingsImportBtn')?.addEventListener('click', () => this.triggerImport());
        
        // File input
        document.getElementById('fileInput')?.addEventListener('change', (e) => this.handleImport(e));
        
        // Clear data button
        document.getElementById('clearDataBtn')?.addEventListener('click', () => this.clearAllData());
        
        // Prompt card actions (event delegation)
        document.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]');
            if (!action) return;
            
            const actionType = action.dataset.action;
            const promptId = action.dataset.id;
            
            switch (actionType) {
                case 'favorite':
                    this.toggleFavorite(promptId);
                    break;
                case 'edit':
                    this.openEditModal(promptId);
                    break;
                case 'delete':
                    this.openDeleteModal(promptId);
                    break;
                case 'copy':
                    this.copyPrompt(promptId);
                    break;
                case 'preview':
                    this.openPreviewModal(promptId);
                    break;
                case 'duplicate':
                    this.duplicatePrompt(promptId);
                    break;
            }
        });
        
        // Initialize modals
        Modal.init();
    },

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + K for search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('searchInput')?.focus();
            }
            
            // Cmd/Ctrl + N for new prompt
            if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
                e.preventDefault();
                this.openCreateModal();
            }
        });
    },

    /**
     * Load data and render
     */
    loadData() {
        this.updateStats();
        this.renderDashboard();
        this.renderAllPrompts();
        this.renderFavorites();
        this.renderCategories();
    },

    /**
     * Update statistics
     */
    updateStats() {
        const prompts = Storage.getAllPrompts();
        const favorites = Storage.getFavorites();
        const counts = Storage.getCategoryCounts();
        
        // Update counts in sidebar
        document.getElementById('allPromptsCount').textContent = prompts.length;
        document.getElementById('favoritesCount').textContent = favorites.length;
        
        // Update dashboard stats
        document.getElementById('totalPrompts').textContent = prompts.length;
        document.getElementById('totalFavorites').textContent = favorites.length;
        document.getElementById('codingCount').textContent = counts.coding;
        document.getElementById('designCount').textContent = counts.design;
        
        // Update sidebar category filters
        PromptCard.renderSidebarCategories(counts);
    },

    /**
     * Switch view
     */
    switchView(view) {
        this.currentView = view;
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });
        
        // Show/hide views
        document.querySelectorAll('.view').forEach(v => {
            v.classList.toggle('active', v.id === view + 'View');
        });
        
        // Reset filters for some views
        if (view === 'favorites') {
            this.currentFilter.favoritesOnly = true;
            this.currentFilter.category = 'all';
        } else if (view === 'categories') {
            this.currentFilter.favoritesOnly = false;
            this.currentFilter.category = 'all';
        } else if (view === 'dashboard') {
            this.currentFilter.favoritesOnly = false;
            this.currentFilter.category = 'all';
            this.renderDashboard();
        } else if (view === 'all') {
            this.currentFilter.favoritesOnly = false;
            this.currentFilter.category = 'all';
            this.renderAllPrompts();
        }
        
        // Close mobile sidebar
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        sidebar?.classList.remove('mobile-open');
        overlay?.classList.remove('active');
        
        // Refresh view
        this.refreshCurrentView();
    },

    /**
     * Refresh current view
     */
    refreshCurrentView() {
        switch (this.currentView) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'all':
                this.renderAllPrompts();
                break;
            case 'favorites':
                this.renderFavorites();
                break;
            case 'categories':
                this.renderCategories();
                break;
        }
        
        this.updateStats();
    },

    /**
     * Render dashboard
     */
    renderDashboard() {
        const container = document.getElementById('recentPromptsGrid');
        if (!container) return;
        
        let prompts = Storage.getAllPrompts();
        
        // Apply search filter
        if (this.currentFilter.query) {
            prompts = Search.search(prompts, this.currentFilter.query);
        }
        
        // Get recent (last 6)
        prompts = prompts.slice(0, 6);
        
        if (prompts.length === 0) {
            PromptCard.showEmptyState('recentPromptsGrid', 'No prompts yet. Create your first one!', true);
        } else {
            PromptCard.renderGrid(prompts, 'recentPromptsGrid');
        }
    },

    /**
     * Render all prompts
     */
    renderAllPrompts() {
        const container = document.getElementById('allPromptsGrid');
        const emptyState = document.getElementById('emptyAllPrompts');
        if (!container) return;
        
        let prompts = Storage.getAllPrompts();
        
        // Apply filters
        prompts = Search.filter(prompts, this.currentFilter);
        
        if (prompts.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
        } else {
            if (emptyState) emptyState.style.display = 'none';
            PromptCard.renderGrid(prompts, 'allPromptsGrid');
        }
    },

    /**
     * Render favorites
     */
    renderFavorites() {
        const container = document.getElementById('favoritesGrid');
        const emptyState = document.getElementById('emptyFavorites');
        if (!container) return;
        
        let prompts = Storage.getFavorites();
        
        // Apply search
        if (this.currentFilter.query) {
            prompts = Search.search(prompts, this.currentFilter.query);
        }
        
        // Apply sort
        prompts = Search.sort(prompts, this.currentFilter.sortBy);
        
        if (prompts.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
        } else {
            if (emptyState) emptyState.style.display = 'none';
            PromptCard.renderGrid(prompts, 'favoritesGrid');
        }
    },

    /**
     * Render categories
     */
    renderCategories() {
        const counts = Storage.getCategoryCounts();
        PromptCard.renderCategoriesGrid(counts);
    },

    /**
     * Filter by category
     */
    filterByCategory(category) {
        this.currentFilter.category = category;
        this.currentFilter.favoritesOnly = false;
        this.switchView('all');
    },

    /**
     * Open create modal
     */
    openCreateModal() {
        Modal.openCreateModal();
    },

    /**
     * Open edit modal
     */
    openEditModal(promptId) {
        Modal.openEditModal(promptId);
    },

    /**
     * Open preview modal
     */
    openPreviewModal(promptId) {
        Modal.openPreviewModal(promptId);
    },

    /**
     * Open delete modal
     */
    openDeleteModal(promptId) {
        Modal.openDeleteModal(promptId);
    },

    /**
     * Toggle favorite
     */
    toggleFavorite(promptId) {
        const isFavorite = Storage.toggleFavorite(promptId);
        
        if (isFavorite) {
            this.showToast('Added to favorites!', 'success');
        } else {
            this.showToast('Removed from favorites', 'info');
        }
        
        this.refreshCurrentView();
    },

    /**
     * Copy prompt to clipboard
     */
    copyPrompt(promptId) {
        const prompts = Storage.getAllPrompts();
        const prompt = prompts.find(p => p.id === promptId);
        
        if (prompt) {
            this.copyToClipboard(prompt.content);
            Storage.incrementUsage(promptId);
            this.showToast('Prompt copied successfully!', 'success');
            
            // Refresh to update usage count
            setTimeout(() => this.refreshCurrentView(), 500);
        }
    },

    /**
     * Copy text to clipboard
     */
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(err => {
            console.error('Failed to copy:', err);
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        });
    },

    /**
     * Duplicate prompt
     */
    duplicatePrompt(promptId) {
        const newPrompt = Storage.duplicatePrompt(promptId);
        
        if (newPrompt) {
            this.showToast('Prompt duplicated successfully!', 'success');
            this.refreshCurrentView();
        } else {
            this.showToast('Failed to duplicate prompt', 'error');
        }
    },

    /**
     * Delete prompt
     */
    deletePrompt(promptId) {
        if (Storage.deletePrompt(promptId)) {
            this.showToast('Prompt deleted successfully!', 'success');
            this.refreshCurrentView();
        } else {
            this.showToast('Failed to delete prompt', 'error');
        }
    },

    /**
     * Export prompts
     */
    exportPrompts() {
        if (Storage.exportPrompts()) {
            this.showToast('Prompts exported successfully!', 'success');
        } else {
            this.showToast('Failed to export prompts', 'error');
        }
    },

    /**
     * Trigger import
     */
    triggerImport() {
        document.getElementById('fileInput')?.click();
    },

    /**
     * Handle import
     */
    handleImport(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = Storage.importPrompts(e.target?.result);
            
            if (result.success) {
                this.showToast(`Successfully imported ${result.count} prompts!`, 'success');
                this.refreshCurrentView();
            } else {
                this.showToast(`Import failed: ${result.error}`, 'error');
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    },

    /**
     * Clear all data
     */
    clearAllData() {
        if (confirm('Are you sure you want to delete all prompts? This cannot be undone.')) {
            if (Storage.clearAllPrompts()) {
                this.showToast('All prompts cleared!', 'success');
                this.refreshCurrentView();
            } else {
                this.showToast('Failed to clear prompts', 'error');
            }
        }
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'check',
            error: 'times',
            info: 'info'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${icons[type] || 'info'}"></i>
            </div>
            <span class="toast-message">${message}</span>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Close button
        toast.querySelector('.toast-close')?.addEventListener('click', () => {
            this.removeToast(toast);
        });
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            this.removeToast(toast);
        }, 4000);
    },

    /**
     * Remove toast
     */
    removeToast(toast) {
        if (!toast) return;
        
        toast.classList.add('toast-exit');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

