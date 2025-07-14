// wardrobe.js - Fixed Wardrobe Management Module with Canvas Integration

class Wardrobe {
    constructor(app) {
        this.app = app;
        this.imageData = null; // Store uploaded image data
    }

    /**
     * Render wardrobe items
     */
    render() {
        try {
            const grid = document.getElementById('items-grid');
            if (!grid) {
                console.warn('Items grid not found');
                return;
            }

            const filteredItems = this.getFilteredItems();
            
            // Clear grid first
            grid.innerHTML = '';
            
            if (filteredItems.length === 0) {
                grid.innerHTML = this.renderEmptyState();
                return;
            }

            // Create and add items
            filteredItems.forEach(item => {
                const itemElement = this.createItemElement(item);
                grid.appendChild(itemElement);
            });

            console.log(`Rendered ${filteredItems.length} items`);

            // Update canvas if it exists and is visible
            if (this.app.canvas && this.app.state.currentSection === 'builder') {
                setTimeout(() => {
                    this.app.canvas.render();
                }, 100);
            }
            
        } catch (error) {
            console.error('Wardrobe render error:', error);
            this.showError('Failed to render wardrobe items');
        }
    }

    /**
     * Create item element
     */
    createItemElement(item) {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.setAttribute('data-item-id', item.id);

        itemCard.innerHTML = `
            <div class="item-image">
                ${item.image ? 
                    `<img src="${item.image}" alt="${item.name || item.category}" loading="lazy">` :
                    `<i class="fas fa-${this.getCategoryIcon(item.category)}" style="font-size: 2rem; color: var(--text-muted);"></i>`
                }
                <div class="item-actions">
                    <button class="item-action" 
                            onclick="window.CHYK.wardrobe.toggleFavorite('${item.id}')" 
                            title="${item.favorite ? 'Remove from favorites' : 'Add to favorites'}">
                        <i class="fas fa-heart" style="color: ${item.favorite ? 'var(--error)' : 'var(--text-muted)'}"></i>
                    </button>
                    <button class="item-action" 
                            onclick="window.CHYK.wardrobe.editItem('${item.id}')" 
                            title="Edit item">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="item-action" 
                            onclick="window.CHYK.wardrobe.deleteItem('${item.id}')" 
                            title="Delete item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="item-info">
                <div class="item-category">${this.sanitize(item.category)}</div>
                ${item.name ? `<div style="font-weight: 600; margin-top: 0.25rem; font-size: 0.9rem;">${this.sanitize(item.name)}</div>` : ''}
                ${item.notes ? `<div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem;">${this.sanitize(item.notes)}</div>` : ''}
                <div class="item-tags">
                    ${item.tags.map(tag => `<span class="item-tag">${this.sanitize(tag)}</span>`).join('')}
                </div>
                <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.5rem;">
                    Added ${new Date(item.dateAdded).toLocaleDateString()}
                </div>
            </div>
        `;

        return itemCard;
    }

    /**
     * Render empty state
     */
    renderEmptyState() {
        return `
            <div class="empty-state">
                <i class="fas fa-tshirt"></i>
                <p>No items found. Upload photos to get started!</p>
                <button class="btn btn-primary" onclick="window.CHYK.showModal('upload')">
                    <i class="fas fa-camera"></i>
                    Add First Item
                </button>
            </div>
        `;
    }

    /**
     * Get filtered items
     */
    getFilteredItems() {
        try {
            let items = this.app.state.wardrobeItems || [];
            
            // Filter by category
            if (this.app.state.activeCategory && this.app.state.activeCategory !== 'all') {
                items = items.filter(item => item.category === this.app.state.activeCategory);
            }
            
            // Filter by search query
            if (this.app.state.searchQuery && this.app.state.searchQuery.length > 0) {
                const query = this.app.state.searchQuery.toLowerCase().trim();
                items = items.filter(item => 
                    item.category.toLowerCase().includes(query) ||
                    (item.name && item.name.toLowerCase().includes(query)) ||
                    item.tags.some(tag => tag.toLowerCase().includes(query)) ||
                    (item.notes && item.notes.toLowerCase().includes(query))
                );
            }
            
            // Sort by date added (newest first)
            return items.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            
        } catch (error) {
            console.error('Filter error:', error);
            return [];
        }
    }

    /**
     * Filter by category
     */
    filterByCategory(category) {
        try {
            this.app.state.activeCategory = category;
            
            // Update filter buttons
            document.querySelectorAll('.category-filter').forEach(btn => {
                btn.classList.remove('active');
            });
            
            const activeBtn = document.querySelector(`[data-category="${category}"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
            }

            this.render();
            this.app.saveState();
            
        } catch (error) {
            console.error('Category filter error:', error);
        }
    }

    /**
     * Toggle favorite status
     */
    toggleFavorite(itemId) {
        try {
            const item = this.app.state.wardrobeItems.find(i => i.id === itemId);
            if (item) {
                item.favorite = !item.favorite;
                this.render();
                this.app.saveState();
                this.showSuccess(item.favorite ? 'Added to favorites' : 'Removed from favorites');
            }
        } catch (error) {
            console.error('Toggle favorite error:', error);
        }
    }

    /**
     * Edit item
     */
    editItem(itemId) {
        try {
            const item = this.app.state.wardrobeItems.find(i => i.id === itemId);
            if (!item) {
                this.showError('Item not found');
                return;
            }

            // Simple edit - just the name for now
            const newName = prompt('Edit item name:', item.name || '');
            if (newName !== null) {
                item.name = newName.trim();
                this.render();
                this.app.saveState();
                this.showSuccess('Item updated');
            }
            
        } catch (error) {
            console.error('Edit item error:', error);
        }
    }

    /**
     * Delete item
     */
    deleteItem(itemId) {
        try {
            const item = this.app.state.wardrobeItems.find(i => i.id === itemId);
            if (!item) return;

            const confirmed = confirm(`Are you sure you want to delete this ${item.category} item?`);

            if (confirmed) {
                this.app.state.wardrobeItems = this.app.state.wardrobeItems.filter(i => i.id !== itemId);
                
                // Also remove from canvas if present
                this.app.state.canvasItems = this.app.state.canvasItems.filter(i => i.id !== itemId);
                
                this.render();
                this.app.saveState();
                this.showSuccess('Item deleted');

                // Update canvas if visible
                if (this.app.canvas && this.app.state.currentSection === 'builder') {
                    this.app.canvas.render();
                }
            }
        } catch (error) {
            console.error('Delete item error:', error);
        }
    }

    /**
     * Add new item
     */
    addItem(itemData) {
        try {
            const newItem = {
                id: this.generateId(),
                name: itemData.name || '',
                category: itemData.category || 'tops',
                tags: itemData.tags || [],
                notes: itemData.notes || '',
                favorite: false,
                dateAdded: new Date().toISOString(),
                image: itemData.image || this.imageData || null
            };
            
            this.app.state.wardrobeItems.push(newItem);
            this.render();
            this.app.saveState();
            this.showSuccess('Item added to your closet!');

            // Clear stored image data
            this.imageData = null;

            // Update canvas if visible
            if (this.app.canvas && this.app.state.currentSection === 'builder') {
                setTimeout(() => {
                    this.app.canvas.render();
                }, 100);
            }
            
        } catch (error) {
            console.error('Add item error:', error);
            this.showError('Failed to add item');
        }
    }

    /**
     * Setup upload form
     */
    setupUploadForm() {
        try {
            const uploadForm = document.getElementById('upload-form');
            if (uploadForm) {
                uploadForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleUploadForm(new FormData(uploadForm));
                });
            }

            // Setup file upload
            this.setupFileUpload();
        } catch (error) {
            console.error('Upload form setup error:', error);
        }
    }

    /**
     * Handle upload form submission
     */
    handleUploadForm(formData) {
        try {
            const itemData = {
                name: formData.get('item-name') || '',
                category: formData.get('item-category') || 'tops',
                tags: (formData.get('item-tags') || '').split(',').map(t => t.trim()).filter(t => t),
                notes: formData.get('item-notes') || '',
                image: this.imageData
            };

            this.addItem(itemData);
            
            // Close modal
            if (this.app.hideModal) {
                this.app.hideModal('upload');
            }
            
            // Reset form
            uploadForm.reset();
            
        } catch (error) {
            console.error('Upload form error:', error);
            this.showError('Failed to process form');
        }
    }

    /**
     * Setup file upload
     */
    setupFileUpload() {
        try {
            const uploadArea = document.getElementById('file-upload-area');
            const fileInput = document.getElementById('file-input');

            if (uploadArea && fileInput) {
                uploadArea.addEventListener('click', () => {
                    fileInput.click();
                });

                fileInput.addEventListener('change', (e) => {
                    if (e.target.files && e.target.files.length > 0) {
                        this.handleFileUpload(e.target.files[0]);
                    }
                });

                // Drag and drop
                uploadArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    uploadArea.classList.add('drag-over');
                });

                uploadArea.addEventListener('dragleave', (e) => {
                    e.preventDefault();
                    uploadArea.classList.remove('drag-over');
                });

                uploadArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    uploadArea.classList.remove('drag-over');
                    
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        this.handleFileUpload(e.dataTransfer.files[0]);
                    }
                });
            }
        } catch (error) {
            console.error('File upload setup error:', error);
        }
    }

    /**
     * Handle file upload
     */
    handleFileUpload(file) {
        try {
            if (!file.type.startsWith('image/')) {
                this.showError('Please select an image file');
                return;
            }

            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                this.showError('File size must be less than 10MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    // Store image data
                    this.imageData = e.target.result;
                    
                    // Show upload form
                    const uploadForm = document.getElementById('upload-form');
                    if (uploadForm) {
                        uploadForm.style.display = 'block';
                    }
                    
                    // Update upload text
                    const uploadText = document.querySelector('.upload-text');
                    if (uploadText) {
                        uploadText.innerHTML = `
                            <div style="text-align: center;">
                                <i class="fas fa-check-circle" style="color: var(--success); font-size: 1.5rem; margin-bottom: 0.5rem;"></i><br>
                                <strong>File uploaded successfully!</strong><br>
                                <small>Fill in the details below and click "Add to Closet"</small>
                            </div>
                        `;
                    }
                    
                    this.showSuccess(`File "${file.name}" uploaded successfully`);
                    
                } catch (error) {
                    console.error('File processing error:', error);
                    this.showError('Failed to process file');
                }
            };

            reader.onerror = () => {
                this.showError('Failed to read file');
            };

            reader.readAsDataURL(file);
            
        } catch (error) {
            console.error('File upload error:', error);
            this.showError('File upload failed');
        }
    }

    /**
     * Clear image data
     */
    clearImageData() {
        this.imageData = null;
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
     * Show success message
     */
    showSuccess(message) {
        if (this.app.showSimpleSuccess) {
            this.app.showSimpleSuccess(message);
        } else {
            console.log('Success:', message);
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        if (this.app.showSimpleError) {
            this.app.showSimpleError(message);
        } else {
            console.error('Error:', message);
        }
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.Wardrobe = Wardrobe;
}