/**
 * Cloak Rotation Manager
 * Handles automatic cloak cycling with configurable intervals
 * Integrates with existing cloak system while maintaining compatibility
 */

class CloakRotationManager {
    constructor() {
        this.isRotating = false;
        this.rotationInterval = null;
        this.currentCloakIndex = 0;
        this.rotationTimeout = null;
        this.cloakPool = [];
        this.customCloaks = [];

        // Load settings and initialize
        this.loadSettings();
        this.buildCloakPool();

        // Resume rotation if enabled
        if (this.rotationEnabled && this.cloakPool.length > 1) {
            this.startRotation();
        }
    }

    /**
     * Load rotation settings from localStorage
     */
    loadSettings() {
        try {
            this.rotationEnabled = localStorage.getItem('unblockee_cloakRotationEnabled') === 'true';
            const intervalStr = localStorage.getItem('unblockee_cloakRotationInterval');
            this.rotationInterval = intervalStr ? parseFloat(intervalStr) : 1.0;

            // Validate interval (0.5-10 seconds)
            if (isNaN(this.rotationInterval) || this.rotationInterval < 0.5 || this.rotationInterval > 10) {
                this.rotationInterval = 1.0;
                localStorage.setItem('unblockee_cloakRotationInterval', '1.0');
            }

            // Load custom cloaks
            const customCloaksStr = localStorage.getItem('unblockee_customCloaks');
            if (customCloaksStr) {
                this.customCloaks = JSON.parse(customCloaksStr);
                if (!Array.isArray(this.customCloaks)) {
                    this.customCloaks = [];
                }
            }

            // Load rotation state for resume
            const savedIndex = localStorage.getItem('unblockee_cloakRotationIndex');
            if (savedIndex !== null) {
                this.currentCloakIndex = parseInt(savedIndex, 10) || 0;
            }
        } catch (error) {
            console.warn('Error loading cloak rotation settings:', error);
            this.rotationEnabled = false;
            this.rotationInterval = 1.0;
            this.customCloaks = [];
            this.currentCloakIndex = 0;
        }
    }

    /**
     * Save current settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem('unblockee_cloakRotationEnabled', this.rotationEnabled ? 'true' : 'false');
            localStorage.setItem('unblockee_cloakRotationInterval', this.rotationInterval.toString());
            localStorage.setItem('unblockee_customCloaks', JSON.stringify(this.customCloaks));
            localStorage.setItem('unblockee_cloakRotationIndex', this.currentCloakIndex.toString());
        } catch (error) {
            console.warn('Error saving cloak rotation settings:', error);
        }
    }

    /**
     * Build the complete cloak pool from built-in + custom cloaks
     */
    buildCloakPool() {
        // Get built-in cloaks (assuming SettingsModal.cloaks is available)
        const builtInCloaks = window.SettingsModal?.cloaks || [
            { name: "Default", icon: "https://edpuzzle.imgix.net/favicons/favicon-32.png", title: "Edpuzzle" },
            { name: "Wikipedia", icon: "https://en.wikipedia.org/favicon.ico", title: "World War II - Wikipedia" },
            { name: "Google", icon: "https://www.google.com/chrome/static/images/chrome-logo-m100.svg", title: "New Tab" },
            { name: "Classroom", icon: "https://ssl.gstatic.com/classroom/favicon.png", title: "Home" },
            { name: "Canva", icon: "https://static.canva.com/static/images/android-192x192-2.png", title: "Home - Canva" },
            { name: "Quiz", icon: "https://ssl.gstatic.com/docs/spreadsheets/forms/forms_icon_2023q4.ico", title: "You've already responded" },
            { name: "Powerschool", icon: "https://waverlyk12.powerschool.com/favicon.ico", title: "Grades and Attendance" }
        ];

        // Combine built-in and custom cloaks
        this.cloakPool = [
            ...builtInCloaks.map(cloak => ({ ...cloak, type: 'built-in' })),
            ...this.customCloaks.map(cloak => ({ ...cloak, type: 'custom' }))
        ];

        // Ensure at least one cloak exists
        if (this.cloakPool.length === 0) {
            this.cloakPool = [{ name: "Default", icon: "", title: "Unblocked Games", type: 'built-in' }];
        }

        // Validate current index
        if (this.currentCloakIndex >= this.cloakPool.length) {
            this.currentCloakIndex = 0;
        }
    }

    /**
     * Set rotation enabled/disabled
     * @param {boolean} enabled
     */
    setRotationEnabled(enabled) {
        this.rotationEnabled = enabled;
        this.saveSettings();

        if (enabled && this.cloakPool.length > 1) {
            this.startRotation();
        } else {
            this.stopRotation();
        }

        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('cloakRotationEnabledChanged', {
            detail: { enabled, poolSize: this.cloakPool.length }
        }));
    }

    /**
     * Set rotation interval in seconds
     * @param {number} interval - Interval in seconds (0.5-10)
     */
    setRotationInterval(interval) {
        const validInterval = Math.max(0.5, Math.min(10, interval));
        this.rotationInterval = validInterval;
        this.saveSettings();

        // Restart rotation with new interval if active
        if (this.isRotating) {
            this.stopRotation();
            this.startRotation();
        }

        window.dispatchEvent(new CustomEvent('cloakRotationIntervalChanged', {
            detail: { interval: validInterval }
        }));
    }

    /**
     * Start the cloak rotation
     */
    startRotation() {
        if (this.isRotating || this.cloakPool.length <= 1) {
            return;
        }

        this.isRotating = true;
        this.performRotation();

        window.dispatchEvent(new CustomEvent('cloakRotationStarted'));
    }

    /**
     * Stop the cloak rotation
     */
    stopRotation() {
        if (!this.isRotating) {
            return;
        }

        this.isRotating = false;
        if (this.rotationTimeout) {
            clearTimeout(this.rotationTimeout);
            this.rotationTimeout = null;
        }

        window.dispatchEvent(new CustomEvent('cloakRotationStopped'));
    }

    /**
     * Perform a single rotation cycle
     */
    performRotation() {
        if (!this.isRotating || this.cloakPool.length <= 1) {
            return;
        }

        try {
            const cloak = this.cloakPool[this.currentCloakIndex];
            if (cloak) {
                this.applyCloak(cloak);
            }

            // Move to next cloak
            this.currentCloakIndex = (this.currentCloakIndex + 1) % this.cloakPool.length;
            this.saveSettings();

            // Schedule next rotation
            const intervalMs = Math.max(500, Math.min(10000, this.rotationInterval * 1000));
            this.rotationTimeout = setTimeout(() => {
                this.performRotation();
            }, intervalMs);

        } catch (error) {
            console.warn('Error during cloak rotation:', error);
            this.stopRotation();
        }
    }

    /**
     * Apply a cloak by updating document title and favicon
     * @param {Object} cloak - Cloak object with title and icon properties
     */
    applyCloak(cloak) {
        try {
            // Update title
            document.title = cloak.title || 'Unblocked Games';

            // Update favicon
            const existingFavicon = document.querySelector("link[rel*='icon']");
            if (existingFavicon) {
                existingFavicon.remove();
            }

            if (cloak.icon) {
                const link = document.createElement('link');
                link.rel = 'icon';
                const ext = cloak.icon.split('.').pop().toLowerCase();
                link.type = ext === 'png' ? 'image/png' : ext === 'svg' ? 'image/svg+xml' : 'image/x-icon';
                link.href = cloak.icon + (cloak.icon.includes('?') ? '&' : '?') + 'v=' + Date.now();

                // Add error handling for failed favicon loads
                link.onerror = () => {
                    console.warn(`Failed to load favicon: ${cloak.icon}, falling back to default`);
                    this.applyDefaultFavicon();
                };

                document.head.appendChild(link);
            } else {
                this.applyDefaultFavicon();
            }

            // Store current cloak for compatibility with existing system
            const cloakData = { title: cloak.title, icon: cloak.icon };
            if (window.StorageUtils) {
                window.StorageUtils.setObject('cloak', cloakData);
            } else {
                localStorage.setItem('cloak', JSON.stringify(cloakData));
            }

            // Emit custom event
            window.dispatchEvent(new CustomEvent('cloakChanged', {
                detail: {
                    cloak: cloak,
                    rotationActive: this.isRotating
                }
            }));

        } catch (error) {
            console.warn('Error applying cloak:', error);
        }
    }

    /**
     * Apply default favicon when cloak icon fails to load
     */
    applyDefaultFavicon() {
        const defaultLink = document.createElement('link');
        defaultLink.rel = 'icon';
        defaultLink.type = 'image/x-icon';
        defaultLink.href = 'data:image/x-icon;base64,AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAAAAAAAAAAP8A//8AAAD//wD/AAAAAP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/';
        document.head.appendChild(defaultLink);
    }

    /**
     * Add a custom cloak
     * @param {string} title - Cloak title
     * @param {string} iconUrl - Favicon URL
     */
    addCustomCloak(title, iconUrl) {
        if (!title || !iconUrl) {
            throw new Error('Title and icon URL are required');
        }

        // Basic URL validation
        try {
            new URL(iconUrl);
        } catch {
            throw new Error('Invalid icon URL');
        }

        // Check for duplicates
        const exists = this.customCloaks.some(cloak =>
            cloak.title === title && cloak.iconUrl === iconUrl
        );

        if (exists) {
            throw new Error('Custom cloak with same title and icon already exists');
        }

        const newCloak = {
            name: `Custom: ${title}`,
            title: title,
            icon: iconUrl,
            type: 'custom'
        };

        this.customCloaks.push(newCloak);
        this.buildCloakPool();
        this.saveSettings();

        window.dispatchEvent(new CustomEvent('customCloakAdded', {
            detail: { cloak: newCloak }
        }));

        return newCloak;
    }

    /**
     * Remove a custom cloak
     * @param {number} index - Index in custom cloaks array
     */
    removeCustomCloak(index) {
        if (index < 0 || index >= this.customCloaks.length) {
            throw new Error('Invalid custom cloak index');
        }

        const removed = this.customCloaks.splice(index, 1)[0];
        this.buildCloakPool();
        this.saveSettings();

        window.dispatchEvent(new CustomEvent('customCloakRemoved', {
            detail: { cloak: removed }
        }));

        return removed;
    }

    /**
     * Get current rotation status
     */
    getStatus() {
        return {
            isRotating: this.isRotating,
            rotationEnabled: this.rotationEnabled,
            rotationInterval: this.rotationInterval,
            currentCloakIndex: this.currentCloakIndex,
            poolSize: this.cloakPool.length,
            customCloaksCount: this.customCloaks.length
        };
    }

    /**
     * Force rotation to next cloak
     */
    rotateNow() {
        if (this.cloakPool.length > 1) {
            this.performRotation();
        }
    }

    /**
     * Get current cloak
     */
    getCurrentCloak() {
        return this.cloakPool[this.currentCloakIndex] || null;
    }

    /**
     * Get all available cloaks
     */
    getAllCloaks() {
        return [...this.cloakPool];
    }

    /**
     * Get custom cloaks only
     */
    getCustomCloaks() {
        return [...this.customCloaks];
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.CloakRotationManager = new CloakRotationManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CloakRotationManager;
}