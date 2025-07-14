// planner.js - Enhanced Weekly/Monthly Planner Module with Calendar Views

class Planner {
    constructor(app) {
        this.app = app;
        this.currentView = 'week'; // 'week' or 'month'
        this.currentWeekStart = this.getWeekStart(new Date());
        this.currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        this.searchQuery = '';
        this.activeCategory = 'all';
    }

    /**
     * Initialize planner with enhanced calendar views
     */
    init() {
        try {
            this.setupPlannerHTML();
            this.render();
            this.renderSavedOutfits();
            this.setupEventListeners();
            this.setupDragDrop();
            this.setupKeyboardNavigation();
            console.log('Enhanced planner initialized');
        } catch (error) {
            console.error('Planner initialization error:', error);
        }
    }

    /**
     * Setup planner HTML structure
     */
    setupPlannerHTML() {
        const plannerSection = document.getElementById('planner-section');
        if (!plannerSection) return;

        plannerSection.innerHTML = `
            <!-- Planner Header -->
            <div class="planner-header">
                <div class="planner-title-section">
                    <h2 class="content-title">
                        <i class="fas fa-calendar-week"></i>
                        Outfit Planner
                    </h2>
                    <p class="content-subtitle">Plan your outfits for the week or month ahead</p>
                </div>
                
                <div class="planner-controls">
                    <div class="planner-navigation">
                        <button class="planner-nav-btn" onclick="CHYK.planner.previousPeriod()" title="Previous">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <div class="current-period" id="current-period">
                            December 2024
                        </div>
                        <button class="planner-nav-btn" onclick="CHYK.planner.nextPeriod()" title="Next">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <button class="planner-nav-btn" onclick="CHYK.planner.goToToday()" title="Today">
                            <i class="fas fa-today"></i>
                        </button>
                    </div>
                    
                    <div class="view-toggle">
                        <button class="planner-view-toggle active" onclick="CHYK.planner.switchView('week')" data-view="week">
                            <i class="fas fa-calendar-week"></i>
                            <span>Week</span>
                        </button>
                        <button class="planner-view-toggle" onclick="CHYK.planner.switchView('month')" data-view="month">
                            <i class="fas fa-calendar"></i>
                            <span>Month</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Planner Layout -->
            <div class="planner-layout">
                <!-- Main Calendar Area -->
                <div class="planner-main">
                    <!-- Weekly View -->
                    <div class="weekly-view active" id="weekly-view">
                        <div class="week-header">
                            <div class="week-day-header">Sunday</div>
                            <div class="week-day-header">Monday</div>
                            <div class="week-day-header">Tuesday</div>
                            <div class="week-day-header">Wednesday</div>
                            <div class="week-day-header">Thursday</div>
                            <div class="week-day-header">Friday</div>
                            <div class="week-day-header">Saturday</div>
                        </div>
                        <div class="week-grid" id="week-grid">
                            <!-- Week days will be populated by JavaScript -->
                        </div>
                    </div>

                    <!-- Monthly View -->
                    <div class="monthly-view" id="monthly-view">
                        <div class="month-header">
                            <div class="month-day-header">Sun</div>
                            <div class="month-day-header">Mon</div>
                            <div class="month-day-header">Tue</div>
                            <div class="month-day-header">Wed</div>
                            <div class="month-day-header">Thu</div>
                            <div class="month-day-header">Fri</div>
                            <div class="month-day-header">Sat</div>
                        </div>
                        <div class="month-grid" id="month-grid">
                            <!-- Month days will be populated by JavaScript -->
                        </div>
                    </div>
                </div>

                <!-- Outfit Sidebar -->
                <div class="saved-outfits-sidebar">
                    <div class="saved-outfits-header">
                        <h3 class="saved-outfits-title">Saved Outfits</h3>
                        <p class="saved-outfits-subtitle">Drag outfits to calendar days</p>
                    </div>

                    <div class="saved-outfits-search-container">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" 
                               class="search-input" 
                               id="saved-outfits-search" 
                               placeholder="Search outfits..." 
                               value="">
                    </div>

                    <div class="outfit-category-filters">
                        <button class="outfit-category-filter active" onclick="CHYK.planner.filterOutfits('all')" data-category="all">
                            All
                        </button>
                        <button class="outfit-category-filter" onclick="CHYK.planner.filterOutfits('work')" data-category="work">
                            Work
                        </button>
                        <button class="outfit-category-filter" onclick="CHYK.planner.filterOutfits('casual')" data-category="casual">
                            Casual
                        </button>
                        <button class="outfit-category-filter" onclick="CHYK.planner.filterOutfits('evening')" data-category="evening">
                            Evening
                        </button>
                        <button class="outfit-category-filter" onclick="CHYK.planner.filterOutfits('formal')" data-category="formal">
                            Formal
                        </button>
                    </div>

                    <div class="saved-outfits-list" id="saved-outfits-for-planner">
                        <!-- Outfits will be populated here -->
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Switch between week and month views
     */
    switchView(view) {
        try {
            this.currentView = view;
            
            // Update active button
            document.querySelectorAll('.planner-view-toggle').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            document.querySelector(`[data-view="${view}"]`).classList.add('active');
            document.querySelector(`[data-view="${view}"]`).setAttribute('aria-pressed', 'true');
            
            // Show/hide views
            document.getElementById('weekly-view').classList.toggle('active', view === 'week');
            document.getElementById('monthly-view').classList.toggle('active', view === 'month');
            
            // Re-render calendar
            this.render();
            
            console.log(`Switched to ${view} view`);
        } catch (error) {
            console.error('Switch view error:', error);
        }
    }

    /**
     * Navigate to previous period
     */
    previousPeriod() {
        try {
            if (this.currentView === 'week') {
                this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
            } else {
                this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
            }
            this.render();
            this.app.saveState();
        } catch (error) {
            console.error('Previous period error:', error);
        }
    }

    /**
     * Navigate to next period
     */
    nextPeriod() {
        try {
            if (this.currentView === 'week') {
                this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
            } else {
                this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
            }
            this.render();
            this.app.saveState();
        } catch (error) {
            console.error('Next period error:', error);
        }
    }

    /**
     * Go to today
     */
    goToToday() {
        try {
            const today = new Date();
            this.currentWeekStart = this.getWeekStart(today);
            this.currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            this.render();
            this.app.saveState();
        } catch (error) {
            console.error('Go to today error:', error);
        }
    }

    /**
     * Render the calendar
     */
    render() {
        try {
            this.updatePeriodTitle();
            
            if (this.currentView === 'week') {
                this.renderWeekView();
            } else {
                this.renderMonthView();
            }
            
            this.setupDragDrop();
        } catch (error) {
            console.error('Render error:', error);
        }
    }

    /**
     * Update period title
     */
    updatePeriodTitle() {
        try {
            const titleElement = document.getElementById('current-period');
            if (!titleElement) return;
            
            if (this.currentView === 'week') {
                const weekEnd = new Date(this.currentWeekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                
                const options = { month: 'short', day: 'numeric' };
                const startStr = this.currentWeekStart.toLocaleDateString('en-US', options);
                const endStr = weekEnd.toLocaleDateString('en-US', options);
                
                if (this.currentWeekStart.getMonth() === weekEnd.getMonth()) {
                    titleElement.textContent = `${startStr} - ${weekEnd.getDate()}, ${this.currentWeekStart.getFullYear()}`;
                } else {
                    titleElement.textContent = `${startStr} - ${endStr}, ${this.currentWeekStart.getFullYear()}`;
                }
            } else {
                const options = { month: 'long', year: 'numeric' };
                titleElement.textContent = this.currentMonth.toLocaleDateString('en-US', options);
            }
        } catch (error) {
            console.error('Update period title error:', error);
        }
    }

    /**
     * Render week view
     */
    renderWeekView() {
        try {
            const grid = document.getElementById('week-grid');
            if (!grid) return;
            
            grid.innerHTML = '';
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(this.currentWeekStart);
                date.setDate(this.currentWeekStart.getDate() + i);
                
                const dayCell = this.createDayCell(date, 'week');
                grid.appendChild(dayCell);
            }
        } catch (error) {
            console.error('Render week view error:', error);
        }
    }

    /**
     * Render month view
     */
    renderMonthView() {
        try {
            const grid = document.getElementById('month-grid');
            if (!grid) return;
            
            grid.innerHTML = '';
            
            const firstDay = new Date(this.currentMonth);
            const startDate = new Date(firstDay);
            startDate.setDate(startDate.getDate() - firstDay.getDay());
            
            // Render 42 days (6 weeks)
            for (let i = 0; i < 42; i++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);
                
                const dayCell = this.createDayCell(date, 'month');
                
                // Mark days outside current month
                if (date.getMonth() !== this.currentMonth.getMonth()) {
                    dayCell.classList.add('other-month');
                }
                
                grid.appendChild(dayCell);
            }
        } catch (error) {
            console.error('Render month view error:', error);
        }
    }

    /**
     * Create day cell
     */
    createDayCell(date, viewType) {
        try {
            const dayCell = document.createElement('div');
            dayCell.className = 'planner-day';
            
            const dateKey = this.formatDate(date);
            dayCell.setAttribute('data-date', dateKey);
            dayCell.setAttribute('role', 'gridcell');
            dayCell.setAttribute('tabindex', '0');
            
            if (this.isToday(date)) {
                dayCell.classList.add('today');
            }
            
            // Day header
            const dayHeader = document.createElement('div');
            dayHeader.className = 'planner-day-header';
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'planner-day-number';
            dayNumber.textContent = date.getDate();
            
            dayHeader.appendChild(dayNumber);
            
            // Day outfit container
            const dayOutfit = document.createElement('div');
            dayOutfit.className = 'planner-day-outfit';
            
            // Check for planned outfit
            const plannedOutfit = this.app.state.plannerData[dateKey];
            
            if (plannedOutfit) {
                const outfitPreview = this.createOutfitPreview(plannedOutfit, dateKey);
                dayOutfit.appendChild(outfitPreview);
            } else {
                const placeholder = document.createElement('div');
                placeholder.className = 'planner-outfit-placeholder';
                placeholder.innerHTML = `
                    <i class="fas fa-plus" style="opacity: 0.3;"></i>
                    <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.5rem;">
                        Drop outfit here
                    </div>
                `;
                dayOutfit.appendChild(placeholder);
            }
            
            dayCell.appendChild(dayHeader);
            dayCell.appendChild(dayOutfit);
            
            // Accessibility
            const outfitText = plannedOutfit ? `, planned outfit: ${plannedOutfit.name}` : ', no outfit planned';
            dayCell.setAttribute('aria-label', `${date.toLocaleDateString()}${outfitText}`);
            
            return dayCell;
            
        } catch (error) {
            console.error('Create day cell error:', error);
            return document.createElement('div');
        }
    }

    /**
     * Create outfit preview
     */
    createOutfitPreview(outfit, dateKey) {
        try {
            const preview = document.createElement('div');
            preview.className = 'planner-outfit-preview';
            
            const isProcessed = outfit.preview && outfit.preview.startsWith('data:image/png');
            if (isProcessed) {
                preview.style.background = 'var(--transparency-pattern-sm)';
            }
            
            preview.innerHTML = `
                ${outfit.preview ? 
                    `<img src="${outfit.preview}" 
                         alt="${this.sanitizeHtml(outfit.name)}" 
                         loading="lazy">` :
                    `<i class="fas fa-palette"></i>`
                }
                <div class="planner-outfit-info">
                    ${this.sanitizeHtml(outfit.name)}
                </div>
                <div class="planner-outfit-actions">
                    <button class="planner-outfit-action" onclick="CHYK.planner.viewPlannedOutfit('${dateKey}')" title="View outfit">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="planner-outfit-action" onclick="CHYK.planner.editOutfitForDay('${dateKey}')" title="Edit outfit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="planner-outfit-action" onclick="CHYK.planner.removeOutfitFromDay('${dateKey}')" title="Remove outfit">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            return preview;
            
        } catch (error) {
            console.error('Create outfit preview error:', error);
            return document.createElement('div');
        }
    }

    /**
     * Setup drag and drop
     */
    setupDragDrop() {
        try {
            const plannerDays = document.querySelectorAll('.planner-day');
            
            plannerDays.forEach(day => {
                day.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    day.classList.add('drop-target');
                });

                day.addEventListener('dragleave', (e) => {
                    e.preventDefault();
                    if (!day.contains(e.relatedTarget)) {
                        day.classList.remove('drop-target');
                    }
                });

                day.addEventListener('drop', (e) => {
                    e.preventDefault();
                    day.classList.remove('drop-target');
                    
                    const outfitId = e.dataTransfer.getData('text/plain');
                    const outfit = this.app.state.savedOutfits.find(o => o.id === outfitId);
                    const dateKey = day.dataset.date;
                    
                    if (outfit && dateKey) {
                        this.addOutfitToDay(dateKey, outfit);
                    }
                });
            });
        } catch (error) {
            console.error('Setup drag drop error:', error);
        }
    }

    /**
     * Add outfit to specific day
     */
    addOutfitToDay(dateKey, outfit) {
        try {
            this.app.state.plannerData[dateKey] = { ...outfit };
            this.render();
            this.app.saveState();
            
            const date = new Date(dateKey);
            this.app.showSimpleSuccess(`Outfit "${outfit.name}" planned for ${date.toLocaleDateString()}`);
            
        } catch (error) {
            console.error('Add outfit to day error:', error);
        }
    }

    /**
     * Remove outfit from specific day
     */
    removeOutfitFromDay(dateKey) {
        try {
            if (this.app.state.plannerData[dateKey]) {
                const outfitName = this.app.state.plannerData[dateKey].name;
                delete this.app.state.plannerData[dateKey];
                this.render();
                this.app.saveState();
                this.app.showSimpleSuccess(`Outfit "${outfitName}" removed from day`);
            }
        } catch (error) {
            console.error('Remove outfit from day error:', error);
        }
    }

    /**
     * View planned outfit details
     */
    viewPlannedOutfit(dateKey) {
        try {
            const plannedOutfit = this.app.state.plannerData[dateKey];
            if (!plannedOutfit) {
                this.app.showSimpleNotification('No outfit planned for this day', 'info');
                return;
            }

            const date = new Date(dateKey);
            this.app.showSimpleNotification(
                `Planned outfit: "${plannedOutfit.name}" for ${date.toLocaleDateString()}`,
                'info',
                5000
            );
        } catch (error) {
            console.error('View planned outfit error:', error);
        }
    }

    /**
     * Edit outfit for specific day
     */
    editOutfitForDay(dateKey) {
        try {
            const plannedOutfit = this.app.state.plannerData[dateKey];
            if (!plannedOutfit) {
                this.app.showSimpleNotification('No outfit planned for this day', 'info');
                return;
            }

            // Simple edit - change outfit name
            const newName = prompt('Edit outfit name:', plannedOutfit.name);
            if (newName && newName.trim()) {
                this.app.state.plannerData[dateKey].name = newName.trim();
                this.render();
                this.app.saveState();
                this.app.showSimpleSuccess('Outfit updated');
            }
        } catch (error) {
            console.error('Edit outfit for day error:', error);
        }
    }

    /**
     * Render saved outfits
     */
    renderSavedOutfits() {
        try {
            const outfitsList = document.getElementById('saved-outfits-for-planner');
            if (!outfitsList) return;

            const filteredOutfits = this.getFilteredOutfits();

            if (filteredOutfits.length === 0) {
                outfitsList.innerHTML = this.renderEmptyOutfitsState();
                return;
            }

            const fragment = document.createDocumentFragment();
            filteredOutfits.forEach(outfit => {
                const outfitElement = this.createOutfitElement(outfit);
                fragment.appendChild(outfitElement);
            });

            outfitsList.innerHTML = '';
            outfitsList.appendChild(fragment);

            outfitsList.setAttribute('aria-label', `${filteredOutfits.length} saved outfits available for planning`);

        } catch (error) {
            console.error('Render saved outfits error:', error);
        }
    }

    /**
     * Create outfit element for sidebar
     */
    createOutfitElement(outfit) {
        try {
            const outfitElement = document.createElement('div');
            outfitElement.className = 'saved-outfit-item';
            outfitElement.setAttribute('draggable', 'true');
            outfitElement.setAttribute('data-outfit-id', outfit.id);
            outfitElement.setAttribute('role', 'button');
            outfitElement.setAttribute('tabindex', '0');
            outfitElement.setAttribute('aria-label', `Drag ${outfit.name} to calendar or click to view details`);

            const isProcessed = outfit.preview && outfit.preview.startsWith('data:image/png');

            outfitElement.innerHTML = `
                <div class="saved-outfit-preview" 
                     style="${isProcessed ? 'background: var(--transparency-pattern-md);' : ''}">
                    ${outfit.preview ? 
                        `<img src="${outfit.preview}" 
                             alt="${this.sanitizeHtml(outfit.name)}" 
                             loading="lazy">` :
                        `<i class="fas fa-palette"></i>`
                    }
                </div>
                <div class="saved-outfit-info">
                    <div class="saved-outfit-name">${this.sanitizeHtml(outfit.name)}</div>
                    <div class="saved-outfit-category">${this.sanitizeHtml(outfit.category)}</div>
                    ${outfit.notes ? `<div class="saved-outfit-notes" title="${this.sanitizeHtml(outfit.notes)}">${this.sanitizeHtml(outfit.notes)}</div>` : ''}
                </div>
            `;

            // Setup drag events
            outfitElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', outfit.id);
                outfitElement.classList.add('dragging');
            });

            outfitElement.addEventListener('dragend', () => {
                outfitElement.classList.remove('dragging');
            });

            // Click to view outfit details
            outfitElement.addEventListener('click', (e) => {
                if (!outfitElement.classList.contains('dragging')) {
                    this.viewOutfit(outfit);
                }
            });

            // Keyboard navigation
            outfitElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.viewOutfit(outfit);
                }
            });

            return outfitElement;
            
        } catch (error) {
            console.error('Create outfit element error:', error);
            return document.createElement('div');
        }
    }

    /**
     * View outfit details
     */
    viewOutfit(outfit) {
        try {
            let message = `Outfit: ${outfit.name}\nCategory: ${outfit.category}`;
            if (outfit.notes) {
                message += `\nNotes: ${outfit.notes}`;
            }
            if (outfit.items && outfit.items.length > 0) {
                message += `\nItems: ${outfit.items.length} pieces`;
            }
            
            this.app.showSimpleNotification(message, 'info', 5000);
        } catch (error) {
            console.error('View outfit error:', error);
        }
    }

    /**
     * Get filtered outfits
     */
    getFilteredOutfits() {
        try {
            let outfits = [...(this.app.state.savedOutfits || [])];
            
            // Filter by category
            if (this.activeCategory && this.activeCategory !== 'all') {
                outfits = outfits.filter(outfit => outfit.category === this.activeCategory);
            }
            
            // Filter by search query
            if (this.searchQuery && this.searchQuery.length > 0) {
                const query = this.searchQuery.toLowerCase().trim();
                outfits = outfits.filter(outfit => 
                    outfit.name.toLowerCase().includes(query) ||
                    outfit.category.toLowerCase().includes(query) ||
                    (outfit.notes && outfit.notes.toLowerCase().includes(query))
                );
            }
            
            return outfits.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
        } catch (error) {
            console.error('Filter outfits error:', error);
            return [];
        }
    }

    /**
     * Filter outfits by category
     */
    filterOutfits(category) {
        try {
            this.activeCategory = category;
            
            document.querySelectorAll('.outfit-category-filter').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            
            const activeBtn = document.querySelector(`[data-category="${category}"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
                activeBtn.setAttribute('aria-pressed', 'true');
            }

            this.renderSavedOutfits();
        } catch (error) {
            console.error('Filter outfits error:', error);
        }
    }

    /**
     * Render empty outfits state
     */
    renderEmptyOutfitsState() {
        const hasSearch = this.searchQuery && this.searchQuery.length > 0;
        const hasFilter = this.activeCategory && this.activeCategory !== 'all';
        
        if (hasSearch || hasFilter) {
            return `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No outfits match your search criteria.</p>
                    <button class="btn btn-secondary btn-sm" onclick="CHYK.planner.clearSearch()">
                        Clear Search
                    </button>
                </div>
            `;
        }
        
        return `
            <div class="empty-state">
                <i class="fas fa-palette"></i>
                <p>No saved outfits yet.</p>
                <p>Create outfits in the Outfit Builder first!</p>
                <button class="btn btn-primary btn-sm" onclick="CHYK.showSection('builder')">
                    Create Outfit
                </button>
            </div>
        `;
    }

    /**
     * Clear search
     */
    clearSearch() {
        try {
            const searchInput = document.getElementById('saved-outfits-search');
            if (searchInput) {
                searchInput.value = '';
            }
            
            this.searchQuery = '';
            this.filterOutfits('all');
            
            this.app.showSimpleNotification('Search cleared');
        } catch (error) {
            console.error('Clear search error:', error);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        try {
            // Search functionality
            const searchInput = document.getElementById('saved-outfits-search');
            if (searchInput) {
                const debouncedSearch = this.debounce((query) => {
                    this.searchQuery = query;
                    this.renderSavedOutfits();
                }, 300);

                searchInput.addEventListener('input', (e) => {
                    debouncedSearch(e.target.value);
                });
            }
        } catch (error) {
            console.error('Setup event listeners error:', error);
        }
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        try {
            document.addEventListener('keydown', (e) => {
                // Only handle if planner is active
                if (this.app.state.currentSection !== 'planner') return;
                
                // Keyboard shortcuts
                if (e.altKey) {
                    switch (e.key) {
                        case 'w':
                            e.preventDefault();
                            this.switchView('week');
                            break;
                        case 'm':
                            e.preventDefault();
                            this.switchView('month');
                            break;
                        case 'ArrowLeft':
                            e.preventDefault();
                            this.previousPeriod();
                            break;
                        case 'ArrowRight':
                            e.preventDefault();
                            this.nextPeriod();
                            break;
                        case 't':
                            e.preventDefault();
                            this.goToToday();
                            break;
                    }
                }
            });
        } catch (error) {
            console.error('Setup keyboard navigation error:', error);
        }
    }

    // Utility methods
    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    isToday(date) {
        const today = new Date();
        return this.formatDate(date) === this.formatDate(today);
    }

    sanitizeHtml(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

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
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Planner;
} else if (typeof window !== 'undefined') {
    window.Planner = Planner;
}