/**
 * PromptVault - Prompt Card Component
 * Renders individual prompt cards
 */

const PromptCard = {
    /**
     * Render a single prompt card
     */
    render(prompt) {
        const card = document.createElement('div');
        card.className = 'prompt-card';
        card.dataset.id = prompt.id;
        
        // Get preview text (first 150 characters)
        const previewText = this.getPreviewText(prompt.content, 150);
        
        // Format date
        const dateStr = this.formatDate(prompt.createdAt);
        
        // Generate category icon
        const categoryIcon = this.getCategoryIcon(prompt.category);
        
        // Generate tags HTML
        const tagsHtml = this.renderTags(prompt.tags);
        
        card.innerHTML = `
            <div class="prompt-card-header">
                <h3 class="prompt-card-title">${this.escapeHtml(prompt.title)}</h3>
                <div class="prompt-card-actions">
                    <button class="prompt-card-action favorite" 
                            data-action="favorite" 
                            data-id="${prompt.id}"
                            title="${prompt.favorite ? 'Remove from favorites' : 'Add to favorites'}">
                        <i class="fas fa-star${prompt.favorite ? '' : '-o'}"></i>
                    </button>
                    <button class="prompt-card-action" 
                            data-action="edit" 
                            data-id="${prompt.id}"
                            title="Edit prompt">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="prompt-card-action delete" 
                            data-action="delete" 
                            data-id="${prompt.id}"
                            title="Delete prompt">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="prompt-card-preview">${this.escapeHtml(previewText)}</div>
            
            <div class="prompt-card-meta">
                <span class="prompt-card-category ${prompt.category}">
                    ${categoryIcon} ${this.capitalizeFirst(prompt.category)}
                </span>
                <span class="prompt-card-usage">
                    <i class="fas fa-copy"></i> ${prompt.usageCount || 0}
                </span>
            </div>
            
            ${tagsHtml ? `<div class="prompt-card-tags">${tagsHtml}</div>` : ''}
            
            <div class="prompt-card-footer">
                <button class="btn btn-secondary btn-sm" data-action="copy" data-id="${prompt.id}">
                    <i class="fas fa-copy"></i> Copy
                </button>
                <button class="btn btn-ghost btn-sm" data-action="preview" data-id="${prompt.id}">
                    <i class="fas fa-eye"></i> Preview
                </button>
                <button class="btn btn-ghost btn-sm" data-action="duplicate" data-id="${prompt.id}" title="Duplicate">
                    <i class="fas fa-clone"></i>
                </button>
            </div>
        `;
        
        return card;
    },

    /**
     * Render multiple prompt cards in a container
     */
    renderGrid(prompts, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Clear existing content
        container.innerHTML = '';
        
        if (!prompts || prompts.length === 0) {
            return;
        }
        
        // Add cards with staggered animation
        prompts.forEach((prompt, index) => {
            const card = this.render(prompt);
            card.style.animationDelay = `${index * 0.05}s`;
            container.appendChild(card);
        });
    },

    /**
     * Render tags as pills
     */
    renderTags(tags) {
        if (!tags || !Array.isArray(tags) || tags.length === 0) {
            return '';
        }
        
        return tags.slice(0, 4).map(tag => 
            `<span class="prompt-tag">${this.escapeHtml(tag)}</span>`
        ).join('') + (tags.length > 4 ? `<span class="prompt-tag">+${tags.length - 4}</span>` : '');
    },

    /**
     * Get preview text (truncated)
     */
    getPreviewText(text, maxLength = 150) {
        if (!text) return '';
        
        // Remove extra whitespace
        const cleaned = text.replace(/\s+/g, ' ').trim();
        
        if (cleaned.length <= maxLength) {
            return cleaned;
        }
        
        return cleaned.substring(0, maxLength) + '...';
    },

    /**
     * Get category icon
     */
    getCategoryIcon(category) {
        const icons = {
            coding: '<i class="fas fa-code"></i>',
            design: '<i class="fas fa-palette"></i>',
            marketing: '<i class="fas fa-bullhorn"></i>',
            writing: '<i class="fas fa-pen"></i>',
            productivity: '<i class="fas fa-rocket"></i>',
            other: '<i class="fas fa-folder"></i>'
        };
        
        return icons[category] || icons.other;
    },

    /**
     * Format date to readable string
     */
    formatDate(timestamp) {
        if (!timestamp) return '';
        
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        if (!text) return '';
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Capitalize first letter
     */
    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Render category card for categories view
     */
    renderCategoryCard(category, count) {
        const icons = {
            coding: 'fa-code',
            design: 'fa-palette',
            marketing: 'fa-bullhorn',
            writing: 'fa-pen',
            productivity: 'fa-rocket',
            other: 'fa-folder'
        };
        
        const labels = {
            coding: 'Coding Prompts',
            design: 'Design Prompts',
            marketing: 'Marketing Prompts',
            writing: 'Writing Prompts',
            productivity: 'Productivity Prompts',
            other: 'Other Prompts'
        };
        
        const card = document.createElement('div');
        card.className = 'category-card';
        card.dataset.category = category;
        
        card.innerHTML = `
            <div class="category-card-icon ${category}">
                <i class="fas ${icons[category] || icons.other}"></i>
            </div>
            <h3>${labels[category] || 'Other'}</h3>
            <p>${count} prompt${count !== 1 ? 's' : ''}</p>
        `;
        
        return card;
    },

    /**
     * Render all category cards
     */
    renderCategoriesGrid(counts) {
        const container = document.getElementById('categoriesGrid');
        if (!container) return;
        
        container.innerHTML = '';
        
        Object.entries(counts).forEach(([category, count]) => {
            const card = this.renderCategoryCard(category, count);
            container.appendChild(card);
        });
    },

    /**
     * Show empty state
     */
    showEmptyState(containerId, message = 'No prompts found', showCreateButton = true) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>${message}</h3>
                ${showCreateButton ? `
                    <button class="btn btn-primary" id="emptyCreateBtn">
                        <i class="fas fa-plus"></i> Create Prompt
                    </button>
                ` : ''}
            </div>
        `;
        
        // Add event listener to create button
        if (showCreateButton) {
            const createBtn = document.getElementById('emptyCreateBtn');
            if (createBtn) {
                createBtn.addEventListener('click', () => {
                    App.openCreateModal();
                });
            }
        }
    },

    /**
     * Render sidebar category filters
     */
    renderSidebarCategories(counts) {
        const container = document.getElementById('categoryFilters');
        if (!container) return;
        
        const colors = {
            coding: '#3b82f6',
            design: '#ec4899',
            marketing: '#f97316',
            writing: '#8b5cf6',
            productivity: '#10b981',
            other: '#64748b'
        };
        
        const labels = {
            coding: 'Coding',
            design: 'Design',
            marketing: 'Marketing',
            writing: 'Writing',
            productivity: 'Productivity',
            other: 'Other'
        };
        
        container.innerHTML = Object.entries(counts).map(([category, count]) => `
            <li>
                <a href="#" data-category="${category}">
                    <span class="category-dot" style="background: ${colors[category]}"></span>
                    <span>${labels[category]}</span>
                    <span class="category-count">${count}</span>
                </a>
            </li>
        `).join('');
    }
};

// Export for use in other modules
window.PromptCard = PromptCard;

