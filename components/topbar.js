/**

 *
 * This file is loaded via a normal <script> tag in index.html, so it must use
 * browser globals instead of ES module imports to avoid:
 * "Cannot use import statement outside a module".
 *
 * Now includes all dependencies bundled - you only need to include this file and topbar.css!
 */

// Dependencies are now loaded from external files (utils/storage.js, utils/notifications.js, components/settings.js)

// ===== DOMAIN BLOCKING UTILITIES =====
// Block school filtering software domains from being accessed
const schoolFilteringList = ["deledao", "goguardian", "lightspeed", "linewize", "securly", ".edu/"];

function isBlockedDomain(url) {
    try {
        const domain = new URL(url, location.origin).hostname + "/";
        return schoolFilteringList.some(school => domain.includes(school));
    } catch {
        return false;
    }
}

// Override fetch to block filtering software domains
const originalFetch = window.fetch;
window.fetch = function (url, options) {
    if (isBlockedDomain(url)) {
        console.warn(`Blocked request to filtering software domain: ${url}`);
        return Promise.reject(new Error("Blocked: School filtering software domain"));
    }
    return originalFetch.apply(this, arguments);
};

// Override XMLHttpRequest to block filtering software domains
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url) {
    if (isBlockedDomain(url)) {
        console.warn(`Blocked XMLHttpRequest to filtering software domain: ${url}`);
        return;
    }
    return originalOpen.apply(this, arguments);
};

// ===== TOPBAR COMPONENT =====

const StorageUtils = window.StorageUtils || {};
const notificationManagerInstance = window.NotificationManager || { notify: () => { } };

/**
 * Topbar Component - Global navigation and search interface
 * Displays rounded search bar with navigation buttons, settings, and notifications
 */
const DEFAULT_SEARCH_ENGINES = { brave: { name: 'Brave Search', url: 'https://search.brave.com/search?q=' } };

class Topbar {
    constructor() {
        this.isMobile = window.innerWidth < 768;
        this.topbar = null;
        this.elements = {};
        this.searchEngines = window.searchEngines || DEFAULT_SEARCH_ENGINES;

        // Initialize notification system using the shared global instance
        this.notifications = notificationManagerInstance;

        // Expose notification API
        this.notify = (message, type = 'info', duration = 3000, action = null) => {
            try {
                return this.notifications.notify(message, type, duration, action);
            } catch (error) {
                console.warn('Notification failed:', error);
                return null;
            }
        };

        try {
            this.init();
        } catch (error) {
            console.error('Topbar initialization error:', error);
            // Don't let initialization errors prevent global exposure
        }
    }

    init() {
        this.createTopbar();
        this.bindEvents();
        this.loadSavedEngine();
        this.checkChangelogNotifications();

        // Initialize offline detection
        this.initializeOfflineDetection();

        // Initialize alternate game library indicator
        this.initializeGameLibraryIndicator();

        // Initialize WidgetBot
        this.initializeWidgetBot();

        // Mark topbar as ready after all initialization is complete
        this.markAsReady();
    }

    markAsReady() {
        // Mark topbar as ready
        window.componentsReady = window.componentsReady || {};
        window.componentsReady.topbar = true;
        window.dispatchEvent(new CustomEvent('topbarReady'));
    }

    createTopbar() {
        // Check if topbar already exists to prevent duplicates
        if (document.querySelector('.topbar')) {
            console.warn('Topbar already exists');
            return;
        }

        const topbar = document.createElement('div');
        topbar.className = 'topbar';
        topbar.innerHTML = `
            <div class="topbar-container">
                <!-- Logo/Brand -->
                <div class="topbar-brand">
                    <a href="#" onclick="navigateTo('home')" class="brand-link">
                        <span class="brand-icon">🚀</span>
                        <span class="brand-text">Unblockee</span>
                    </a>
                </div>

                <!-- Desktop Navigation -->
                <nav class="topbar-nav desktop-nav">
                    <a href="#" onclick="navigateTo('home')" class="nav-item">
                        <span class="nav-icon">🏠</span>
                        <span class="nav-text">Home</span>
                    </a>
                    <a href="#" onclick="navigateTo('games')" class="nav-item">
                        <span class="nav-icon">🎮</span>
                        <span class="nav-text">Games</span>
                        <span class="game-library-indicator hidden" id="alternate-game-indicator" title="Library 2 (Ultimate Game Stash)">L2</span>
                    </a>
                    <a href="#" onclick="navigateTo('movies')" class="nav-item">
                        <span class="nav-icon">🎬</span>
                        <span class="nav-text">Movies</span>
                    </a>
                    <a href="#" onclick="navigateTo('music')" class="nav-item">
                        <span class="nav-icon">🎵</span>
                        <span class="nav-text">Music</span>
                    </a>
                    <a href="#" onclick="navigateTo('browser')" class="nav-item">
                        <span class="nav-icon">🌐</span>
                        <span class="nav-text">Browser</span>
                    </a>
                </nav>

                <!-- Search Section -->
                <div class="topbar-search">
                    <form class="search-form" id="topbar-search-form">
                        <div class="search-container">
                            <input
                                type="text"
                                class="search-input"
                                placeholder="Search the web..."
                                autocomplete="off"
                                id="topbar-search-input"
                            >
                            <button type="submit" class="tb-search-btn">
                                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.35-4.35"></path>
                                </svg>
                            </button>
                            <select class="search-engine-select" id="search-engine-select">
                                <option value="brave">Brave Search</option>
                                <option value="duckduckgo">DuckDuckGo</option>
                                <option value="google">Google</option>
                                <option value="bing">Bing</option>
                                <option value="youtube">YouTube</option>
                            </select>
                        </div>
                    </form>
                </div>




                    <!-- Chat Button -->
                    <button class="tb-action-btn topbar-icon-button tb-chat-btn" id="topbar-chat-btn" title="AI Chat">
                        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </button>

                    <!-- Notifications Bell -->
                    <button class="tb-action-btn topbar-icon-button tb-notification-btn" id="topbar-notification-btn" title="Changelog & Updates">
                        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        <span class="notification-badge hidden" id="topbar-notification-badge">1</span>
                    </button>

                    <!-- Settings Gear -->
                    <button class="tb-action-btn topbar-icon-button tb-settings-btn" id="topbar-settings-btn" title="Settings">
                        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                    </button>

                    <!-- Mobile Menu Toggle -->
                    <button class="mobile-menu-toggle" id="mobile-menu-toggle">
                        <span class="hamburger-line"></span>
                        <span class="hamburger-line"></span>
                        <span class="hamburger-line"></span>
                    </button>
                </div>
            </div>

            <!-- Offline Indicator (click-through when hidden; CSS handles pointer-events) -->
            <div id="offline-indicator" class="offline-indicator hidden">
                <span class="offline-icon">📱</span>
                <span class="offline-text">Offline Mode</span>
            </div>

            <!-- Mobile Menu Overlay -->
            <div class="mobile-menu-overlay" id="mobile-menu-overlay">
                <div class="mobile-menu-content">
                    <nav class="mobile-nav">
                        <a href="#" onclick="navigateTo('home')" class="mobile-nav-item">
                            <span class="nav-icon">🏠</span>
                            <span class="nav-text">Home</span>
                        </a>
                        <a href="#" onclick="navigateTo('games')" class="mobile-nav-item">
                            <span class="nav-icon">🎮</span>
                            <span class="nav-text">Games</span>
                            <span class="game-library-indicator hidden" id="mobile-alternate-game-indicator" title="Library 2 (Ultimate Game Stash)">L2</span>
                        </a>
                        <a href="#" onclick="navigateTo('movies')" class="mobile-nav-item">
                            <span class="nav-icon">🎬</span>
                            <span class="nav-text">Movies</span>
                        </a>
                        <a href="#" onclick="navigateTo('music')" class="mobile-nav-item">
                            <span class="nav-icon">🎵</span>
                            <span class="nav-text">Music</span>
                        </a>
                        <a href="#" onclick="navigateTo('browser')" class="mobile-nav-item">
                            <span class="nav-icon">🌐</span>
                            <span class="nav-text">Browser</span>
                        </a>
                        <a href="#" onclick="navigateTo('settings')" class="mobile-nav-item">
                            <span class="nav-icon">⚙️</span>
                            <span class="nav-text">Settings</span>
                        </a>
                    </nav>
                </div>
            </div>
        `;

        // Insert topbar at the beginning of body
        document.body.insertBefore(topbar, document.body.firstChild);
        this.topbar = topbar;

        // Cache elements with null checks
        this.elements = {
            searchForm: topbar.querySelector('#topbar-search-form'),
            searchInput: topbar.querySelector('#topbar-search-input'),
            searchEngineSelect: topbar.querySelector('#search-engine-select'),
            chatBtn: topbar.querySelector('#topbar-chat-btn'),
            settingsBtn: topbar.querySelector('#topbar-settings-btn'),
            prxxySettingsBtn: topbar.querySelector('#prxxy-settings-btn'),
            notificationBtn: topbar.querySelector('#topbar-notification-btn'),
            notificationBadge: topbar.querySelector('#topbar-notification-badge'),

            mobileMenuToggle: topbar.querySelector('#mobile-menu-toggle'),
            mobileMenuOverlay: topbar.querySelector('#mobile-menu-overlay'),
            gameLibraryIndicator: topbar.querySelector('#alternate-game-indicator'),
            mobileGameLibraryIndicator: topbar.querySelector('#mobile-alternate-game-indicator')
        };
    }

    bindEvents() {
        // Search functionality - Add null check
        if (this.elements.searchForm) {
            this.elements.searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearch();
            });
        }

        // NOTE: Search engine setting is deprecated from Settings UI, but we
        // still persist this select locally for users who change it here.
        if (this.elements.searchEngineSelect) {
            this.elements.searchEngineSelect.addEventListener('change', (e) => {
                localStorage.setItem('searchEngine', e.target.value);
            });
        }

        // Settings button - Add null check
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.addEventListener('click', async () => {
                this.showLoadingIndicator('topbar-settings-btn');

                // Always try to open the SettingsModal directly first
                await this.waitForComponent('SettingsModal', 3000);

                if (window.SettingsModal && typeof window.SettingsModal.open === 'function') {
                    // Only open if not already open to prevent refresh loops
                    if (!window.SettingsModal.isOpen) {
                        window.SettingsModal.open();
                    }
                } else {
                    // Fallback: navigate to settings hash (which can handle modal opening on page load)
                    if (typeof navigateTo === 'function') {
                        navigateTo('settings');
                    } else {
                        // Direct hash navigation as ultimate fallback
                        window.location.href = '/index.html#settings';
                    }
                }

                this.hideLoadingIndicator('topbar-settings-btn');
            });
        }

        // Chat button - Add null check
        if (this.elements.chatBtn) {
            this.elements.chatBtn.addEventListener('click', () => {
                window.location.assign('/pages/chatbot.html');
            });
        }

        // Prxxy Settings button removed - WISP settings now in Staticsj browser



        // Notification button - Add null check
        if (this.elements.notificationBtn) {
            this.elements.notificationBtn.addEventListener('click', async () => {
                this.showLoadingIndicator('topbar-notification-btn');

                // Safely check for component existence
                await this.waitForComponent('ChangelogModal', 1000);

                if (window.ChangelogModal && typeof window.ChangelogModal.open === 'function') {
                    window.ChangelogModal.open();
                }

                this.hideLoadingIndicator('topbar-notification-btn');
            });
        }

        // Mobile menu toggle - Add null check
        if (this.elements.mobileMenuToggle) {
            this.elements.mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Close mobile menu when clicking overlay - Add null check
        if (this.elements.mobileMenuOverlay) {
            this.elements.mobileMenuOverlay.addEventListener('click', (e) => {
                if (e.target === this.elements.mobileMenuOverlay) {
                    this.closeMobileMenu();
                }
            });
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            const newIsMobile = window.innerWidth < 768;
            if (newIsMobile !== this.isMobile) {
                this.isMobile = newIsMobile;
                this.closeMobileMenu();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Focus search with Ctrl+K or Cmd+K
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (this.elements.searchInput) {
                    this.elements.searchInput.focus();
                }
            }

            // Close mobile menu with Escape
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }

            // Global panic key handling (single source of truth)
            this.handlePanicKey(e);
        });
    }

    loadSavedEngine() {
        const savedEngine = localStorage.getItem('searchEngine') || 'brave';
        if (this.searchEngines[savedEngine]) {
            this.elements.searchEngineSelect.value = savedEngine;
        }
    }

    handleSearch() {
        const query = this.elements.searchInput.value.trim();
        const engine = this.elements.searchEngineSelect.value;

        if (!query) {
            this.elements.searchInput.focus();
            return;
        }

        const searchUrl = this.searchEngines[engine].url + encodeURIComponent(query);

        // Check if on main page or in iframe
        if (window.parent && window.parent !== window) {
            // We're in an iframe - use postMessage
            window.parent.postMessage({ type: 'navigate', url: searchUrl }, '*');
        } else {
            // We're on the main page - navigate to browser with search parameter and engine
            const browserSearchUrl = `/Staticsj/index.html#search=${encodeURIComponent(query)}&engine=${encodeURIComponent(engine)}`;
            window.location.href = browserSearchUrl;
        }

        // Clear search input after search
        this.elements.searchInput.value = '';
    }

    // Helper method to wait for component initialization
    async waitForComponent(componentName, timeout = 2000) {
        return new Promise((resolve) => {
            const startTime = Date.now();

            const checkComponent = () => {
                if (window[componentName]) {
                    resolve(true);
                } else if (Date.now() - startTime > timeout) {
                    console.warn(`Component ${componentName} not available after ${timeout}ms`);
                    resolve(false);
                } else {
                    setTimeout(checkComponent, 100);
                }
            };

            checkComponent();
        });
    }

    // Helper method to show loading indicator
    showLoadingIndicator(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.classList.add('loading');
            button.style.opacity = '0.6';
        }
    }

    // Helper method to hide loading indicator
    hideLoadingIndicator(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.classList.remove('loading');
            button.style.opacity = '1';
        }
    }

    // Static method to wait for all components (if needed)
    static async waitForComponents() {
        return new Promise((resolve) => {
            // Just wait for componentsReady object to exist
            const checkComponents = () => {
                if (window.componentsReady && typeof window.componentsReady === 'object') {
                    resolve();
                } else {
                    setTimeout(checkComponents, 100);
                }
            };
            checkComponents();
        });
    }

    toggleMobileMenu() {
        const isOpen = this.elements.mobileMenuOverlay.classList.contains('active');
        if (isOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        this.elements.mobileMenuOverlay.classList.add('active');
        this.elements.mobileMenuToggle.classList.add('active');
        document.body.classList.add('mobile-menu-open');
    }

    closeMobileMenu() {
        this.elements.mobileMenuOverlay.classList.remove('active');
        this.elements.mobileMenuToggle.classList.remove('active');
        document.body.classList.remove('mobile-menu-open');
    }

    checkChangelogNotifications() {
        try {
            const currentVersion = "2.0.0"; // Should match changelog.json version
            const lastSeenVersion = localStorage.getItem('lastSeenChangelogVersion') || '0.0.0';

            if (lastSeenVersion !== currentVersion) {
                this.showNotificationBadge();
            }
        } catch (error) {
            console.warn('Failed to check changelog notifications:', error);
        }
    }

    showNotificationBadge() {
        if (this.elements.notificationBadge) {
            this.elements.notificationBadge.classList.remove('hidden');
        }
    }

    hideNotificationBadge() {
        if (this.elements.notificationBadge) {
            this.elements.notificationBadge.classList.add('hidden');
        }
    }

    // === OFFLINE DETECTION METHODS ===
    initializeOfflineDetection() {
        this.initializeServiceWorker();
        this.updateOfflineStatus();

        // Listen for online/offline events
        window.addEventListener('online', () => this.updateOfflineStatus());
        window.addEventListener('offline', () => this.updateOfflineStatus());
    }

    // Service Worker Registration
    initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            // Dynamic path calculation for subfolder hosting compatibility
            // Calculates correct path based on current page location
            const base = location.pathname.replace(/[^\/]*$/, '');
            const swPath = base + '../sw.js';

            navigator.serviceWorker.register(swPath)
                .then(() => {
                    // Listen for service worker messages
                    navigator.serviceWorker.addEventListener('message', event => {
                        if (event.data.type === 'GAME_CACHED') {
                            // Noisy logs removed; hook available for future UI updates
                        }
                    });
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        }
    }

    // Get offline status
    isOffline() {
        return !navigator.onLine;
    }

    // Update offline indicator
    updateOfflineStatus() {
        let indicator = document.getElementById('offline-indicator');

        // Ensure a single indicator instance; if missing, create a scoped one
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'offline-indicator';
            indicator.className = 'offline-indicator hidden';
            indicator.innerHTML = `
                <span class="offline-icon">📱</span>
                <span class="offline-text">Offline Mode</span>
            `;
            document.body.appendChild(indicator);
        }

        if (this.isOffline()) {
            indicator.classList.remove('hidden'); // CSS gives pointer-events:auto
        } else {
            indicator.classList.add('hidden'); // CSS gives display:none + pointer-events:none
        }
    }

    // Public API methods
    focusSearch() {
        if (this.elements.searchInput) {
            this.elements.searchInput.focus();
        }
    }

    // Show movie search in topbar (called from movies page) - REMOVED: Search moved to movies page

    setNotificationBadge(count) {
        if (this.elements.notificationBadge) {
            if (count > 0) {
                this.elements.notificationBadge.textContent = count;
                this.showNotificationBadge();
            } else {
                this.hideNotificationBadge();
            }
        }
    }



    // === CLOAK & PANIC KEY CENTRALIZATION ===

    getCloakMode() {
        const mode = StorageUtils.get('unblockee_cloakMode') || 'none';
        if (mode === 'about:blank' || mode === 'blob' || mode === 'none') {
            return mode;
        }
        return 'none';
    }

    openWithCloak(url, target = '_blank') {
        const mode = this.getCloakMode();

        if (mode === 'about:blank') {
            // about:blank cloak: open about:blank, then inject iframe pointing to url
            const win = window.open('about:blank', target);
            if (!win) return;
            try {
                const doc = win.document;
                doc.open();
                doc.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Loading...</title>
                        <style>
                            html,body{margin:0;padding:0;height:100%;overflow:hidden;background:#000;}
                            iframe{border:0;width:100%;height:100%;}
                        </style>
                    </head>
                    <body>
                        <iframe src="${url}"></iframe>
                    </body>
                    </html>
                `);
                doc.close();
            } catch (e) {
                // If cross-origin restrictions or blockers interfere, fall back
                win.location.href = url;
            }
            return;
        }

        if (mode === 'blob') {
            // Blob cloak: simple blob HTML shell that iframes target URL
            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Loading...</title>
                    <style>
                        html,body{margin:0;padding:0;height:100%;overflow:hidden;background:#000;}
                        iframe{border:0;width:100%;height:100%;}
                    </style>
                </head>
                <body>
                    <iframe src="${url}"></iframe>
                </body>
                </html>
            `;
            const blob = new Blob([html], { type: 'text/html' });
            const blobUrl = URL.createObjectURL(blob);
            const win = window.open(blobUrl, target);
            if (!win) return;
            return;
        }

        // Default: no cloak
        window.open(url, target);
    }

    handlePanicKey(e) {
        // Support custom panic key from localStorage
        let panicKey = localStorage.getItem('unblockee_customPanicKey') || StorageUtils.get('unblockee_panicKeys') || 'none';
        panicKey = panicKey.toLowerCase().trim();
        if (panicKey === 'none' || panicKey === '') return;

        const matchCombo = (combo) => {
            const normalized = combo.toLowerCase().replace(/\s+/g, '');
            switch (normalized) {
                case 'ctrl+shift+k':
                    return e.ctrlKey && e.shiftKey && (e.key === 'k' || e.key === 'K');
                case 'ctrl+shift+x':
                    return e.ctrlKey && e.shiftKey && (e.key === 'x' || e.key === 'X');
                case 'alt+f4':
                    return e.altKey && e.key === 'F4';
                case 'ctrl+w':
                    return e.ctrlKey && e.key === 'w';
                case 'esc':
                    return e.key === 'Escape';
                default:
                    // Support custom key combinations like "ctrl+shift+q"
                    const parts = normalized.split('+');
                    if (parts.length < 2) return false;

                    const modifiers = parts.slice(0, -1);
                    const key = parts[parts.length - 1].toLowerCase();

                    // Check modifiers
                    const ctrlRequired = modifiers.includes('ctrl');
                    const shiftRequired = modifiers.includes('shift');
                    const altRequired = modifiers.includes('alt');
                    const metaRequired = modifiers.includes('meta') || modifiers.includes('cmd');

                    if (ctrlRequired && !e.ctrlKey) return false;
                    if (shiftRequired && !e.shiftKey) return false;
                    if (altRequired && !e.altKey) return false;
                    if (metaRequired && !e.metaKey) return false;

                    // Check for unexpected modifiers
                    if (!ctrlRequired && e.ctrlKey) return false;
                    if (!shiftRequired && e.shiftKey) return false;
                    if (!altRequired && e.altKey) return false;
                    if (!metaRequired && e.metaKey) return false;

                    return e.key.toLowerCase() === key;
            }
        };

        if (!matchCombo(panicKey)) return;

        // Get custom panic URL
        let targetUrl = localStorage.getItem('unblockee_customPanicUrl') || StorageUtils.get('panicAction') || StorageUtils.get('unblockee_panicAction') || 'https://www.google.com';

        // Validate URL
        try {
            new URL(targetUrl);
        } catch (error) {
            console.warn('Invalid panic URL, using fallback:', targetUrl);
            targetUrl = 'https://www.google.com';
        }

        // Show notification
        try {
            this.notify('Panic key activated - Redirecting...', 'warning', 2000);
        } catch (error) {
            console.warn('Failed to show panic notification:', error);
        }

        // Small delay to show notification before redirect
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 100);
    }

    // === ALTERNATE GAME LIBRARY INDICATOR METHODS ===
    initializeGameLibraryIndicator() {
        // Check initial state
        this.updateGameLibraryIndicator();

        // Listen for settings changes
        window.addEventListener('alternateGameLibraryChanged', (event) => {
            this.updateGameLibraryIndicator();
        });

        // Also listen for storage events to catch direct changes
        window.addEventListener('storage', (event) => {
            if (event.key === 'alternateGameLibraryEnabled') {
                this.updateGameLibraryIndicator();
            }
        });
    }

    updateGameLibraryIndicator() {
        try {
            // Use StorageUtils for alternate game library indicator
            const alternateGameLibraryEnabled = StorageUtils.getBoolean('alternateGameLibraryEnabled', false);

            if (this.elements.gameLibraryIndicator) {
                if (alternateGameLibraryEnabled) {
                    this.elements.gameLibraryIndicator.classList.remove('hidden');
                } else {
                    this.elements.gameLibraryIndicator.classList.add('hidden');
                }
            }

            if (this.elements.mobileGameLibraryIndicator) {
                if (alternateGameLibraryEnabled) {
                    this.elements.mobileGameLibraryIndicator.classList.remove('hidden');
                } else {
                    this.elements.mobileGameLibraryIndicator.classList.add('hidden');
                }
            }
        } catch (error) {
            console.warn('Failed to update game library indicator:', error);
        }
    }

    // === WIDGETBOT INITIALIZATION METHODS ===
    initializeWidgetBot() {
        try {
            // Check if WidgetBot is enabled in settings
            const widgetbotEnabled = StorageUtils.getBoolean('widgetbotEnabled', true);

            if (widgetbotEnabled) {
                this.loadWidgetBotScript();
            }
        } catch (error) {
            console.warn('Failed to initialize WidgetBot:', error);
        }
    }

    loadWidgetBotScript() {
        // Check if script already exists
        if (document.querySelector('script[src*="cdn.jsdelivr.net/npm/@widgetbot/crate@3"]')) {
            return;
        }

        // UNBLOCKEE WIDGETBOT MODIFICATION
        // To disable WidgetBot, comment out the following lines (lines 821-840)
        // To enable WidgetBot, uncomment the following lines (lines 821-840)
        
        // Create and load the WidgetBot script
        const script = document.createElement('script');
        // Using new embed URL for WidgetBot
        script.src = '../Staticsj/embed.html#widgetbot';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            // Initialize WidgetBot after script loads
            try {
                new Crate({
                    server: '1334648765679800442', // Unblockee's server
                    channel: '1336060647280083138', // #updates
                    fullscreenMode: true
                });
            } catch (error) {
                console.warn('Failed to initialize WidgetBot crate:', error);
            }
        };
        script.onerror = () => {
            console.warn('Failed to load WidgetBot script');
        };

        document.head.appendChild(script);
    }

    destroy() {
        if (this.topbar) {
            this.topbar.remove();
        }
    }
}

// Auto-initialize when DOM is loaded
// Ensure the topbar always exists and stays mounted like a persistent mini-player.
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize component tracking
    window.componentsReady = window.componentsReady || {};

    // If a topbar already exists from a previous partial render, reuse it instead of recreating.
    if (window.Topbar && window.Topbar.topbar && document.body.contains(window.Topbar.topbar)) {
        window.componentsReady.topbar = true;
        window.dispatchEvent(new CustomEvent('topbarReady'));
    }

    // Make navigateTo function available globally (if not already)
    if (typeof window.navigateTo !== 'function') {
        window.navigateTo = (page) => {
            // Navigation routes - all internal pages use root-anchored paths
            const routes = {
                'home': '/index.html',
                'games': '/pages/games.html',
                'movies': '/pages/movies.html',
                'music': '/pages/music.html',
                'browser': '/Staticsj/index.html'
            };

            // Handle hash-based routing for settings
            if (page === 'settings') {
                // Hash-based routing: navigate to index.html#settings
                const settingsUrl = '/index.html#settings';
                try {
                    sessionStorage.setItem('topbarLastPage', settingsUrl);
                } catch (e) { }
                window.location.href = settingsUrl;
                return;
            }

            const route = routes[page] || '/index.html';

            try {
                sessionStorage.setItem('topbarLastPage', route);
            } catch (e) { }

            // All navigation uses direct window.location.href for internal pages
            window.location.href = route;
        };
    }

    // Restore last visited page for this session (only on entry pages like index)
    try {
        if (!window.location.pathname.includes('Coderunner.html')) {
            const last = sessionStorage.getItem('topbarLastPage');
            if (last && last !== window.location.href && last !== window.location.pathname) {
                // Avoid loops: only redirect if we're on bare index or root
                const isEntry =
                    window.location.pathname === '/' ||
                    window.location.pathname.endsWith('/index.html');
                if (isEntry) {
                    window.location.href = last;
                }
            }
        }
    } catch (e) { }

    // Setup hash-based routing listener for settings modal
    const setupHashRouting = () => {
        const handleHashChange = () => {
            if (window.location.hash === '#settings') {
                // Wait for SettingsModal to be available, then open it
                setTimeout(async () => {
                    if (window.SettingsModal && typeof window.SettingsModal.open === 'function') {
                        // Only open if not already open to prevent refresh loops
                        if (!window.SettingsModal.isOpen) {
                            window.SettingsModal.open();
                        }
                    } else {
                        // Wait for component initialization with a single attempt
                        let attempts = 0;
                        const maxAttempts = 50; // 5 seconds max, 100ms intervals

                        const checkSettingsModal = setInterval(() => {
                            attempts++;
                            if (window.SettingsModal && typeof window.SettingsModal.open === 'function') {
                                // Only open if not already open to prevent refresh loops
                                if (!window.SettingsModal.isOpen) {
                                    window.SettingsModal.open();
                                }
                                clearInterval(checkSettingsModal);
                            } else if (attempts >= maxAttempts) {
                                clearInterval(checkSettingsModal);
                            }
                        }, 100);
                    }
                }, 100); // Small delay to ensure DOM is ready
            }
        };

        // Check hash on page load
        handleHashChange();

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);
    };

    // Initialize hash routing after a short delay to ensure all components are loaded
    setTimeout(setupHashRouting, 500);

    // Initialize topbar on all pages (including movies) except coderunner which controls its own timing.
    if (!window.location.pathname.includes('Coderunner.html')) {
        if (!window.Topbar || !window.Topbar.topbar || !document.body.contains(window.Topbar.topbar)) {
            window.Topbar = new Topbar();
        }
    } else {
        // For coderunner page, expose initializeTopbar function without duplicating instances.
        window.initializeTopbar = () => {
            if (!window.Topbar || !window.Topbar.topbar || !document.body.contains(window.Topbar.topbar)) {
                window.Topbar = new Topbar();
            }
        };
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Topbar;
}
