// error-handler.js - Fixed Error Handling Module

const ErrorHandler = {
    /**
     * Handle application errors gracefully
     */
    handle(error, context = 'Unknown', userMessage = null) {
        try {
            // Ensure error is an object
            if (!error) {
                error = new Error('Unknown error occurred');
            }
            
            // Log error for debugging
            if (typeof Utils !== 'undefined' && Utils.log) {
                Utils.log(`Error in ${context}: ${error.message || error}`, 'error', {
                    error: error,
                    stack: error.stack,
                    context: context,
                    timestamp: new Date().toISOString(),
                    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
                    url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
                });
            } else {
                console.error(`Error in ${context}:`, error);
            }
            
            // Report to monitoring service in production
            if (typeof CONFIG !== 'undefined' && !CONFIG.DEBUG) {
                this.reportError(error, context);
            }
            
            // Show user-friendly message
            const message = userMessage || this.getUserFriendlyMessage(error, context);
            
            // Try to use the UI instance from the global CHYK app
            if (typeof window !== 'undefined' && window.CHYK && window.CHYK.ui && typeof window.CHYK.ui.showNotification === 'function') {
                try {
                    window.CHYK.ui.showNotification(message, 'error');
                } catch (uiError) {
                    console.warn('Failed to show UI notification:', uiError);
                    this.showFallbackNotification(message);
                }
            } else {
                // Fallback notification
                this.showFallbackNotification(message);
            }
        } catch (handlerError) {
            console.error('Error in error handler:', handlerError);
            // Ultimate fallback
            if (typeof alert !== 'undefined') {
                alert('An error occurred. Please refresh the page.');
            }
        }
    },

    /**
     * Get user-friendly error message based on error type and context
     */
    getUserFriendlyMessage(error, context) {
        try {
            // Context-specific error messages
            const contextMessages = {
                'File Upload': 'Failed to upload file. Please check the file format and try again.',
                'Background Removal': 'Image processing failed. The original image will be used instead.',
                'Save Outfit': 'Failed to save outfit. Please try again.',
                'Login': 'Login failed. Please check your credentials and try again.',
                'Signup': 'Account creation failed. Please try again.',
                'Navigation': 'Navigation error occurred. Please refresh the page.',
                'Canvas': 'Outfit builder encountered an error. Please try again.',
                'Planner': 'Calendar planning failed. Please try again.',
                'Settings': 'Settings update failed. Please try again.',
                'Modal': 'Dialog error occurred. Please try again.',
                'UI': 'Interface error occurred. Please refresh the page.',
                'Wardrobe': 'Wardrobe management error. Please try again.'
            };

            // Error type specific messages
            const errorTypeMessages = {
                'NetworkError': 'Network connection failed. Please check your internet connection.',
                'QuotaExceededError': 'Storage limit exceeded. Please clear some data or try again later.',
                'SecurityError': 'Security restriction encountered. Please try again.',
                'TypeError': 'Invalid data format encountered. Please refresh the page and try again.',
                'ReferenceError': 'Application error occurred. Please refresh the page.',
                'SyntaxError': 'Data format error. Please try again.',
                'RangeError': 'Value out of acceptable range. Please check your input.',
                'URIError': 'Invalid URL format. Please check your input.',
                'TimeoutError': 'Request timed out. Please try again.',
                'AbortError': 'Operation was cancelled. Please try again.',
                'NotFoundError': 'Requested resource not found. Please try again.',
                'PermissionDeniedError': 'Permission denied. Please check your settings.'
            };

            // Try context-specific message first
            if (contextMessages[context]) {
                return contextMessages[context];
            }

            // Try error type specific message
            if (error && error.name && errorTypeMessages[error.name]) {
                return errorTypeMessages[error.name];
            }

            // Check for specific error patterns
            if (error && error.message) {
                const message = error.message.toLowerCase();
                
                if (message.includes('network') || message.includes('fetch')) {
                    return 'Network error occurred. Please check your connection and try again.';
                }
                
                if (message.includes('permission') || message.includes('denied')) {
                    return 'Permission denied. Please check your browser settings.';
                }
                
                if (message.includes('storage') || message.includes('quota')) {
                    return 'Storage limit reached. Please clear some data and try again.';
                }
                
                if (message.includes('timeout')) {
                    return 'Request timed out. Please try again.';
                }
                
                if (message.includes('parse') || message.includes('json')) {
                    return 'Data format error. Please refresh the page and try again.';
                }
            }

            // Default fallback message
            return 'An unexpected error occurred. Please try again or refresh the page.';
        } catch (msgError) {
            console.warn('Error getting user friendly message:', msgError);
            return 'An error occurred. Please refresh the page.';
        }
    },

    /**
     * Report error to monitoring service (placeholder for real implementation)
     */
    reportError(error, context) {
        try {
            const errorReport = {
                message: error.message || 'Unknown error',
                stack: error.stack || 'No stack trace',
                context: context,
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
                timestamp: new Date().toISOString(),
                url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
                userId: (typeof window !== 'undefined' && window.CHYK && window.CHYK.state && window.CHYK.state.currentUser) ? window.CHYK.state.currentUser.id : 'anonymous',
                sessionId: this.getSessionId(),
                buildVersion: (typeof CONFIG !== 'undefined' && CONFIG.VERSION) ? CONFIG.VERSION : 'unknown'
            };
            
            // Store in local storage for later sending (if network is available)
            this.storeErrorForLaterReporting(errorReport);
            
        } catch (reportingError) {
            console.warn('Failed to report error:', reportingError);
        }
    },

    /**
     * Get or create session ID for error tracking
     */
    getSessionId() {
        try {
            if (typeof sessionStorage === 'undefined') return 'no-session-storage';
            
            let sessionId = sessionStorage.getItem('chyk_session_id');
            if (!sessionId) {
                sessionId = this.generateId();
                sessionStorage.setItem('chyk_session_id', sessionId);
            }
            return sessionId;
        } catch (error) {
            console.warn('Failed to get session ID:', error);
            return 'session-error-' + Date.now();
        }
    },

    /**
     * Generate simple ID
     */
    generateId() {
        return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Store error for later reporting when network is available
     */
    storeErrorForLaterReporting(errorReport) {
        try {
            if (typeof localStorage === 'undefined') return;
            
            const storedErrors = JSON.parse(localStorage.getItem('chyk_pending_errors') || '[]');
            storedErrors.push(errorReport);
            
            // Keep only the last 10 errors to prevent storage bloat
            const recentErrors = storedErrors.slice(-10);
            localStorage.setItem('chyk_pending_errors', JSON.stringify(recentErrors));
        } catch (storageError) {
            console.warn('Failed to store error for later reporting:', storageError);
        }
    },

    /**
     * Send pending errors when network is available
     */
    sendPendingErrors() {
        try {
            if (typeof localStorage === 'undefined') return;
            
            const pendingErrors = JSON.parse(localStorage.getItem('chyk_pending_errors') || '[]');
            if (pendingErrors.length === 0) return;

            console.log(`Sending ${pendingErrors.length} pending error reports`);
            
            // Clear pending errors after successful send
            localStorage.removeItem('chyk_pending_errors');
            
        } catch (error) {
            console.warn('Failed to send pending errors:', error);
        }
    },

    /**
     * Show fallback notification when UI is not available
     */
    showFallbackNotification(message) {
        try {
            if (typeof document === 'undefined') {
                console.error('Fallback notification:', message);
                return;
            }

            // Remove existing fallback notifications
            const existingNotifications = document.querySelectorAll('.fallback-notification');
            existingNotifications.forEach(n => {
                try {
                    n.remove();
                } catch (e) {
                    console.warn('Failed to remove existing notification:', e);
                }
            });
            
            const notification = document.createElement('div');
            notification.className = 'fallback-notification';
            notification.setAttribute('role', 'alert');
            notification.setAttribute('aria-live', 'assertive');
            
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #EF4444;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 0.75rem;
                box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
                z-index: 9999;
                max-width: 350px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 0.9rem;
                line-height: 1.4;
                word-wrap: break-word;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                animation: slideInRight 0.3s ease-out;
            `;
            
            // Add CSS animation if not already present
            if (!document.querySelector('#fallback-notification-styles')) {
                try {
                    const style = document.createElement('style');
                    style.id = 'fallback-notification-styles';
                    style.textContent = `
                        @keyframes slideInRight {
                            from { transform: translateX(100%); opacity: 0; }
                            to { transform: translateX(0); opacity: 1; }
                        }
                        @keyframes slideOutRight {
                            from { transform: translateX(0); opacity: 1; }
                            to { transform: translateX(100%); opacity: 0; }
                        }
                    `;
                    document.head.appendChild(style);
                } catch (styleError) {
                    console.warn('Failed to add notification styles:', styleError);
                }
            }
            
            // Sanitize message
            const sanitizedMessage = message ? String(message).replace(/</g, '&lt;').replace(/>/g, '&gt;') : 'An error occurred';
            
            notification.innerHTML = `
                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <div style="flex-shrink: 0; margin-top: 0.125rem;">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 600; margin-bottom: 0.25rem;">Error</div>
                        <div>${sanitizedMessage}</div>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" 
                            style="background: none; border: none; color: inherit; cursor: pointer; padding: 0; margin-left: 0.5rem; opacity: 0.7; font-size: 1.25rem; line-height: 1; flex-shrink: 0;"
                            aria-label="Close notification">×</button>
                </div>
            `;
            
            document.body.appendChild(notification);

            // Auto-remove after 8 seconds
            setTimeout(() => {
                try {
                    if (notification.parentNode) {
                        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
                        setTimeout(() => {
                            if (notification.parentNode) {
                                notification.parentNode.removeChild(notification);
                            }
                        }, 300);
                    }
                } catch (removeError) {
                    console.warn('Failed to auto-remove notification:', removeError);
                }
            }, 8000);
            
        } catch (fallbackError) {
            // Last resort: browser alert
            console.error('Fallback notification failed:', fallbackError);
            if (typeof alert !== 'undefined') {
                alert(`Error: ${message || 'An error occurred'}`);
            }
        }
    },

    /**
     * Handle promise rejections
     */
    handleUnhandledRejection(event) {
        try {
            const error = event.reason || new Error('Unhandled promise rejection');
            this.handle(error, 'Unhandled Promise Rejection');
            
            // Prevent the default browser behavior
            if (event.preventDefault) {
                event.preventDefault();
            }
        } catch (handlerError) {
            console.error('Error in unhandled rejection handler:', handlerError);
        }
    },

    /**
     * Handle global errors
     */
    handleGlobalError(event) {
        try {
            const error = event.error || new Error(event.message || 'Unknown error');
            this.handle(error, 'Global Error');
        } catch (handlerError) {
            console.error('Error in global error handler:', handlerError);
        }
    },

    /**
     * Setup global error handling
     */
    setupGlobalHandlers() {
        try {
            if (typeof window === 'undefined') return;

            // Handle unhandled promise rejections
            window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
            
            // Handle global JavaScript errors
            window.addEventListener('error', this.handleGlobalError.bind(this));
            
            // Handle network status changes
            window.addEventListener('online', () => {
                console.log('Network connection restored');
                this.sendPendingErrors();
            });
            
            window.addEventListener('offline', () => {
                console.log('Network connection lost');
            });
        } catch (setupError) {
            console.error('Failed to setup global error handlers:', setupError);
        }
    },

    /**
     * Check if error should be ignored (rate limiting)
     */
    shouldIgnoreError(error, context) {
        try {
            const errorKey = `${context}-${error.name || 'Unknown'}-${error.message || 'Unknown'}`;
            const now = Date.now();
            const lastReported = this.lastReportedErrors?.get(errorKey) || 0;
            
            // Ignore if same error was reported within last 5 minutes
            if (now - lastReported < 5 * 60 * 1000) {
                return true;
            }
            
            // Update last reported time
            if (!this.lastReportedErrors) {
                this.lastReportedErrors = new Map();
            }
            this.lastReportedErrors.set(errorKey, now);
            
            // Clean up old entries
            if (this.lastReportedErrors.size > 100) {
                const cutoff = now - 10 * 60 * 1000; // 10 minutes ago
                for (const [key, time] of this.lastReportedErrors) {
                    if (time < cutoff) {
                        this.lastReportedErrors.delete(key);
                    }
                }
            }
            
            return false;
        } catch (rateLimitError) {
            console.warn('Error in rate limiting check:', rateLimitError);
            return false;
        }
    },

    /**
     * Initialize error handling system
     */
    init() {
        try {
            this.setupGlobalHandlers();
            
            // Send any pending errors from previous sessions
            if (typeof navigator !== 'undefined' && navigator.onLine) {
                setTimeout(() => this.sendPendingErrors(), 1000);
            }
            
            console.log('Error handling system initialized');
        } catch (initError) {
            console.error('Failed to initialize error handling system:', initError);
        }
    }
};

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
} else if (typeof window !== 'undefined') {
    window.ErrorHandler = ErrorHandler;
}