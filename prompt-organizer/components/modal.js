/**
 * PromptVault - Modal Component
 * Handles all modal operations
 */

const Modal = {
    // Modal elements
    promptModal: null,
    previewModal: null,
    deleteModal: null,

    // Current state
    currentPromptId: null,

    /**
     * Initialize modals
     */
    init() {
        this.promptModal = document.getElementById('promptModal');
        this.previewModal = document.getElementById('previewModal');
        this.deleteModal = document.getElementById('deleteModal');

        this.bindEvents();
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Close buttons
        document.getElementById('closeModal')?.addEventListener('click', () => this.closePromptModal());
        document.getElementById('cancelBtn')?.addEventListener('click', () => this.closePromptModal());
        document.getElementById('closePreviewModal')?.addEventListener('click', () => this.closePreviewModal());
        document.getElementById('closePreviewBtn')?.addEventListener('click', () => this.closePreviewModal());
        document.getElementById('closeDeleteModal')?.addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => this.closeDeleteModal());

        // Close on overlay click
        this.promptModal?.addEventListener('click', (e) => {
            if (e.target === this.promptModal) this.closePromptModal();
        });
        this.previewModal?.addEventListener('click', (e) => {
            if (e.target === this.previewModal) this.closePreviewModal();
        });
        this.deleteModal?.addEventListener('click', (e) => {
            if (e.target === this.deleteModal) this.closeDeleteModal();
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAll();
            }
        });

        // Form submission
        document.getElementById('promptForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePromptSubmit();
        });

        // Copy from preview
        document.getElementById('copyPreviewBtn')?.addEventListener('click', () => {
            const content = document.getElementById('previewContent')?.textContent;
            if (content) {
                App.copyToClipboard(content);
            }
        });
    },

    /**
     * Open create prompt modal
     */
    openCreateModal() {
        const form = document.getElementById('promptForm');
        const title = document.getElementById('modalTitle');
        const submitBtn = document.getElementById('submitBtn');
        
        // Reset form
        form.reset();
        document.getElementById('promptId').value = '';
        
        // Update title and button
        title.textContent = 'Create New Prompt';
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Prompt';
        
        // Open modal
        this.promptModal.classList.add('active');
        
        // Focus first input
        setTimeout(() => {
            document.getElementById('promptTitle')?.focus();
        }, 100);
    },

    /**
     * Open edit prompt modal
     */
    openEditModal(promptId) {
        const prompts = Storage.getAllPrompts();
        const prompt = prompts.find(p => p.id === promptId);
        
        if (!prompt) return;
        
        const form = document.getElementById('promptForm');
        const title = document.getElementById('modalTitle');
        const submitBtn = document.getElementById('submitBtn');
        
        // Fill form
        document.getElementById('promptId').value = prompt.id;
        document.getElementById('promptTitle').value = prompt.title || '';
        document.getElementById('promptDescription').value = prompt.description || '';
        document.getElementById('promptContent').value = prompt.content || '';
        document.getElementById('promptCategory').value = prompt.category || '';
        document.getElementById('promptDifficulty').value = prompt.difficulty || '';
        document.getElementById('promptTags').value = (prompt.tags || []).join(', ');
        
        // Update title and button
        title.textContent = 'Edit Prompt';
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Prompt';
        
        // Open modal
        this.promptModal.classList.add('active');
    },

    /**
     * Close create/edit prompt modal
     */
    closePromptModal() {
        this.promptModal?.classList.remove('active');
    },

    /**
     * Open preview modal
     */
    openPreviewModal(promptId) {
        const prompts = Storage.getAllPrompts();
        const prompt = prompts.find(p => p.id === promptId);
        
        if (!prompt) return;
        
        this.currentPromptId = promptId;
        
        // Fill preview data
        document.getElementById('previewTitle').textContent = prompt.title || 'Untitled';
        document.getElementById('previewContent').textContent = prompt.content || '';
        document.getElementById('previewDate').textContent = `Created: ${this.formatDate(prompt.createdAt)}`;
        document.getElementById('previewUsage').textContent = `Used: ${prompt.usageCount || 0} times`;
        
        // Set category badge
        const categoryEl = document.getElementById('previewCategory');
        categoryEl.textContent = this.capitalizeFirst(prompt.category || 'Other');
        categoryEl.className = `preview-category prompt-card-category ${prompt.category || 'other'}`;
        
        // Render tags
        const tagsContainer = document.getElementById('previewTags');
        if (prompt.tags && prompt.tags.length > 0) {
            tagsContainer.innerHTML = prompt.tags.map(tag => 
                `<span class="prompt-tag">${this.escapeHtml(tag)}</span>`
            ).join('');
            tagsContainer.style.display = 'flex';
        } else {
            tagsContainer.style.display = 'none';
        }
        
        // Open modal
        this.previewModal.classList.add('active');
    },

    /**
     * Close preview modal
     */
    closePreviewModal() {
        this.previewModal?.classList.remove('active');
        this.currentPromptId = null;
    },

    /**
     * Open delete confirmation modal
     */
    openDeleteModal(promptId) {
        this.currentPromptId = promptId;
        
        // Bind confirm button
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        confirmBtn.onclick = () => this.confirmDelete();
        
        // Open modal
        this.deleteModal.classList.add('active');
    },

    /**
     * Close delete modal
     */
    closeDeleteModal() {
        this.deleteModal?.classList.remove('active');
        this.currentPromptId = null;
    },

    /**
     * Confirm delete action
     */
    confirmDelete() {
        if (this.currentPromptId) {
            App.deletePrompt(this.currentPromptId);
            this.closeDeleteModal();
        }
    },

    /**
     * Close all modals
     */
    closeAll() {
        this.closePromptModal();
        this.closePreviewModal();
        this.closeDeleteModal();
    },

    /**
     * Handle prompt form submission
     */
    handlePromptSubmit() {
        const id = document.getElementById('promptId').value;
        const title = document.getElementById('promptTitle').value.trim();
        const description = document.getElementById('promptDescription').value.trim();
        const content = document.getElementById('promptContent').value.trim();
        const category = document.getElementById('promptCategory').value;
        const difficulty = document.getElementById('promptDifficulty').value;
        const tagsInput = document.getElementById('promptTags').value;
        
        // Validate required fields
        if (!title || !content || !category) {
            App.showToast('Please fill in all required fields', 'error');
            return;
        }
        
        // Parse tags
        const tags = Search.parseTags(tagsInput);
        
        const promptData = {
            title,
            description,
            content,
            category,
            difficulty,
            tags
        };
        
        if (id) {
            // Update existing prompt
            const updated = Storage.updatePrompt(id, promptData);
            if (updated) {
                App.showToast('Prompt updated successfully!', 'success');
                App.refreshCurrentView();
            } else {
                App.showToast('Failed to update prompt', 'error');
            }
        } else {
            // Create new prompt
            const newPrompt = Storage.addPrompt(promptData);
            if (newPrompt) {
                App.showToast('Prompt created successfully!', 'success');
                App.refreshCurrentView();
            } else {
                App.showToast('Failed to create prompt', 'error');
            }
        }
        
        this.closePromptModal();
    },

    /**
     * Format date
     */
    formatDate(timestamp) {
        if (!timestamp) return 'Unknown';
        
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    },

    /**
     * Capitalize first letter
     */
    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Export for use in other modules
window.Modal = Modal;

