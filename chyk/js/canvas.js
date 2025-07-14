// canvas.js - Fixed Canvas/Outfit Builder Module

class Canvas {
    constructor(app) {
        this.app = app;
        this.isInitialized = false;
    }

    /**
     * Initialize canvas with enhanced functionality
     */
    init() {
        try {
            console.log('Initializing Canvas...');
            this.setupDragDrop();
            this.render();
            this.isInitialized = true;
            console.log('Canvas initialized successfully');
        } catch (error) {
            console.error('Canvas initialization error:', error);
        }
    }

    /**
     * Enhanced canvas rendering
     */
    render() {
        try {
            this.renderItemsList();
            this.updateCanvasInstructions();
            this.restoreCanvasItems();
        } catch (error) {
            console.error('Canvas render error:', error);
        }
    }

    /**
     * Enhanced items list rendering
     */
    renderItemsList() {
        try {
            const itemsList = document.getElementById('canvas-items-list');
            if (!itemsList) {
                console.warn('Canvas items list not found');
                return;
            }

            const filteredItems = this.getFilteredItems();

            if (filteredItems.length === 0) {
                itemsList.innerHTML = this.renderEmptyItemsList();
                return;
            }

            const fragment = document.createDocumentFragment();
            filteredItems.forEach(item => {
                const itemElement = this.createCanvasItemElement(item);
                fragment.appendChild(itemElement);
            });

            itemsList.innerHTML = '';
            itemsList.appendChild(fragment);

            console.log(`Rendered ${filteredItems.length} items in canvas sidebar`);
            
        } catch (error) {
            console.error('Canvas items list render error:', error);
        }
    }

    /**
     * Create canvas item element
     */
    createCanvasItemElement(item) {
        try {
            const canvasItem = document.createElement('div');
            canvasItem.className = 'canvas-item';
            canvasItem.setAttribute('draggable', 'true');
            canvasItem.setAttribute('data-item-id', item.id);
            canvasItem.setAttribute('role', 'button');
            canvasItem.setAttribute('tabindex', '0');
            canvasItem.setAttribute('aria-label', `Add ${item.category} to canvas`);

            canvasItem.innerHTML = `
                <div class="canvas-item-image">
                    ${item.image ? 
                        `<img src="${item.image}" 
                             alt="${item.name || item.category}" 
                             loading="lazy" 
                             style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--border-radius);"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center;">
                             <i class="fas fa-${this.getCategoryIcon(item.category)}"></i>
                         </div>` :
                        `<i class="fas fa-${this.getCategoryIcon(item.category)}"></i>`
                    }
                </div>
                <div class="canvas-item-info">
                    <div class="canvas-item-category">${this.sanitize(item.category)}</div>
                    ${item.name ? `<div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 0.25rem;">${this.sanitize(item.name)}</div>` : ''}
                    ${item.tags.length > 0 ? `<div style="font-size: 0.6rem; color: var(--text-muted); margin-top: 0.25rem;">${item.tags.slice(0, 2).map(tag => this.sanitize(tag)).join(', ')}</div>` : ''}
                </div>
            `;

            // Setup drag events
            canvasItem.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.id);
                canvasItem.style.opacity = '0.5';
                console.log(`Started dragging item: ${item.id}`);
            });

            canvasItem.addEventListener('dragend', (e) => {
                canvasItem.style.opacity = '';
                console.log(`Ended dragging item: ${item.id}`);
            });

            // Enhanced keyboard navigation
            canvasItem.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.addItemToCanvasFromKeyboard(item);
                }
            });

            // Click to add (alternative to drag)
            canvasItem.addEventListener('click', (e) => {
                if (!e.ctrlKey && !e.metaKey) return; // Only add on Ctrl/Cmd + click
                this.addItemToCanvasFromKeyboard(item);
            });

            return canvasItem;
        } catch (error) {
            console.error('Error creating canvas item element:', error);
            return document.createElement('div');
        }
    }

    /**
     * Add item to canvas from keyboard/click
     */
    addItemToCanvasFromKeyboard(item) {
        try {
            const canvas = document.getElementById('styling-canvas');
            if (canvas) {
                const centerX = canvas.offsetWidth / 2;
                const centerY = canvas.offsetHeight / 2;
                this.addItemToCanvas(item, centerX, centerY);
            }
        } catch (error) {
            console.error('Error adding item from keyboard:', error);
        }
    }

    /**
     * Render empty items list
     */
    renderEmptyItemsList() {
        return `
            <div style="text-align: center; padding: 1rem; color: var(--text-muted);">
                <i class="fas fa-tshirt" style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.3;" aria-hidden="true"></i>
                <p>No items available for the outfit builder.</p>
                <p style="font-size: 0.8rem; margin-top: 0.5rem;">Add items to your closet first, then come back to create outfits!</p>
                <button class="btn btn-primary btn-sm" onclick="window.CHYK.showSection('closet')" style="margin-top: 0.5rem;">
                    <i class="fas fa-plus"></i>
                    Add Items
                </button>
            </div>
        `;
    }

    /**
     * Enhanced filtering
     */
    getFilteredItems() {
        try {
            let items = this.app.state.wardrobeItems || [];
            
            if (this.app.state.activeCanvasCategory && this.app.state.activeCanvasCategory !== 'all') {
                items = items.filter(item => item.category === this.app.state.activeCanvasCategory);
            }
            
            return items;
        } catch (error) {
            console.error('Canvas items filter error:', error);
            return [];
        }
    }

    /**
     * Enhanced filter items
     */
    filterItems(category) {
        try {
            this.app.state.activeCanvasCategory = category;
            
            document.querySelectorAll('#builder-section .category-filter').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            
            const activeBtn = document.querySelector(`#builder-section [data-category="${category}"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
                activeBtn.setAttribute('aria-pressed', 'true');
            }

            this.renderItemsList();
            console.log(`Filtered canvas items by category: ${category}`);
        } catch (error) {
            console.error('Canvas filter items error:', error);
        }
    }

    /**
     * Enhanced drag and drop setup
     */
    setupDragDrop() {
        try {
            const canvas = document.getElementById('styling-canvas');
            if (!canvas) {
                console.warn('Styling canvas not found');
                return;
            }

            console.log('Setting up canvas drag and drop...');

            // Enhanced drag over
            canvas.addEventListener('dragover', (e) => {
                e.preventDefault();
                canvas.classList.add('drop-target');
            });

            // Enhanced drag leave
            canvas.addEventListener('dragleave', (e) => {
                e.preventDefault();
                // Only remove styles if actually leaving the canvas
                if (!canvas.contains(e.relatedTarget)) {
                    this.resetCanvasDropStyles(canvas);
                }
            });

            // Enhanced drop
            canvas.addEventListener('drop', (e) => {
                e.preventDefault();
                this.resetCanvasDropStyles(canvas);
                
                const itemId = e.dataTransfer.getData('text/plain');
                const item = this.app.state.wardrobeItems.find(i => i.id === itemId);
                
                if (item) {
                    const rect = canvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    this.addItemToCanvas(item, x, y);
                    console.log(`Dropped item ${item.id} at (${x}, ${y})`);
                } else {
                    console.warn('Item not found for drop:', itemId);
                }
            });

            console.log('Canvas drag and drop setup complete');

        } catch (error) {
            console.error('Drag drop setup error:', error);
        }
    }

    /**
     * Reset canvas drop styles
     */
    resetCanvasDropStyles(canvas) {
        canvas.classList.remove('drop-target');
    }

    /**
     * Enhanced add item to canvas
     */
    addItemToCanvas(item, x, y) {
        try {
            const canvas = document.getElementById('styling-canvas');
            if (!canvas) {
                console.error('Canvas not found');
                return;
            }

            // Check if item is already on canvas
            const existingItem = canvas.querySelector(`[data-item-id="${item.id}"]`);
            if (existingItem) {
                this.app.showSimpleNotification && this.app.showSimpleNotification('Item is already on the canvas', 'info');
                // Focus the existing item
                existingItem.focus();
                return;
            }

            const placedItem = document.createElement('div');
            placedItem.className = 'canvas-item-placed';
            placedItem.dataset.itemId = item.id;
            placedItem.style.left = `${Math.max(0, Math.min(x - 50, canvas.offsetWidth - 100))}px`;
            placedItem.style.top = `${Math.max(0, Math.min(y - 50, canvas.offsetHeight - 100))}px`;
            placedItem.style.width = '100px';
            placedItem.style.height = '100px';
            placedItem.setAttribute('tabindex', '0');
            placedItem.setAttribute('aria-label', `${item.category} item on canvas`);
            
            placedItem.innerHTML = `
                <div class="canvas-item-content" style="width: 100%; height: 100%; position: relative;">
                    ${item.image ? 
                        `<img src="${item.image}" 
                             alt="${item.name || item.category}" 
                             loading="lazy" 
                             style="width: 100%; height: 100%; object-fit: cover; border-radius: calc(var(--border-radius) - 2px);"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center;">
                             <i class="fas fa-${this.getCategoryIcon(item.category)}" style="font-size: 2rem; color: var(--primary);"></i>
                         </div>` :
                        `<i class="fas fa-${this.getCategoryIcon(item.category)}" style="font-size: 2rem; color: var(--primary);"></i>`
                    }
                </div>
                <button class="remove-from-canvas" aria-label="Remove item from canvas" title="Remove from canvas">&times;</button>
                <div class="resize-handle" aria-label="Resize item" title="Drag to resize"></div>
            `;

            this.setupItemInteractions(placedItem, item);
            canvas.appendChild(placedItem);
            
            // Add to canvas items state
            this.app.state.canvasItems.push({ 
                ...item, 
                x: parseInt(placedItem.style.left), 
                y: parseInt(placedItem.style.top), 
                width: 100, 
                height: 100 
            });
            
            this.updateCanvasInstructions();
            this.app.saveState();
            
            console.log(`Added item ${item.id} to canvas`);
            this.app.showSimpleSuccess && this.app.showSimpleSuccess(`Added ${item.category} to canvas`);
            
        } catch (error) {
            console.error('Add item to canvas error:', error);
        }
    }

    /**
     * Enhanced item interactions setup
     */
    setupItemInteractions(placedItem, item) {
        try {
            const canvas = document.getElementById('styling-canvas');
            const resizeHandle = placedItem.querySelector('.resize-handle');
            const removeBtn = placedItem.querySelector('.remove-from-canvas');

            // Show/hide controls on hover and focus
            const showControls = () => {
                const handle = placedItem.querySelector('.resize-handle');
                const remove = placedItem.querySelector('.remove-from-canvas');
                if (handle) handle.style.display = 'flex';
                if (remove) remove.style.display = 'flex';
                placedItem.style.zIndex = '15';
            };

            const hideControls = () => {
                const handle = placedItem.querySelector('.resize-handle');
                const remove = placedItem.querySelector('.remove-from-canvas');
                if (handle) handle.style.display = 'none';
                if (remove) remove.style.display = 'none';
                placedItem.style.zIndex = '10';
            };

            // Event listeners for controls visibility
            placedItem.addEventListener('mouseenter', showControls);
            placedItem.addEventListener('mouseleave', hideControls);
            placedItem.addEventListener('focus', showControls);
            placedItem.addEventListener('blur', hideControls);

            // Remove button
            if (removeBtn) {
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeItemFromCanvas(placedItem, item.id);
                });
            }

            // Enhanced mouse dragging
            this.setupMouseDragging(placedItem, canvas);
            
            // Enhanced resizing
            if (resizeHandle) {
                this.setupResizing(placedItem, resizeHandle, canvas);
            }

            // Enhanced keyboard navigation
            this.setupKeyboardNavigation(placedItem, canvas, item);

        } catch (error) {
            console.error('Item interactions setup error:', error);
        }
    }

    /**
     * Setup mouse dragging
     */
    setupMouseDragging(placedItem, canvas) {
        try {
            placedItem.addEventListener('mousedown', (e) => {
                // Don't drag if clicking on controls
                if (e.target.closest('.resize-handle') || e.target.closest('.remove-from-canvas')) return;
                
                e.preventDefault();
                let isDragging = true;
                const startX = e.clientX;
                const startY = e.clientY;
                const startLeft = parseInt(placedItem.style.left) || 0;
                const startTop = parseInt(placedItem.style.top) || 0;
                
                placedItem.style.cursor = 'grabbing';
                placedItem.style.zIndex = '100';
                placedItem.classList.add('dragging');
                
                const handleMouseMove = (e) => {
                    if (!isDragging) return;
                    
                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;
                    const newLeft = Math.max(0, Math.min(startLeft + deltaX, canvas.offsetWidth - placedItem.offsetWidth));
                    const newTop = Math.max(0, Math.min(startTop + deltaY, canvas.offsetHeight - placedItem.offsetHeight));
                    
                    placedItem.style.left = newLeft + 'px';
                    placedItem.style.top = newTop + 'px';
                };

                const handleMouseUp = () => {
                    isDragging = false;
                    placedItem.style.cursor = 'move';
                    placedItem.style.zIndex = '10';
                    placedItem.classList.remove('dragging');
                    this.updateCanvasItemData(placedItem);
                    
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            });
        } catch (error) {
            console.error('Mouse dragging setup error:', error);
        }
    }

    /**
     * Setup resizing functionality
     */
    setupResizing(placedItem, resizeHandle, canvas) {
        try {
            resizeHandle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = placedItem.offsetWidth;
                const startHeight = placedItem.offsetHeight;
                
                const handleMouseMove = (e) => {
                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;
                    const delta = Math.max(deltaX, deltaY);
                    
                    const newSize = Math.max(50, Math.min(startWidth + delta, 300));
                    
                    placedItem.style.width = newSize + 'px';
                    placedItem.style.height = newSize + 'px';
                    
                    // Ensure item stays within canvas bounds
                    const maxLeft = canvas.offsetWidth - newSize;
                    const maxTop = canvas.offsetHeight - newSize;
                    const currentLeft = parseInt(placedItem.style.left) || 0;
                    const currentTop = parseInt(placedItem.style.top) || 0;
                    
                    if (currentLeft > maxLeft) placedItem.style.left = maxLeft + 'px';
                    if (currentTop > maxTop) placedItem.style.top = maxTop + 'px';
                };

                const handleMouseUp = () => {
                    this.updateCanvasItemData(placedItem);
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            });
        } catch (error) {
            console.error('Resizing setup error:', error);
        }
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation(placedItem, canvas, item) {
        try {
            placedItem.addEventListener('keydown', (e) => {
                const step = e.shiftKey ? 10 : 1;
                let newLeft = parseInt(placedItem.style.left) || 0;
                let newTop = parseInt(placedItem.style.top) || 0;
                
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        newLeft = Math.max(0, newLeft - step);
                        placedItem.style.left = newLeft + 'px';
                        this.updateCanvasItemData(placedItem);
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        newLeft = Math.min(canvas.offsetWidth - placedItem.offsetWidth, newLeft + step);
                        placedItem.style.left = newLeft + 'px';
                        this.updateCanvasItemData(placedItem);
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        newTop = Math.max(0, newTop - step);
                        placedItem.style.top = newTop + 'px';
                        this.updateCanvasItemData(placedItem);
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        newTop = Math.min(canvas.offsetHeight - placedItem.offsetHeight, newTop + step);
                        placedItem.style.top = newTop + 'px';
                        this.updateCanvasItemData(placedItem);
                        break;
                    case 'Delete':
                    case 'Backspace':
                        e.preventDefault();
                        this.removeItemFromCanvas(placedItem, item.id);
                        break;
                    case '+':
                    case '=':
                        e.preventDefault();
                        this.resizeItem(placedItem, 10);
                        break;
                    case '-':
                        e.preventDefault();
                        this.resizeItem(placedItem, -10);
                        break;
                }
            });
        } catch (error) {
            console.error('Keyboard navigation setup error:', error);
        }
    }

    /**
     * Resize item programmatically
     */
    resizeItem(placedItem, delta) {
        try {
            const currentSize = placedItem.offsetWidth;
            const newSize = Math.max(50, Math.min(currentSize + delta, 300));
            
            placedItem.style.width = newSize + 'px';
            placedItem.style.height = newSize + 'px';
            
            this.updateCanvasItemData(placedItem);
        } catch (error) {
            console.error('Resize item error:', error);
        }
    }

    /**
     * Remove item from canvas
     */
    removeItemFromCanvas(placedItem, itemId) {
        try {
            placedItem.remove();
            this.app.state.canvasItems = this.app.state.canvasItems.filter(i => i.id !== itemId);
            this.updateCanvasInstructions();
            this.app.saveState();
            
            console.log(`Removed item ${itemId} from canvas`);
            this.app.showSimpleNotification && this.app.showSimpleNotification('Item removed from canvas');
        } catch (error) {
            console.error('Remove item from canvas error:', error);
        }
    }

    /**
     * Update canvas item data in state
     */
    updateCanvasItemData(placedItem) {
        try {
            const itemId = placedItem.dataset.itemId;
            const canvasItemIndex = this.app.state.canvasItems.findIndex(item => item.id === itemId);
            
            if (canvasItemIndex !== -1) {
                this.app.state.canvasItems[canvasItemIndex] = {
                    ...this.app.state.canvasItems[canvasItemIndex],
                    x: parseInt(placedItem.style.left) || 0,
                    y: parseInt(placedItem.style.top) || 0,
                    width: placedItem.offsetWidth,
                    height: placedItem.offsetHeight
                };
                this.app.saveState();
            }
        } catch (error) {
            console.error('Update canvas item data error:', error);
        }
    }

    /**
     * Restore canvas items from state
     */
    restoreCanvasItems() {
        try {
            const canvas = document.getElementById('styling-canvas');
            if (!canvas || this.app.state.canvasItems.length === 0) return;

            // Clear existing canvas items
            canvas.querySelectorAll('.canvas-item-placed').forEach(item => item.remove());

            // Restore items from state
            this.app.state.canvasItems.forEach(canvasItem => {
                const wardrobeItem = this.app.state.wardrobeItems.find(item => item.id === canvasItem.id);
                if (wardrobeItem) {
                    this.addItemToCanvas(wardrobeItem, canvasItem.x, canvasItem.y);
                    
                    // Apply saved size
                    const placedItem = canvas.querySelector(`[data-item-id="${canvasItem.id}"]`);
                    if (placedItem) {
                        placedItem.style.width = canvasItem.width + 'px';
                        placedItem.style.height = canvasItem.height + 'px';
                    }
                }
            });

            console.log(`Restored ${this.app.state.canvasItems.length} canvas items`);
        } catch (error) {
            console.error('Restore canvas items error:', error);
        }
    }

    /**
     * Update canvas instructions visibility
     */
    updateCanvasInstructions() {
        try {
            const canvas = document.getElementById('styling-canvas');
            const instructions = canvas?.querySelector('.canvas-instructions');
            
            if (instructions && canvas) {
                const hasItems = canvas.querySelectorAll('.canvas-item-placed').length > 0;
                instructions.style.display = hasItems ? 'none' : 'block';
            }
        } catch (error) {
            console.error('Update canvas instructions error:', error);
        }
    }

    /**
     * Clear canvas
     */
    clear() {
        try {
            const canvas = document.getElementById('styling-canvas');
            if (canvas) {
                canvas.querySelectorAll('.canvas-item-placed').forEach(item => item.remove());
                this.app.state.canvasItems = [];
                this.updateCanvasInstructions();
                this.app.saveState();
                
                console.log('Canvas cleared');
                this.app.showSimpleNotification && this.app.showSimpleNotification('Canvas cleared');
            }
        } catch (error) {
            console.error('Clear canvas error:', error);
        }
    }

    /**
     * Save outfit
     */
    save() {
        try {
            const canvas = document.getElementById('styling-canvas');
            if (!canvas || canvas.querySelectorAll('.canvas-item-placed').length === 0) {
                this.app.showSimpleError && this.app.showSimpleError('Add items to canvas before saving');
                return;
            }
            
            // Show save outfit modal
            this.app.showModal && this.app.showModal('save-outfit');
        } catch (error) {
            console.error('Save outfit error:', error);
        }
    }

    /**
     * Save outfit with details
     */
    saveOutfit(name, category, notes) {
        try {
            const canvas = document.getElementById('styling-canvas');
            if (!canvas || this.app.state.canvasItems.length === 0) {
                this.app.showSimpleError && this.app.showSimpleError('No items on canvas to save');
                return;
            }

            const newOutfit = {
                id: this.generateId(),
                name: this.sanitize(name),
                category: this.sanitize(category),
                notes: this.sanitize(notes),
                items: this.deepClone(this.app.state.canvasItems),
                dateCreated: new Date().toISOString(),
                preview: null // Could generate a preview image here
            };

            if (!this.app.state.savedOutfits) {
                this.app.state.savedOutfits = [];
            }
            
            this.app.state.savedOutfits.push(newOutfit);
            this.app.saveState();
            
            console.log(`Saved outfit: ${name}`);
            this.app.showSimpleSuccess && this.app.showSimpleSuccess(`Outfit "${name}" saved successfully!`);
            
        } catch (error) {
            console.error('Save outfit error:', error);
            this.app.showSimpleError && this.app.showSimpleError('Failed to save outfit');
        }
    }

    /**
     * Setup save outfit form
     */
    setupSaveOutfitForm() {
        try {
            const saveOutfitForm = document.getElementById('save-outfit-form');
            if (saveOutfitForm) {
                // Setup category change handler for custom category
                const categorySelect = document.getElementById('outfit-category');
                const customCategoryGroup = document.getElementById('custom-category-group');
                
                if (categorySelect && customCategoryGroup) {
                    categorySelect.addEventListener('change', (e) => {
                        if (e.target.value === 'Custom') {
                            customCategoryGroup.style.display = 'block';
                            const customInput = document.getElementById('custom-category');
                            if (customInput) {
                                customInput.required = true;
                                setTimeout(() => customInput.focus(), 100);
                            }
                        } else {
                            customCategoryGroup.style.display = 'none';
                            const customInput = document.getElementById('custom-category');
                            if (customInput) {
                                customInput.required = false;
                                customInput.value = '';
                            }
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Save outfit form setup error:', error);
        }
    }

    /**
     * Get category icon
     */
    getCategoryIcon(category) {
        const icons = {
            tops: 'tshirt',
            bottoms: 'vest-patches',
            shoes: 'shoe-prints',
            accessories: 'gem',
            outerwear: 'vest'
        };
        return icons[category] || 'tshirt';
    }

    /**
     * Sanitize HTML content
     */
    sanitize(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Deep clone object
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
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Canvas;
} else if (typeof window !== 'undefined') {
    window.Canvas = Canvas;
}