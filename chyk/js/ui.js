// ui.js - Fixed UI Management Module

class UI {
    constructor(app) {
        this.app = app || {};
        this.activeNotifications = new Set();
        this.init();
    }

    /**
     * Show loading overlay with enhanced accessibility
     */
    showLoading(message = 'Loading your virtual closet...') {
        try {
            const overlay = this.getElement('#loading-overlay');
            if (overlay) {
                const messageEl = overlay.querySelector('p');
                if (messageEl) messageEl.textContent = message;
                
                overlay.classList.remove('hidden');
                overlay.setAttribute('aria-hidden', 'false');
                
                // Disable page interaction
                if (document.body) {
                    document.body.style.overflow = 'hidden';
                }
                
                // Set focus to loading overlay for screen readers
                overlay.setAttribute('aria-live', 'polite');
                overlay.setAttribute('role', 'status');
            }
        } catch (error) {
            this.handleError(error, 'UI Loading');
        }
    },

    /**
     * Hide loading overlay
     */
    hideLoading() {
        try {
            const overlay = this.getElement('#loading-overlay');
            if (overlay) {
                overlay.classList.add('hidden');
                overlay.setAttribute('aria-hidden', 'true');
                
                // Re-enable page interaction
                if (document.body) {
                    document.body.style.overflow = '';
                }
                
                // Remove aria attributes
                overlay.removeAttribute('aria-live');
                overlay.removeAttribute('role');
            }
        } catch (error) {
            this.handleError(error, 'UI Loading Hide');
        }
    },

    /**
     * Safe element getter
     */
    getElement(selector) {
        try {
            if (this.app && typeof this.app.getElement === 'function') {
                return this.app.getElement(selector);
            }
            return document.querySelector(selector);
        } catch (error) {
            console.warn(`Failed to get element ${selector}:`, error);
            return null;
        }
    },

    /**
     * Enhanced mobile navigation toggle
     */
    toggleMobile() {
        try {
            const mobileNav = this.getElement('#mobile-nav');
            const toggle = this.getElement('.mobile-menu-toggle');
            
            if (mobileNav && toggle) {
                const isOpen = mobileNav.classList.contains('active');
                
                mobileNav.classList.toggle('active');
                toggle.setAttribute('aria-expanded', !isOpen);
                mobileNav.setAttribute('aria-hidden', isOpen);
                
                const icon = toggle.querySelector('i');
                if (icon) {
                    icon.className = !isOpen ? 'fas fa-times' : 'fas fa-bars';
                }

                // Handle body scroll
                if (document.body) {
                    document.body.style.overflow = !isOpen ? 'hidden' : '';
                }
                
                // Focus management
                if (!isOpen) {
                    // Focus first link when opening
                    const firstLink = mobileNav.querySelector('.nav-link');
                    if (firstLink) {
                        setTimeout(() => firstLink.focus(), 100);
                    }
                }
            }
        } catch (error) {
            this.handleError(error, 'Mobile Navigation Toggle');
        }
    },

    /**
     * Close mobile navigation
     */
    closeMobile() {
        try {
            const mobileNav = this.getElement('#mobile-nav');
            const toggle = this.getElement('.mobile-menu-toggle');
            
            if (mobileNav && toggle) {
                mobileNav.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                mobileNav.setAttribute('aria-hidden', 'true');
                
                const icon = toggle.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-bars';
                }

                // Re-enable body scroll
                if (document.body) {
                    document.body.style.overflow = '';
                }
            }
        } catch (error) {
            this.handleError(error, 'Mobile Navigation Close');
        }
    },

    /**
     * Enhanced notification system with queue management
     */
    showNotification(message, type = 'success', duration = null) {
        try {
            // Validate parameters
            if (!message) {
                console.warn('Empty notification message');
                return null;
            }

            // Create unique notification ID
            const notificationId = this.generateId();
            
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.setAttribute('role', 'alert');
            notification.setAttribute('aria-live', 'polite');
            notification.setAttribute('data-notification-id', notificationId);
            
            // Enhanced styling
            Object.assign(notification.style, {
                position: 'fixed',
                top: this.calculateNotificationPosition() + 'px',
                right: '20px',
                background: this.getNotificationColor(type),
                color: type === 'info' ? 'var(--text-primary)' : 'var(--text-inverse)',
                padding: '1rem 1.5rem',
                borderRadius: 'var(--border-radius)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: '3000',
                transform: 'translateX(100%)',
                transition: 'transform 0.3s ease-in-out, top 0.3s ease-in-out',
                maxWidth: '350px',
                wordWrap: 'break-word',
                backdropFilter: 'blur(10px)'
            });
            
            const icons = {
                success: 'fas fa-check-circle',
                error: 'fas fa-exclamation-circle',
                info: 'fas fa-info-circle',
                warning: 'fas fa-exclamation-triangle'
            };
            
            // Sanitize message
            const sanitizedMessage = this.sanitizeHtml(message);
            
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="${icons[type] || icons.info}" aria-hidden="true"></i>
                    <span>${sanitizedMessage}</span>
                    <button onclick="CHYK.ui.closeNotification('${notificationId}')" 
                            style="background: none; border: none; color: inherit; cursor: pointer; padding: 0; margin-left: auto; opacity: 0.7; font-size: 1.2rem;"
                            aria-label="Close notification">×</button>
                </div>
            `;
            
            if (document.body) {
                document.body.appendChild(notification);
                this.activeNotifications.add(notificationId);

                // Animate in
                requestAnimationFrame(() => {
                    notification.style.transform = 'translateX(0)';
                });

                // Auto-remove
                const autoRemoveDuration = duration || this.getNotificationDuration(type);
                
                setTimeout(() => {
                    this.closeNotification(notificationId);
                }, autoRemoveDuration);
            }

            return notificationId;

        } catch (error) {
            this.handleError(error, 'Notification System');
            // Fallback to simple alert
            if (typeof alert !== 'undefined') {
                alert(message);
            }
            return null;
        }
    },

    /**
     * Sanitize HTML content
     */
    sanitizeHtml(str) {
        try {
            if (typeof str !== 'string') return '';
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        } catch (error) {
            return String(str || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
    },

    /**
     * Generate unique ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Calculate position for new notification (stacking)
     */
    calculateNotificationPosition() {
        try {
            const existingNotifications = document.querySelectorAll('.notification');
            let topPosition = 90; // Base position below header
            
            existingNotifications.forEach((notification) => {
                if (notification.offsetParent !== null) { // If visible
                    topPosition += notification.offsetHeight + 10; // Add height + gap
                }
            });
            
            return topPosition;
        } catch (error) {
            console.warn('Error calculating notification position:', error);
            return 90;
        }
    },

    /**
     * Close specific notification
     */
    closeNotification(notificationId) {
        try {
            const notification = document.querySelector(`[data-notification-id="${notificationId}"]`);
            if (notification && notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                        this.activeNotifications.delete(notificationId);
                        this.repositionNotifications();
                    }
                }, 300);
            }
        } catch (error) {
            this.handleError(error, 'Close Notification');
        }
    },

    /**
     * Reposition remaining notifications after one is closed
     */
    repositionNotifications() {
        try {
            const notifications = document.querySelectorAll('.notification');
            let currentTop = 90;
            
            notifications.forEach((notification) => {
                notification.style.top = currentTop + 'px';
                currentTop += notification.offsetHeight + 10;
            });
        } catch (error) {
            console.warn('Error repositioning notifications:', error);
        }
    },

    /**
     * Get notification background color
     */
    getNotificationColor(type) {
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            info: '#3B82F6',
            warning: '#F59E0B'
        };
        return colors[type] || colors.info;
    },

    /**
     * Get notification duration based on type
     */
    getNotificationDuration(type) {
        const durations = {
            success: 3000,
            error: 5000,
            info: 4000,
            warning: 4000
        };
        return durations[type] || 3000;
    },

    /**
     * Enhanced processing feedback with progress indication
     */
    showProcessingFeedback(stage, message, progress = null) {
        try {
            const uploadText = this.getElement('.upload-text');
            if (!uploadText) return;

            const stages = {
                'uploading': { icon: 'fas fa-upload', color: '#3B82F6' },
                'processing': { icon: 'fas fa-magic fa-spin', color: '#3B82F6' },
                'analyzing': { icon: 'fas fa-search fa-spin', color: '#8B5CF6' },
                'removing': { icon: 'fas fa-eraser fa-spin', color: '#EC4899' },
                'complete': { icon: 'fas fa-check-circle', color: '#10B981' },
                'error': { icon: 'fas fa-exclamation-triangle', color: '#EF4444' }
            };

            const stageInfo = stages[stage] || stages['processing'];
            
            let progressBar = '';
            if (progress !== null && progress >= 0 && progress <= 100) {
                progressBar = `
                    <div style="width: 100%; background: rgba(0,0,0,0.1); border-radius: 10px; margin-top: 1rem; overflow: hidden;">
                        <div style="width: ${progress}%; background: ${stageInfo.color}; height: 8px; transition: width 0.3s ease;"></div>
                    </div>
                `;
            }
            
            const sanitizedMessage = this.sanitizeHtml(message);
            uploadText.innerHTML = `
                <div style="color: ${stageInfo.color};">
                    <i class="${stageInfo.icon}" aria-hidden="true"></i>
                    <strong>${sanitizedMessage}</strong>
                    ${progressBar}
                </div>
            `;

            // Update accessibility
            uploadText.setAttribute('aria-live', 'polite');
            uploadText.setAttribute('role', 'status');
            
        } catch (error) {
            this.handleError(error, 'Processing Feedback');
        }
    },

    /**
     * Show confirmation dialog
     */
    showConfirmation(message, title = 'Confirm Action', onConfirm = null, onCancel = null) {
        try {
            // Create confirmation modal
            const confirmModal = document.createElement('div');
            confirmModal.className = 'modal';
            confirmModal.setAttribute('role', 'dialog');
            confirmModal.setAttribute('aria-modal', 'true');
            confirmModal.setAttribute('aria-labelledby', 'confirm-modal-title');
            confirmModal.style.opacity = '0';
            confirmModal.style.visibility = 'hidden';
            
            const sanitizedTitle = this.sanitizeHtml(title);
            const sanitizedMessage = this.sanitizeHtml(message);
            
            confirmModal.innerHTML = `
                <div class="modal-content" style="max-width: 400px;">
                    <header class="modal-header">
                        <h2 id="confirm-modal-title" class="modal-title serif">${sanitizedTitle}</h2>
                    </header>
                    <div style="margin-bottom: 2rem;">
                        <p style="color: var(--text-secondary); line-height: 1.6;">${sanitizedMessage}</p>
                    </div>
                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button class="btn btn-secondary" onclick="CHYK.ui.closeConfirmation(false)">Cancel</button>
                        <button class="btn btn-primary" onclick="CHYK.ui.closeConfirmation(true)">Confirm</button>
                    </div>
                </div>
            `;
            
            // Store callbacks
            this.confirmationCallbacks = { onConfirm, onCancel };
            
            if (document.body) {
                document.body.appendChild(confirmModal);
                document.body.style.overflow = 'hidden';
            }
            
            // Show modal
            requestAnimationFrame(() => {
                confirmModal.style.opacity = '1';
                confirmModal.style.visibility = 'visible';
                const content = confirmModal.querySelector('.modal-content');
                if (content) content.style.transform = 'scale(1)';
                
                // Focus confirm button
                const confirmBtn = confirmModal.querySelector('.btn-primary');
                if (confirmBtn) confirmBtn.focus();
            });
            
            this.activeConfirmModal = confirmModal;
            
        } catch (error) {
            this.handleError(error, 'Show Confirmation');
        }
    },

    /**
     * Close confirmation dialog
     */
    closeConfirmation(confirmed = false) {
        try {
            if (this.activeConfirmModal) {
                this.activeConfirmModal.style.opacity = '0';
                this.activeConfirmModal.style.visibility = 'hidden';
                
                setTimeout(() => {
                    if (this.activeConfirmModal && this.activeConfirmModal.parentNode && document.body) {
                        document.body.removeChild(this.activeConfirmModal);
                        document.body.style.overflow = '';
                    }
                }, 300);
                
                // Execute callbacks
                if (confirmed && this.confirmationCallbacks?.onConfirm) {
                    this.confirmationCallbacks.onConfirm();
                } else if (!confirmed && this.confirmationCallbacks?.onCancel) {
                    this.confirmationCallbacks.onCancel();
                }
                
                this.activeConfirmModal = null;
                this.confirmationCallbacks = null;
            }
        } catch (error) {
            this.handleError(error, 'Close Confirmation');
        }
    },

    /**
     * Show tooltip
     */
    showTooltip(element, message, position = 'top') {
        try {
            if (!element || !message) return null;

            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = message;
            tooltip.setAttribute('role', 'tooltip');
            
            Object.assign(tooltip.style, {
                position: 'absolute',
                background: 'rgba(47, 43, 40, 0.9)',
                color: 'var(--text-inverse)',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--border-radius)',
                fontSize: '0.8rem',
                zIndex: '4000',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                opacity: '0',
                transition: 'opacity 0.2s ease-in-out'
            });
            
            if (document.body) {
                document.body.appendChild(tooltip);
            }
            
            // Position tooltip
            const rect = element.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            let top, left;
            
            switch (position) {
                case 'top':
                    top = rect.top - tooltipRect.height - 5;
                    left = rect.left + (rect.width - tooltipRect.width) / 2;
                    break;
                case 'bottom':
                    top = rect.bottom + 5;
                    left = rect.left + (rect.width - tooltipRect.width) / 2;
                    break;
                case 'left':
                    top = rect.top + (rect.height - tooltipRect.height) / 2;
                    left = rect.left - tooltipRect.width - 5;
                    break;
                case 'right':
                    top = rect.top + (rect.height - tooltipRect.height) / 2;
                    left = rect.right + 5;
                    break;
            }
            
            tooltip.style.top = top + 'px';
            tooltip.style.left = left + 'px';
            
            // Show tooltip
            requestAnimationFrame(() => {
                tooltip.style.opacity = '1';
            });
            
            return tooltip;
            
        } catch (error) {
            this.handleError(error, 'Show Tooltip');
            return null;
        }
    },

    /**
     * Hide tooltip
     */
    hideTooltip(tooltip) {
        try {
            if (tooltip && tooltip.parentNode) {
                tooltip.style.opacity = '0';
                setTimeout(() => {
                    if (tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                }, 200);
            }
        } catch (error) {
            this.handleError(error, 'Hide Tooltip');
        }
    },

    /**
     * Setup tooltip system
     */
    setupTooltips() {
        try {
            let activeTooltip = null;
            
            document.addEventListener('mouseenter', (e) => {
                const element = e.target.closest('[data-tooltip]');
                if (element) {
                    const message = element.getAttribute('data-tooltip');
                    const position = element.getAttribute('data-tooltip-position') || 'top';
                    activeTooltip = this.showTooltip(element, message, position);
                }
            }, true);
            
            document.addEventListener('mouseleave', (e) => {
                const element = e.target.closest('[data-tooltip]');
                if (element && activeTooltip) {
                    this.hideTooltip(activeTooltip);
                    activeTooltip = null;
                }
            }, true);
        } catch (error) {
            this.handleError(error, 'Setup Tooltips');
        }
    },

    /**
     * Animate element entrance
     */
    animateIn(element, animation = 'fadeIn') {
        try {
            if (!element) return;

            const animations = {
                fadeIn: 'opacity: 0; transition: opacity 0.3s ease-in-out;',
                slideDown: 'transform: translateY(-20px); opacity: 0; transition: all 0.3s ease-in-out;',
                slideUp: 'transform: translateY(20px); opacity: 0; transition: all 0.3s ease-in-out;',
                slideLeft: 'transform: translateX(20px); opacity: 0; transition: all 0.3s ease-in-out;',
                slideRight: 'transform: translateX(-20px); opacity: 0; transition: all 0.3s ease-in-out;',
                scale: 'transform: scale(0.8); opacity: 0; transition: all 0.3s ease-in-out;'
            };
            
            const animationStyle = animations[animation] || animations.fadeIn;
            element.style.cssText += animationStyle;
            
            requestAnimationFrame(() => {
                element.style.opacity = '1';
                element.style.transform = 'none';
            });
            
        } catch (error) {
            this.handleError(error, 'Animate In');
        }
    },

    /**
     * Update UI theme (for future dark mode support)
     */
    updateTheme(theme = 'light') {
        try {
            if (document.documentElement) {
                document.documentElement.setAttribute('data-theme', theme);
            }
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('chyk-theme', theme);
            }
        } catch (error) {
            this.handleError(error, 'Update Theme');
        }
    },

    /**
     * Setup accessibility enhancements
     */
    setupAccessibilityEnhancements() {
        try {
            // Skip links for keyboard navigation
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.textContent = 'Skip to main content';
            skipLink.className = 'sr-only';
            skipLink.style.cssText = `
                position: absolute;
                top: -40px;
                left: 6px;
                background: var(--primary);
                color: var(--text-inverse);
                padding: 8px;
                text-decoration: none;
                border-radius: 4px;
                z-index: 10000;
            `;
            
            skipLink.addEventListener('focus', () => {
                skipLink.style.top = '6px';
            });
            
            skipLink.addEventListener('blur', () => {
                skipLink.style.top = '-40px';
            });
            
            if (document.body) {
                document.body.insertBefore(skipLink, document.body.firstChild);
            }
        } catch (error) {
            this.handleError(error, 'Setup Accessibility');
        }
    },

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        try {
            document.addEventListener('keydown', (e) => {
                // Only handle shortcuts when not in input fields
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                
                if (e.altKey && this.app && typeof this.app.navigate === 'function') {
                    switch (e.key) {
                        case 'h':
                            e.preventDefault();
                            this.app.navigate('home');
                            break;
                        case 'd':
                            e.preventDefault();
                            if (this.app.state && this.app.state.currentUser) {
                                this.app.navigate('dashboard');
                            }
                            break;
                        case 'c':
                            e.preventDefault();
                            if (this.app.state && this.app.state.currentUser && typeof this.app.showSection === 'function') {
                                this.app.showSection('closet');
                            }
                            break;
                        case 'b':
                            e.preventDefault();
                            if (this.app.state && this.app.state.currentUser && typeof this.app.showSection === 'function') {
                                this.app.showSection('builder');
                            }
                            break;
                        case 'p':
                            e.preventDefault();
                            if (this.app.state && this.app.state.currentUser && typeof this.app.showSection === 'function') {
                                this.app.showSection('planner');
                            }
                            break;
                    }
                }
            });
        } catch (error) {
            this.handleError(error, 'Setup Keyboard Shortcuts');
        }
    },

    /**
     * Handle errors safely
     */
    handleError(error, context) {
        try {
            if (typeof ErrorHandler !== 'undefined' && ErrorHandler.handle) {
                ErrorHandler.handle(error, context);
            } else {
                console.error(`UI Error in ${context}:`, error);
            }
        } catch (handlerError) {
            console.error('Error in UI error handler:', handlerError);
        }
    },

    /**
     * Initialize UI enhancements
     */
    init() {
        try {
            // Add small delay to ensure DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.setupTooltips();
                    this.setupAccessibilityEnhancements();
                    this.setupKeyboardShortcuts();
                });
            } else {
                this.setupTooltips();
                this.setupAccessibilityEnhancements();
                this.setupKeyboardShortcuts();
            }
        } catch (error) {
            this.handleError(error, 'UI Initialization');
        }
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
} else if (typeof window !== 'undefined') {
    window.UI = UI;
}