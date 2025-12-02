/**
 * Changelog Modal Component - Display changelog and announcements
 * Shows once per version update with blur background modal
 */

class ChangelogModal {
    constructor() {
        this.isOpen = false;
        this.changelog = null;
        this.loadingComplete = false;

        try {
            this.init();
        } catch (error) {
            console.error('ChangelogModal initialization error:', error);
            // Don't let initialization errors prevent global exposure
        }
    }

    init() {
        this.bindEvents();
        this.loadChangelog();
    }

    /**
     * Normalize changelog data to ensure consistent field access
     * Handles date field compatibility between 'date' and 'releaseDate'
     * Normalizes changes structure for consistent access
     */
    normalizeChangelogData() {
        if (!this.changelog) return;

        // Normalize date field - ensure we have a releaseDate field
        if (!this.changelog.releaseDate && this.changelog.date) {
            this.changelog.releaseDate = this.changelog.date;
        } else if (!this.changelog.releaseDate && !this.changelog.date) {
            // If neither field exists, provide fallback
            this.changelog.releaseDate = new Date().toISOString().split('T')[0];
            console.warn('No date field found in changelog, using current date');
        }

        // Ensure changes structure is properly formatted
        if (this.changelog.changes) {
            // If changes is an array, convert to categorized format
            if (Array.isArray(this.changelog.changes)) {
                const changesArray = this.changelog.changes;
                this.changelog.changes = {
                    new: [],
                    improved: [],
                    fixed: [],
                    deprecated: [],
                    security: []
                };

                // Distribute array items across categories
                changesArray.forEach(item => {
                    // Try to categorize based on common patterns
                    if (item.toLowerCase().includes('new') ||
                        item.toLowerCase().includes('add') ||
                        item.toLowerCase().includes('introduce')) {
                        this.changelog.changes.new.push(item);
                    } else if (item.toLowerCase().includes('fix') ||
                        item.toLowerCase().includes('bug') ||
                        item.toLowerCase().includes('resolve')) {
                        this.changelog.changes.fixed.push(item);
                    } else if (item.toLowerCase().includes('improve') ||
                        item.toLowerCase().includes('enhance') ||
                        item.toLowerCase().includes('optimize')) {
                        this.changelog.changes.improved.push(item);
                    } else if (item.toLowerCase().includes('security') ||
                        item.toLowerCase().includes('vulnerable')) {
                        this.changelog.changes.security.push(item);
                    } else {
                        // Default to new features
                        this.changelog.changes.new.push(item);
                    }
                });
            }

            // Ensure all expected categories exist
            const expectedCategories = ['new', 'improved', 'fixed', 'deprecated', 'security'];
            expectedCategories.forEach(category => {
                if (!this.changelog.changes[category]) {
                    this.changelog.changes[category] = [];
                }
                // Ensure each category is an array
                if (!Array.isArray(this.changelog.changes[category])) {
                    this.changelog.changes[category] = [this.changelog.changes[category]].filter(Boolean);
                }
            });
        } else {
            // Create default changes structure if missing
            this.changelog.changes = {
                new: [],
                improved: [],
                fixed: [],
                deprecated: [],
                security: []
            };
        }

        // Ensure other required fields have defaults
        if (!this.changelog.version) {
            this.changelog.version = "1.0.0";
        }
        if (!this.changelog.releaseType) {
            this.changelog.releaseType = "patch";
        }
    }

    async loadChangelog() {
        try {
            // Dynamically determine the correct path to changelog.json
            const changelogPath = this.getChangelogPath();

            const response = await fetch(changelogPath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            this.changelog = await response.json();
            this.loadingComplete = true;

            // Normalize date field to ensure compatibility with both 'date' and 'releaseDate'
            this.normalizeChangelogData();

            // Now that changelog is loaded, check for new version
            this.checkForNewVersion();
        } catch (error) {
            console.warn('Failed to load changelog.json:', error);

            // Try alternative paths if the first one fails
            await this.tryAlternativePaths();
        }
    }

    getChangelogPath() {
        // Return absolute URL for changelog.json to work from nested routes
        // Check if we are in a subfolder (like /pages/)
        const path = window.location.pathname;
        if (path.includes('/pages/')) {
            return new URL('../changelog.json', window.location.href).toString();
        }
        return new URL('changelog.json', window.location.origin).toString();
    }

    async tryAlternativePaths() {
        const possiblePaths = [
            'changelog.json',
            '../../changelog.json',
            '../changelog.json',
            './changelog.json'
        ];

        // Remove duplicates
        const uniquePaths = [...new Set(possiblePaths)];

        for (const path of uniquePaths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    this.changelog = await response.json();
                    this.loadingComplete = true;
                    this.normalizeChangelogData();
                    this.checkForNewVersion();
                    return;
                }
            } catch (error) {
                console.warn('Failed to load changelog from alternative path', path);
            }
        }

        // If all paths fail, use fallback data
        console.warn('All changelog paths failed, using fallback data');
        this.changelog = {
            version: "1.0.0",
            releaseDate: new Date().toISOString().split('T')[0],
            releaseType: "major",
            changes: {
                new: ["Unable to load changelog data"],
                improved: [],
                fixed: [],
                deprecated: [],
                security: []
            }
        };
        this.loadingComplete = true;
        this.normalizeChangelogData();
        this.checkForNewVersion();
    }

    bindEvents() {
        // Close on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('changelog-overlay')) {
                this.close();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.isOpen && e.key === 'Escape') {
                this.close();
            }
        });
    }

    checkForNewVersion() {
        // Add null check for changelog and loading completion
        if (!this.changelog || !this.changelog.version) {
            console.warn('Changelog data not loaded yet');
            // Try again after a short delay
            if (this.loadingComplete) {
                console.warn('Changelog loading completed but no data available');
            }
            return;
        }

        const currentVersion = this.changelog.version;
        const lastSeenVersion = localStorage.getItem('lastSeenChangelogVersion') || '0.0.0';

        // Show changelog if new version detected
        if (this.isNewerVersion(currentVersion, lastSeenVersion)) {
            // Auto-show after a short delay, but only if not in test environment
            if (!window.location.pathname.includes('test') && !window.location.pathname.includes('testing')) {
                setTimeout(() => {
                    this.open();
                }, 1500);
            }
        }
    }

    isNewerVersion(version1, version2) {
        const v1 = version1.split('.').map(Number);
        const v2 = version2.split('.').map(Number);

        for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
            const num1 = v1[i] || 0;
            const num2 = v2[i] || 0;

            if (num1 > num2) return true;
            if (num1 < num2) return false;
        }

        return false;
    }

    createModal() {
        const overlay = document.createElement('div');
        overlay.className = 'changelog-overlay hidden';

        const modal = document.createElement('div');
        modal.className = 'changelog-modal-container';

        modal.innerHTML = `
            <!-- Modal Header -->
            <div class="changelog-header">
                <div class="changelog-title-section">
                    <div class="changelog-badge">
                        <span class="version-badge">v${this.changelog.version}</span>
                        <span class="release-type-badge ${this.changelog.releaseType}">${this.changelog.releaseType}</span>
                    </div>
                    <h2 class="changelog-title">What's New in Unblockee</h2>
                    <p class="changelog-date">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Released ${this.formatDate(this.getReleaseDate())}
                    </p>
                </div>
                <button class="changelog-close-btn" aria-label="Close changelog">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            <!-- Modal Content -->
            <div class="changelog-content">
                ${this.renderChangesList()}
            </div>

            <!-- Modal Footer -->
            <div class="changelog-footer">
                <div class="changelog-actions">
                    <button type="button" class="btn btn-secondary dismiss-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M18 6 6 18M6 6l12 12"/>
                        </svg>
                        Dismiss
                    </button>
                    <button type="button" class="btn btn-primary view-full-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        View Full Changelog
                    </button>
                </div>
                <p class="changelog-notice">
                    This changelog will only show once per version.
                    <a href="${new URL('changelog.json', window.location.origin).toString()}" target="_blank" class="changelog-link">View all versions</a>
                </p>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Cache elements
        this.overlay = overlay;
        this.modal = modal;
        this.elements = {
            closeBtn: modal.querySelector('.changelog-close-btn'),
            dismissBtn: modal.querySelector('.dismiss-btn'),
            viewFullBtn: modal.querySelector('.view-full-btn')
        };

        // Bind events
        this.elements.closeBtn.addEventListener('click', () => this.close());
        this.elements.dismissBtn.addEventListener('click', () => this.dismiss());
        this.elements.viewFullBtn.addEventListener('click', () => this.viewFullChangelog());
    }

    renderChangesList() {
        const changes = this.changelog.changes;
        const hasContent = Object.values(changes).some(list => list.length > 0);

        if (!hasContent) {
            return `
                <div class="changelog-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <h3>No changes to display</h3>
                    <p>This update contains no significant changes.</p>
                </div>
            `;
        }

        let html = '';

        if (changes.new && changes.new.length > 0) {
            html += this.renderChangeSection('New Features', changes.new, '🆕', 'new');
        }

        if (changes.improved && changes.improved.length > 0) {
            html += this.renderChangeSection('Improvements', changes.improved, '✨', 'improved');
        }

        if (changes.fixed && changes.fixed.length > 0) {
            html += this.renderChangeSection('Fixxed', changes.fixed, '🔧', 'fixed');
        }

        if (changes.security && changes.security.length > 0) {
            html += this.renderChangeSection('Security Updates', changes.security, '🔒', 'security');
        }

        if (changes.deprecated && changes.deprecated.length > 0) {
            html += this.renderChangeSection('Deprecated Features', changes.deprecated, '⚠️', 'deprecated');
        }

        // Add breaking changes section if they exist in the changelog data
        if (this.changelog.breakingChanges && this.changelog.breakingChanges.length > 0) {
            html += this.renderChangeSection('Breaking Changes', this.changelog.breakingChanges, '💥', 'breaking');
        }

        return html;
    }

    renderChangeSection(title, items, icon, type) {
        const maxItems = type === 'new' ? 5 : 3; // Show more new features
        const displayedItems = items.slice(0, maxItems);
        const hasMore = items.length > maxItems;

        let html = `
            <div class="changelog-section">
                <div class="changelog-section-header">
                    <h3 class="section-title">
                        <span class="section-icon">${icon}</span>
                        ${title}
                        <span class="item-count">(${items.length})</span>
                    </h3>
                </div>
                <ul class="changes-list">
        `;

        displayedItems.forEach(item => {
            html += `
                <li class="change-item">
                    <div class="change-content">${item}</div>
                </li>
            `;
        });

        if (hasMore) {
            const remainingCount = items.length - maxItems;
            html += `
                <li class="change-item more-items">
                    <button type="button" class="show-more-btn" data-type="${type}">
                        Show ${remainingCount} more ${title.toLowerCase()}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M6 9l6 6 6-6"/>
                        </svg>
                    </button>
                </li>
            `;
        }

        html += `
                </ul>
            </div>
        `;

        return html;
    }

    /**
     * Safely get the release date from the changelog
     * Returns a fallback date if the field is missing or malformed
     */
    getReleaseDate() {
        if (!this.changelog) {
            return new Date().toISOString().split('T')[0];
        }

        const date = this.changelog.releaseDate || this.changelog.date;

        if (!date) {
            return new Date().toISOString().split('T')[0];
        }

        return date;
    }

    formatDate(dateString) {
        try {
            // Use getReleaseDate() if no dateString provided
            const dateToFormat = dateString || this.getReleaseDate();
            const date = new Date(dateToFormat);

            // Check if date is valid
            if (isNaN(date.getTime())) {
                console.warn('Invalid date format:', dateToFormat);
                return dateToFormat; // Return original string if invalid
            }

            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.warn('Error formatting date:', error);
            return dateString || this.getReleaseDate();
        }
    }

    expandSection(type) {
        const changelog = this.changelog.changes;
        let items = [];

        switch (type) {
            case 'new':
                items = changelog.new || [];
                break;
            case 'improved':
                items = changelog.improved || [];
                break;
            case 'fixed':
                items = changelog.fixed || [];
                break;
            case 'security':
                items = changelog.security || [];
                break;
            case 'deprecated':
                items = changelog.deprecated || [];
                break;
            case 'breaking':
                items = this.changelog.breakingChanges || [];
                break;
        }

        // Re-render with all items
        this.modal.querySelector('.changelog-content').innerHTML = this.renderChangesList();

        // Re-bind show more buttons
        this.modal.querySelectorAll('.show-more-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.expandSection(btn.dataset.type);
            });
        });
    }

    open() {
        this.isOpen = true;

        // Ensure modal is fully initialized
        if (!this.overlay) {
            this.createModal();
        }

        // Additional check for modal existence
        if (!this.overlay || !this.modal) {
            console.error('Changelog modal not properly initialized');
            return;
        }

        this.overlay.classList.remove('hidden');
        document.body.classList.add('changelog-open');

        // Bind dynamic events
        this.modal.querySelectorAll('.show-more-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.expandSection(btn.dataset.type);
            });
        });

        // Focus management
        setTimeout(() => {
            if (this.elements && this.elements.closeBtn) {
                this.elements.closeBtn.focus();
            }
        }, 100);
    }

    close() {
        this.isOpen = false;
        this.overlay.classList.add('hidden');
        document.body.classList.remove('changelog-open');

        // Update last seen version
        localStorage.setItem('lastSeenChangelogVersion', this.changelog.version);

        // Update notification badge if exists
        if (window.Topbar) {
            window.Topbar.hideNotificationBadge();
        }
    }

    dismiss() {
        this.close();

        // Store dismissal time to prevent immediate re-show
        localStorage.setItem('changelogDismissedAt', Date.now().toString());
    }

    viewFullChangelog() {
        this.close();
        const changelogUrl = new URL('changelog.json', window.location.origin).toString();

        // Open full changelog in new window or navigate to changelog page
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'navigate',
                url: changelogUrl
            }, '*');
        } else {
            window.open(changelogUrl, '_blank');
        }
    }

    // Manual trigger method (called from topbar)
    forceShow() {
        // Check if dismissed recently (within 24 hours)
        const dismissedAt = localStorage.getItem('changelogDismissedAt');
        if (dismissedAt) {
            const timeDiff = Date.now() - parseInt(dismissedAt);
            const hoursDiff = timeDiff / (1000 * 60 * 60);

            if (hoursDiff < 24) {
                return;
            }
        }

        this.open();
    }

    // Get changelog info for external use
    getChangelogInfo() {
        return {
            version: this.changelog.version,
            releaseDate: this.getReleaseDate(),
            releaseType: this.changelog.releaseType,
            hasNewChanges: this.isNewerVersion(
                this.changelog.version,
                localStorage.getItem('lastSeenChangelogVersion') || '0.0.0'
            )
        };
    }

    // Reset version tracking (useful for development)
    resetVersionTracking() {
        localStorage.removeItem('lastSeenChangelogVersion');
        localStorage.removeItem('changelogDismissedAt');
    }

    // Cleanup
    destroy() {
        if (this.overlay) {
            this.overlay.remove();
        }
        this.isOpen = false;
    }

    // Static method to wait for component to be ready
    static waitForReady() {
        return new Promise((resolve) => {
            const checkReady = () => {
                if (window.componentsReady && window.componentsReady.changelog) {
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });
    }
}

// Global initialization function for external use
window.checkForNewChangelog = function () {
    if (window.ChangelogModal) {
        return window.ChangelogModal.checkForNewVersion();
    } else {
        console.warn('ChangelogModal not initialized yet');
        return false;
    }
};

// Global function to force show changelog
window.showChangelog = function () {
    if (window.ChangelogModal) {
        window.ChangelogModal.forceShow();
    } else {
        console.warn('ChangelogModal not initialized yet');
    }
};

// Global function to get changelog info
window.getChangelogInfo = function () {
    if (window.ChangelogModal) {
        return window.ChangelogModal.getChangelogInfo();
    } else {
        console.warn('ChangelogModal not initialized yet');
        return null;
    }
};

// Initialize when DOM is loaded
async function initializeChangelog() {
    try {
        // Initialize component tracking
        window.componentsReady = window.componentsReady || {};

        window.ChangelogModal = new ChangelogModal();

        // Ensure changelog data is loaded before marking as ready
        await window.ChangelogModal.loadChangelog();

        // Mark component as ready
        window.componentsReady.changelog = true;
        window.dispatchEvent(new CustomEvent('changelogReady'));

    } catch (error) {
        console.error('Failed to initialize changelog component:', error);
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeChangelog);

// Prevent duplicate initialization
window.changelogInitialized = false;
window.initializeChangelog = function () {
    if (window.changelogInitialized) {
        return; // Already initialized, do nothing
    }
    window.changelogInitialized = true;
    initializeChangelog();
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChangelogModal;
}