/**
 * Shortcuts Component - Shortcuts management system
 * Add/edit/delete shortcuts with drag and drop reordering
 */

class ShortcutsManager {
    constructor() {
        // Prevent multiple instances
        if (window.ShortcutsManagerInstance) {
            return window.ShortcutsManagerInstance;
        }

        this.isDragging = false;
        this.draggedElement = null;
        this.wasDragging = false; // Flag to prevent spurious click after drag

        // Default shortcuts:
        // - Prefer defaults injected by index.html via window.defaultShortcuts when available.
        // - Fallback to a safe in-file list so the component still works standalone.
        const fallbackDefaultShortcuts = [
            { id: "games", name: "Games", icon: "fas fa-gamepad", url: "/pages/games.html", description: "Play unblocked games", builtIn: true },
            { id: "movies", name: "Movies", icon: "fas fa-film", url: "/pages/movies.html", description: "Watch movies & TV shows", builtIn: true },
            { id: "music", name: "Music", icon: "fas fa-music", url: "/pages/music.html", description: "Listen to music", builtIn: true },
            { id: "browser", name: "Browser", icon: "fas fa-globe", url: "/Staticsj/index.html", description: "Browse the web", builtIn: true },
            { id: "credits", name: "Credits", icon: "fas fa-info-circle", url: "/pages/credits.html", description: "Explore the credits", builtIn: true },
            // New built-in shortcuts
            { id: "unblockee-coderunner", name: "Coderunner", icon: "fas fa-code", url: "pages/Coderunner.html", description: "Run and test code in-browser", builtIn: true },
            { id: "unblockee-chatbot", name: "Chatbot", icon: "fas fa-robot", url: "pages/chatbot.html", description: "Ask the Unblockee assistant", builtIn: true },
            { id: "box-rhw-one", name: "Box", icon: "fas fa-box", url: "https://box.rhw.one", description: "Box utility via proxy", builtIn: true }
        ];

        this.defaultShortcuts = (Array.isArray(window.defaultShortcuts) && window.defaultShortcuts.length)
            ? window.defaultShortcuts
            : fallbackDefaultShortcuts;

        this.shortcuts = this.loadShortcuts();
        this.init();

        // Store instance reference
        window.ShortcutsManagerInstance = this;
    }

    init() {
        this.createShortcutsUI();
        this.bindEvents();
        this.renderShortcuts();
    }

    createShortcutsUI() {
        // Check if shortcuts container already exists (from legacy HTML or another component)
        const existingContainer = document.querySelector('.shortcuts-container');

        if (existingContainer) {
            this.container = existingContainer;
        } else {
            // Create new container only if none exists
            this.container = document.createElement('div');
            this.container.className = 'shortcuts-container';
            this.container.innerHTML = `
                <div class="shortcuts-grid" id="shortcuts-grid">
                    <!-- Shortcuts will be populated here -->
                </div>

                <!-- Add Shortcut Button -->
                <button class="add-shortcut-btn" id="add-shortcut-btn" title="Add New Shortcut">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 5v14m-7-7h14"/>
                    </svg>
                    Add Shortcut
                </button>
            `;

            // Find a suitable place to insert shortcuts (after topbar, before content)
            const topbar = document.querySelector('.topbar');
            const content = document.querySelector('main, .content, #content');

            if (content) {
                content.insertBefore(this.container, content.firstChild);
            } else if (topbar && topbar.nextSibling) {
                topbar.parentNode.insertBefore(this.container, topbar.nextSibling);
            } else {
                document.body.insertBefore(this.container, document.body.firstChild);
            }
        }

        // Cache elements
        this.elements = {
            grid: this.container.querySelector('#shortcuts-grid'),
            addBtn: this.container.querySelector('#add-shortcut-btn')
        };
    }

    bindEvents() {
        // Add shortcut button
        if (this.elements.addBtn) {
            this.elements.addBtn.addEventListener('click', () => {
                this.showAddShortcutModal();
            });
        }

        // Delegate events for shortcut items
        if (this.elements.grid) {
            this.elements.grid.addEventListener('click', (e) => {
                this.handleShortcutClick(e);
            });

            // Drag and drop events
            this.elements.grid.addEventListener('dragstart', (e) => {
                this.handleDragStart(e);
            });

            this.elements.grid.addEventListener('dragover', (e) => {
                this.handleDragOver(e);
            });

            this.elements.grid.addEventListener('drop', (e) => {
                this.handleDrop(e);
            });

            this.elements.grid.addEventListener('dragend', (e) => {
                this.handleDragEnd(e);
            });
        }

        // Keyboard navigation
        if (this.container) {
            this.container.addEventListener('keydown', (e) => {
                this.handleKeyboardNavigation(e);
            });
        }

        // Context menu events
        this.currentContextShortcut = null;

        // Handle shortcut right-click to show context menu
        if (this.elements.grid) {
            this.elements.grid.addEventListener('contextmenu', (e) => {
                const shortcutItem = e.target.closest('.shortcut-item');
                if (shortcutItem) {
                    e.preventDefault();
                    const shortcutId = shortcutItem.dataset.id;
                    const shortcut = this.shortcuts.find(s => s.id === shortcutId);
                    if (shortcut) {
                        this.currentContextShortcut = shortcut;
                        this.showContextMenu(e.clientX, e.clientY);
                    }
                }
            });
        }

        // Context menu item events
        const contextMenu = document.getElementById('contextMenu');
        if (contextMenu) {
            // Close context menu when clicking elsewhere
            document.addEventListener('click', (e) => {
                if (!contextMenu.contains(e.target) && e.target.closest('.context-menu') !== contextMenu) {
                    contextMenu.style.display = 'none';
                }
            });

            // Open in About:Blank
            const openInAboutBlankBtn = document.getElementById('openInAboutBlankBtn');
            if (openInAboutBlankBtn) {
                openInAboutBlankBtn.addEventListener('click', () => {
                    if (this.currentContextShortcut) {
                        if (window.topbar && window.topbar.openWithCloak) {
                            window.topbar.openWithCloak(this.currentContextShortcut.url, '_blank');
                        } else {
                            window.open(this.currentContextShortcut.url, '_blank');
                        }
                        contextMenu.style.display = 'none';
                    }
                });
            }

            // Open in Blob Tab
            const openInBlobTabBtn = document.getElementById('openInBlobTabBtn');
            if (openInBlobTabBtn) {
                openInBlobTabBtn.addEventListener('click', () => {
                    if (this.currentContextShortcut) {
                        if (window.topbar && window.topbar.openWithCloak) {
                            window.topbar.openWithCloak(this.currentContextShortcut.url, '_blank');
                        } else {
                            window.open(this.currentContextShortcut.url, '_blank');
                        }
                        contextMenu.style.display = 'none';
                    }
                });
            }

            // Edit shortcut
            const editShortcutBtn = document.getElementById('editShortcutBtn');
            if (editShortcutBtn) {
                editShortcutBtn.addEventListener('click', () => {
                    if (this.currentContextShortcut) {
                        this.showEditShortcutModal(this.currentContextShortcut);
                        contextMenu.style.display = 'none';
                    }
                });
            }

            // Delete shortcut
            const deleteShortcutBtn = document.getElementById('deleteShortcutBtn');
            if (deleteShortcutBtn) {
                deleteShortcutBtn.addEventListener('click', () => {
                    if (this.currentContextShortcut) {
                        this.deleteShortcut(this.currentContextShortcut);
                        contextMenu.style.display = 'none';
                    }
                });
            }

            // Close context menu
            const closeContextMenuBtn = document.getElementById('closeContextMenuBtn');
            if (closeContextMenuBtn) {
                closeContextMenuBtn.addEventListener('click', () => {
                    contextMenu.style.display = 'none';
                });
            }
        }
    }

    loadShortcuts() {
        try {
            const saved = localStorage.getItem('shortcuts');
            const userShortcuts = saved ? JSON.parse(saved) : [];

            // Combine default and user shortcuts, ensuring no duplicates
            const allShortcuts = [...this.defaultShortcuts];
            userShortcuts.forEach(userShortcut => {
                if (!allShortcuts.find(defaultShortcut => defaultShortcut.id === userShortcut.id)) {
                    allShortcuts.push(userShortcut);
                }
            });

            return allShortcuts;
        } catch (error) {
            console.warn('Failed to load shortcuts:', error);
            return [...this.defaultShortcuts];
        }
    }

    saveShortcuts() {
        try {
            // Only save user-created shortcuts (exclude built-in ones)
            const userShortcuts = this.shortcuts.filter(shortcut => !shortcut.builtIn);
            localStorage.setItem('shortcuts', JSON.stringify(userShortcuts));
        } catch (error) {
            console.warn('Failed to save shortcuts:', error);
        }
    }

    renderShortcuts() {
        if (!this.elements.grid) {
            console.warn('Shortcuts grid element not found, skipping render');
            return;
        }

        this.elements.grid.innerHTML = '';

        this.shortcuts.forEach((shortcut, index) => {
            const shortcutElement = this.createShortcutElement(shortcut, index);
            this.elements.grid.appendChild(shortcutElement);
        });

    }

    createShortcutElement(shortcut, index) {
        const shortcutEl = document.createElement('div');
        shortcutEl.className = 'shortcut-item';
        shortcutEl.dataset.id = shortcut.id;
        shortcutEl.dataset.index = index;
        shortcutEl.setAttribute('draggable', true);
        shortcutEl.setAttribute('tabindex', '0');

        // Add click handler directly to the element
        shortcutEl.addEventListener('click', (e) => {
            this.handleShortcutClick(e);
        });

        shortcutEl.innerHTML = `
            <div class="shortcut-content">
                <div class="shortcut-header">
                    <div class="shortcut-icon">
                        ${shortcut.icon
                ? (shortcut.icon.startsWith('http') || shortcut.icon.startsWith('data:')
                    ? `<img src="${shortcut.icon}" alt="${shortcut.name}" onerror="this.style.display='none'">`
                    : (shortcut.icon.includes('fa-')
                        ? `<i class="${shortcut.icon}"></i>`
                        : `<span>${shortcut.icon}</span>`))
                : '<i class="fas fa-link"></i>'
            }
                    </div>
                    <div class="shortcut-title">${shortcut.name}</div>
                </div>
                <div class="shortcut-description">${shortcut.description || (() => {
                try {
                    return new URL(shortcut.url).hostname;
                } catch {
                    return shortcut.url;
                }
            })()}</div>
                ${shortcut.category ? `<div class="shortcut-category">${shortcut.category}</div>` : ''}
            </div>
        `;

        return shortcutEl;
    }

    handleShortcutClick(e) {
        // Prevent click event from firing after a drag operation
        if (this.wasDragging) {
            this.wasDragging = false; // Reset immediately after checking
            e.stopPropagation();
            return;
        }

        const actionBtn = e.target.closest('[data-action]');
        const shortcutItem = e.target.closest('.shortcut-item');

        if (!shortcutItem) return;

        const shortcutId = shortcutItem.dataset.id;
        const shortcut = this.shortcuts.find(s => s.id === shortcutId);

        if (!shortcut) return;

        if (actionBtn) {
            const action = actionBtn.dataset.action;
            e.stopPropagation();

            switch (action) {
                case 'edit':
                    this.showEditShortcutModal(shortcut);
                    break;
                case 'delete':
                    this.deleteShortcut(shortcut);
                    break;
                case 'drag':
                    // Drag handle clicked - don't navigate
                    break;
            }
        } else {
            // Shortcut item clicked - navigate to URL
            this.navigateToShortcut(shortcut);
        }
    }

    // Helper method to build proxy URL for user shortcuts
    buildProxyUrl(url) {
        // Determine if URL should use proxy
        const isExternalUrl = url.startsWith('http://') || url.startsWith('https://');
        const isRelativePath = !url.startsWith('/') && !url.startsWith('http://') && !url.startsWith('https://');

        // Built-in shortcuts and internal paths open directly
        if (!isExternalUrl && !isRelativePath) {
            return url;
        }

        // External URLs use the embed proxy with proper encoding
        if (isExternalUrl) {
            return `/Staticsj/embed.html#${encodeURIComponent(url)}`;
        }

        // Relative paths are treated as internal
        return url;
    }

    navigateToShortcut(shortcut) {
        const targetUrl = shortcut.url;

        // Show loading spinner immediately
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) {
            // Force a reflow to ensure the spinner appears immediately
            loadingSpinner.classList.add('show');
            loadingSpinner.offsetHeight; // Force reflow
        }

        // Small delay to ensure spinner is visible before navigation
        requestAnimationFrame(() => {
            // Handle different types of URLs
            if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
                // External URL - use proxy
                const proxyUrl = `/Staticsj/embed.html#${encodeURIComponent(targetUrl)}`;
                if (window.topbar && window.topbar.openWithCloak) {
                    window.topbar.openWithCloak(proxyUrl);
                } else {
                    window.location.href = proxyUrl;
                }
            } else if (targetUrl.startsWith('/')) {
                // Internal absolute path
                window.location.href = targetUrl;
            } else {
                // Relative path - assume internal
                window.location.href = targetUrl;
            }
        });
    }

    showAddShortcutModal() {
        this.showShortcutModal();
    }

    showEditShortcutModal(shortcut) {
        this.showShortcutModal(shortcut);
    }

    showShortcutModal(existingShortcut = null) {
        const isEditing = !!existingShortcut;

        const modal = document.createElement('div');
        modal.className = 'shortcut-modal-overlay';
        modal.innerHTML = `
            <div class="shortcut-modal-container">
                <div class="shortcut-modal-header">
                    <h3>${isEditing ? 'Edit Shortcut' : 'Add New Shortcut'}</h3>
                    <button class="shortcut-modal-close" data-action="close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M18 6 6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                
                <div class="shortcut-modal-body">
                    <form class="shortcut-form" id="shortcut-form">
                        <div class="shortcut-form-group">
                            <label for="shortcut-name">Name *</label>
                            <input type="text" id="shortcut-name" name="name" required 
                                   placeholder="Enter shortcut name" 
                                   value="${existingShortcut?.name || ''}">
                        </div>
                        
                        <div class="shortcut-form-group">
                            <label for="shortcut-url">URL *</label>
                            <input type="url" id="shortcut-url" name="url" required
                                   placeholder="example.com (https:// will be added automatically)"
                                   value="${existingShortcut?.url || ''}">
                        </div>
                        
                        <div class="shortcut-form-group">
                            <label for="shortcut-icon">Icon</label>
                            <div class="icon-input-group">
                                <select id="icon-type" name="iconType">
                                    <option value="emoji">Emoji</option>
                                    <option value="url">Image URL</option>
                                    <option value="upload">Upload Image</option>
                                </select>
                                <div class="icon-input-container">
                                    <input type="text" id="shortcut-icon" name="icon"
                                           placeholder="🎮 or https://example.com/icon.png"
                                           value="${existingShortcut?.icon || ''}">
                                    <div class="upload-preview-container" style="display: none;">
                                        <input type="file" id="icon-upload" accept="image/*">
                                        <div class="image-preview">
                                            <img class="icon-preview" style="display:none; max-width:64px; max-height:64px;">
                                        </div>
                                    </div>
                                    <input type="hidden" id="hidden-icon-data" name="iconData">
                                </div>
                            </div>
                        </div>
                        
                        <div class="shortcut-form-group">
                            <label for="shortcut-category">Category</label>
                            <select id="shortcut-category" name="category">
                                <option value="">No category</option>
                                <option value="entertainment">Entertainment</option>
                                <option value="utility">Utility</option>
                                <option value="education">Education</option>
                                <option value="social">Social</option>
                                <option value="gaming">Gaming</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </form>
                </div>
                
                <div class="shortcut-modal-footer">
                    <button type="button" class="btn btn-secondary" data-action="cancel">Cancel</button>
                    <button type="submit" form="shortcut-form" class="btn btn-primary">
                        ${isEditing ? 'Update' : 'Add'} Shortcut
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Set initial icon type
        const iconTypeSelect = modal.querySelector('#icon-type');
        const iconInput = modal.querySelector('#shortcut-icon');
        const iconUpload = modal.querySelector('#icon-upload');
        const hiddenIconData = modal.querySelector('#hidden-icon-data');

        if (existingShortcut?.icon?.startsWith('data:')) {
            iconTypeSelect.value = 'upload';
            hiddenIconData.value = existingShortcut.icon;
            const preview = modal.querySelector('.icon-preview');
            preview.src = existingShortcut.icon;
            preview.style.display = 'block';
        } else if (existingShortcut?.icon?.startsWith('http')) {
            iconTypeSelect.value = 'url';
        } else if (existingShortcut?.icon) {
            iconTypeSelect.value = 'emoji';
        }

        this.updateIconInput(iconTypeSelect, iconInput, iconUpload);

        // Bind events
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.hasAttribute('data-action')) {
                this.closeShortcutModal(modal);
            }
        });

        iconTypeSelect.addEventListener('change', () => {
            this.updateIconInput(iconTypeSelect, iconInput, iconUpload);
        });

        iconUpload.addEventListener('change', (e) => {
            this.handleIconUpload(e, iconInput);
        });

        modal.querySelector('#shortcut-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveShortcutFromModal(modal, existingShortcut);
        });

        // Focus first input
        setTimeout(() => {
            modal.querySelector('#shortcut-name').focus();
        }, 100);
    }

    updateIconInput(iconTypeSelect, iconInput, iconUpload) {
        const type = iconTypeSelect.value;
        const iconInputContainer = iconInput.closest('.icon-input-container');
        const textInput = iconInputContainer.querySelector('#shortcut-icon');
        const uploadContainer = iconInputContainer.querySelector('.upload-preview-container');
        const hiddenInput = iconInputContainer.querySelector('#hidden-icon-data');
        const preview = uploadContainer.querySelector('.icon-preview');

        switch (type) {
            case 'emoji':
                textInput.style.display = 'block';
                textInput.type = 'text';
                textInput.placeholder = '🎮 or 🔗';
                textInput.value = textInput.value.startsWith('http') || textInput.value.startsWith('data:') ? '' : textInput.value;
                uploadContainer.style.display = 'none';
                break;
            case 'url':
                textInput.style.display = 'block';
                textInput.type = 'url';
                textInput.placeholder = 'https://example.com/icon.png';
                uploadContainer.style.display = 'none';
                break;
            case 'upload':
                textInput.style.display = 'none';
                uploadContainer.style.display = 'block';
                if (hiddenInput.value && hiddenInput.value.startsWith('data:')) {
                    preview.src = hiddenInput.value;
                    preview.style.display = 'block';
                } else {
                    preview.style.display = 'none';
                }
                break;
        }
    }

    handleIconUpload(event, iconInput) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 1024 * 1024) { // 1MB limit
            alert('Image file size must be less than 1MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const iconInputContainer = iconInput.closest('.icon-input-container');
            const hiddenInput = iconInputContainer.querySelector('#hidden-icon-data');
            hiddenInput.value = e.target.result;
            // Update preview
            const preview = iconInputContainer.querySelector('.icon-preview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    saveShortcutFromModal(modal, existingShortcut) {
        const form = modal.querySelector('#shortcut-form');
        const formData = new FormData(form);

        const name = formData.get('name').trim();
        let url = formData.get('url').trim();
        const iconType = formData.get('iconType');
        let icon;
        if (iconType === 'upload') {
            icon = formData.get('iconData').trim();
        } else {
            icon = formData.get('icon').trim();
        }
        const category = formData.get('category');

        // Validation
        if (!name) {
            alert('Please enter a name');
            return;
        }

        if (!url) {
            alert('Please enter a URL');
            return;
        }

        // Auto-add https:// if no protocol is specified
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        // Validate URL
        try {
            new URL(url);
        } catch {
            alert('Please enter a valid URL');
            return;
        }

        // Create or update shortcut
        if (existingShortcut) {
            // Update existing
            Object.assign(existingShortcut, {
                name,
                url,
                icon: icon || null,
                category: category || null
            });
        } else {
            // Create new
            const newShortcut = {
                id: this.generateId(name),
                name,
                url,
                icon: icon || null,
                category: category || null,
                builtIn: false
            };
            this.shortcuts.push(newShortcut);
        }

        this.saveShortcuts();
        this.renderShortcuts();
        this.closeShortcutModal(modal);
    }

    generateId(name) {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
    }

    deleteShortcut(shortcut) {
        if (!confirm(`Delete shortcut "${shortcut.name}"?`)) return;

        const index = this.shortcuts.findIndex(s => s.id === shortcut.id);
        if (index > -1) {
            this.shortcuts.splice(index, 1);
            this.saveShortcuts();
            this.renderShortcuts();
        }
    }

    closeShortcutModal(modal) {
        modal.remove();
    }

    // Drag and drop functionality
    handleDragStart(e) {
        this.isDragging = true;
        this.draggedElement = e.target.closest('.shortcut-item');
        this.draggedElement.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.draggedElement.outerHTML);
    }

    handleDragOver(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const afterElement = this.getDragAfterElement(e.clientY);
        const draggable = document.querySelector('.shortcut-item.dragging');

        if (afterElement == null) {
            this.elements.grid.appendChild(draggable);
        } else {
            this.elements.grid.insertBefore(draggable, afterElement);
        }
    }

    handleDrop(e) {
        e.preventDefault();
        this.updateShortcutOrder();
    }

    handleDragEnd(e) {
        this.isDragging = false;
        this.draggedElement = null;

        // Set flag to prevent spurious click event after drag
        this.wasDragging = true;
        setTimeout(() => {
            this.wasDragging = false;
        }, 50); // 50ms should be enough to catch the click event

        const items = this.elements.grid.querySelectorAll('.shortcut-item');
        items.forEach(item => item.classList.remove('dragging'));
    }

    getDragAfterElement(y) {
        const draggableElements = [...this.elements.grid.querySelectorAll('.shortcut-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    updateShortcutOrder() {
        const itemElements = [...this.elements.grid.querySelectorAll('.shortcut-item')];
        const newOrder = itemElements.map(item => item.dataset.id);

        // Reorder shortcuts array
        this.shortcuts.sort((a, b) => {
            return newOrder.indexOf(a.id) - newOrder.indexOf(b.id);
        });

        this.saveShortcuts();
    }

    handleKeyboardNavigation(e) {
        const focusedElement = document.activeElement;
        const shortcutItem = focusedElement.closest('.shortcut-item');

        if (!shortcutItem) return;

        const shortcuts = [...this.elements.grid.querySelectorAll('.shortcut-item')];
        const currentIndex = shortcuts.indexOf(shortcutItem);

        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.navigateToShortcut(this.shortcuts[currentIndex]);
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (currentIndex < shortcuts.length - 1) {
                    shortcuts[currentIndex + 1].focus();
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (currentIndex > 0) {
                    shortcuts[currentIndex - 1].focus();
                }
                break;
        }
    }

    showContextMenu(x, y) {
        const contextMenu = document.getElementById('contextMenu');
        if (contextMenu) {
            // Position the context menu
            contextMenu.style.left = `${x}px`;
            contextMenu.style.top = `${y}px`;
            contextMenu.style.display = 'block';

            // Ensure context menu stays within viewport
            const rect = contextMenu.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            if (rect.right > windowWidth) {
                contextMenu.style.left = `${windowWidth - rect.width}px`;
            }

            if (rect.bottom > windowHeight) {
                contextMenu.style.top = `${windowHeight - rect.height}px`;
            }
        }
    }

    // Public API methods
    addShortcut(shortcut) {
        const newShortcut = {
            id: this.generateId(shortcut.name),
            name: shortcut.name,
            url: shortcut.url,
            icon: shortcut.icon || null,
            category: shortcut.category || null,
            builtIn: false
        };

        this.shortcuts.push(newShortcut);
        this.saveShortcuts();
        this.renderShortcuts();

        return newShortcut;
    }

    removeShortcut(id) {
        const shortcut = this.shortcuts.find(s => s.id === id);
        if (shortcut && !shortcut.builtIn) {
            const index = this.shortcuts.indexOf(shortcut);
            this.shortcuts.splice(index, 1);
            this.saveShortcuts();
            this.renderShortcuts();
            return true;
        }
        return false;
    }

    getShortcuts() {
        return [...this.shortcuts];
    }

    resetToDefaults() {
        this.shortcuts = [...this.defaultShortcuts];
        localStorage.removeItem('shortcuts');
        this.renderShortcuts();
    }

    destroy() {
        if (this.container) {
            this.container.remove();
        }
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize after a small delay to ensure DOM is fully ready
    setTimeout(() => {
        window.ShortcutsManager = new ShortcutsManager();

        // Add click listener to header "Add Shortcut" button
        const addShortcutsBtn = document.getElementById('addShortcutsBtn');
        if (addShortcutsBtn) {
            addShortcutsBtn.addEventListener('click', () => {
                if (window.ShortcutsManager && typeof window.ShortcutsManager.showAddShortcutModal === 'function') {
                    window.ShortcutsManager.showAddShortcutModal();
                }
            });
        }
    }, 100);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShortcutsManager;
}