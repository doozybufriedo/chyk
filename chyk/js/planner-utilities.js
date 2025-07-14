// planner-utilities.js - Advanced Utilities for the Outfit Planner

/**
 * Advanced Planner Utilities Class
 * Provides additional functionality for the outfit planner
 */
class PlannerUtils {
    constructor(app) {
        this.app = app;
    }

    /**
     * Generate outfit suggestions based on various factors
     */
    generateOutfitSuggestions(date, context = {}) {
        try {
            const { weather, occasion, recentOutfits = [] } = context;
            const dayOfWeek = new Date(date).getDay();
            const availableOutfits = this.app.state.savedOutfits || [];
            
            let suggestions = [...availableOutfits];
            
            // Filter by day of week preferences
            if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Weekdays
                suggestions = suggestions.filter(outfit => 
                    ['work', 'formal', 'business'].includes(outfit.category.toLowerCase())
                );
            } else { // Weekends
                suggestions = suggestions.filter(outfit => 
                    ['casual', 'weekend', 'leisure'].includes(outfit.category.toLowerCase())
                );
            }
            
            // Avoid recently worn outfits
            if (recentOutfits.length > 0) {
                const recentIds = recentOutfits.map(outfit => outfit.id);
                suggestions = suggestions.filter(outfit => !recentIds.includes(outfit.id));
            }
            
            // Weather-based filtering (if available)
            if (weather) {
                suggestions = this.filterByWeather(suggestions, weather);
            }
            
            // Occasion-based filtering
            if (occasion) {
                suggestions = this.filterByOccasion(suggestions, occasion);
            }
            
            // Sort by usage frequency and variety
            suggestions = this.rankSuggestions(suggestions);
            
            return suggestions.slice(0, 5); // Return top 5 suggestions
            
        } catch (error) {
            console.error('Error generating outfit suggestions:', error);
            return [];
        }
    }

    /**
     * Filter outfits by weather conditions
     */
    filterByWeather(outfits, weather) {
        const { temperature, condition, humidity } = weather;
        
        return outfits.filter(outfit => {
            // Temperature-based filtering
            if (temperature < 50) { // Cold weather
                return outfit.tags?.some(tag => 
                    ['warm', 'winter', 'jacket', 'coat', 'sweater'].includes(tag.toLowerCase())
                );
            } else if (temperature > 80) { // Hot weather
                return outfit.tags?.some(tag => 
                    ['light', 'summer', 'breathable', 'cotton', 'linen'].includes(tag.toLowerCase())
                );
            }
            
            // Condition-based filtering
            if (condition?.includes('rain')) {
                return outfit.tags?.some(tag => 
                    ['waterproof', 'rain', 'umbrella'].includes(tag.toLowerCase())
                );
            }
            
            return true; // Default: include all outfits
        });
    }

    /**
     * Filter outfits by occasion
     */
    filterByOccasion(outfits, occasion) {
        const occasionMap = {
            'meeting': ['work', 'formal', 'business'],
            'date': ['evening', 'formal', 'dressy'],
            'party': ['evening', 'formal', 'party'],
            'gym': ['sport', 'athletic', 'workout'],
            'shopping': ['casual', 'comfortable'],
            'travel': ['comfortable', 'versatile']
        };
        
        const relevantCategories = occasionMap[occasion.toLowerCase()] || [];
        
        return outfits.filter(outfit => 
            relevantCategories.includes(outfit.category) ||
            outfit.tags?.some(tag => relevantCategories.includes(tag.toLowerCase()))
        );
    }

    /**
     * Rank outfit suggestions based on various factors
     */
    rankSuggestions(outfits) {
        const plannedOutfits = Object.values(this.app.state.plannerData || {});
        const usageStats = this.calculateUsageStats(plannedOutfits);
        
        return outfits.map(outfit => ({
            ...outfit,
            score: this.calculateOutfitScore(outfit, usageStats)
        })).sort((a, b) => b.score - a.score);
    }

    /**
     * Calculate usage statistics for outfits
     */
    calculateUsageStats(plannedOutfits) {
        const stats = {};
        
        plannedOutfits.forEach(outfit => {
            stats[outfit.id] = (stats[outfit.id] || 0) + 1;
        });
        
        return stats;
    }

    /**
     * Calculate score for outfit suggestion ranking
     */
    calculateOutfitScore(outfit, usageStats) {
        let score = 50; // Base score
        
        // Favor less frequently used outfits
        const usageCount = usageStats[outfit.id] || 0;
        score -= usageCount * 10;
        
        // Boost favorite outfits
        if (outfit.favorite) {
            score += 20;
        }
        
        // Boost recently created outfits
        const daysSinceCreated = this.daysSince(outfit.dateCreated);
        if (daysSinceCreated < 7) {
            score += 15;
        }
        
        // Boost outfits with more complete information
        if (outfit.notes && outfit.notes.length > 0) score += 5;
        if (outfit.tags && outfit.tags.length > 0) score += 5;
        if (outfit.preview) score += 5;
        
        return Math.max(0, score);
    }

    /**
     * Generate weekly outfit plan automatically
     */
    generateWeeklyPlan(startDate, preferences = {}) {
        try {
            const { includeWeekends = false, variety = 'high', workDays = 5 } = preferences;
            const plan = {};
            const usedOutfits = new Set();
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);
                const dayOfWeek = date.getDay();
                const dateKey = this.formatDate(date);
                
                // Skip weekends if not included
                if (!includeWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
                    continue;
                }
                
                // Generate suggestions for this day
                const context = {
                    recentOutfits: Array.from(usedOutfits).map(id => ({ id }))
                };
                
                const suggestions = this.generateOutfitSuggestions(dateKey, context);
                const availableSuggestions = suggestions.filter(outfit => 
                    !usedOutfits.has(outfit.id)
                );
                
                if (availableSuggestions.length > 0) {
                    const selectedOutfit = availableSuggestions[0];
                    plan[dateKey] = selectedOutfit;
                    
                    // Track usage for variety
                    if (variety === 'high') {
                        usedOutfits.add(selectedOutfit.id);
                    }
                }
            }
            
            return plan;
            
        } catch (error) {
            console.error('Error generating weekly plan:', error);
            return {};
        }
    }

    /**
     * Analyze outfit usage patterns
     */
    analyzeOutfitPatterns() {
        try {
            const plannedOutfits = Object.entries(this.app.state.plannerData || {});
            const analysis = {
                totalPlannedDays: plannedOutfits.length,
                categoryBreakdown: {},
                dayOfWeekPatterns: {},
                mostUsedOutfits: [],
                leastUsedOutfits: [],
                averageUsagePerOutfit: 0,
                suggestions: []
            };
            
            // Category breakdown
            plannedOutfits.forEach(([dateKey, outfit]) => {
                const category = outfit.category;
                analysis.categoryBreakdown[category] = (analysis.categoryBreakdown[category] || 0) + 1;
                
                // Day of week patterns
                const dayOfWeek = new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long' });
                if (!analysis.dayOfWeekPatterns[dayOfWeek]) {
                    analysis.dayOfWeekPatterns[dayOfWeek] = {};
                }
                analysis.dayOfWeekPatterns[dayOfWeek][category] = 
                    (analysis.dayOfWeekPatterns[dayOfWeek][category] || 0) + 1;
            });
            
            // Usage frequency analysis
            const usageStats = this.calculateUsageStats(plannedOutfits.map(([, outfit]) => outfit));
            const savedOutfits = this.app.state.savedOutfits || [];
            
            const outfitUsage = savedOutfits.map(outfit => ({
                ...outfit,
                usageCount: usageStats[outfit.id] || 0
            }));
            
            analysis.mostUsedOutfits = outfitUsage
                .filter(outfit => outfit.usageCount > 0)
                .sort((a, b) => b.usageCount - a.usageCount)
                .slice(0, 5);
            
            analysis.leastUsedOutfits = outfitUsage
                .filter(outfit => outfit.usageCount === 0)
                .slice(0, 5);
            
            analysis.averageUsagePerOutfit = savedOutfits.length > 0 
                ? plannedOutfits.length / savedOutfits.length 
                : 0;
            
            // Generate suggestions based on analysis
            analysis.suggestions = this.generateAnalysisSuggestions(analysis);
            
            return analysis;
            
        } catch (error) {
            console.error('Error analyzing outfit patterns:', error);
            return null;
        }
    }

    /**
     * Generate suggestions based on usage analysis
     */
    generateAnalysisSuggestions(analysis) {
        const suggestions = [];
        
        // Suggest using underutilized outfits
        if (analysis.leastUsedOutfits.length > 0) {
            suggestions.push({
                type: 'underutilized',
                message: `You have ${analysis.leastUsedOutfits.length} outfits that haven't been planned yet. Consider incorporating them into your weekly plans.`,
                action: 'Plan underutilized outfits'
            });
        }
        
        // Suggest category diversification
        const categories = Object.keys(analysis.categoryBreakdown);
        if (categories.length < 3) {
            suggestions.push({
                type: 'diversity',
                message: 'Consider adding more variety to your outfit categories for a more balanced wardrobe.',
                action: 'Explore different categories'
            });
        }
        
        // Suggest planning ahead
        if (analysis.totalPlannedDays < 7) {
            suggestions.push({
                type: 'planning',
                message: 'Planning outfits for the entire week can save time and reduce decision fatigue.',
                action: 'Generate weekly plan'
            });
        }
        
        return suggestions;
    }

    /**
     * Export planner data to various formats
     */
    exportPlannerData(format = 'json', dateRange = null) {
        try {
            let data = this.app.state.plannerData || {};
            
            // Filter by date range if provided
            if (dateRange) {
                const { startDate, endDate } = dateRange;
                data = Object.fromEntries(
                    Object.entries(data).filter(([dateKey]) => {
                        const date = new Date(dateKey);
                        return date >= new Date(startDate) && date <= new Date(endDate);
                    })
                );
            }
            
            switch (format.toLowerCase()) {
                case 'json':
                    return this.exportAsJSON(data);
                case 'csv':
                    return this.exportAsCSV(data);
                case 'ical':
                    return this.exportAsICal(data);
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
            
        } catch (error) {
            console.error('Error exporting planner data:', error);
            return null;
        }
    }

    /**
     * Export as JSON
     */
    exportAsJSON(data) {
        return {
            format: 'json',
            data: JSON.stringify(data, null, 2),
            filename: `outfit-plan-${this.formatDate(new Date())}.json`,
            mimeType: 'application/json'
        };
    }

    /**
     * Export as CSV
     */
    exportAsCSV(data) {
        const headers = ['Date', 'Day of Week', 'Outfit Name', 'Category', 'Notes'];
        const rows = [headers];
        
        Object.entries(data).forEach(([dateKey, outfit]) => {
            const date = new Date(dateKey);
            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
            rows.push([
                dateKey,
                dayOfWeek,
                outfit.name || '',
                outfit.category || '',
                outfit.notes || ''
            ]);
        });
        
        const csvContent = rows.map(row => 
            row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        return {
            format: 'csv',
            data: csvContent,
            filename: `outfit-plan-${this.formatDate(new Date())}.csv`,
            mimeType: 'text/csv'
        };
    }

    /**
     * Export as iCal format
     */
    exportAsICal(data) {
        const events = Object.entries(data).map(([dateKey, outfit]) => {
            const date = new Date(dateKey);
            const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
            
            return [
                'BEGIN:VEVENT',
                `DTSTART;VALUE=DATE:${dateStr}`,
                `DTEND;VALUE=DATE:${dateStr}`,
                `SUMMARY:Outfit: ${outfit.name}`,
                `DESCRIPTION:Category: ${outfit.category}\\nNotes: ${outfit.notes || 'No notes'}`,
                `UID:outfit-${outfit.id}-${dateStr}@chyk-app.com`,
                'END:VEVENT'
            ].join('\n');
        });
        
        const icalContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//CHYK//Outfit Planner//EN',
            'CALSCALE:GREGORIAN',
            ...events,
            'END:VCALENDAR'
        ].join('\n');
        
        return {
            format: 'ical',
            data: icalContent,
            filename: `outfit-plan-${this.formatDate(new Date())}.ics`,
            mimeType: 'text/calendar'
        };
    }

    /**
     * Import planner data from file
     */
    async importPlannerData(file) {
        try {
            const text = await this.readFileAsText(file);
            let importedData = {};
            
            if (file.name.endsWith('.json')) {
                importedData = JSON.parse(text);
            } else if (file.name.endsWith('.csv')) {
                importedData = this.parseCSVToPlannerData(text);
            } else {
                throw new Error('Unsupported file format. Please use JSON or CSV.');
            }
            
            // Validate imported data
            const validatedData = this.validateImportedData(importedData);
            
            // Merge with existing data
            this.app.state.plannerData = {
                ...this.app.state.plannerData,
                ...validatedData
            };
            
            this.app.saveState();
            
            return {
                success: true,
                imported: Object.keys(validatedData).length,
                message: `Successfully imported ${Object.keys(validatedData).length} planned outfits.`
            };
            
        } catch (error) {
            console.error('Error importing planner data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Advanced search functionality
     */
    advancedSearch(query, filters = {}) {
        try {
            const {
                categories = [],
                dateRange = null,
                tags = [],
                includeNotes = true
            } = filters;
            
            let results = Object.entries(this.app.state.plannerData || {});
            
            // Filter by date range
            if (dateRange) {
                const { startDate, endDate } = dateRange;
                results = results.filter(([dateKey]) => {
                    const date = new Date(dateKey);
                    return date >= new Date(startDate) && date <= new Date(endDate);
                });
            }
            
            // Filter by categories
            if (categories.length > 0) {
                results = results.filter(([, outfit]) => 
                    categories.includes(outfit.category)
                );
            }
            
            // Filter by tags
            if (tags.length > 0) {
                results = results.filter(([, outfit]) => 
                    outfit.tags && tags.some(tag => 
                        outfit.tags.includes(tag)
                    )
                );
            }
            
            // Text search
            if (query && query.trim()) {
                const searchTerm = query.toLowerCase().trim();
                results = results.filter(([, outfit]) => {
                    const searchableText = [
                        outfit.name,
                        outfit.category,
                        ...(outfit.tags || []),
                        includeNotes ? outfit.notes : ''
                    ].join(' ').toLowerCase();
                    
                    return searchableText.includes(searchTerm);
                });
            }
            
            return {
                results: results.map(([dateKey, outfit]) => ({
                    date: dateKey,
                    outfit
                })),
                total: results.length
            };
            
        } catch (error) {
            console.error('Error in advanced search:', error);
            return { results: [], total: 0 };
        }
    }

    /**
     * Get outfit statistics for a specific period
     */
    getPeriodStatistics(startDate, endDate) {
        try {
            const periodData = Object.entries(this.app.state.plannerData || {})
                .filter(([dateKey]) => {
                    const date = new Date(dateKey);
                    return date >= new Date(startDate) && date <= new Date(endDate);
                });
            
            const stats = {
                totalDays: this.daysBetween(new Date(startDate), new Date(endDate)) + 1,
                plannedDays: periodData.length,
                unplannedDays: 0,
                categoryBreakdown: {},
                mostWornCategory: null,
                planningRate: 0
            };
            
            stats.unplannedDays = stats.totalDays - stats.plannedDays;
            stats.planningRate = (stats.plannedDays / stats.totalDays) * 100;
            
            // Category breakdown
            periodData.forEach(([, outfit]) => {
                const category = outfit.category;
                stats.categoryBreakdown[category] = (stats.categoryBreakdown[category] || 0) + 1;
            });
            
            // Most worn category
            if (Object.keys(stats.categoryBreakdown).length > 0) {
                stats.mostWornCategory = Object.entries(stats.categoryBreakdown)
                    .sort(([,a], [,b]) => b - a)[0][0];
            }
            
            return stats;
            
        } catch (error) {
            console.error('Error calculating period statistics:', error);
            return null;
        }
    }

    // Utility helper functions
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    daysSince(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        return Math.floor((now - date) / (1000 * 60 * 60 * 24));
    }

    daysBetween(startDate, endDate) {
        return Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    parseCSVToPlannerData(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const data = {};
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
            if (values.length >= headers.length && values[0]) {
                const dateKey = values[0];
                data[dateKey] = {
                    id: `imported-${Date.now()}-${i}`,
                    name: values[2] || 'Imported Outfit',
                    category: values[3] || 'casual',
                    notes: values[4] || '',
                    dateCreated: new Date().toISOString()
                };
            }
        }
        
        return data;
    }

    validateImportedData(data) {
        const validatedData = {};
        
        Object.entries(data).forEach(([dateKey, outfit]) => {
            // Validate date format
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return;
            
            // Validate outfit object
            if (!outfit || typeof outfit !== 'object') return;
            if (!outfit.name || typeof outfit.name !== 'string') return;
            
            validatedData[dateKey] = {
                id: outfit.id || `imported-${Date.now()}-${Math.random()}`,
                name: outfit.name,
                category: outfit.category || 'casual',
                notes: outfit.notes || '',
                dateCreated: outfit.dateCreated || new Date().toISOString(),
                tags: Array.isArray(outfit.tags) ? outfit.tags : []
            };
        });
        
        return validatedData;
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlannerUtils;
} else if (typeof window !== 'undefined') {
    window.PlannerUtils = PlannerUtils;
}