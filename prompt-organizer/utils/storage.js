/**
 * PromptVault - Storage Utility Module
 * Handles all LocalStorage operations for prompts
 */

const Storage = {
    // Storage keys
    PROMPTS_KEY: 'promptvault_prompts',
    THEME_KEY: 'promptvault_theme',
    SIDEBAR_KEY: 'promptvault_sidebar',

    /**
     * Generate a unique ID for prompts
     */
    generateId() {
        return 'prompt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Get all prompts from LocalStorage
     */
    getAllPrompts() {
        try {
            const data = localStorage.getItem(this.PROMPTS_KEY);
            if (data) {
                return JSON.parse(data);
            }
            // Initialize with sample prompts on first run
            this.initializeSamplePrompts();
            return this.getAllPrompts();
        } catch (error) {
            console.error('Error reading prompts from storage:', error);
            return [];
        }
    },

    /**
     * Initialize sample prompts for first-time users
     */
    initializeSamplePrompts() {
        const samplePrompts = [
            {
                id: this.generateId(),
                title: 'React Component Generator',
                description: 'Generate React functional components with props',
                content: `Create a React functional component with the following requirements:
- Use TypeScript
- Include prop types with proper typing
- Add error boundaries
- Include loading states
- Use modern React hooks`,
                category: 'coding',
                tags: ['React', 'TypeScript', 'Components'],
                difficulty: 'intermediate',
                favorite: true,
                usageCount: 5,
                createdAt: Date.now() - 86400000 * 2,
                updatedAt: Date.now() - 86400000
            },
            {
                id: this.generateId(),
                title: 'UI Design Brief Generator',
                description: 'Create design briefs for web projects',
                content: `Create a comprehensive UI design brief for a [PROJECT_TYPE] with these specifications:

1. Target Audience: [AUDIENCE_DESCRIPTION]
2. Primary Goals: [GOALS]
3. Brand Identity:
   - Color Palette: [COLORS]
   - Typography: [FONTS]
   - Visual Style: [STYLE]

4. Key Features:
   - [FEATURE_1]
   - [FEATURE_2]
   - [FEATURE_3]

5. Deliverables:
   - Wireframes
   - High-fidelity mockups
   - Design system components`,
                category: 'design',
                tags: ['UI Design', 'Brief', 'Web Design'],
                difficulty: 'beginner',
                favorite: false,
                usageCount: 3,
                createdAt: Date.now() - 86400000 * 5,
                updatedAt: Date.now() - 86400000 * 3
            },
            {
                id: this.generateId(),
                title: 'SEO Blog Post Outline',
                description: 'Generate SEO-friendly blog post structures',
                content: `Write a comprehensive SEO-optimized blog post outline on the topic: [TOPIC]

Requirements:
- Target keyword: [KEYWORD]
- Secondary keywords: [KEYWORD_1], [KEYWORD_2]
- Word count: 1500-2000 words
- Include at least 5 H2 headings
- Add meta description (under 160 characters)

Structure:
1. Introduction (hook + thesis)
2. H2: [Section 1]
   - H3: [Subsection]
   - H3: [Subsection]
3. H2: [Section 2]
4. H2: [Section 3]
5. Conclusion with CTA`,
                category: 'marketing',
                tags: ['SEO', 'Content', 'Blog'],
                difficulty: 'beginner',
                favorite: true,
                usageCount: 8,
                createdAt: Date.now() - 86400000 * 7,
                updatedAt: Date.now() - 86400000
            },
            {
                id: this.generateId(),
                title: 'Professional Email Template',
                description: 'Cold outreach email template',
                content: `Subject: [PERSONALIZED_HOOK]

Hi [NAME],

I noticed [SPECIFIC_OBSERVATION] and thought it was impressive because [REASON].

I'm reaching out because [VALUE_PROPOSITION].

Would you be open to a quick 15-minute call on [DATE/TIME]? Alternatively, feel free to book a time that works better for you: [CALENDAR_LINK]

Best regards,
[YOUR_NAME]

P.S. [ONE_SENTENCE_VALUE_ADD]`,
                category: 'writing',
                tags: ['Email', 'Outreach', 'Cold Email'],
                difficulty: 'beginner',
                favorite: false,
                usageCount: 12,
                createdAt: Date.now() - 86400000 * 10,
                updatedAt: Date.now() - 86400000 * 2
            },
            {
                id: this.generateId(),
                title: 'Daily Productivity Routine',
                description: 'Optimize daily workflow for maximum productivity',
                content: `Design an optimal daily productivity routine:

Morning Block (6 AM - 12 PM):
- [ ] Wake up at [TIME]
- [ ] Exercise for [DURATION]
- [ ] Healthy breakfast
- [ ] Review daily goals (top 3 priorities)
- [ ] Deep work session [HOURS]

Afternoon Block (12 PM - 6 PM):
- [ ] Lunch break
- [ ] Email and communication batch
- [ ] Meetings (keep to minimum)
- [ ] Task work sessions

Evening Block (6 PM - 10 PM):
- [ ] Personal development time
- [ ] Family/social time
- [ ] Prepare for next day
- [ ] Sleep by [TIME]`,
                category: 'productivity',
                tags: ['Routine', 'Time Management', 'Habits'],
                difficulty: 'intermediate',
                favorite: false,
                usageCount: 2,
                createdAt: Date.now() - 86400000 * 3,
                updatedAt: Date.now() - 86400000
            },
            {
                id: this.generateId(),
                title: 'Python Data Processing Script',
                description: 'Process and analyze CSV data',
                content: `Write a Python script to process CSV data with the following requirements:

1. Read CSV file from [FILE_PATH]
2. Clean and preprocess data:
   - Handle missing values
   - Remove duplicates
   - Standardize formats
3. Perform analysis:
   - Calculate statistics
   - Generate summary
   - Create visualizations
4. Output results to [OUTPUT_PATH]

Use libraries:
- pandas for data manipulation
- numpy for numerical operations
- matplotlib for visualization`,
                category: 'coding',
                tags: ['Python', 'Data', 'Automation'],
                difficulty: 'advanced',
                favorite: true,
                usageCount: 4,
                createdAt: Date.now() - 86400000 * 1,
                updatedAt: Date.now()
            }
        ];

        this.savePrompts(samplePrompts);
    },

    /**
     * Save prompts to LocalStorage
     */
    savePrompts(prompts) {
        try {
            localStorage.setItem(this.PROMPTS_KEY, JSON.stringify(prompts));
            return true;
        } catch (error) {
            console.error('Error saving prompts to storage:', error);
            return false;
        }
    },

    /**
     * Add a new prompt
     */
    addPrompt(promptData) {
        const prompts = this.getAllPrompts();
        const newPrompt = {
            id: this.generateId(),
            title: promptData.title,
            description: promptData.description || '',
            content: promptData.content,
            category: promptData.category,
            tags: promptData.tags || [],
            difficulty: promptData.difficulty || '',
            favorite: false,
            usageCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        prompts.unshift(newPrompt);
        
        if (this.savePrompts(prompts)) {
            return newPrompt;
        }
        return null;
    },

    /**
     * Update an existing prompt
     */
    updatePrompt(id, updates) {
        const prompts = this.getAllPrompts();
        const index = prompts.findIndex(p => p.id === id);
        
        if (index !== -1) {
            prompts[index] = {
                ...prompts[index],
                ...updates,
                updatedAt: Date.now()
            };
            
            if (this.savePrompts(prompts)) {
                return prompts[index];
            }
        }
        return null;
    },

    /**
     * Delete a prompt
     */
    deletePrompt(id) {
        const prompts = this.getAllPrompts();
        const filtered = prompts.filter(p => p.id !== id);
        
        if (this.savePrompts(filtered)) {
            return true;
        }
        return false;
    },

    /**
     * Toggle favorite status
     */
    toggleFavorite(id) {
        const prompts = this.getAllPrompts();
        const prompt = prompts.find(p => p.id === id);
        
        if (prompt) {
            prompt.favorite = !prompt.favorite;
            prompt.updatedAt = Date.now();
            
            if (this.savePrompts(prompts)) {
                return prompt.favorite;
            }
        }
        return null;
    },

    /**
     * Increment usage count for a prompt
     */
    incrementUsage(id) {
        const prompts = this.getAllPrompts();
        const prompt = prompts.find(p => p.id === id);
        
        if (prompt) {
            prompt.usageCount = (prompt.usageCount || 0) + 1;
            prompt.updatedAt = Date.now();
            
            if (this.savePrompts(prompts)) {
                return prompt.usageCount;
            }
        }
        return null;
    },

    /**
     * Duplicate a prompt
     */
    duplicatePrompt(id) {
        const prompts = this.getAllPrompts();
        const original = prompts.find(p => p.id === id);
        
        if (original) {
            const duplicate = {
                ...original,
                id: this.generateId(),
                title: original.title + ' (Copy)',
                favorite: false,
                usageCount: 0,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            
            prompts.unshift(duplicate);
            
            if (this.savePrompts(prompts)) {
                return duplicate;
            }
        }
        return null;
    },

    /**
     * Get favorites
     */
    getFavorites() {
        const prompts = this.getAllPrompts();
        return prompts.filter(p => p.favorite);
    },

    /**
     * Get prompts by category
     */
    getByCategory(category) {
        const prompts = this.getAllPrompts();
        return prompts.filter(p => p.category === category);
    },

    /**
     * Get category counts
     */
    getCategoryCounts() {
        const prompts = this.getAllPrompts();
        const counts = {
            coding: 0,
            design: 0,
            marketing: 0,
            writing: 0,
            productivity: 0,
            other: 0
        };
        
        prompts.forEach(p => {
            if (counts.hasOwnProperty(p.category)) {
                counts[p.category]++;
            } else {
                counts.other++;
            }
        });
        
        return counts;
    },

    /**
     * Export prompts to JSON
     */
    exportPrompts() {
        const prompts = this.getAllPrompts();
        const data = JSON.stringify(prompts, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `promptvault_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return true;
    },

    /**
     * Import prompts from JSON
     */
    importPrompts(jsonData) {
        try {
            const imported = typeof jsonData === 'string' 
                ? JSON.parse(jsonData) 
                : jsonData;
            
            if (!Array.isArray(imported)) {
                throw new Error('Invalid format: expected an array');
            }
            
            // Validate structure
            const valid = imported.every(p => 
                p.title && p.content && p.category
            );
            
            if (!valid) {
                throw new Error('Invalid prompt data structure');
            }
            
            // Assign new IDs and timestamps
            const newPrompts = imported.map(p => ({
                ...p,
                id: this.generateId(),
                createdAt: Date.now(),
                updatedAt: Date.now()
            }));
            
            // Merge with existing prompts
            const existing = this.getAllPrompts();
            const merged = [...newPrompts, ...existing];
            
            if (this.savePrompts(merged)) {
                return { success: true, count: newPrompts.length };
            }
            
            return { success: false, error: 'Failed to save prompts' };
        } catch (error) {
            console.error('Import error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Clear all prompts
     */
    clearAllPrompts() {
        try {
            localStorage.removeItem(this.PROMPTS_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing prompts:', error);
            return false;
        }
    },

    /**
     * Get theme preference
     */
    getTheme() {
        return localStorage.getItem(this.THEME_KEY) || 'light';
    },

    /**
     * Set theme preference
     */
    setTheme(theme) {
        localStorage.setItem(this.THEME_KEY, theme);
    },

    /**
     * Get sidebar state
     */
    getSidebarState() {
        return localStorage.getItem(this.SIDEBAR_KEY) !== 'collapsed';
    },

    /**
     * Set sidebar state
     */
    setSidebarState(collapsed) {
        localStorage.setItem(this.SIDEBAR_KEY, collapsed ? 'expanded' : 'collapsed');
    },

    /**
     * Bulk delete prompts
     */
    bulkDelete(ids) {
        const prompts = this.getAllPrompts();
        const filtered = prompts.filter(p => !ids.includes(p.id));
        
        if (this.savePrompts(filtered)) {
            return filtered.length;
        }
        return null;
    }
};

// Export for use in other modules
window.Storage = Storage;

