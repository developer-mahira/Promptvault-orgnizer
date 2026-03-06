 /**
 * PromptVault - Search Utility Module
 * Handles search and filter operations for prompts
 */

const Search = {
    /**
     * Search prompts by query string
     * Searches in: title, description, content, tags, category
     */
    search(prompts, query) {
        if (!query || !query.trim()) {
            return prompts;
        }
        
        const searchTerm = query.toLowerCase().trim();
        
        return prompts.filter(prompt => {
            // Search in title
            if (prompt.title && prompt.title.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            // Search in description
            if (prompt.description && prompt.description.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            // Search in content
            if (prompt.content && prompt.content.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            // Search in category
            if (prompt.category && prompt.category.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            // Search in tags
            if (prompt.tags && Array.isArray(prompt.tags)) {
                const tagMatch = prompt.tags.some(tag => 
                    tag.toLowerCase().includes(searchTerm)
                );
                if (tagMatch) return true;
            }
            
            return false;
        });
    },

    /**
     * Filter prompts by category
     */
    filterByCategory(prompts, category) {
        if (!category || category === 'all') {
            return prompts;
        }
        
        return prompts.filter(prompt => 
            prompt.category && prompt.category.toLowerCase() === category.toLowerCase()
        );
    },

    /**
     * Filter prompts by favorite status
     */
    filterByFavorite(prompts, favoritesOnly = true) {
        if (!favoritesOnly) {
            return prompts;
        }
        
        return prompts.filter(prompt => prompt.favorite);
    },

    /**
     * Filter prompts by multiple criteria
     */
    filter(prompts, options = {}) {
        let result = [...prompts];
        
        // Apply search query
        if (options.query) {
            result = this.search(result, options.query);
        }
        
        // Apply category filter
        if (options.category && options.category !== 'all') {
            result = this.filterByCategory(result, options.category);
        }
        
        // Apply favorites filter
        if (options.favoritesOnly) {
            result = this.filterByFavorite(result, true);
        }
        
        // Apply sorting
        if (options.sortBy) {
            result = this.sort(result, options.sortBy);
        }
        
        return result;
    },

    /**
     * Sort prompts
     */
    sort(prompts, sortBy = 'newest') {
        const sorted = [...prompts];
        
        switch (sortBy) {
            case 'newest':
                return sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            
            case 'oldest':
                return sorted.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
            
            case 'title':
                return sorted.sort((a, b) => 
                    (a.title || '').localeCompare(b.title || '')
                );
            
            case 'usage':
                return sorted.sort((a, b) => 
                    (b.usageCount || 0) - (a.usageCount || 0)
                );
            
            default:
                return sorted;
        }
    },

    /**
     * Get search suggestions based on existing data
     */
    getSuggestions(prompts, query) {
        if (!query || query.length < 2) {
            return [];
        }
        
        const suggestions = new Set();
        const searchTerm = query.toLowerCase();
        
        prompts.forEach(prompt => {
            // Add matching titles
            if (prompt.title && prompt.title.toLowerCase().includes(searchTerm)) {
                suggestions.add(prompt.title);
            }
            
            // Add matching tags
            if (prompt.tags && Array.isArray(prompt.tags)) {
                prompt.tags.forEach(tag => {
                    if (tag.toLowerCase().includes(searchTerm)) {
                        suggestions.add(tag);
                    }
                });
            }
            
            // Add matching categories
            if (prompt.category && prompt.category.toLowerCase().includes(searchTerm)) {
                suggestions.add(prompt.category);
            }
        });
        
        return Array.from(suggestions).slice(0, 5);
    },

    /**
     * Highlight search term in text
     */
    highlight(text, query) {
        if (!query || !text) return text;
        
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },

    /**
     * Escape special regex characters
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * Parse tags from string (comma separated)
     */
    parseTags(tagsString) {
        if (!tagsString || !tagsString.trim()) {
            return [];
        }
        
        return tagsString
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
    },

    /**
     * Get unique tags from all prompts
     */
    getAllTags(prompts) {
        const tagsSet = new Set();
        
        prompts.forEach(prompt => {
            if (prompt.tags && Array.isArray(prompt.tags)) {
                prompt.tags.forEach(tag => tagsSet.add(tag));
            }
        });
        
        return Array.from(tagsSet).sort();
    },

    /**
     * Get recent searches from localStorage
     */
    getRecentSearches() {
        try {
            const data = localStorage.getItem('promptvault_recent_searches');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    /**
     * Save a recent search
     */
    saveRecentSearch(query) {
        if (!query || query.trim().length < 2) return;
        
        try {
            let recent = this.getRecentSearches();
            recent = recent.filter(s => s !== query);
            recent.unshift(query);
            recent = recent.slice(0, 10); // Keep only 10 recent
            localStorage.setItem('promptvault_recent_searches', JSON.stringify(recent));
        } catch (e) {
            console.error('Error saving recent search:', e);
        }
    },

    /**
     * Clear recent searches
     */
    clearRecentSearches() {
        try {
            localStorage.removeItem('promptvault_recent_searches');
        } catch (e) {
            console.error('Error clearing recent searches:', e);
        }
    }
};

// Export for use in other modules
window.Search = Search;

