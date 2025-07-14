// modal.js - Enhanced Modal Management Module with Link Upload Support

class Modal {
    constructor(app) {
        this.app = app;
        this.previouslyFocused = null;
        this.focusTrapListeners = new Map();
    }

    /**
     * Show modal with enhanced accessibility
     */
    show(modalId) {
        try {
            const modal = this.app.getElement(`#${modalId}-modal`);
            if (!modal) {
                Utils.log(`Modal not found: ${modalId}`, 'warn');
                return;
            }

            // Store previously focused element
            this.previouslyFocused = document.activeElement;

            // Show modal with animation
            modal.style.opacity = '0';
            modal.style.visibility = 'visible';
            modal.setAttribute('aria-hidden', 'false');
            
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.style.transform = 'scale(0.9)';
            }
            
            // Animate in
            requestAnimationFrame(() => {
                modal.style.opacity = '1';
                if (content) {
                    content.style.transform = 'scale(1)';
                }
            });
            
            // Disable body scroll
            document.body.style.overflow = 'hidden';
            
            // Focus management
            setTimeout(() => {
                const firstFocusable = this.getFirstFocusableElement(modal);
                if (firstFocusable) {
                    firstFocusable.focus();
                }
            }, 150); // Wait for animation to complete
            
            // Setup focus trap
            this.setupFocusTrap(modal);

            // Special handling for different modals
            this.handleModalSpecifics(modalId, modal);

            Utils.log(`Modal opened: ${modalId}`, 'debug');
            
        } catch (error) {
            ErrorHandler.handle(error, 'Modal Show', `Failed to open ${modalId} modal`);
        }
    }

    /**
     * Close modal with cleanup
     */
    close(modalId) {
        try {
            const modal = this.app.getElement(`#${modalId}-modal`);
            if (!modal) return;

            // Animate out
            modal.style.opacity = '0';
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.style.transform = 'scale(0.9)';
            }
            
            setTimeout(() => {
                modal.style.visibility = 'hidden';
                modal.setAttribute('aria-hidden', 'true');
            }, 300);
            
            // Re-enable body scroll
            document.body.style.overflow = '';
            
            // Clean up forms
            this.cleanupModal(modal, modalId);
            
            // Remove focus trap
            this.removeFocusTrap(modal);

            // Restore focus
            if (this.previouslyFocused && this.previouslyFocused.focus) {
                this.previouslyFocused.focus();
            }

            Utils.log(`Modal closed: ${modalId}`, 'debug');
            
        } catch (error) {
            ErrorHandler.handle(error, 'Modal Close', `Failed to close ${modalId} modal`);
        }
    }

    /**
     * Handle modal-specific setup
     */
    handleModalSpecifics(modalId, modal) {
        switch (modalId) {
            case 'upload':
                this.resetUploadModal();
                this.setupUploadModalTabs();
                break;
            case 'save-outfit':
                this.setupSaveOutfitModal();
                break;
            case 'login':
                this.setupLoginModal();
                break;
            case 'signup':
                this.setupSignupModal();
                break;
            case 'forgot-password':
                this.setupForgotPasswordModal();
                break;
        }
    }

    /**
     * Clean up modal content
     */
    cleanupModal(modal, modalId) {
        // Reset forms
        const forms = modal.querySelectorAll('form');
        forms.forEach(form => {
            form.reset();
            // Clear form errors
            form.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('error');
            });
        });

        // Modal-specific cleanup
        switch (modalId) {
            case 'upload':
                this.cleanupUploadModal();
                break;
            case 'save-outfit':
                this.cleanupSaveOutfitModal();
                break;
        }
    }

    /**
     * Get first focusable element in modal
     */
    getFirstFocusableElement(modal) {
        const focusableElements = modal.querySelectorAll(
            'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        return focusableElements[0] || null;
    }

    /**
     * Setup focus trap for modal accessibility
     */
    setupFocusTrap(modal) {
        const focusableElements = modal.querySelectorAll(
            'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        modal.addEventListener('keydown', handleTabKey);
        this.focusTrapListeners.set(modal, handleTabKey);
    }

    /**
     * Remove focus trap
     */
    removeFocusTrap(modal) {
        const listener = this.focusTrapListeners.get(modal);
        if (listener) {
            modal.removeEventListener('keydown', listener);
            this.focusTrapListeners.delete(modal);
        }
    }

    /**
     * Setup upload modal tabs
     */
    setupUploadModalTabs() {
        try {
            // Set up tab switching functionality
            const uploadTabs = document.querySelectorAll('.upload-tab');
            uploadTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    const method = tab.getAttribute('data-method');
                    if (method && this.app.wardrobe) {
                        this.app.wardrobe.switchUploadMethod(method);
                    }
                });
            });

            // Set up link input handling
            const linkInput = this.app.getElement('#shopping-link-input');
            if (linkInput) {
                linkInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const fetchBtn = this.app.getElement('#fetch-from-link-btn');
                        if (fetchBtn) {
                            fetchBtn.click();
                        }
                    }
                });

                // Real-time URL validation
                linkInput.addEventListener('input', (e) => {
                    this.validateShoppingUrl(e.target.value);
                });
            }

            // Focus appropriate input based on active tab
            setTimeout(() => {
                const activeTab = document.querySelector('.upload-tab.active');
                if (activeTab && activeTab.getAttribute('data-method') === 'link') {
                    linkInput?.focus();
                }
            }, 200);

        } catch (error) {
            ErrorHandler.handle(error, 'Setup Upload Modal Tabs');
        }
    }

    /**
     * Validate shopping URL in real-time
     */
    validateShoppingUrl(url) {
        try {
            const linkInput = this.app.getElement('#shopping-link-input');
            const fetchBtn = this.app.getElement('#fetch-from-link-btn');
            
            if (!linkInput || !fetchBtn) return;

            if (!url || url.trim() === '') {
                // Empty input
                linkInput.style.borderColor = '';
                fetchBtn.disabled = true;
                return;
            }

            try {
                new URL(url);
                // Valid URL format
                if (this.app.wardrobe && this.app.wardrobe.isValidShoppingUrl(url)) {
                    // Valid shopping URL
                    linkInput.style.borderColor = 'var(--success)';
                    fetchBtn.disabled = false;
                } else {
                    // Invalid shopping site
                    linkInput.style.borderColor = 'var(--warning)';
                    fetchBtn.disabled = false; // Still allow attempt
                }
            } catch (error) {
                // Invalid URL format
                linkInput.style.borderColor = 'var(--error)';
                fetchBtn.disabled = true;
            }
        } catch (error) {
            ErrorHandler.handle(error, 'Validate Shopping URL');
        }
    }

    /**
     * Reset upload modal to initial state
     */
    resetUploadModal() {
        try {
            // Reset to file upload by default
            if (this.app.wardrobe) {
                this.app.wardrobe.switchUploadMethod('file');
            }

            // Reset upload text
            const uploadText = this.app.getElement('.upload-text');
            if (uploadText) {
                uploadText.innerHTML = `
                    Drag & drop an image or click to browse<br>
                    <small>Supported formats: JPG, PNG, WEBP (Max 10MB)</small>
                `;
            }
            
            // Reset and hide form
            const uploadForm = this.app.getElement('#upload-form');
            if (uploadForm) {
                uploadForm.style.display = 'none';
                uploadForm.reset();
                
                // Reset submit button text
                const submitBtn = uploadForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.innerHTML = `
                        <i class="fas fa-plus" aria-hidden="true"></i>
                        <span>Process & Add to Closet</span>
                    `;
                }
            }
            
            // Reset checkboxes
            const skipCheckbox = this.app.getElement('#skip-background-removal');
            if (skipCheckbox) {
                skipCheckbox.checked = false;
            }
            
            // Hide and reset custom category group
            const customCategoryGroup = this.app.getElement('#custom-category-group');
            if (customCategoryGroup) {
                customCategoryGroup.style.display = 'none';
            }

            // Hide and reset link fields
            const linkFields = this.app.getElement('#link-fields');
            if (linkFields) {
                linkFields.style.display = 'none';
            }

            // Reset link areas
            this.resetLinkAreas();
            
        } catch (error) {
            ErrorHandler.handle(error, 'Reset Upload Modal');
        }
    }

    /**
     * Reset link-specific areas
     */
    resetLinkAreas() {
        try {
            const linkArea = this.app.getElement('#link-upload-area');
            const previewArea = this.app.getElement('#link-preview-area');
            const linkInput = this.app.getElement('#shopping-link-input');
            
            if (linkArea) {
                linkArea.classList.remove('fetch-loading', 'fetch-error', 'fetch-success');
            }
            
            if (previewArea) {
                previewArea.style.display = 'none';
            }
            
            if (linkInput) {
                linkInput.value = '';
                linkInput.style.borderColor = '';
            }

            // Reset fetch button
            const fetchBtn = this.app.getElement('#fetch-from-link-btn');
            if (fetchBtn) {
                fetchBtn.disabled = false;
                fetchBtn.innerHTML = `
                    <i class="fas fa-download" aria-hidden="true"></i>
                    <span>Fetch Item</span>
                `;
            }
            
        } catch (error) {
            ErrorHandler.handle(error, 'Reset Link Areas');
        }
    }

    /**
     * Clean up upload modal
     */
    cleanupUploadModal() {
        try {
            if (this.app.wardrobe) {
                this.app.wardrobe.clearImageData();
            }
            this.resetUploadModal();
        } catch (error) {
            ErrorHandler.handle(error, 'Cleanup Upload Modal');
        }
    }

    /**
     * Setup save outfit modal
     */
    setupSaveOutfitModal() {
        try {
            const categorySelect = this.app.getElement('#outfit-category');
            const customCategoryGroup = this.app.getElement('#custom-category-group');
            
            if (categorySelect && customCategoryGroup) {
                // Reset custom category visibility
                customCategoryGroup.style.display = 'none';
                
                // Setup category change handler if not already done
                if (!categorySelect.hasAttribute('data-handler-setup')) {
                    categorySelect.addEventListener('change', (e) => {
                        if (e.target.value === 'Custom') {
                            customCategoryGroup.style.display = 'block';
                            const customInput = this.app.getElement('#custom-category');
                            if (customInput) {
                                customInput.required = true;
                                setTimeout(() => customInput.focus(), 100);
                            }
                        } else {
                            customCategoryGroup.style.display = 'none';
                            const customInput = this.app.getElement('#custom-category');
                            if (customInput) {
                                customInput.required = false;
                                customInput.value = '';
                            }
                        }
                    });
                    categorySelect.setAttribute('data-handler-setup', 'true');
                }
            }
        } catch (error) {
            ErrorHandler.handle(error, 'Setup Save Outfit Modal');
        }
    }

    /**
     * Clean up save outfit modal
     */
    cleanupSaveOutfitModal() {
        try {
            const customCategoryGroup = this.app.getElement('#custom-category-group');
            if (customCategoryGroup) {
                customCategoryGroup.style.display = 'none';
            }
            
            const customInput = this.app.getElement('#custom-category');
            if (customInput) {
                customInput.required = false;
                customInput.value = '';
            }
        } catch (error) {
            ErrorHandler.handle(error, 'Cleanup Save Outfit Modal');
        }
    }

    /**
     * Setup login modal
     */
    setupLoginModal() {
        try {
            // Pre-fill email if user was previously logged in
            const savedEmail = localStorage.getItem('chyk_last_email');
            if (savedEmail) {
                const emailInput = this.app.getElement('#login-email');
                if (emailInput) {
                    emailInput.value = savedEmail;
                    // Focus password field instead
                    setTimeout(() => {
                        const passwordInput = this.app.getElement('#login-password');
                        if (passwordInput) passwordInput.focus();
                    }, 150);
                }
            }
        } catch (error) {
            ErrorHandler.handle(error, 'Setup Login Modal');
        }
    }

    /**
     * Setup signup modal
     */
    setupSignupModal() {
        try {
            // Setup real-time password validation
            const passwordInput = this.app.getElement('#signup-password');
            const confirmInput = this.app.getElement('#signup-confirm');
            
            if (passwordInput && confirmInput) {
                const validatePasswords = () => {
                    const password = passwordInput.value;
                    const confirm = confirmInput.value;
                    const confirmGroup = confirmInput.closest('.form-group');
                    
                    if (confirm.length > 0 && password !== confirm) {
                        confirmGroup?.classList.add('error');
                    } else {
                        confirmGroup?.classList.remove('error');
                    }
                };
                
                confirmInput.addEventListener('input', validatePasswords);
                passwordInput.addEventListener('input', validatePasswords);
            }
        } catch (error) {
            ErrorHandler.handle(error, 'Setup Signup Modal');
        }
    }

    /**
     * Setup forgot password modal
     */
    setupForgotPasswordModal() {
        try {
            // Pre-fill email if available
            const emailInput = this.app.getElement('#forgot-email');
            const loginEmail = this.app.getElement('#login-email');
            
            if (emailInput && loginEmail && loginEmail.value) {
                emailInput.value = loginEmail.value;
            }
        } catch (error) {
            ErrorHandler.handle(error, 'Setup Forgot Password Modal');
        }
    }

    /**
     * Show notification within modal
     */
    showModalNotification(modalId, message, type = 'info') {
        try {
            const modal = this.app.getElement(`#${modalId}-modal`);
            if (!modal) return;

            // Remove existing modal notifications
            const existingNotifications = modal.querySelectorAll('.modal-notification');
            existingNotifications.forEach(n => n.remove());

            // Create notification element
            const notification = document.createElement('div');
            notification.className = `modal-notification ${type}`;
            notification.setAttribute('role', 'alert');
            notification.setAttribute('aria-live', 'polite');
            
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: var(--space-sm);">
                    <i class="fas fa-${this.getNotificationIcon(type)}" aria-hidden="true"></i>
                    <span>${Utils.sanitizeHtml(message)}</span>
                    <button onclick="this.parentElement.parentElement.remove()" 
                            style="background: none; border: none; color: inherit; cursor: pointer; padding: 0; margin-left: auto; opacity: 0.7;"
                            aria-label="Close notification">×</button>
                </div>
            `;

            // Insert notification at the top of modal content
            const modalContent = modal.querySelector('.modal-content');
            const modalHeader = modal.querySelector('.modal-header');
            
            if (modalContent && modalHeader) {
                modalContent.insertBefore(notification, modalHeader.nextSibling);
            }

            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 5000);

        } catch (error) {
            ErrorHandler.handle(error, 'Show Modal Notification');
        }
    }

    /**
     * Get notification icon based on type
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Show modal with custom content
     */
    showCustomModal(title, content, buttons = []) {
        try {
            const modalId = 'custom-modal-' + Utils.generateId();
            
            const modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'modal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-labelledby', `${modalId}-title`);
            modal.setAttribute('aria-hidden', 'true');
            
            const buttonsHtml = buttons.map(button => `
                <button class="btn ${button.class || 'btn-secondary'}" 
                        onclick="CHYK.modal.closeCustomModal('${modalId}'); ${button.onclick || ''}"
                        ${button.primary ? 'data-primary="true"' : ''}>
                    ${button.icon ? `<i class="${button.icon}" aria-hidden="true"></i>` : ''}
                    <span>${Utils.sanitizeHtml(button.text)}</span>
                </button>
            `).join('');
            
            modal.innerHTML = `
                <div class="modal-content">
                    <button class="modal-close" onclick="CHYK.modal.closeCustomModal('${modalId}')" aria-label="Close modal">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <header class="modal-header">
                        <h2 id="${modalId}-title" class="modal-title serif">${Utils.sanitizeHtml(title)}</h2>
                    </header>
                    <div class="modal-body" style="margin-bottom: 2rem;">
                        ${content}
                    </div>
                    ${buttons.length > 0 ? `
                        <div class="modal-footer" style="display: flex; gap: 1rem; justify-content: flex-end;">
                            ${buttonsHtml}
                        </div>
                    ` : ''}
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Show modal
            setTimeout(() => {
                this.show(modalId.replace('-modal', ''));
            }, 10);
            
            return modalId;
            
        } catch (error) {
            ErrorHandler.handle(error, 'Show Custom Modal');
            return null;
        }
    }

    /**
     * Close custom modal
     */
    closeCustomModal(modalId) {
        try {
            const modal = document.getElementById(modalId);
            if (modal) {
                const baseId = modalId.replace('-modal', '');
                this.close(baseId);
                
                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                    }
                }, 350);
            }
        } catch (error) {
            ErrorHandler.handle(error, 'Close Custom Modal');
        }
    }

    /**
     * Setup global modal event listeners
     */
    setupGlobalListeners() {
        // Close modal on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                const modalId = e.target.id.replace('-modal', '');
                this.close(modalId);
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModals = document.querySelectorAll('.modal[aria-hidden="false"]');
                if (activeModals.length > 0) {
                    activeModals.forEach(modal => {
                        const modalId = modal.id.replace('-modal', '');
                        this.close(modalId);
                    });
                }
            }
        });
    }

    /**
     * Initialize modal system
     */
    init() {
        this.setupGlobalListeners();
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Modal;
} else if (typeof window !== 'undefined') {
    window.Modal = Modal;
}