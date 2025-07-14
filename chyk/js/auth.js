// auth.js - Updated Authentication Module with Fixed Navigation

class Auth {
    constructor(app) {
        this.app = app;
    }

    /**
     * Enhanced login with validation and proper navigation
     */
    async login(email, password) {
        try {
            // Validate inputs
            if (!Utils.isValidEmail(email)) {
                this.app.showSimpleError('Please enter a valid email address');
                return;
            }

            if (password.length < 6) {
                this.app.showSimpleError('Password must be at least 6 characters');
                return;
            }

            // Show loading state
            if (this.app.ui && this.app.ui.showLoading) {
                this.app.ui.showLoading('Signing you in...');
            }
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const user = { 
                email: email.toLowerCase(), 
                firstName: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1), 
                lastName: 'User',
                id: Utils.generateId(),
                lastLogin: new Date().toISOString(),
                preferences: {
                    outfitReminders: true,
                    reminderTime: '8:00',
                    backgroundRemoval: true
                }
            };
            
            // Hide loading state
            if (this.app.ui && this.app.ui.hideLoading) {
                this.app.ui.hideLoading();
            }

            // Use main app's login handler for proper navigation
            this.app.handleSuccessfulLogin(user);
            
            // Store last email for convenience
            localStorage.setItem('chyk_last_email', email);
            
        } catch (error) {
            if (this.app.ui && this.app.ui.hideLoading) {
                this.app.ui.hideLoading();
            }
            ErrorHandler.handle(error, 'Login', 'Login failed. Please try again.');
        }
    }

    /**
     * Enhanced signup with validation and proper navigation
     */
    async signup(email, password) {
        try {
            // Validate inputs
            if (!Utils.isValidEmail(email)) {
                this.app.showSimpleError('Please enter a valid email address');
                return;
            }

            if (password.length < 6) {
                this.app.showSimpleError('Password must be at least 6 characters');
                return;
            }

            // Show loading state
            if (this.app.ui && this.app.ui.showLoading) {
                this.app.ui.showLoading('Creating your account...');
            }
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const user = { 
                email: email.toLowerCase(), 
                firstName: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1), 
                lastName: 'User',
                id: Utils.generateId(),
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                preferences: {
                    outfitReminders: true,
                    reminderTime: '8:00',
                    backgroundRemoval: true
                }
            };
            
            // Hide loading state
            if (this.app.ui && this.app.ui.hideLoading) {
                this.app.ui.hideLoading();
            }

            // Use main app's login handler for proper navigation
            this.app.handleSuccessfulLogin(user);
            
            // Store last email for convenience
            localStorage.setItem('chyk_last_email', email);
            
        } catch (error) {
            if (this.app.ui && this.app.ui.hideLoading) {
                this.app.ui.hideLoading();
            }
            ErrorHandler.handle(error, 'Signup', 'Account creation failed. Please try again.');
        }
    }

    /**
     * Forgot password functionality
     */
    async forgotPassword(email) {
        try {
            if (!Utils.isValidEmail(email)) {
                this.app.showSimpleError('Please enter a valid email address');
                return;
            }

            if (this.app.ui && this.app.ui.showLoading) {
                this.app.ui.showLoading('Sending reset instructions...');
            }
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if (this.app.ui && this.app.ui.hideLoading) {
                this.app.ui.hideLoading();
            }

            this.app.hideModal('forgot-password');
            this.app.showSimpleSuccess(
                `Password reset instructions have been sent to ${email}. Please check your inbox.`
            );
            
        } catch (error) {
            if (this.app.ui && this.app.ui.hideLoading) {
                this.app.ui.hideLoading();
            }
            ErrorHandler.handle(error, 'Forgot Password', 'Failed to send reset instructions. Please try again.');
        }
    }

    /**
     * Enhanced logout with cleanup - this is called by main app
     */
    logout() {
        try {
            const userName = this.app.state.currentUser?.firstName || 'User';
            
            this.app.state.currentUser = null;
            this.app.state.userPreferences = {
                outfitReminders: true,
                reminderTime: '8:00',
                backgroundRemoval: true
            };
            
            this.updateAuthUI();
            this.app.navigate('home');
            this.app.showSimpleSuccess(`Goodbye, ${userName}! See you soon.`);
            
            // Clear sensitive data
            localStorage.removeItem(CONFIG.STORAGE_KEYS.STATE);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
            
            // Clear cache
            if (this.app.cache && this.app.cache.imageData) {
                this.app.cache.imageData.clear();
            }
            
        } catch (error) {
            ErrorHandler.handle(error, 'Logout');
        }
    }

    /**
     * Enhanced authentication UI updates
     */
    updateAuthUI() {
        try {
            const guestNav = this.app.getElement('#guest-nav');
            const userNav = this.app.getElement('#user-nav');
            const userEmail = this.app.getElement('#user-email');

            if (this.app.state.currentUser && guestNav && userNav && userEmail) {
                guestNav.classList.add('hidden');
                userNav.classList.remove('hidden');
                
                const displayName = this.app.state.currentUser.firstName && this.app.state.currentUser.lastName 
                    ? `${this.app.state.currentUser.firstName} ${this.app.state.currentUser.lastName}`
                    : this.app.state.currentUser.firstName || this.app.state.currentUser.email;
                    
                userEmail.textContent = displayName;
                userEmail.setAttribute('aria-label', `Logged in as ${displayName}`);
            } else if (guestNav && userNav) {
                guestNav.classList.remove('hidden');
                userNav.classList.add('hidden');
            }
        } catch (error) {
            ErrorHandler.handle(error, 'Auth UI Update');
        }
    }

    /**
     * Enhanced authentication check
     */
    checkAuthentication() {
        try {
            const savedUser = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
            if (savedUser) {
                try {
                    const userData = JSON.parse(savedUser);
                    // Validate user data structure
                    if (userData && userData.email && userData.id) {
                        this.app.state.currentUser = userData;
                        this.app.state.userPreferences = userData.preferences || {
                            outfitReminders: true,
                            reminderTime: '8:00',
                            backgroundRemoval: true
                        };
                        this.updateAuthUI();
                    } else {
                        // Invalid user data, clean up
                        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
                    }
                } catch (parseError) {
                    Utils.log('Failed to parse saved user data', 'warn', parseError);
                    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
                }
            }
        } catch (error) {
            ErrorHandler.handle(error, 'Authentication Check');
        }
    }

    /**
     * Setup authentication forms
     */
    setupForms() {
        this.setupLoginForm();
        this.setupSignupForm();
        this.setupForgotPasswordForm();
    }

    /**
     * Setup login form
     */
    setupLoginForm() {
        const loginForm = this.app.getElement('#login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                try {
                    const formData = new FormData(loginForm);
                    const email = formData.get('email')?.toString().trim();
                    const password = formData.get('password')?.toString().trim();
                    
                    if (email && password) {
                        await this.login(email, password);
                    } else {
                        this.app.showSimpleError('Please enter both email and password');
                    }
                } catch (error) {
                    ErrorHandler.handle(error, 'Login Form Submit');
                }
            });
        }
    }

    /**
     * Setup signup form
     */
    setupSignupForm() {
        const signupForm = this.app.getElement('#signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                try {
                    const formData = new FormData(signupForm);
                    const email = formData.get('email')?.toString().trim();
                    const password = formData.get('password')?.toString().trim();
                    const confirmPassword = formData.get('confirmPassword')?.toString().trim();
                    
                    if (!email || !password || !confirmPassword) {
                        this.app.showSimpleError('Please fill in all fields');
                        return;
                    }
                    
                    if (password !== confirmPassword) {
                        this.app.showSimpleError('Passwords do not match');
                        return;
                    }
                    
                    await this.signup(email, password);
                } catch (error) {
                    ErrorHandler.handle(error, 'Signup Form Submit');
                }
            });
        }
    }

    /**
     * Setup forgot password form
     */
    setupForgotPasswordForm() {
        const forgotPasswordForm = this.app.getElement('#forgot-password-form');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                try {
                    const formData = new FormData(forgotPasswordForm);
                    const email = formData.get('email')?.toString().trim();
                    
                    if (email) {
                        await this.forgotPassword(email);
                    } else {
                        this.app.showSimpleError('Please enter your email address');
                    }
                } catch (error) {
                    ErrorHandler.handle(error, 'Forgot Password Form Submit');
                }
            });
        }
    }

    /**
     * Update user profile
     */
    updateProfile(profileData) {
        try {
            if (this.app.state.currentUser) {
                this.app.state.currentUser = {
                    ...this.app.state.currentUser,
                    ...profileData,
                    lastUpdated: new Date().toISOString()
                };
                
                this.updateAuthUI();
                this.app.saveState();
                return true;
            }
            return false;
        } catch (error) {
            ErrorHandler.handle(error, 'Update Profile');
            return false;
        }
    }

    /**
     * Change password
     */
    async changePassword(currentPassword, newPassword) {
        try {
            // In a real application, this would verify the current password
            // For demo purposes, we'll just simulate the process
            
            if (this.app.ui && this.app.ui.showLoading) {
                this.app.ui.showLoading('Changing password...');
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update last password change date
            if (this.app.state.currentUser) {
                this.app.state.currentUser.lastPasswordChange = new Date().toISOString();
                this.app.saveState();
            }
            
            if (this.app.ui && this.app.ui.hideLoading) {
                this.app.ui.hideLoading();
            }
            
            return true;
            
        } catch (error) {
            if (this.app.ui && this.app.ui.hideLoading) {
                this.app.ui.hideLoading();
            }
            ErrorHandler.handle(error, 'Change Password');
            return false;
        }
    }

    /**
     * Update user preferences
     */
    updatePreferences(preferences) {
        try {
            this.app.state.userPreferences = {
                ...this.app.state.userPreferences,
                ...preferences
            };
            
            if (this.app.state.currentUser) {
                this.app.state.currentUser.preferences = this.app.state.userPreferences;
            }
            
            this.app.saveState();
            return true;
        } catch (error) {
            ErrorHandler.handle(error, 'Update Preferences');
            return false;
        }
    }

    /**
     * Validate session (for periodic checks)
     */
    validateSession() {
        try {
            if (this.app.state.currentUser) {
                const lastLogin = new Date(this.app.state.currentUser.lastLogin);
                const now = new Date();
                const daysSinceLogin = (now - lastLogin) / (1000 * 60 * 60 * 24);
                
                // Auto-logout after 30 days of inactivity
                if (daysSinceLogin > 30) {
                    this.logout();
                    this.app.showSimpleNotification('Session expired. Please log in again.', 'warning');
                    return false;
                }
            }
            return true;
        } catch (error) {
            ErrorHandler.handle(error, 'Session Validation');
            return false;
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.app.state.currentUser;
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.app.state.currentUser;
    }

    /**
     * Initialize session management
     */
    initSessionManagement() {
        // Check session validity every 5 minutes
        setInterval(() => {
            this.validateSession();
        }, 5 * 60 * 1000);
        
        // Update last activity on user interactions
        ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
            document.addEventListener(event, () => {
                if (this.app.state.currentUser) {
                    this.app.state.currentUser.lastActivity = new Date().toISOString();
                }
            }, { passive: true, capture: false });
        });
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
} else if (typeof window !== 'undefined') {
    window.Auth = Auth;
}