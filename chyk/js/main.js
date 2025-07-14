/**
 * CHYK Application - Updated Main Controller
 * Fixed navigation flow to start at home page and go to dashboard after login
 */

class CHYKApp {
    constructor() {
        // Simple application state
        this.state = {
            currentUser: null,
            currentPage: 'home',
            currentSection: 'closet',
            wardrobeItems: [],
            savedOutfits: [],
            currentWeekStart: this.getWeekStart(new Date()),
            plannerData: {},
            canvasItems: [],
            searchQuery: '',
            activeCategory: 'all',
            activeCanvasCategory: 'all',
            isInitialized: false,
            userPreferences: {
                outfitReminders: true,
                reminderTime: '8:00',
                backgroundRemoval: true
            }
        };

        // Page configuration
        this.pageConfig = {
            'home': { id: 'home-page', auth: false },
            'about': { id: 'about-page', auth: false },
            'features': { id: 'features-page', auth: false },
            'community': { id: 'community-page', auth: false },
            'contact': { id: 'contact-page', auth: false },
            'dashboard': { id: 'dashboard', auth: true },
            'settings': { id: 'settings-page', auth: true }
        };
    }

    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    }

    async init() {
        try {
            console.log('Initializing CHYK application...');
            
            // Load saved state first
            this.loadState();
            
            // Check authentication early
            this.checkAuthentication();
            
            // Setup basic event listeners
            this.setupEventListeners();
            
            // Generate sample data if needed
            this.generateSampleData();
            
            // Initialize modules safely
            this.initializeModules();
            
            // Navigate to initial page (this should be 'home' for new users)
            const initialPage = this.getInitialPage();
            console.log(`Initial page determined: ${initialPage}`);
            this.navigate(initialPage);
            
            this.state.isInitialized = true;
            console.log('CHYK application initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize CHYK:', error);
            this.showSimpleError('Application failed to load. Please refresh the page.');
        }
    }

    initializeModules() {
        try {
            // Initialize modules safely with fallbacks
            this.wardrobe = this.createModule('Wardrobe');
            this.ui = this.createModule('UI');
            this.modal = this.createModule('Modal');
            this.auth = this.createModule('Auth');
            this.canvas = this.createModule('Canvas');
            this.planner = this.createModule('Planner');
            
            // Setup forms and canvas
            this.setupForms();
            
            // Initialize canvas if wardrobe has items and user is authenticated
            if (this.canvas && this.state.wardrobeItems.length > 0 && this.state.currentUser) {
                setTimeout(() => {
                    this.canvas.init();
                }, 100);
            }
            
            console.log('Modules initialized safely');
        } catch (error) {
            console.warn('Some modules failed to initialize:', error);
            // App will continue with basic functionality
        }
    }

    createModule(moduleName) {
        try {
            if (window[moduleName] && typeof window[moduleName] === 'function') {
                const module = new window[moduleName](this);
                console.log(`${moduleName} module created successfully`);
                return module;
            } else {
                console.warn(`Module ${moduleName} not available`);
                return null;
            }
        } catch (error) {
            console.warn(`Failed to create module ${moduleName}:`, error);
            return null;
        }
    }

    setupForms() {
        try {
            // Setup upload form if wardrobe module exists
            if (this.wardrobe && typeof this.wardrobe.setupUploadForm === 'function') {
                this.wardrobe.setupUploadForm();
            }

            // Setup save outfit form for canvas
            if (this.canvas && typeof this.canvas.setupSaveOutfitForm === 'function') {
                this.canvas.setupSaveOutfitForm();
            }

            // Setup modal system
            if (this.modal && typeof this.modal.init === 'function') {
                this.modal.init();
            }

            // Setup auth forms
            if (this.auth && typeof this.auth.setupForms === 'function') {
                this.auth.setupForms();
            }
        } catch (error) {
            console.warn('Form setup error:', error);
        }
    }

    checkAuthentication() {
        try {
            const savedUser = localStorage.getItem('chyk_user');
            if (savedUser) {
                try {
                    const userData = JSON.parse(savedUser);
                    if (userData && userData.email && userData.id) {
                        this.state.currentUser = userData;
                        this.state.userPreferences = userData.preferences || this.state.userPreferences;
                        console.log('Found existing user session:', userData.email);
                        // Don't call updateAuthUI here, wait for page load
                    }
                } catch (parseError) {
                    console.warn('Failed to parse saved user data:', parseError);
                    localStorage.removeItem('chyk_user');
                }
            }
        } catch (error) {
            console.error('Authentication check error:', error);
        }
    }

    getInitialPage() {
        try {
            // Always start with home page for initial load, unless there's a specific hash
            const hash = window.location.hash.replace('#', '');
            
            // If there's a hash and it's a valid page
            if (hash && this.pageConfig[hash]) {
                // If hash points to authenticated page but no user, redirect to home
                if (this.pageConfig[hash].auth && !this.state.currentUser) {
                    console.log(`Hash page ${hash} requires auth but no user found, redirecting to home`);
                    // Clear the hash since user isn't authenticated
                    window.location.hash = '';
                    return 'home';
                }
                return hash;
            }
            
            // For clean URLs or direct access, always start at home
            // Users will be redirected to dashboard after login
            console.log(`Starting at home page, user ${this.state.currentUser ? 'is' : 'is not'} authenticated`);
            return 'home';
        } catch (error) {
            console.warn('Error getting initial page:', error);
            return 'home';
        }
    }

    // Enhanced navigation system
    navigate(page, updateHash = true) {
        try {
            if (!page || !this.pageConfig[page]) {
                console.warn(`Invalid page: ${page}, redirecting to home`);
                page = 'home';
            }

            const pageInfo = this.pageConfig[page];

            // Check authentication requirement
            if (pageInfo.auth && !this.state.currentUser) {
                console.log(`Authentication required for ${page}, showing login modal`);
                this.showModal('login');
                return;
            }

            // Hide all pages first
            this.hideAllPages();
            
            // Show target page
            const targetPageElement = document.getElementById(pageInfo.id);
            if (targetPageElement) {
                targetPageElement.style.display = page === 'dashboard' ? 'flex' : 'block';
                targetPageElement.classList.add('active');
                console.log(`Successfully navigated to ${page}`);
            } else {
                console.warn(`Could not find page element: #${pageInfo.id}`);
                return;
            }
            
            // Update navigation state
            this.updateNavigation(page);
            
            // Initialize page-specific content
            this.initializePage(page);

            this.state.currentPage = page;
            
            // Update page title
            this.updatePageTitle(page);
            
            // Update URL hash
            if (updateHash) {
                window.location.hash = page;
            }
            
            // Close mobile menu if open
            this.closeMobileMenu();
            
            // Save state after navigation
            this.saveState();
            
        } catch (error) {
            console.error('Navigation error:', error);
        }
    }

    hideAllPages() {
        try {
            Object.values(this.pageConfig).forEach(pageInfo => {
                const element = document.getElementById(pageInfo.id);
                if (element) {
                    element.classList.remove('active');
                    element.style.display = 'none';
                }
            });
        } catch (error) {
            console.warn('Error hiding pages:', error);
        }
    }

    updateNavigation(page) {
        try {
            // Update desktop navigation
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });

            const activeLink = document.querySelector(`[data-page="${page}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }

            // Update auth UI based on current user state
            this.updateAuthUI();
        } catch (error) {
            console.warn('Error updating navigation:', error);
        }
    }

    initializePage(page) {
        try {
            switch (page) {
                case 'home':
                    // Update auth UI for home page hero actions
                    this.updateAuthUI();
                    break;
                case 'dashboard':
                    this.initDashboard();
                    break;
                case 'settings':
                    this.initSettings();
                    break;
            }
        } catch (error) {
            console.warn(`Error initializing page ${page}:`, error);
        }
    }

    initDashboard() {
        try {
            // Show the correct section
            this.showSection(this.state.currentSection);
            
            // Initialize modules with delays to prevent conflicts
            setTimeout(() => {
                if (this.wardrobe && this.wardrobe.render) {
                    this.wardrobe.render();
                }
            }, 50);

            setTimeout(() => {
                if (this.canvas && this.canvas.render) {
                    this.canvas.render();
                }
            }, 100);

            setTimeout(() => {
                if (this.planner && this.planner.init) {
                    this.planner.init();
                }
            }, 150);
            
        } catch (error) {
            console.warn('Error initializing dashboard:', error);
        }
    }

    showSection(sectionId) {
        try {
            const validSections = ['closet', 'builder', 'planner', 'outfits', 'favorites'];
            if (!validSections.includes(sectionId)) {
                sectionId = 'closet';
            }

            // Hide all sections
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
                section.style.display = 'none';
            });

            // Update sidebar navigation
            document.querySelectorAll('.sidebar-nav .nav-item').forEach(link => {
                link.classList.remove('active');
            });

            // Show target section
            const targetSection = document.getElementById(`${sectionId}-section`);
            if (targetSection) {
                targetSection.style.display = 'block';
                targetSection.classList.add('active');
                console.log(`Switched to section: ${sectionId}`);
            }

            // Update active sidebar link
            const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }

            // Initialize section-specific content
            this.initializeSection(sectionId);

            this.state.currentSection = sectionId;
            this.saveState();
            
        } catch (error) {
            console.error('Section switch error:', error);
        }
    }

    initializeSection(sectionId) {
        try {
            switch (sectionId) {
                case 'closet':
                    if (this.wardrobe && this.wardrobe.render) {
                        this.wardrobe.render();
                    }
                    break;
                case 'builder':
                    if (this.canvas) {
                        if (this.canvas.render) {
                            this.canvas.render();
                        }
                        if (this.canvas.init && !this.canvas.isInitialized) {
                            this.canvas.init();
                            this.canvas.isInitialized = true;
                        }
                    }
                    break;
                case 'planner':
                    if (this.planner) {
                        if (!this.planner.isInitialized) {
                            this.planner.init();
                            this.planner.isInitialized = true;
                        } else if (this.planner.render) {
                            this.planner.render();
                        }
                    }
                    break;
                case 'outfits':
                    this.renderSavedOutfits();
                    break;
                case 'favorites':
                    this.renderFavorites();
                    break;
            }
        } catch (error) {
            console.warn(`Error initializing section ${sectionId}:`, error);
        }
    }

    renderSavedOutfits() {
        try {
            const outfitsGrid = document.getElementById('saved-outfits-grid');
            if (!outfitsGrid) return;

            const savedOutfits = this.state.savedOutfits || [];
            
            if (savedOutfits.length === 0) {
                outfitsGrid.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-star"></i>
                        <p>No saved outfits yet!</p>
                        <p>Create outfits in the Outfit Builder first.</p>
                        <button class="btn btn-primary" onclick="CHYK.showSection('builder')">
                            <i class="fas fa-palette"></i>
                            Create Outfit
                        </button>
                    </div>
                `;
                return;
            }

            // Render saved outfits
            outfitsGrid.innerHTML = '';
            savedOutfits.forEach(outfit => {
                const outfitElement = this.createOutfitCard(outfit);
                outfitsGrid.appendChild(outfitElement);
            });

        } catch (error) {
            console.warn('Error rendering saved outfits:', error);
        }
    }

    createOutfitCard(outfit) {
        const card = document.createElement('div');
        card.className = 'outfit-card';
        card.innerHTML = `
            <div class="outfit-image">
                ${outfit.preview ? 
                    `<img src="${outfit.preview}" alt="${outfit.name}" loading="lazy">` :
                    `<i class="fas fa-palette" style="font-size: 2rem; color: var(--text-muted);"></i>`
                }
            </div>
            <div class="outfit-info">
                <h3>${this.sanitize(outfit.name)}</h3>
                <div class="outfit-category">${this.sanitize(outfit.category)}</div>
                ${outfit.notes ? `<p>${this.sanitize(outfit.notes)}</p>` : ''}
                <div class="outfit-date">Created ${new Date(outfit.dateCreated).toLocaleDateString()}</div>
            </div>
        `;
        return card;
    }

    renderFavorites() {
        try {
            const favoritesGrid = document.getElementById('favorites-grid');
            if (!favoritesGrid) return;

            const favoriteItems = this.state.wardrobeItems.filter(item => item.favorite);
            
            if (favoriteItems.length === 0) {
                favoritesGrid.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-heart"></i>
                        <p>No favorite items yet!</p>
                        <p>Mark items as favorites by clicking the heart icon.</p>
                        <button class="btn btn-primary" onclick="CHYK.showSection('closet')">
                            <i class="fas fa-tshirt"></i>
                            Browse Closet
                        </button>
                    </div>
                `;
                return;
            }

            // Use wardrobe module to render items if available
            if (this.wardrobe && this.wardrobe.createItemElement) {
                favoritesGrid.innerHTML = '';
                favoriteItems.forEach(item => {
                    const itemElement = this.wardrobe.createItemElement(item);
                    favoritesGrid.appendChild(itemElement);
                });
            }
        } catch (error) {
            console.warn('Error rendering favorites:', error);
        }
    }

    setupEventListeners() {
        try {
            // Setup navigation click handlers
            document.addEventListener('click', (e) => {
                // Handle navigation links
                if (e.target.matches('[data-page]') || e.target.closest('[data-page]')) {
                    e.preventDefault();
                    const element = e.target.matches('[data-page]') ? e.target : e.target.closest('[data-page]');
                    const page = element.getAttribute('data-page');
                    this.navigate(page);
                }
                
                // Handle section links
                if (e.target.matches('[data-section]') || e.target.closest('[data-section]')) {
                    e.preventDefault();
                    const element = e.target.matches('[data-section]') ? e.target : e.target.closest('[data-section]');
                    const section = element.getAttribute('data-section');
                    this.showSection(section);
                }
                
                // Handle mobile menu toggle
                if (e.target.matches('.mobile-menu-toggle') || e.target.closest('.mobile-menu-toggle')) {
                    this.toggleMobileMenu();
                }
                
                // Handle modal close
                if (e.target.matches('.modal-close') || e.target.classList.contains('modal')) {
                    const modal = e.target.closest('.modal') || e.target;
                    if (modal && modal.id) {
                        const modalId = modal.id.replace('-modal', '');
                        this.hideModal(modalId);
                    }
                }

                // Handle user menu toggle
                if (e.target.matches('.user-menu-toggle') || e.target.closest('.user-menu-toggle')) {
                    this.toggleUserMenu();
                }
            });

            // Setup form handlers
            this.setupBasicForms();
            
            // Hash change handling
            window.addEventListener('hashchange', () => {
                const hash = window.location.hash.replace('#', '');
                if (hash && this.pageConfig[hash]) {
                    this.navigate(hash, false);
                }
            });

            // Setup search functionality
            this.setupSearch();

        } catch (error) {
            console.error('Event listeners setup error:', error);
        }
    }

    setupSearch() {
        try {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.state.searchQuery = e.target.value;
                    if (this.wardrobe && this.wardrobe.render) {
                        this.wardrobe.render();
                    }
                });
            }
        } catch (error) {
            console.warn('Search setup error:', error);
        }
    }

    setupBasicForms() {
        try {
            // Contact form
            const contactForm = document.getElementById('contact-form');
            if (contactForm) {
                contactForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleContactForm(new FormData(contactForm));
                });
            }

            // Save outfit form
            const saveOutfitForm = document.getElementById('save-outfit-form');
            if (saveOutfitForm) {
                saveOutfitForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleSaveOutfit(new FormData(saveOutfitForm));
                });
            }
        } catch (error) {
            console.error('Form setup error:', error);
        }
    }

    handleSaveOutfit(formData) {
        try {
            if (!this.canvas) {
                this.showSimpleError('Canvas not available');
                return;
            }

            const outfitName = formData.get('outfitName')?.toString().trim();
            const category = formData.get('category')?.toString().trim();
            const customCategory = formData.get('customCategory')?.toString().trim();
            const notes = formData.get('notes')?.toString().trim();

            if (!outfitName || !category) {
                this.showSimpleError('Please fill in all required fields');
                return;
            }

            const finalCategory = category === 'Custom' && customCategory ? customCategory : category;

            if (this.canvas.saveOutfit) {
                this.canvas.saveOutfit(outfitName, finalCategory, notes);
                this.hideModal('save-outfit');
            }
        } catch (error) {
            console.error('Save outfit error:', error);
            this.showSimpleError('Failed to save outfit');
        }
    }

    handleContactForm(formData) {
        try {
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');
            
            if (!name || !email || !subject || !message) {
                this.showSimpleError('Please fill in all required fields');
                return;
            }

            // Simulate form submission
            this.showSimpleSuccess('Thank you for your message! We\'ll get back to you soon.');
            
            // Reset form
            document.getElementById('contact-form').reset();
            
        } catch (error) {
            console.error('Contact form error:', error);
            this.showSimpleError('Failed to send message. Please try again.');
        }
    }

    updateAuthUI() {
        try {
            const guestNav = document.getElementById('guest-nav');
            const userNav = document.getElementById('user-nav');
            const userEmail = document.getElementById('user-email');
            const guestActions = document.getElementById('guest-actions');
            const userActions = document.getElementById('user-actions');

            if (this.state.currentUser) {
                // Update navigation
                if (guestNav) guestNav.classList.add('hidden');
                if (userNav) userNav.classList.remove('hidden');
                if (userEmail) {
                    const displayName = this.state.currentUser.firstName || this.state.currentUser.email.split('@')[0];
                    userEmail.textContent = displayName;
                }

                // Update hero actions on home page
                if (guestActions) guestActions.classList.add('hidden');
                if (userActions) userActions.classList.remove('hidden');

                console.log('Updated auth UI for logged in user');
            } else {
                // Update navigation
                if (guestNav) guestNav.classList.remove('hidden');
                if (userNav) userNav.classList.add('hidden');

                // Update hero actions on home page
                if (guestActions) guestActions.classList.remove('hidden');
                if (userActions) userActions.classList.add('hidden');

                console.log('Updated auth UI for guest user');
            }
        } catch (error) {
            console.error('Auth UI update error:', error);
        }
    }

    // Enhanced login handler that properly navigates to dashboard
    handleSuccessfulLogin(user) {
        try {
            this.state.currentUser = user;
            this.state.userPreferences = user.preferences || this.state.userPreferences;
            this.updateAuthUI();
            
            // Save user data
            this.saveState();
            localStorage.setItem('chyk_user', JSON.stringify(user));
            
            // Close any open modals
            this.hideModal('login');
            this.hideModal('signup');
            
            // Navigate to dashboard
            console.log('Login successful, navigating to dashboard');
            this.navigate('dashboard');
            
            const firstName = user.firstName || user.email.split('@')[0];
            this.showSimpleSuccess(`Welcome back, ${firstName}!`);
            
        } catch (error) {
            console.error('Handle successful login error:', error);
        }
    }

    logout() {
        try {
            const userName = this.state.currentUser?.firstName || this.state.currentUser?.email?.split('@')[0] || 'User';
            
            // Clear user state
            this.state.currentUser = null;
            this.state.userPreferences = {
                outfitReminders: true,
                reminderTime: '8:00',
                backgroundRemoval: true
            };
            
            // Update UI
            this.updateAuthUI();
            
            // Navigate to home page
            this.navigate('home');
            
            // Clear storage
            localStorage.removeItem('chyk_user');
            localStorage.removeItem('chyk_state');
            
            // Clear cache if available
            if (this.cache && this.cache.imageData) {
                this.cache.imageData.clear();
            }
            
            this.showSimpleSuccess(`Goodbye, ${userName}! See you soon.`);
            
            console.log('User logged out successfully');
            
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Modal helpers
    showModal(modalId) {
        try {
            if (this.modal && this.modal.show) {
                this.modal.show(modalId);
            } else {
                // Fallback modal display
                const modal = document.getElementById(`${modalId}-modal`);
                if (modal) {
                    modal.style.display = 'flex';
                    modal.style.opacity = '1';
                    modal.style.visibility = 'visible';
                }
            }
        } catch (error) {
            console.error('Show modal error:', error);
        }
    }

    hideModal(modalId) {
        try {
            if (this.modal && this.modal.close) {
                this.modal.close(modalId);
            } else {
                // Fallback modal hide
                const modal = document.getElementById(`${modalId}-modal`);
                if (modal) {
                    modal.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Hide modal error:', error);
        }
    }

    // Mobile menu helpers
    toggleMobileMenu() {
        try {
            const mobileNav = document.getElementById('mobile-nav');
            const toggle = document.getElementById('mobile-menu-toggle');
            
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
            }
        } catch (error) {
            console.error('Mobile menu toggle error:', error);
        }
    }

    closeMobileMenu() {
        try {
            const mobileNav = document.getElementById('mobile-nav');
            const toggle = document.getElementById('mobile-menu-toggle');
            
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
            console.error('Close mobile menu error:', error);
        }
    }

    // User menu toggle
    toggleUserMenu() {
        try {
            const dropdown = document.getElementById('user-dropdown');
            if (dropdown) {
                dropdown.classList.toggle('active');
            }
        } catch (error) {
            console.error('User menu toggle error:', error);
        }
    }

    // Simple notification system
    showSimpleSuccess(message) {
        this.showSimpleNotification(message, 'success');
    }

    showSimpleError(message) {
        this.showSimpleNotification(message, 'error');
    }

    showSimpleNotification(message, type = 'info', duration = 4000) {
        try {
            // Use UI module if available
            if (this.ui && this.ui.showNotification) {
                this.ui.showNotification(message, type, duration);
                return;
            }

            // Fallback notification system
            const existing = document.querySelectorAll('.simple-notification');
            existing.forEach(n => n.remove());

            const notification = document.createElement('div');
            notification.className = `simple-notification simple-notification-${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 90px;
                right: 20px;
                background: ${type === 'error' ? '#EF4444' : type === 'success' ? '#10B981' : '#3B82F6'};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 10000;
                max-width: 350px;
                font-family: inherit;
                animation: slideInRight 0.3s ease-out;
            `;

            document.body.appendChild(notification);

            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, duration);
        } catch (error) {
            console.error('Notification error:', error);
        }
    }

    // Sample data generation
    generateSampleData() {
        try {
            if (this.state.wardrobeItems.length === 0) {
                this.state.wardrobeItems = [
                    {
                        id: this.generateId(),
                        category: 'tops',
                        name: 'Blue Cotton T-Shirt',
                        tags: ['casual', 'cotton', 'blue'],
                        notes: 'Comfortable everyday t-shirt',
                        favorite: true,
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: this.generateId(),
                        category: 'bottoms',
                        name: 'Dark Wash Jeans',
                        tags: ['jeans', 'dark', 'slim'],
                        notes: 'Dark wash slim-fit jeans',
                        favorite: false,
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: this.generateId(),
                        category: 'shoes',
                        name: 'White Sneakers',
                        tags: ['casual', 'white', 'comfortable'],
                        notes: 'Versatile white sneakers',
                        favorite: true,
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: this.generateId(),
                        category: 'accessories',
                        name: 'Leather Watch',
                        tags: ['watch', 'leather', 'brown'],
                        notes: 'Classic brown leather watch',
                        favorite: false,
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: this.generateId(),
                        category: 'outerwear',
                        name: 'Black Jacket',
                        tags: ['jacket', 'black', 'formal'],
                        notes: 'Professional black blazer',
                        favorite: true,
                        dateAdded: new Date().toISOString()
                    }
                ];
            }
        } catch (error) {
            console.warn('Error generating sample data:', error);
        }
    }

    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    saveState() {
        try {
            localStorage.setItem('chyk_state', JSON.stringify(this.state));
            if (this.state.currentUser) {
                localStorage.setItem('chyk_user', JSON.stringify(this.state.currentUser));
            }
        } catch (error) {
            console.warn('Failed to save state:', error);
        }
    }

    loadState() {
        try {
            const savedState = localStorage.getItem('chyk_state');
            if (savedState) {
                const parsed = JSON.parse(savedState);
                this.state = { ...this.state, ...parsed };
                console.log('Loaded saved state');
            }
        } catch (error) {
            console.warn('Failed to load state:', error);
        }
    }

    initSettings() {
        console.log('Settings page initialized');
    }

    updatePageTitle(page) {
        const titles = {
            home: 'CHYK - Smart Virtual Closet',
            about: 'About CHYK',
            features: 'Features - CHYK',
            community: 'Community - CHYK',
            contact: 'Contact Us - CHYK',
            dashboard: 'Dashboard - My Virtual Closet',
            settings: 'Settings - Account Management'
        };
        
        document.title = titles[page] || titles.home;
    }

    // Utility methods
    getElement(selector) {
        return document.querySelector(selector);
    }

    sanitize(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// Simple initialization
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('DOM loaded, initializing CHYK...');
        window.CHYK = new CHYKApp();
        await window.CHYK.init();
        console.log('CHYK initialization complete');
    } catch (error) {
        console.error('Critical initialization error:', error);
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 2rem; font-family: sans-serif;">
                <div>
                    <h1 style="color: #C4A688;">CHYK</h1>
                    <h2>Loading Error</h2>
                    <p>The application failed to load. Please refresh the page.</p>
                    <button onclick="location.reload()" style="padding: 0.5rem 1rem; margin-top: 1rem; cursor: pointer; background: #C4A688; color: white; border: none; border-radius: 0.5rem;">Refresh Page</button>
                </div>
            </div>
        `;
    }
});

// Global error handlers
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});