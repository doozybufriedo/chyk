// utils.js - Enhanced Utility Functions - Fixed Version

const Utils = {
    /**
     * Debounce function execution
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function execution
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Generate unique ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Generate shorter ID for UI elements
     */
    generateShortId() {
        return Math.random().toString(36).substr(2, 6);
    },

    /**
     * Sanitize HTML content to prevent XSS
     */
    sanitizeHtml(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Validate email format
     */
    isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate password strength
     */
    validatePassword(password) {
        const result = {
            isValid: false,
            strength: 'weak',
            issues: []
        };

        if (!password || typeof password !== 'string') {
            result.issues.push('Password is required');
            return result;
        }

        if (password.length < 6) {
            result.issues.push('Password must be at least 6 characters long');
        }

        if (password.length >= 6) {
            result.isValid = true;
            result.strength = 'fair';
        }

        if (password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password)) {
            result.strength = 'good';
        }

        if (password.length >= 10 && /[A-Z]/.test(password) && /[a-z]/.test(password) && 
            /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
            result.strength = 'strong';
        }

        return result;
    },

    /**
     * Format file size in human readable format
     */
    formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Enhanced format relative time (e.g., "2 days ago")
     */
    formatRelativeTime(date) {
        try {
            const now = new Date();
            const targetDate = new Date(date);
            
            if (isNaN(targetDate.getTime())) {
                return 'Invalid date';
            }
            
            const diffInSeconds = Math.floor((now - targetDate) / 1000);

            if (diffInSeconds < 60) {
                return 'Just now';
            }

            const diffInMinutes = Math.floor(diffInSeconds / 60);
            if (diffInMinutes < 60) {
                return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
            }

            const diffInHours = Math.floor(diffInMinutes / 60);
            if (diffInHours < 24) {
                return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
            }

            const diffInDays = Math.floor(diffInHours / 24);
            if (diffInDays < 7) {
                return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
            }

            const diffInWeeks = Math.floor(diffInDays / 7);
            if (diffInWeeks < 4) {
                return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
            }

            const diffInMonths = Math.floor(diffInDays / 30);
            if (diffInMonths < 12) {
                return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
            }

            const diffInYears = Math.floor(diffInDays / 365);
            return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
        } catch (error) {
            console.warn('Error formatting relative time:', error);
            return 'Unknown time';
        }
    },

    /**
     * Enhanced format date in a readable format
     */
    formatDate(date, format = 'short') {
        try {
            const targetDate = new Date(date);
            
            if (isNaN(targetDate.getTime())) {
                return 'Invalid date';
            }
            
            const formats = {
                short: { month: 'short', day: 'numeric', year: 'numeric' },
                long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
                time: { hour: '2-digit', minute: '2-digit' },
                datetime: { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                },
                iso: null // Will return ISO string
            };

            if (format === 'iso') {
                return targetDate.toISOString();
            }

            return targetDate.toLocaleDateString('en-US', formats[format] || formats.short);
        } catch (error) {
            console.warn('Error formatting date:', error);
            return 'Invalid date';
        }
    },

    /**
     * Deep clone object (handles nested objects and arrays)
     */
    deepClone(obj) {
        try {
            if (obj === null || typeof obj !== 'object') return obj;
            if (obj instanceof Date) return new Date(obj.getTime());
            if (obj instanceof Array) return obj.map(item => this.deepClone(item));
            if (typeof obj === 'object') {
                const clonedObj = {};
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        clonedObj[key] = this.deepClone(obj[key]);
                    }
                }
                return clonedObj;
            }
        } catch (error) {
            console.warn('Error deep cloning object:', error);
            return obj;
        }
    },

    /**
     * Merge objects deeply
     */
    deepMerge(target, source) {
        try {
            const result = { ...target };
            
            for (const key in source) {
                if (source.hasOwnProperty(key)) {
                    if (source[key] instanceof Object && target[key] instanceof Object) {
                        result[key] = this.deepMerge(target[key], source[key]);
                    } else {
                        result[key] = source[key];
                    }
                }
            }
            
            return result;
        } catch (error) {
            console.warn('Error deep merging objects:', error);
            return target;
        }
    },

    /**
     * Check if device supports touch
     */
    isTouchDevice() {
        try {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        } catch (error) {
            return false;
        }
    },

    /**
     * Check if device is mobile
     */
    isMobile() {
        try {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        } catch (error) {
            return false;
        }
    },

    /**
     * Check if device prefers reduced motion
     */
    prefersReducedMotion() {
        try {
            return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch (error) {
            return false;
        }
    },

    /**
     * Get element position relative to viewport
     */
    getElementPosition(element) {
        try {
            if (!element || !element.getBoundingClientRect) {
                return { x: 0, y: 0, width: 0, height: 0, center: { x: 0, y: 0 } };
            }
            
            const rect = element.getBoundingClientRect();
            return {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
                center: {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                }
            };
        } catch (error) {
            console.warn('Error getting element position:', error);
            return { x: 0, y: 0, width: 0, height: 0, center: { x: 0, y: 0 } };
        }
    },

    /**
     * Calculate distance between two points
     */
    calculateDistance(point1, point2) {
        try {
            if (!point1 || !point2) return 0;
            const dx = point2.x - point1.x;
            const dy = point2.y - point1.y;
            return Math.sqrt(dx * dx + dy * dy);
        } catch (error) {
            console.warn('Error calculating distance:', error);
            return 0;
        }
    },

    /**
     * Convert hex color to RGB
     */
    hexToRgb(hex) {
        try {
            if (!hex || typeof hex !== 'string') return null;
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        } catch (error) {
            console.warn('Error converting hex to RGB:', error);
            return null;
        }
    },

    /**
     * Convert RGB to hex color
     */
    rgbToHex(r, g, b) {
        try {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        } catch (error) {
            console.warn('Error converting RGB to hex:', error);
            return '#000000';
        }
    },

    /**
     * Get contrast ratio between two colors
     */
    getContrastRatio(color1, color2) {
        try {
            const rgb1 = typeof color1 === 'string' ? this.hexToRgb(color1) : color1;
            const rgb2 = typeof color2 === 'string' ? this.hexToRgb(color2) : color2;
            
            if (!rgb1 || !rgb2) return 1;
            
            const luminance1 = this.getLuminance(rgb1);
            const luminance2 = this.getLuminance(rgb2);
            
            const lighter = Math.max(luminance1, luminance2);
            const darker = Math.min(luminance1, luminance2);
            
            return (lighter + 0.05) / (darker + 0.05);
        } catch (error) {
            console.warn('Error calculating contrast ratio:', error);
            return 1;
        }
    },

    /**
     * Calculate luminance of a color
     */
    getLuminance(rgb) {
        try {
            if (!rgb || typeof rgb !== 'object') return 0;
            const { r, g, b } = rgb;
            const [rs, gs, bs] = [r, g, b].map(c => {
                c = c / 255;
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        } catch (error) {
            console.warn('Error calculating luminance:', error);
            return 0;
        }
    },

    /**
     * Compress image to reduce file size
     */
    compressImage(file, maxWidth = 1920, maxHeight = 1920, quality = 0.8) {
        return new Promise((resolve, reject) => {
            try {
                if (!file || !file.type || !file.type.startsWith('image/')) {
                    reject(new Error('Invalid file type'));
                    return;
                }

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();

                img.onload = () => {
                    try {
                        // Calculate new dimensions
                        let { width, height } = img;
                        
                        if (width > height) {
                            if (width > maxWidth) {
                                height = (height * maxWidth) / width;
                                width = maxWidth;
                            }
                        } else {
                            if (height > maxHeight) {
                                width = (width * maxHeight) / height;
                                height = maxHeight;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;

                        // Draw and compress
                        ctx.drawImage(img, 0, 0, width, height);
                        canvas.toBlob(resolve, 'image/jpeg', quality);
                    } catch (error) {
                        reject(error);
                    }
                };

                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = URL.createObjectURL(file);
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Load image from URL/File
     */
    loadImage(src) {
        return new Promise((resolve, reject) => {
            try {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('Failed to load image'));
                
                if (src instanceof File) {
                    img.src = URL.createObjectURL(src);
                } else if (typeof src === 'string') {
                    img.src = src;
                } else {
                    reject(new Error('Invalid image source'));
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Download data as file
     */
    downloadAsFile(data, filename, type = 'application/json') {
        try {
            const blob = new Blob([data], { type });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    },

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        try {
            if (!text || typeof text !== 'string') return false;
            
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const result = document.execCommand('copy');
                document.body.removeChild(textArea);
                return result;
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    },

    /**
     * Parse URL parameters
     */
    parseUrlParams(url = window.location.href) {
        try {
            const params = new URLSearchParams(new URL(url).search);
            const result = {};
            for (const [key, value] of params) {
                result[key] = value;
            }
            return result;
        } catch (error) {
            console.warn('Error parsing URL params:', error);
            return {};
        }
    },

    /**
     * Update URL without refreshing page
     */
    updateUrl(params, replaceState = false) {
        try {
            const url = new URL(window.location);
            
            Object.keys(params).forEach(key => {
                if (params[key] === null || params[key] === undefined) {
                    url.searchParams.delete(key);
                } else {
                    url.searchParams.set(key, params[key]);
                }
            });
            
            if (replaceState) {
                history.replaceState(null, '', url);
            } else {
                history.pushState(null, '', url);
            }
        } catch (error) {
            console.warn('Error updating URL:', error);
        }
    },

    /**
     * Validate form fields
     */
    validateField(field, rules = {}) {
        try {
            if (!field) return { isValid: false, errors: ['Field not found'] };
            
            const value = field.value?.trim();
            const errors = [];

            if (rules.required && !value) {
                errors.push(`${field.name || 'Field'} is required`);
            }

            if (value && rules.minLength && value.length < rules.minLength) {
                errors.push(`Must be at least ${rules.minLength} characters`);
            }

            if (value && rules.maxLength && value.length > rules.maxLength) {
                errors.push(`Must be no more than ${rules.maxLength} characters`);
            }

            if (value && rules.pattern && !rules.pattern.test(value)) {
                errors.push(rules.patternMessage || 'Invalid format');
            }

            if (value && rules.email && !this.isValidEmail(value)) {
                errors.push('Must be a valid email address');
            }

            return {
                isValid: errors.length === 0,
                errors
            };
        } catch (error) {
            console.warn('Error validating field:', error);
            return { isValid: false, errors: ['Validation error'] };
        }
    },

    /**
     * Escape regex special characters
     */
    escapeRegex(string) {
        try {
            if (typeof string !== 'string') return '';
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        } catch (error) {
            console.warn('Error escaping regex:', error);
            return '';
        }
    },

    /**
     * Enhanced highlight search terms in text with better escaping and styling
     */
    highlightSearchTerms(text, searchTerm, className = 'search-highlight') {
        try {
            if (!searchTerm || !text || typeof text !== 'string' || typeof searchTerm !== 'string') {
                return text;
            }
            
            // Split search term by spaces to handle multiple words
            const terms = searchTerm.trim().split(/\s+/).filter(term => term.length > 0);
            
            let highlightedText = text;
            
            terms.forEach(term => {
                const escapedTerm = this.escapeRegex(term);
                const regex = new RegExp(`(${escapedTerm})`, 'gi');
                highlightedText = highlightedText.replace(regex, `<mark class="${className}">$1</mark>`);
            });
            
            return highlightedText;
        } catch (error) {
            // If regex fails, return original text
            console.warn('Failed to highlight search terms:', error);
            return text;
        }
    },

    /**
     * Extract text content from HTML (removes tags but preserves content)
     */
    extractTextFromHtml(html) {
        try {
            if (!html || typeof html !== 'string') return '';
            const div = document.createElement('div');
            div.innerHTML = html;
            return div.textContent || div.innerText || '';
        } catch (error) {
            console.warn('Error extracting text from HTML:', error);
            return '';
        }
    },

    /**
     * Truncate text with ellipsis
     */
    truncateText(text, maxLength, suffix = '...') {
        try {
            if (!text || typeof text !== 'string') return '';
            if (text.length <= maxLength) return text;
            return text.substring(0, maxLength - suffix.length) + suffix;
        } catch (error) {
            console.warn('Error truncating text:', error);
            return text;
        }
    },

    /**
     * Search within array of objects by multiple fields
     */
    searchObjects(objects, query, searchFields = []) {
        try {
            if (!Array.isArray(objects) || !query || !searchFields.length) return objects;
            
            const normalizedQuery = query.toLowerCase().trim();
            
            return objects.filter(obj => {
                return searchFields.some(field => {
                    const value = this.get(obj, field);
                    if (typeof value === 'string') {
                        return value.toLowerCase().includes(normalizedQuery);
                    } else if (Array.isArray(value)) {
                        return value.some(item => 
                            typeof item === 'string' && item.toLowerCase().includes(normalizedQuery)
                        );
                    }
                    return false;
                });
            });
        } catch (error) {
            console.warn('Error searching objects:', error);
            return objects;
        }
    },

    /**
     * Filter objects by multiple criteria
     */
    filterObjects(objects, filters = {}) {
        try {
            if (!Array.isArray(objects)) return [];
            
            return objects.filter(obj => {
                return Object.entries(filters).every(([key, value]) => {
                    if (value === null || value === undefined || value === '') return true;
                    
                    const objValue = this.get(obj, key);
                    
                    if (Array.isArray(value)) {
                        return value.includes(objValue);
                    } else if (typeof value === 'string') {
                        return objValue && objValue.toString().toLowerCase().includes(value.toLowerCase());
                    } else {
                        return objValue === value;
                    }
                });
            });
        } catch (error) {
            console.warn('Error filtering objects:', error);
            return objects;
        }
    },

    /**
     * Sort objects by field with direction
     */
    sortObjects(objects, field, direction = 'asc') {
        try {
            if (!Array.isArray(objects)) return [];
            
            return [...objects].sort((a, b) => {
                const aValue = this.get(a, field);
                const bValue = this.get(b, field);
                
                // Handle null/undefined values
                if (aValue == null && bValue == null) return 0;
                if (aValue == null) return direction === 'asc' ? 1 : -1;
                if (bValue == null) return direction === 'asc' ? -1 : 1;
                
                // Handle dates
                if (aValue instanceof Date && bValue instanceof Date) {
                    return direction === 'asc' ? aValue - bValue : bValue - aValue;
                }
                
                // Handle strings (case insensitive)
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    const result = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
                    return direction === 'asc' ? result : -result;
                }
                
                // Handle numbers
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return direction === 'asc' ? aValue - bValue : bValue - aValue;
                }
                
                // Default comparison
                if (aValue < bValue) return direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return direction === 'asc' ? 1 : -1;
                return 0;
            });
        } catch (error) {
            console.warn('Error sorting objects:', error);
            return objects;
        }
    },

    /**
     * Group objects by field value
     */
    groupObjects(objects, field) {
        try {
            if (!Array.isArray(objects)) return {};
            
            return objects.reduce((groups, obj) => {
                const value = this.get(obj, field);
                const key = value || 'Other';
                
                if (!groups[key]) {
                    groups[key] = [];
                }
                groups[key].push(obj);
                
                return groups;
            }, {});
        } catch (error) {
            console.warn('Error grouping objects:', error);
            return {};
        }
    },

    /**
     * Log debug information (only in debug mode)
     */
    log(message, type = 'info', data = null) {
        try {
            const shouldLog = window.CONFIG ? CONFIG.DEBUG : true;
            if (!shouldLog && type === 'debug') return;
            
            const timestamp = new Date().toISOString();
            const logMessage = `[CHYK ${timestamp}] ${message}`;
            
            switch (type) {
                case 'error':
                    console.error(logMessage, data);
                    break;
                case 'warn':
                    console.warn(logMessage, data);
                    break;
                case 'debug':
                    console.debug(logMessage, data);
                    break;
                default:
                    console.log(logMessage, data);
            }
        } catch (error) {
            // Fallback logging
            console.log(message, data);
        }
    },

    /**
     * Create UUID v4
     */
    createUUID() {
        try {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        } catch (error) {
            console.warn('Error creating UUID:', error);
            return this.generateId();
        }
    },

    /**
     * Sleep for specified milliseconds
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Retry function execution with exponential backoff
     */
    async retry(fn, maxAttempts = 3, delay = 1000) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                
                if (attempt === maxAttempts) {
                    throw lastError;
                }
                
                // Exponential backoff
                await this.sleep(delay * Math.pow(2, attempt - 1));
            }
        }
    },

    /**
     * Check if object is empty
     */
    isEmpty(obj) {
        try {
            if (obj == null) return true;
            if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
            if (obj instanceof Map || obj instanceof Set) return obj.size === 0;
            return Object.keys(obj).length === 0;
        } catch (error) {
            console.warn('Error checking if empty:', error);
            return true;
        }
    },

    /**
     * Get nested object property safely
     */
    get(obj, path, defaultValue = undefined) {
        try {
            if (!obj || typeof obj !== 'object') return defaultValue;
            
            const keys = Array.isArray(path) ? path : path.split('.');
            let result = obj;
            
            for (const key of keys) {
                if (result == null || typeof result !== 'object') {
                    return defaultValue;
                }
                result = result[key];
            }
            
            return result !== undefined ? result : defaultValue;
        } catch (error) {
            console.warn('Error getting nested property:', error);
            return defaultValue;
        }
    },

    /**
     * Set nested object property safely
     */
    set(obj, path, value) {
        try {
            if (!obj || typeof obj !== 'object') return obj;
            
            const keys = Array.isArray(path) ? path : path.split('.');
            const lastKey = keys.pop();
            
            let current = obj;
            for (const key of keys) {
                if (!(key in current) || typeof current[key] !== 'object') {
                    current[key] = {};
                }
                current = current[key];
            }
            
            current[lastKey] = value;
            return obj;
        } catch (error) {
            console.warn('Error setting nested property:', error);
            return obj;
        }
    },

    /**
     * Debounced search function for real-time search
     */
    createDebouncedSearch(searchFunction, delay = 300) {
        return this.debounce(searchFunction, delay);
    },

    /**
     * Format search results with metadata
     */
    formatSearchResults(results, query, totalCount = null) {
        try {
            const metadata = {
                query: query,
                resultCount: Array.isArray(results) ? results.length : 0,
                totalCount: totalCount || (Array.isArray(results) ? results.length : 0),
                hasResults: Array.isArray(results) && results.length > 0,
                isEmpty: !Array.isArray(results) || results.length === 0,
                isFiltered: totalCount && totalCount > (Array.isArray(results) ? results.length : 0)
            };
            
            return {
                results: Array.isArray(results) ? results : [],
                metadata
            };
        } catch (error) {
            console.warn('Error formatting search results:', error);
            return {
                results: [],
                metadata: {
                    query: query,
                    resultCount: 0,
                    totalCount: 0,
                    hasResults: false,
                    isEmpty: true,
                    isFiltered: false
                }
            };
        }
    },

    /**
     * Generate search result summary text
     */
    getSearchSummary(resultCount, query, totalCount = null) {
        try {
            if (!query) {
                return totalCount ? `${totalCount} items` : `${resultCount} items`;
            }
            
            if (resultCount === 0) {
                return `No results found for "${query}"`;
            }
            
            if (resultCount === 1) {
                return `1 result found for "${query}"`;
            }
            
            if (totalCount && totalCount > resultCount) {
                return `${resultCount} of ${totalCount} results for "${query}"`;
            }
            
            return `${resultCount} results found for "${query}"`;
        } catch (error) {
            console.warn('Error generating search summary:', error);
            return 'Search results';
        }
    }
};

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
} else if (typeof window !== 'undefined') {
    window.Utils = Utils;
}