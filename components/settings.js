/**
 * Settings Modal Component - Comprehensive settings system
 * Modal-based UI with tab navigation for all application settings
 * Includes migration support for legacy storage keys
 */

class SettingsModal {
    constructor() {
        this.isOpen = false;
        this.currentTab = 'general';
        this.settings = this.loadSettings();
        this.elements = {}; // Initialize elements object
        this.themeApplicationDebounce = null; // Initialize debounce timer

        // Array-based tab configuration for easy reordering
        this.tabs = [
            {
                id: 'general',
                name: 'General',
                icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>'
            },
            {
                id: 'movies',
                name: 'Movies',
                icon: '<path d="M18 8a2 2 0 0 0 0-4 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0 0 4"/><path d="M10 22 9 8"/><path d="m14 22 1-14"/><path d="M20 8c.5 0 .9.4.8 1l-2.6 12c-.1.5-.7 1-1.2 1H7c-.6 0-1.1-.4-1.2-1L3.2 9c-.1-.6.3-1 .8-1Z"/>'
            },
            {
                id: 'appearance',
                name: 'Appearance',
                icon: '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.649-1.625c1.812 0 3.461-1.55 3.461-3.478a3.44 3.44 0 0 0-1.032-2.5c-.467-.467-1.022-.658-1.741-.658h-.061a3.44 3.44 0 0 0-1.645.672c-.283.207-.572.375-.879.484a11.5 11.5 0 0 1-1.173.484c-.89.29-1.747.41-2.593.41-2.187 0-3.593-1.02-3.593-2.5 0-1.766 1.261-3 3.02-3 1.652 0 2.813.902 2.813 2.187 0 .646-.195 1.086-.57 1.375-.375.289-.672.375-.883.375-.273 0-.52-.074-.742-.203-.23-.133-.437-.375-.625-.719-.195-.352-.289-.852-.289-1.523 0-.312.039-.66.117-1.023.078-.367.227-.734.437-1.078.21-.344.527-.703.938-1.078.41-.375 1.024-.79 1.836-.79.812 0 1.523.219 2.14.656.617.438 1.336 1.195 2.156 2.273a9.1 9.1 0 0 0 1.562 1.757c.945.86 2.156 1.516 3.633 1.969 1.477.454 3.14.68 4.992.68"/>'
            },
            {
                id: 'offline',
                name: 'Offline',
                icon: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>'
            },
            {
                id: 'privacy',
                name: 'Privacy',
                icon: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><circle cx="12" cy="16" r="1"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'
            },
            {
                id: 'ai',
                name: 'AI',
                icon: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>'
            }
        ];

        // Define themes array inside the class
        this.themes = [
            { name: "Dark", primaryColor: "#a1a1a6", secondaryColor: "#ffffff", bgColor: "#0d0d0d", cardColor: "#1a1a1a", textColor: "#eaeaea" },
            { name: "Ocean", primaryColor: "#00b4d8", secondaryColor: "#0077be", bgColor: "#001122", cardColor: "#002244", textColor: "#e0f7fa" },
            { name: "Forest", primaryColor: "#2d5016", secondaryColor: "#4caf50", bgColor: "#0a1a0a", cardColor: "#1a2a1a", textColor: "#e8f5e8" }
        ];

        // Define backgrounds array inside the class
        this.backgrounds = [
            { name: "None", type: "color", value: "#0d0d0d" },
            { name: "Gradient", type: "color", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
            { name: "YouTube Video", type: "youtube", value: "" },
            { name: "Image URL", type: "image", value: "" }
        ];

        // Define cloaks array inside the class
        this.cloaks = [
            { name: "Default", icon: "https://edpuzzle.imgix.net/favicons/favicon-32.png", title: "Edpuzzle" },
            { name: "Wikipedia", icon: "https://en.wikipedia.org/favicon.ico", title: "World War II - Wikipedia" },
            { name: "Google", icon: "https://www.google.com/chrome/static/images/chrome-logo-m100.svg", title: "New Tab" },
            { name: "Classroom", icon: "https://ssl.gstatic.com/classroom/favicon.png", title: "Home" },
            { name: "Canva", icon: "https://static.canva.com/static/images/android-192x192-2.png", title: "Home - Canva" },
            { name: "Quiz", icon: "https://ssl.gstatic.com/docs/spreadsheets/forms/forms_icon_2023q4.ico", title: "You've already responded" },
            { name: "Powerschool", icon: "https://waverlyk12.powerschool.com/favicon.ico", title: "Grades and Attendance" },
        ];

        try {
            // Run migration on initialization
            this.migrateOldKeys();

            this.init();
        } catch (error) {
            console.error('SettingsModal initialization error:', error);
            // Don't let initialization errors prevent global exposure
        }
    }

    /**
     * Migrate old storage keys to new standardized names
     * @returns {Object} Migration results
     */
    migrateOldKeys() {
        if (window.StorageUtils) {
            const results = window.StorageUtils.migrateLegacyKeys();
            // Only log migration summary when something actually changed
            if (results.migrated > 0 || results.errors > 0 || results.skipped > 0) {
                console.info('Storage migration summary', {
                    migrated: results.migrated,
                    skipped: results.skipped,
                    errors: results.errors
                });
            }
            return results;
        } else {
            // Fallback migration if StorageUtils is not available
            console.warn('StorageUtils not available, running fallback migration');
            return this.fallbackMigration();
        }
    }

    /**
     * Fallback migration function for when StorageUtils is not available
     * @returns {Object} Migration results
     */
    fallbackMigration() {
        const results = {
            migrated: 0,
            errors: 0,
            skipped: 0,
            details: []
        };

        const legacyMappings = {
            'anti-close': 'antiClose',
            'anti_close': 'antiClose',
            'panic-key': 'panicKey',
            'panic_key': 'panicKey',
            'panic-action': 'panicAction',
            'panic_action': 'panicAction',
            'selected-cloak': 'selectedCloak',
            'selected_cloak': 'selectedCloak',
            'auto-about-blank': 'autoAboutBlank',
            'auto_about_blank': 'autoAboutBlank',
            'auto-blob-tab': 'autoBlobTab',
            'auto_blob_tab': 'autoBlobTab',
            'selected-theme': 'selectedTheme',
            'selected_theme': 'selectedTheme',
            'performance-mode': 'performanceMode',
            'performance_mode': 'performanceMode',
            'custom-favicons': 'customFavicons',
            'custom_favicons': 'customFavicons',
            'favicon-rotation': 'faviconRotation',
            'favicon_rotation': 'faviconRotation',
            'favicon-rotation-interval': 'faviconRotationInterval',
            'favicon_rotation_interval': 'faviconRotationInterval',
            'favicon-visibility-toggle': 'faviconVisibilityToggle',
            'favicon_visibility_toggle': 'faviconVisibilityToggle',
            'prox-server': 'proxServer',
            'prox_server': 'proxServer',
            'proxy-server': 'proxServer',
            'proxy_server': 'proxServer',
            'openai-api-key': 'openAiApiKey',
            'openai_api_key': 'openAiApiKey',
            'gemini-api-key': 'geminiApiKey',
            'gemini_api_key': 'geminiApiKey',
            'search-engine': 'searchEngine',
            'search_engine': 'searchEngine'
        };

        Object.entries(legacyMappings).forEach(([legacyKey, newKey]) => {
            try {
                const oldValue = localStorage.getItem(legacyKey);
                if (oldValue !== null) {
                    const newValue = localStorage.getItem(newKey);
                    if (newValue === null) {
                        localStorage.setItem(newKey, oldValue);
                        localStorage.removeItem(legacyKey);
                        results.migrated++;
                        results.details.push(`Migrated "${legacyKey}" -> "${newKey}"`);
                    } else {
                        results.skipped++;
                        results.details.push(`Skipped "${legacyKey}" -> "${newKey}" (new key exists)`);
                    }
                }
            } catch (error) {
                results.errors++;
                results.details.push(`Error migrating "${legacyKey}": ${error.message}`);
            }
        });

        // Silent in production; callers can inspect returned summary if needed
        return results;
    }

    init() {
        this.createModal();
        this.cacheElements();
        this.bindEvents();
        this.loadInitialState();

        // Initialize offline mode UI
        initOfflineModeUI();
    }

    /**
     * Generate navigation HTML from tabs array
     */
    generateNavigationHTML() {
        return this.tabs.map((tab, index) => {
            const isActive = index === 0; // First tab is active by default
            return `
                <a href="#" data-tab="${tab.id}" class="settings-nav-item ${isActive ? 'active' : ''}" role="tab" aria-selected="${isActive}" tabindex="${isActive ? '0' : '-1'}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        ${tab.icon}
                    </svg>
                    <span>${tab.name}</span>
                </a>
            `;
        }).join('');
    }

    /**
     * Generate tab content HTML from tabs array
     */
    generateTabContentHTML() {
        return this.tabs.map((tab, index) => {
            const isActive = index === 0;
            return this.getTabHTML(tab.id, isActive);
        }).join('');
    }

    /**
     * Get HTML for specific tab
     */
    getTabHTML(tabId, isActive) {
        switch (tabId) {
            case 'general':
                return `
                    <div class="settings-tab ${isActive ? 'active' : ''}" data-tab="general" role="tabpanel" aria-labelledby="settings-tab-general">
                        <div class="tab-header">
                            <h3 id="settings-tab-general">General</h3>
                            <p>Choose which games library Unblockee should use by default.</p>
                        </div>

                        <div class="settings-group">
                            <label class="settings-label" for="library-select">Game Library</label>
                            <select id="library-select" class="settings-input">
                                <option value="default">Library 1 (from gnmath)</option>
                                <option value="alt">Library 2 (from ultimate game stash)</option>
                            </select>
                            <span class="form-help">Choose which games library to use. Changes apply immediately.</span>
                        </div>

                        <div class="settings-group">
                            <label class="settings-label">
                                <label class="switch-container">
                                    <input type="checkbox" id="widgetbot-enabled-toggle" class="setting-checkbox">
                                    <span class="switch-slider"></span>
                                </label>
                                Enable WidgetBot
                            </label>
                            <span class="form-help">
                                Enable Widgetbot for sitewide discord integration with the Unblockee server.
                            </span>
                        </div>
                    </div>
                `;
            case 'movies':
                return `
                    <div class="settings-tab ${isActive ? 'active' : ''}" data-tab="movies" role="tabpanel" aria-labelledby="settings-tab-movies">
                        <div class="tab-header">
                            <h3 id="settings-tab-movies">Movies Settings</h3>
                            <p>Control movie ratings and content filtering for the movies section.</p>
                        </div>

                        <div class="settings-group critical">
                            <label class="settings-label" for="max-rating-select">Maximum Rating to Show</label>
                            <select id="max-rating-select" class="settings-input">
                                <option value="PG">PG</option>
                                <option value="PG-13">PG-13</option>
                                <option value="R" selected>R (Default)</option>
                            </select>
                            <span class="form-help">
                                Only movies with ratings at or below this level will be displayed.
                            </span>
                        </div>

                        <div class="settings-group info">
                            <label class="settings-label">
                                <label class="switch-container">
                                    <input type="checkbox" id="movies-proxy-enabled-toggle" class="setting-checkbox">
                                    <span class="switch-slider"></span>
                                </label>
                                Enable Proxy for Movies
                            </label>
                            <span class="form-help">
                                Enable proxy functionality when accessing movie content through embed.html. NC and NR rated movies are always hidden.
                            </span>
                        </div>
                    </div>
                `;
            case 'appearance':
                return `
                    <div class="settings-tab ${isActive ? 'active' : ''}" data-tab="appearance" role="tabpanel" aria-labelledby="settings-tab-appearance">
                        <div class="tab-header">
                            <h3 id="settings-tab-appearance">Appearance</h3>
                            <p>Theme presets and custom colors. Changes apply instantly to the UI.</p>
                        </div>

                        <div class="settings-group">
                            <label class="settings-label" for="theme-preset-select">Theme Preset</label>
                            <select id="theme-preset-select" class="settings-input">
                                <option value="dark">Dark</option>
                                <option value="ocean">Ocean</option>
                                <option value="forest">Forest</option>
                                <option value="custom">Custom (use colors below)</option>
                            </select>
                            <span class="form-help">Pick a base theme or choose Custom and tune the colors below.</span>
                        </div>

                        <div class="settings-group info">
                            <label class="settings-label">
                                <label class="switch-container">
                                    <input type="checkbox" id="global-color-thief-toggle" class="setting-checkbox">
                                    <span class="switch-slider"></span>
                                </label>
                                Enable Global Color Thief
                            </label>
                            <span class="form-help">
                                Automatically extract dominant colors from album art, posters, and other images to create dynamic themes.
                            </span>
                        </div>

                        <div class="settings-group info">
                            <div class="tab-subheader">
                                <h4>Custom Theme</h4>
                                <p>Tweak core colors. Values must be valid hex codes (e.g. #0d0d0d or #fff).</p>
                            </div>

                            <div class="custom-theme-grid">
                                <div class="custom-theme-field">
                                    <label class="settings-label" for="theme-primary-color">Primary Color</label>
                                    <div class="color-picker-group">
                                        <input type="color" id="theme-primary-color" class="color-picker">
                                        <input type="text" id="theme-primary-color-text" class="settings-input theme-color-input" placeholder="#a1a1a6" maxlength="7">
                                    </div>
                                    <span class="form-help">Used for highlights and primary accents.</span>
                                </div>

                                <div class="custom-theme-field">
                                    <label class="settings-label" for="theme-secondary-color">Secondary Color</label>
                                    <div class="color-picker-group">
                                        <input type="color" id="theme-secondary-color" class="color-picker">
                                        <input type="text" id="theme-secondary-color-text" class="settings-input theme-color-input" placeholder="#ffffff" maxlength="7">
                                    </div>
                                    <span class="form-help">Used for subtle accents and borders.</span>
                                </div>

                                <div class="custom-theme-field">
                                    <label class="settings-label" for="theme-bg-color">Background Color</label>
                                    <div class="color-picker-group">
                                        <input type="color" id="theme-bg-color" class="color-picker">
                                        <input type="text" id="theme-bg-color-text" class="settings-input theme-color-input" placeholder="#0d0d0d" maxlength="7">
                                    </div>
                                    <span class="form-help">Base background behind the hex pattern.</span>
                                </div>

                                <div class="custom-theme-field">
                                    <label class="settings-label" for="theme-text-color">Text Color</label>
                                    <div class="color-picker-group">
                                        <input type="color" id="theme-text-color" class="color-picker">
                                        <input type="text" id="theme-text-color-text" class="settings-input theme-color-input" placeholder="#ffffff" maxlength="7">
                                    </div>
                                    <span class="form-help">Primary text color for content.</span>
                                </div>
                            </div>

                            <div class="theme-preview-banner" id="theme-preview">
                                <div class="theme-preview-label">Preview swatches</div>
                                <div class="theme-preview-chip primary"></div>
                                <div class="theme-preview-chip secondary"></div>
                                <div class="theme-preview-chip bg"></div>
                                <div class="theme-preview-chip text"></div>
                            </div>
                        </div>

                        <div class="settings-group">
                            <label class="settings-label" for="background-preset-select">Background Preset</label>
                            <select id="background-preset-select" class="settings-input">
                                <option value="none">None (Use theme colors only)</option>
                                <option value="dark-grid">Hex Grid (Default)</option>
                                <option value="night-city">Night City Skyline</option>
                                <option value="neon-grid">Neon Grid Streets</option>
                                <option value="racing-f1">Racing - F1 Highlights</option>
                                <option value="racing-rally">Racing - Rally Action</option>
                                <option value="racing-motogp">Racing - MotoGP Onboard</option>
                            </select>
                            <span class="form-help">
                                - Static presets above apply instantly as a live preview.
                            </span>
                        </div>

                        <div class="settings-group">
                            <div class="background-mode-options">
                                <label>
                                    <input type="radio" name="custom-bg-mode" value="none" checked>
                                    <span>Default Pattern</span>
                                </label>
                                <label>
                                    <input type="radio" name="custom-bg-mode" value="image">
                                    <span>Image URL</span>
                                </label>
                                <label>
                                    <input type="radio" name="custom-bg-mode" value="youtube">
                                    <span>YouTube Video</span>
                                </label>
                            </div>

                            <div class="settings-group compact">
                                <label class="settings-label" for="custom-bg-url">Custom Background Source</label>
                                <input type="url" id="custom-bg-url" class="settings-input" placeholder="Paste image URL or YouTube URL for background">
                                <span class="form-help">
                                    - Static presets above apply instantly as a live preview.
                                    - For custom: use image (jpg, png, webp, svg, etc.) or a full YouTube URL.
                                </span>
                            </div>
                        </div>
                    </div>
                `;
            case 'offline':
                return `
                    <div class="settings-tab ${isActive ? 'active' : ''}" data-tab="offline" role="tabpanel" aria-labelledby="settings-tab-offline">
                        <div class="tab-header">
                            <h3 id="settings-tab-offline">
                                <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
                                </svg>
                                Offline Mode
                            </h3>
                            <p>Cache games and assets for offline play when you lose internet connection.</p>
                        </div>

                        <div class="settings-group critical offline-mode-group">
                            <div class="offline-mode-toggle-wrapper">
                                <div class="offline-mode-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                        <polyline points="17,8 12,3 7,8"/>
                                        <line x1="12" y1="3" x2="12" y2="15"/>
                                    </svg>
                                </div>
                                <div class="offline-mode-content">
                                    <label class="settings-label offline-mode-label">
                                        <label class="switch-container">
                                            <input type="checkbox" id="offline-mode-toggle" class="setting-checkbox">
                                            <span class="switch-slider"></span>
                                        </label>
                                        Enable Offline Mode
                                    </label>
                                    <span class="form-help">
                                        Automatically caches core assets and selected games for uninterrupted play without internet.
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="offline-split-view">
                            <div class="offline-left-section">
                                <div class="cached-games-header">
                                    <div class="cached-games-header-content">
                                        <h4>
                                            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                                            </svg>
                                            Cached Games
                                        </h4>
                                        <div class="cache-statistics">
                                            <div class="cache-stat">
                                                <span class="cache-stat-value" id="cache-games-count">0</span>
                                                <span class="cache-stat-label">games cached</span>
                                            </div>
                                            <div class="cache-stat">
                                                <span class="cache-stat-value" id="cache-total-size">0 MB</span>
                                                <span class="cache-stat-label">total size</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div id="cached-games-list" class="cached-games-cards">
                                    <div class="no-games">
                                        <div class="no-games-icon">📦</div>
                                        <h5>No cached games yet</h5>
                                        <p>Games you select will appear here for offline play</p>
                                    </div>
                                </div>
                            </div>

                            <div class="offline-right-section">
                                <div class="browse-games-section" onclick="window.open('pages/games.html', '_blank')" role="button" tabindex="0">
                                    <div class="browse-games-content">
                                        <div class="browse-games-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <rect width="20" height="14" x="2" y="3" rx="2"/>
                                                <line x1="8" x2="16" y1="21" y2="21"/>
                                                <line x1="12" x2="12" y1="17" y2="21"/>
                                            </svg>
                                        </div>
                                        <h4>Browse & Select Games</h4>
                                        <p>Choose games to cache for offline play</p>
                                        <div class="browse-games-arrow">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path d="M7 17 17 7M7 7h10v10"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            case 'privacy':
                return `
                    <div class="settings-tab ${isActive ? 'active' : ''}" data-tab="privacy" role="tabpanel" aria-labelledby="settings-tab-privacy">
                        <div class="tab-header">
                            <h3 id="settings-tab-privacy">Privacy</h3>
                            <p>Cloaks, anti-close protection, panic keys, and related privacy behaviors.</p>
                        </div>

                        <div class="settings-group info">
                            <label class="settings-label" for="cloak-mode-select">Cloak Mode</label>
                            <select id="cloak-mode-select" class="settings-input">
                                <option value="none">None</option>
                                <option value="blob">Blob tab</option>
                                <option value="about:blank">About:blank</option>
                            </select>
                            <span class="form-help">
                                Select a single cloaking behavior: About:Blank or Blob Tab.
                            </span>
                        </div>

                        <div class="settings-group info">
                            <label class="settings-label">Tab Cloak</label>
                            <div class="cloak-list" id="cloak-list">
                            </div>
                            <span class="form-help">
                                Changes tab title and icon only. Selection is stored and applied globally.
                            </span>
                        </div>

                        <div class="settings-group info">
                            <label class="settings-label">
                                <label class="switch-container">
                                    <input type="checkbox" id="cloak-rotation-toggle" class="setting-checkbox">
                                    <span class="switch-slider"></span>
                                </label>
                                Rotating Cloaks
                                <span id="cloak-rotation-indicator" class="rotation-indicator" style="display: none;">🔄</span>
                            </label>
                            <div id="cloak-rotation-settings" class="rotation-settings" style="display: none;">
                                <div class="settings-group compact">
                                    <label class="settings-label" for="cloak-rotation-interval">Rotation Interval</label>
                                    <input type="range" id="cloak-rotation-interval" class="settings-input" min="0.5" max="10" step="0.5" value="1.0">
                                    <span class="form-help">
                                        <span id="rotation-interval-value">1.0s</span> - Time between cloak changes (0.5-10 seconds)
                                    </span>
                                </div>
                            </div>
                            <span class="form-help">
                                Automatically cycle through available cloaks at the specified interval.
                            </span>
                        </div>





                        <div class="settings-group critical">
                            <label class="settings-label">
                                <label class="switch-container">
                                    <input type="checkbox" id="anti-close-toggle" class="setting-checkbox">
                                    <span class="switch-slider"></span>
                                </label>
                                Anti-close Protection
                            </label>
                            <span class="form-help">
                                When enabled, warns before closing the tab.
                            </span>
                        </div>

                        <div class="settings-group critical">
                            <label class="settings-label" for="panic-keys-select">Panic Keys</label>
                            <select id="panic-keys-select" class="settings-input">
                                <option value="none">None</option>
                                <option value="ctrl+shift+k">Ctrl+Shift+K</option>
                                <option value="ctrl+shift+x">Ctrl+Shift+X</option>
                                <option value="custom">Custom...</option>
                            </select>
                            <div id="custom-panic-settings" class="custom-panic-settings" style="display: none;">
                                <div class="settings-group compact">
                                    <label class="settings-label" for="custom-panic-key">Custom Key Combination</label>
                                    <input type="text" id="custom-panic-key" class="settings-input" placeholder="Press keys..." readonly>
                                    <button type="button" id="set-custom-panic-key" class="btn btn-secondary">Set Key</button>
                                    <span class="form-help">Click "Set Key" and press your desired key combination.</span>
                                </div>
                                <div class="settings-group compact">
                                    <label class="settings-label" for="custom-panic-url">Custom Redirect URL</label>
                                    <input type="url" id="custom-panic-url" class="settings-input" placeholder="https://example.com">
                                    <span class="form-help">URL to redirect to when panic keys are pressed.</span>
                                </div>
                            </div>
                            <span class="form-help">
                                Triggers a fast safety action when pressed.
                            </span>
                        </div>
                    </div>
                `;
            case 'ai':
                return `
                    <div class="settings-tab ${isActive ? 'active' : ''}" data-tab="ai" role="tabpanel" aria-labelledby="settings-tab-ai">
                        <div class="tab-header">
                            <h3 id="settings-tab-ai">AI Settings</h3>
                            <p>Configure AI model parameters and conversation settings.</p>
                        </div>

                        <div class="settings-section">
                            <h4>Model Configuration</h4>
                            <div class="settings-group">
                                <label class="settings-label" for="ai-temperature-slider">
                                    <span class="setting-name">Model Temperature</span>
                                    <span class="setting-description">Controls randomness in AI responses</span>
                                </label>
                                <div class="control-group">
                                    <div class="range-wrapper">
                                        <input
                                            type="range"
                                            id="ai-temperature-slider"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value="0.7"
                                            class="settings-input"
                                        >
                                        <span class="settings-value" id="ai-temperature-value">0.7</span>
                                    </div>
                                    <div class="range-labels">
                                        <span>Conservative</span>
                                        <span>Creative</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="settings-section">
                            <h4>Conversation Settings</h4>
                            <div class="settings-group">
                                <label class="settings-label">
                                    <div class="setting-info">
                                        <span class="setting-name">Auto-save Conversations</span>
                                        <span class="setting-description">Automatically save conversations to local storage as you chat</span>
                                    </div>
                                    <label class="switch-container">
                                        <input type="checkbox" id="ai-auto-save-toggle" class="setting-checkbox" checked>
                                        <span class="switch-slider"></span>
                                    </label>
                                </label>
                            </div>
                            <div class="settings-group">
                                <label class="settings-label" for="ai-clear-conversations-btn">
                                    <span class="setting-name">Clear Conversations</span>
                                    <span class="setting-description">Remove all saved conversations from local storage</span>
                                </label>
                                <button class="btn btn-secondary" id="ai-clear-conversations-btn">
                                    Clear All Conversations
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            default:
                return '';
        }
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'settings-modal-overlay hidden';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'settings-modal-title');
        modal.innerHTML = `
            <div class="settings-modal-container" tabindex="-1">
                <!-- Modal Header -->
                <div class="settings-header">
                    <h2 class="settings-title" id="settings-modal-title">
                        <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        Settings
                    </h2>
                    <button class="settings-close-btn" id="settings-close-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M18 6 6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <!-- Modal Content -->
                <div class="settings-content">
                    <!-- Sidebar Navigation -->
                    <div class="settings-sidebar">
                        <nav class="settings-nav" role="tablist">
                            ${this.generateNavigationHTML()}
                        </nav>
                    </div>

                    <!-- Settings Forms -->
                    <div class="settings-main">
                        ${this.generateTabContentHTML()}

                        <!-- Appearance Tab -->
                        <div class="settings-tab" data-tab="appearance" role="tabpanel" aria-labelledby="settings-tab-appearance">
                            <div class="tab-header">
                                <h3 id="settings-tab-appearance">Appearance</h3>
                                <p>Theme presets and custom colors. Changes apply instantly to the UI.</p>
                            </div>

                            <!-- Theme presets -->
                            <div class="settings-group">
                                <label class="settings-label" for="theme-preset-select">Theme Preset</label>
                                <select id="theme-preset-select" class="settings-input">
                                    <option value="dark">Dark</option>
                                    <option value="ocean">Ocean</option>
                                    <option value="forest">Forest</option>
                                    <option value="custom">Custom (use colors below)</option>
                                </select>
                                <span class="form-help">Pick a base theme or choose Custom and tune the colors below.</span>
                            </div>

                            <!-- Global Color Thief Toggle -->
                            <div class="settings-group info">
                                <label class="settings-label">
                                    <label class="switch-container">
                                        <input type="checkbox" id="global-color-thief-toggle" class="setting-checkbox">
                                        <span class="switch-slider"></span>
                                    </label>
                                    Enable Global Color Thief
                                </label>
                                <span class="form-help">
                                    Automatically extract dominant colors from album art, posters, and other images to create dynamic themes.
                                </span>
                            </div>

                            <!-- Custom Theme Editor -->
                            <div class="settings-group info">
                                <div class="tab-subheader">
                                    <h4>Custom Theme</h4>
                                    <p>Tweak core colors. Values must be valid hex codes (e.g. #0d0d0d or #fff).</p>
                                </div>

                                <div class="custom-theme-grid">
                                    <div class="custom-theme-field">
                                        <label class="settings-label" for="theme-primary-color">Primary Color</label>
                                        <div class="color-picker-group">
                                            <input type="color" id="theme-primary-color" class="color-picker">
                                            <input type="text" id="theme-primary-color-text" class="settings-input theme-color-input" placeholder="#a1a1a6" maxlength="7">
                                        </div>
                                        <span class="form-help">Used for highlights and primary accents.</span>
                                    </div>

                                    <div class="custom-theme-field">
                                        <label class="settings-label" for="theme-secondary-color">Secondary Color</label>
                                        <div class="color-picker-group">
                                            <input type="color" id="theme-secondary-color" class="color-picker">
                                            <input type="text" id="theme-secondary-color-text" class="settings-input theme-color-input" placeholder="#ffffff" maxlength="7">
                                        </div>
                                        <span class="form-help">Used for subtle accents and borders.</span>
                                    </div>

                                    <div class="custom-theme-field">
                                        <label class="settings-label" for="theme-bg-color">Background Color</label>
                                        <div class="color-picker-group">
                                            <input type="color" id="theme-bg-color" class="color-picker">
                                            <input type="text" id="theme-bg-color-text" class="settings-input theme-color-input" placeholder="#0d0d0d" maxlength="7">
                                        </div>
                                        <span class="form-help">Base background behind the hex pattern.</span>
                                    </div>

                                    <div class="custom-theme-field">
                                        <label class="settings-label" for="theme-text-color">Text Color</label>
                                        <div class="color-picker-group">
                                            <input type="color" id="theme-text-color" class="color-picker">
                                            <input type="text" id="theme-text-color-text" class="settings-input theme-color-input" placeholder="#ffffff" maxlength="7">
                                        </div>
                                        <span class="form-help">Primary text color for content.</span>
                                    </div>
                                </div>

                                <div class="theme-preview-banner" id="theme-preview">
                                    <div class="theme-preview-label">Preview swatches</div>
                                    <div class="theme-preview-chip primary"></div>
                                    <div class="theme-preview-chip secondary"></div>
                                    <div class="theme-preview-chip bg"></div>
                                    <div class="theme-preview-chip text"></div>
                                </div>
                            </div>

                            <!-- Predefined background options -->
                            <div class="settings-group">
                                <label class="settings-label" for="background-preset-select">Background Preset</label>
                                <select id="background-preset-select" class="settings-input">
                                    <option value="none">None (Use theme colors only)</option>
                                    <option value="dark-grid">Hex Grid (Default)</option>
                                    <option value="night-city">Night City Skyline</option>
                                    <option value="neon-grid">Neon Grid Streets</option>
                                    <option value="racing-f1">Racing - F1 Highlights</option>
                                    <option value="racing-rally">Racing - Rally Action</option>
                                    <option value="racing-motogp">Racing - MotoGP Onboard</option>
                                </select>
                                <span class="form-help">
                                    - Static presets above apply instantly as a live preview.
                                </span>
                            </div>

                            <!-- Custom mode + URL (image or YouTube; applies to real background, no inline player) -->
                            <div class="settings-group">
                                <div class="background-mode-options">
                                    <label>
                                        <input type="radio" name="custom-bg-mode" value="none" checked>
                                        <span>Default Pattern</span>
                                    </label>
                                    <label>
                                        <input type="radio" name="custom-bg-mode" value="image">
                                        <span>Image URL</span>
                                    </label>
                                    <label>
                                        <input type="radio" name="custom-bg-mode" value="youtube">
                                        <span>YouTube Video</span>
                                    </label>
                                </div>

                                <div class="settings-group compact">
                                    <label class="settings-label" for="custom-bg-url">Custom Background Source</label>
                                    <input type="url" id="custom-bg-url" class="settings-input" placeholder="Paste image URL or YouTube URL for background">
                                    <span class="form-help">
                                        - Static presets above apply instantly as a live preview.
                                        - For custom: use image (jpg, png, webp, svg, etc.) or a full YouTube URL.
                                    </span>
                                </div>
                            </div>
                        </div>


                        <!-- Offline Tab -->
                        <div class="settings-tab" data-tab="offline" role="tabpanel" aria-labelledby="settings-tab-offline">
                            <div class="tab-header">
                                <h3 id="settings-tab-offline">Offline</h3>
                                <p>Control offline mode and cached games.</p>
                            </div>

                            <!-- Offline toggle -->
                            <div class="settings-group critical">
                                <label class="settings-label">
                                    <label class="switch-container">
                                        <input type="checkbox" id="offline-mode-toggle" class="setting-checkbox">
                                        <span class="switch-slider"></span>
                                    </label>
                                    Enable Offline Mode
                                </label>
                                <span class="form-help">
                                    Caches core assets and selected games so they keep working when you lose connection.
                                </span>
                            </div>

                            <!-- Split-view Layout -->
                            <div class="offline-split-view">
                                <!-- Left Section: Cached Games -->
                                <div class="offline-left-section">
                                    <div class="cached-games-header">
                                        <h4>Cached Games</h4>
                                        <div class="cache-statistics">
                                            <span id="cache-games-count">0</span> games cached •
                                            <span id="cache-total-size">0 MB</span> total
                                        </div>
                                    </div>
                                    <div id="cached-games-list" class="cached-games-cards">
                                        <div class="no-games">No cached games</div>
                                    </div>
                                </div>

                                <!-- Right Section: Browse Games -->
                                <div class="offline-right-section">
                                    <div class="browse-games-section" onclick="window.open('pages/games.html', '_blank')">
                                        <div class="browse-games-content">
                                            <div class="browse-games-icon">🎮</div>
                                            <h4>Click to browse all games</h4>
                                            <p>Select games to cache for offline play</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <!-- AI Tab -->
                        <div class="settings-tab" data-tab="ai" role="tabpanel" aria-labelledby="settings-tab-ai">
                            <div class="tab-header">
                                <h3 id="settings-tab-ai">AI Settings</h3>
                                <p>Configure AI model parameters and conversation settings.</p>
                            </div>

                            <div class="settings-section">
                                <h4>Model Configuration</h4>
                                <div class="settings-group">
                                    <label class="settings-label" for="ai-temperature-slider">
                                        <span class="setting-name">Model Temperature</span>
                                        <span class="setting-description">Controls randomness in AI responses</span>
                                    </label>
                                    <div class="control-group">
                                        <div class="range-wrapper">
                                            <input
                                                type="range"
                                                id="ai-temperature-slider"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value="0.7"
                                                class="settings-input"
                                            >
                                            <span class="settings-value" id="ai-temperature-value">0.7</span>
                                        </div>
                                        <div class="range-labels">
                                            <span>Conservative</span>
                                            <span>Creative</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="settings-section">
                                <h4>Conversation Settings</h4>
                                <div class="settings-group">
                                    <label class="settings-label">
                                        <div class="setting-info">
                                            <span class="setting-name">Auto-save Conversations</span>
                                            <span class="setting-description">Automatically save conversations to local storage as you chat</span>
                                        </div>
                                        <label class="switch-container">
                                            <input type="checkbox" id="ai-auto-save-toggle" class="setting-checkbox" checked>
                                            <span class="switch-slider"></span>
                                        </label>
                                    </label>
                                </div>
                                <div class="settings-group">
                                    <label class="settings-label" for="ai-clear-conversations-btn">
                                        <span class="setting-name">Clear Conversations</span>
                                        <span class="setting-description">Remove all saved conversations from local storage</span>
                                    </label>
                                    <button class="btn btn-secondary" id="ai-clear-conversations-btn">
                                        Clear All Conversations
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Privacy Tab -->
                        <div class="settings-tab" data-tab="privacy" role="tabpanel" aria-labelledby="settings-tab-privacy">
                            <div class="tab-header">
                                <h3 id="settings-tab-privacy">Privacy</h3>
                                <p>Cloaks, anti-close protection, panic keys, and related privacy behaviors.</p>
                            </div>

                            <!-- Cloak selection -->
                            <div class="settings-group info">
                                <label class="settings-label">Tab Cloak</label>
                                <div class="cloak-list" id="cloak-list">
                                    <!-- Populated from this.cloaks -->
                                </div>
                                <span class="form-help">
                                    Changes tab title and icon only. Selection is stored and applied globally.
                                </span>
                            </div>

                            <!-- Rotating Cloaks -->
                            <div class="settings-group info">
                                <label class="settings-label">
                                    <label class="switch-container">
                                        <input type="checkbox" id="cloak-rotation-toggle" class="setting-checkbox">
                                        <span class="switch-slider"></span>
                                    </label>
                                    Rotating Cloaks
                                    <span id="cloak-rotation-indicator" class="rotation-indicator" style="display: none;">🔄</span>
                                </label>
                                <span class="form-help">
                                    Automatically cycle through available cloaks at the specified interval.
                                </span>
                                <div id="cloak-rotation-settings" class="rotation-settings" style="display: none;">
                                    <div class="settings-group compact">
                                        <label class="settings-label" for="cloak-rotation-interval">Rotation Interval</label>
                                        <input type="range" id="cloak-rotation-interval" class="settings-input" min="0.5" max="10" step="0.5" value="1.0">
                                        <span class="settings-value" id="rotation-interval-value">1.0s</span>
                                        <div class="range-labels">
                                            <span>Fast</span>
                                            <span>Slow</span>
                                        </div>
                                    </div>
                                </div>
                            </div>



                            <!-- Cloak mode -->
                            <div class="settings-group info">
                                <label class="settings-label" for="cloak-mode-select">Cloak Mode</label>
                                <select id="cloak-mode-select" class="settings-input">
                                    <option value="none">None</option>
                                    <option value="blob">Blob tab</option>
                                    <option value="about:blank">About:blank</option>
                                </select>
                                <span class="form-help">
                                    Select a single cloaking behavior: About:Blank or Blob Tab.
                                </span>
                            </div>

                            <!-- Anti-close -->
                            <div class="settings-group critical">
                                <label class="settings-label">
                                    <label class="switch-container">
                                        <input type="checkbox" id="anti-close-toggle" class="setting-checkbox">
                                        <span class="switch-slider"></span>
                                    </label>
                                    Anti-close Protection
                                </label>
                                <span class="form-help">
                                    When enabled, warns before closing the tab.
                                </span>
                            </div>

                            <!-- Panic Keys -->
                            <div class="settings-group critical">
                                <label class="settings-label" for="panic-keys-select">Panic Keys</label>
                                <select id="panic-keys-select" class="settings-input">
                                    <option value="none">None</option>
                                    <option value="ctrl+shift+k">Ctrl+Shift+K</option>
                                    <option value="ctrl+shift+x">Ctrl+Shift+X</option>
                                    <option value="custom">Custom...</option>
                                </select>
                                <div id="custom-panic-settings" class="custom-panic-settings" style="display: none;">
                                    <div class="settings-group compact">
                                        <label class="settings-label" for="custom-panic-key">Custom Key Combination</label>
                                        <input type="text" id="custom-panic-key" class="settings-input" placeholder="Press keys..." readonly>
                                        <button type="button" id="set-custom-panic-key" class="btn btn-secondary">Set Key</button>
                                        <span class="form-help">Click "Set Key" and press your desired key combination.</span>
                                    </div>
                                    <div class="settings-group compact">
                                        <label class="settings-label" for="custom-panic-url">Custom Redirect URL</label>
                                        <input type="url" id="custom-panic-url" class="settings-input" placeholder="https://example.com">
                                        <span class="form-help">URL to redirect to when panic keys are pressed.</span>
                                    </div>
                                </div>
                                <span class="form-help">
                                    Triggers a fast safety action when pressed.
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="settings-footer">
                    <div class="settings-autosave-note" aria-live="polite">
                        Settings save automatically as you change them.
                    </div>
                    <button type="button" id="cancel-settings" class="btn btn-secondary">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modal = modal;

        // Create the Add Cloak Modal (hidden by default)
        this.createAddCloakModal();

        this.cacheElements();
        SettingsModal.initSlider('ai-temperature-slider');
    }

    createAddCloakModal() {
        const modal = document.createElement('div');
        modal.className = 'custom-cloak-modal hidden';
        modal.id = 'add-cloak-modal';
        modal.innerHTML = `
            <div class="settings-modal-container small-modal">
                <div class="settings-header">
                    <h2 class="settings-title">Add New Cloak</h2>
                    <button class="settings-close-btn" id="close-add-cloak-modal">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M18 6 6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="settings-main">
                    <div class="settings-group">
                        <label class="settings-label" for="new-cloak-title">Tab Title</label>
                        <input type="text" id="new-cloak-title" class="settings-input" placeholder="Edpuzzle">
                    </div>
                    <div class="settings-group">
                        <label class="settings-label" for="new-cloak-icon">Favicon URL</label>
                        <input type="url" id="new-cloak-icon" class="settings-input" placeholder="https://edpuzzle.imgix.net/favicons/favicon-32.png">
                    </div>
                </div>
                <div class="settings-footer">
                    <button type="button" class="btn btn-secondary" id="cancel-add-cloak">Cancel</button>
                    <button type="button" class="btn btn-primary" id="save-add-cloak">Add Cloak</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Bind events for this modal
        const closeBtn = modal.querySelector('#close-add-cloak-modal');
        const cancelBtn = modal.querySelector('#cancel-add-cloak');
        const saveBtn = modal.querySelector('#save-add-cloak');
        const inputs = modal.querySelectorAll('input');

        const close = () => {
            modal.classList.add('hidden');
            inputs.forEach(i => i.value = '');
        };

        closeBtn.onclick = close;
        cancelBtn.onclick = close;

        saveBtn.onclick = () => {
            const title = modal.querySelector('#new-cloak-title').value.trim();
            const icon = modal.querySelector('#new-cloak-icon').value.trim();
            if (title && icon) {
                this.handleSaveCustomCloak(title, icon);
                close();
            } else {
                if (window.notify) window.notify('Please fill in both fields', 'warn');
                else alert('Please fill in both fields');
            }
        };

        // Close on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });
    }

    handleSaveCustomCloak(title, icon) {
        if (!window.CloakRotationManager) return;
        try {
            window.CloakRotationManager.addCustomCloak(title, icon);
            this.renderCloakList(); // Re-render the main list
            if (window.notify) window.notify('Custom cloak added!', 'success');
        } catch (error) {
            console.error(error);
            if (window.notify) window.notify('Failed to add cloak', 'error');
        }
    }

    cacheElements() {
        if (!this.modal) {
            console.warn('SettingsModal modal not found, skipping element caching');
            return;
        }

        const safeQuery = (selector) => {
            try {
                return this.modal.querySelector(selector);
            } catch (error) {
                console.warn(`Failed to query element ${selector}:`, error);
                return null;
            }
        };

        const safeQueryAll = (selector) => {
            try {
                return this.modal.querySelectorAll(selector);
            } catch (error) {
                console.warn(`Failed to query elements ${selector}:`, error);
                return [];
            }
        };

        this.elements = {
            closeBtn: safeQuery('#settings-close-btn'),
            cancelBtn: safeQuery('#cancel-settings'),

            // Movies settings
            maxRatingSelect: safeQuery('#max-rating-select'),
            hideNcNrToggle: safeQuery('#hide-nc-nr-toggle'),
            moviesProxyEnabledToggle: safeQuery('#movies-proxy-enabled-toggle'),

            // Navigation
            navItems: safeQueryAll('.settings-nav-item'),
            tabs: safeQueryAll('.settings-tab'),

            // Library
            librarySelect: safeQuery('#library-select'),

            // Offline
            offlineModeToggle: safeQuery('#offline-mode-toggle'),
            cachedGamesList: safeQuery('#cached-games-list'),
            cacheGamesCount: safeQuery('#cache-games-count'),
            cacheTotalSize: safeQuery('#cache-total-size'),

            // Appearance
            themePresetSelect: safeQuery('#theme-preset-select'),
            backgroundPresetSelect: safeQuery('#background-preset-select'),
            customBgUrl: safeQuery('#custom-bg-url'),
            customBgModeRadios: safeQueryAll('input[name="custom-bg-mode"]'),
            themePreviewChips: safeQueryAll('#theme-preview .theme-preview-chip'),
            // Custom theme editor
            primaryColor: safeQuery('#theme-primary-color'),
            primaryColorText: safeQuery('#theme-primary-color-text'),
            secondaryColor: safeQuery('#theme-secondary-color'),
            secondaryColorText: safeQuery('#theme-secondary-color-text'),
            bgColor: safeQuery('#theme-bg-color'),
            bgColorText: safeQuery('#theme-bg-color-text'),
            textColor: safeQuery('#theme-text-color'),
            textColorText: safeQuery('#theme-text-color-text'),
            themePreview: safeQuery('#theme-preview'),

            // Privacy (cloak + safety)
            cloakModeSelect: safeQuery('#cloak-mode-select'),
            antiCloseToggle: safeQuery('#anti-close-toggle'),
            panicKeysSelect: safeQuery('#panic-keys-select'),
            cloakList: safeQuery('#cloak-list'),

            // AI settings
            aiTemperatureSlider: safeQuery('#ai-temperature-slider'),
            aiTemperatureValue: safeQuery('#ai-temperature-value'),
            aiAutoSaveToggle: safeQuery('#ai-auto-save-toggle'),
            aiClearConversationsBtn: safeQuery('#ai-clear-conversations-btn'),

            // Global Color Thief
            globalColorThiefToggle: safeQuery('#global-color-thief-toggle'),

            // WidgetBot
            widgetbotEnabledToggle: safeQuery('#widgetbot-enabled-toggle'),

            // Custom Panic Keys
            customPanicSettings: safeQuery('#custom-panic-settings'),
            customPanicKey: safeQuery('#custom-panic-key'),
            setCustomPanicKey: safeQuery('#set-custom-panic-key'),
            customPanicUrl: safeQuery('#custom-panic-url'),


            // Cloak Rotation
            cloakRotationToggle: safeQuery('#cloak-rotation-toggle'),
            cloakRotationIndicator: safeQuery('#cloak-rotation-indicator'),
            cloakRotationSettings: safeQuery('#cloak-rotation-settings'),
            cloakRotationInterval: safeQuery('#cloak-rotation-interval'),
            rotationIntervalValue: safeQuery('#rotation-interval-value')
        };

        // Note: avoid noisy console logs in production; use errors/warnings only when needed.
    }

    bindEvents() {
        // Navigation
        if (this.elements.navItems && this.elements.navItems.length > 0) {
            this.elements.navItems.forEach(item => {
                if (!item) return;
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.switchTab(item.dataset.tab);
                });
            });
        }

        // Modal controls
        if (this.elements.closeBtn) {
            this.elements.closeBtn.addEventListener('click', () => this.close());
        }
        if (this.elements.cancelBtn) {
            this.elements.cancelBtn.addEventListener('click', () => this.close());
        }

        // Close on overlay click (only when clicking true backdrop)
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }

        // Keyboard shortcuts while modal is open
        document.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;

            // Always allow ESC to close
            if (e.key === 'Escape') {
                e.preventDefault();
                this.close();
                return;
            }
        });

        // Library selection
        if (this.elements.librarySelect) {
            this.elements.librarySelect.addEventListener('change', (e) => {
                const libraryType = e.target.value;
                const libraryUrl = libraryType === 'default' ? 'components/zones.json' : 'components/zones2.json';
                this.selectLibrary(libraryType, libraryUrl);

                // Dispatch event for games.html to listen
                window.dispatchEvent(new CustomEvent('alternateGameLibraryChanged', {
                    detail: { enabled: libraryType === 'alt' }
                }));
            });
        }

        // Cached games list interactions
        if (this.elements.cachedGamesList) {
            this.elements.cachedGamesList.addEventListener('click', (e) => {
                if (e.target && e.target.matches('.btn-remove-game')) {
                    const gameId = e.target.closest('.cached-game-item').dataset.gameId;
                    this.removeCachedGame(gameId);
                }
            });
        }

        // Custom theme editor bindings (live preview + debounced persist)
        const bindColorPair = (picker, text, cssVar) => {
            if (!picker || !text) return;

            const applyLive = (value, fromPicker = false) => {
                if (this.isValidColor(value)) {
                    picker.value = value;
                    text.value = value;
                    document.documentElement.style.setProperty(cssVar, value);
                    this.setFieldValidity(text, true);
                    this.updateThemePreviewChips();

                    // Any direct color change promotes the preset to "custom"
                    if (this.elements.themePresetSelect && this.elements.themePresetSelect.value !== 'custom') {
                        this.elements.themePresetSelect.value = 'custom';
                    }

                    // Ensure settings object exists and reflect custom mode
                    this.settings = this.settings || this.getDefaultSettings();
                    this.settings.themePreset = 'custom';

                    switch (cssVar) {
                        case '--primary-color':
                            this.settings.primaryColor = value;
                            break;
                        case '--secondary-color':
                            this.settings.secondaryColor = value;
                            break;
                        case '--background-color':
                            this.settings.backgroundColor = value;
                            break;
                        case '--text-color':
                            this.settings.textColor = value;
                            break;
                    }

                    // Use debounced application so collect/persist run reliably
                    this.debounceThemeApplication();
                } else if (!fromPicker) {
                    this.setFieldValidity(text, false);
                }
            };

            picker.addEventListener('input', (e) => applyLive(e.target.value, true));
            text.addEventListener('input', (e) => applyLive(e.target.value));
        };

        bindColorPair(this.elements.primaryColor, this.elements.primaryColorText, '--primary-color');
        bindColorPair(this.elements.secondaryColor, this.elements.secondaryColorText, '--secondary-color');
        bindColorPair(this.elements.bgColor, this.elements.bgColorText, '--background-color');
        bindColorPair(this.elements.textColor, this.elements.textColorText, '--text-color');

        // Background preset dropdown: maps to static and racing video backgrounds (no live iframe here)
        if (this.elements.backgroundPresetSelect) {
            this.elements.backgroundPresetSelect.addEventListener('change', () => {
                const value = this.elements.backgroundPresetSelect.value;
                let customBgConfig = null;

                switch (value) {
                    case 'none':
                        customBgConfig = { type: 'none' }; // solid color only
                        break;
                    case 'dark-grid':
                        customBgConfig = null; // use default CSS hex grid
                        break;
                    case 'night-city':
                        customBgConfig = { type: 'image', url: 'https://images.pexels.com/photos/2837009/pexels-photo-2837009.jpeg?auto=compress&cs=tinysrgb&w=1600' };
                        break;
                    case 'neon-grid':
                        customBgConfig = { type: 'image', url: 'https://images.pexels.com/photos/1322185/pexels-photo-1322185.jpeg?auto=compress&cs=tinysrgb&w=1600' };
                        break;
                    case 'racing-f1':
                        customBgConfig = { type: 'youtube', videoId: '2x5bT-k64hA' };
                        break;
                    case 'racing-rally':
                        customBgConfig = { type: 'youtube', videoId: 'dR2vR8VnXj0' };
                        break;
                    case 'racing-motogp':
                        customBgConfig = { type: 'youtube', videoId: 'z4zE8ApsW6s' };
                        break;
                    default:
                        customBgConfig = null;
                }

                const presetKey = (this.elements.themePresetSelect && this.elements.themePresetSelect.value) || 'dark';
                this.applyThemePreset(presetKey, customBgConfig || null);

                // Sync radio + URL for custom modes when appropriate
                if (this.elements.customBgModeRadios && this.elements.customBgUrl) {
                    if (!customBgConfig) {
                        this.elements.customBgModeRadios.forEach(r => { r.checked = r.value === 'none'; });
                        this.elements.customBgUrl.value = '';
                    } else if (customBgConfig.type === 'image') {
                        this.elements.customBgModeRadios.forEach(r => { r.checked = r.value === 'image'; });
                        this.elements.customBgUrl.value = customBgConfig.url;
                    } else if (customBgConfig.type === 'youtube') {
                        this.elements.customBgModeRadios.forEach(r => { r.checked = r.value === 'youtube'; });
                        this.elements.customBgUrl.value = `https://www.youtube.com/watch?v=${customBgConfig.videoId}`;
                    }
                }

                // Persist new settings
                const updated = this.collectSettings();
                this.persistSettings(updated);
            });
        }

        // Custom background handling (no embedded live preview: only apply theme/background)
        if (this.elements.customBgModeRadios && this.elements.customBgUrl) {
            const applyBackgroundConfig = () => {
                const rawUrl = this.elements.customBgUrl.value.trim();
                let mode = 'none';
                this.elements.customBgModeRadios.forEach(r => {
                    if (r.checked) mode = r.value;
                });

                let url = rawUrl;
                // Auto-convert YouTube watch URLs to embed-compatible videoId
                let config = null;
                if (mode === 'image' && url && this.isLikelyImageUrl(url)) {
                    config = { type: 'image', url };
                } else if (mode === 'youtube' && url) {
                    const id = this.extractYouTubeVideoId(url);
                    if (id) {
                        config = { type: 'youtube', videoId: id };
                    }
                }

                const presetKey = (this.elements.themePresetSelect && this.elements.themePresetSelect.value) || 'dark';
                this.applyThemePreset(presetKey, config || null);

                // Persist immediately for consistent behavior across pages
                const updated = this.collectSettings();
                this.persistSettings(updated);
            };

            this.elements.customBgModeRadios.forEach(r => {
                r.addEventListener('change', applyBackgroundConfig);
            });
            this.elements.customBgUrl.addEventListener('input', applyBackgroundConfig);
        }

        // Initialize cloak list in Privacy tab
        if (this.elements.cloakList) {
            this.renderCloakList();
        }

        // Initialize cloak rotation settings (wait for rotation manager to be ready)
        setTimeout(() => {
            this.initializeCloakRotationUI();
            this.initializeCloakRotationToggleBehavior();
        }, 100);

        // Initialize global color thief toggle
        this.initializeGlobalColorThief();

        // Initialize custom panic keys
        this.initializeCustomPanicKeys();


        // Initialize current library display
        this.updateCurrentLibraryDisplay();

        // Auto-save bindings: listen to changes on core inputs
        const autoSaveTargets = [
            this.elements.themePresetSelect,
            this.elements.customBgUrl,
            this.elements.primaryLibrarySelect,
            this.elements.altLibrarySelect,
            this.elements.offlineModeToggle,
            this.elements.antiCloseToggle,
            this.elements.panicKeysSelect,
            this.elements.cloakModeSelect,
            this.elements.globalColorThiefToggle,
            this.elements.widgetbotEnabledToggle,
            this.elements.maxRatingSelect,
            this.elements.moviesProxyEnabledToggle
        ];

        autoSaveTargets.forEach(el => {
            if (!el) return;
            const eventName = (el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'radio') ? 'change' : 'input';
            el.addEventListener(eventName, () => this.autoSaveFromEvent());
        });

        if (this.elements.customBgModeRadios && this.elements.customBgModeRadios.length) {
            this.elements.customBgModeRadios.forEach(radio => {
                radio.addEventListener('change', () => this.autoSaveFromEvent());
            });
        }

        if (this.elements.offlineGamesList) {
            this.elements.offlineGamesList.addEventListener('change', () => this.autoSaveFromEvent());
        }

        // Cloak mode dropdown auto-save
        if (this.elements.cloakModeSelect) {
            this.elements.cloakModeSelect.addEventListener('change', () => this.autoSaveFromEvent());
        }

        // Cloak rotation auto-save
        if (this.elements.cloakRotationToggle) {
            this.elements.cloakRotationToggle.addEventListener('change', () => this.autoSaveFromEvent());
        }

        if (this.elements.cloakRotationInterval) {
            this.elements.cloakRotationInterval.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                if (this.elements.rotationIntervalValue) {
                    this.elements.rotationIntervalValue.textContent = `${value}s`;
                }
                this.autoSaveFromEvent();
            });
        }

        // AI settings auto-save
        if (this.elements.aiTemperatureSlider) {
            this.elements.aiTemperatureSlider.addEventListener('input', () => {
                if (this.elements.aiTemperatureValue) {
                    this.elements.aiTemperatureValue.textContent = this.elements.aiTemperatureSlider.value;
                }
                this.autoSaveFromEvent();
            });
        }
        if (this.elements.aiAutoSaveToggle) {
            this.elements.aiAutoSaveToggle.addEventListener('change', () => this.autoSaveFromEvent());
        }
        if (this.elements.aiClearConversationsBtn) {
            this.elements.aiClearConversationsBtn.addEventListener('click', () => this.clearAIConversations());
        }
    }

    clearAIConversations() {
        if (!confirm('Clear all AI conversations? This action cannot be undone.')) {
            return;
        }

        // Clear AI conversations from localStorage
        const STATE_KEY = 'unblockee_ai_state_v1';
        try {
            localStorage.removeItem(STATE_KEY);
            if (window.notify) {
                window.notify('AI conversations cleared successfully', 'success');
            } else {
                alert('AI conversations cleared successfully');
            }
            // Dispatch event to notify ai.html to reload
            window.dispatchEvent(new CustomEvent('aiConversationsCleared'));
        } catch (error) {
            console.error('Failed to clear AI conversations:', error);
            if (window.notify) {
                window.notify('Failed to clear AI conversations', 'error');
            } else {
                alert('Failed to clear AI conversations');
            }
        }

    }

    // Minimal validation for custom background URL
    setupFormValidation() {
        if (!this.elements.customBgUrl) return;
        this.elements.customBgUrl.addEventListener('blur', () => {
            const value = this.elements.customBgUrl.value.trim();
            if (!value) {
                this.setFieldValidity(this.elements.customBgUrl, true);
                return;
            }
            // Basic URL sanity (do not block non-URL patterns aggressively)
            try {
                new URL(value);
                this.setFieldValidity(this.elements.customBgUrl, true);
            } catch {
                this.setFieldValidity(this.elements.customBgUrl, false);
            }
        });
    }

    setFieldValidity(field, isValid) {
        if (isValid) {
            field.classList.remove('invalid');
        } else {
            field.classList.add('invalid');
        }
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    /**
     * Initialize global color thief toggle integration
     */
    initializeGlobalColorThief() {
        if (!this.elements.globalColorThiefToggle || !window.ColorThiefManager) return;

        // Set initial state
        this.elements.globalColorThiefToggle.checked = window.ColorThiefManager.enabled;

        // Handle toggle changes
        this.elements.globalColorThiefToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                window.ColorThiefManager.enable();
            } else {
                window.ColorThiefManager.disable();
            }
        });

        // Listen for external changes
        document.addEventListener('colorThiefApplied', () => {
            // Could update UI if needed
        });
    }


    /**
     * Initialize custom panic keys functionality
     */
    initializeCustomPanicKeys() {
        if (!this.elements.panicKeysSelect) return;

        // Show/hide custom settings based on selection
        this.elements.panicKeysSelect.addEventListener('change', (e) => {
            if (this.elements.customPanicSettings) {
                this.elements.customPanicSettings.style.display =
                    e.target.value === 'custom' ? 'block' : 'none';
            }
        });

        // Set custom key button
        if (this.elements.setCustomPanicKey) {
            this.elements.setCustomPanicKey.addEventListener('click', () => {
                this.setCustomPanicKey();
            });
        }

        // Load existing custom panic settings
        this.loadCustomPanicSettings();
    }

    /**
     * Update current library display
     */
    updateCurrentLibraryDisplay() {
        if (!this.elements.currentLibraryDisplay) return;

        const primary = localStorage.getItem('unblockee_primaryLibrary') || 'default';
        const alt = localStorage.getItem('unblockee_altLibraryFile') || '';

        let displayText = 'components/zones.json'; // default
        if (primary === 'alt' && alt) {
            displayText = alt;
        }

        this.elements.currentLibraryDisplay.textContent = displayText;
    }

    /**
     * Select a library option
     */
    selectLibrary(libraryType, libraryUrl) {
        if (libraryType === 'default') {
            localStorage.setItem('unblockee_primaryLibrary', 'default');
            localStorage.setItem('unblockee_altLibraryFile', '');
            localStorage.setItem('alternateGameLibraryEnabled', 'false');
        } else if (libraryType === 'alt') {
            localStorage.setItem('unblockee_primaryLibrary', 'alt');
            localStorage.setItem('unblockee_altLibraryFile', libraryUrl);
            localStorage.setItem('alternateGameLibraryEnabled', 'true');
        }

        // Update UI
        this.updateCurrentLibraryDisplay();

        // Reload offline games list with new library
        if (this.currentTab === 'offline') {
            this.loadOfflineGamesIntoList();
        }

        // Update visual indicators
        const libraryOptions = this.modal.querySelectorAll('.library-option');
        libraryOptions.forEach(option => {
            option.classList.remove('selected');
        });

        const selectedOption = this.modal.querySelector(`.library-option[data-library="${libraryType}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }

        // Auto-save
        this.autoSaveFromEvent();
    }

    /**
     * Load custom panic key settings
     */
    loadCustomPanicSettings() {
        try {
            const customKey = localStorage.getItem('unblockee_customPanicKey');
            const customUrl = localStorage.getItem('unblockee_customPanicUrl');

            if (this.elements.customPanicKey) {
                this.elements.customPanicKey.value = customKey || 'Press keys...';
            }
            if (this.elements.customPanicUrl && customUrl) {
                this.elements.customPanicUrl.value = customUrl;
            }

            if (this.elements.panicKeysSelect && customKey) {
                this.elements.panicKeysSelect.value = 'custom';
                if (this.elements.customPanicSettings) {
                    this.elements.customPanicSettings.style.display = 'block';
                }
            }
        } catch (error) {
            console.warn('Error loading custom panic settings:', error);
        }
    }

    /**
     * Set custom panic key combination
     */
    setCustomPanicKey() {
        if (!this.elements.customPanicKey) return;

        this.elements.customPanicKey.value = 'Press a key combination...';
        this.elements.customPanicKey.classList.add('recording');

        const keyHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const keys = [];
            if (e.ctrlKey || e.metaKey) keys.push('Ctrl');
            if (e.shiftKey) keys.push('Shift');
            if (e.altKey) keys.push('Alt');

            // Only allow modifier + one non-modifier key
            if (!['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
                keys.push(e.key === ' ' ? 'Space' : e.key);
            }

            if (keys.length >= 2) {
                const keyCombo = keys.join('+');
                this.elements.customPanicKey.value = keyCombo;
                this.elements.customPanicKey.classList.remove('recording');

                // Save to localStorage
                localStorage.setItem('unblockee_customPanicKey', keyCombo);

                document.removeEventListener('keydown', keyHandler, true);
                this.autoSaveFromEvent();
            }
        };

        document.addEventListener('keydown', keyHandler, true);
    }

    // Implement applyCloak and initializeCloakRotation methods
    applyCloak(cloakName) {
        const cloak = this.cloaks.find(c => c.name === cloakName) || this.cloaks[0];
        document.title = cloak.title;

        const existingFavicon = document.querySelector("link[rel*='icon']");
        if (existingFavicon) existingFavicon.remove();

        if (cloak.icon) {
            try {
                const link = document.createElement('link');
                link.rel = 'icon';
                const ext = cloak.icon.split('.').pop().toLowerCase();
                link.type = ext === 'png' ? 'image/png' : ext === 'svg' ? 'image/svg+xml' : 'image/x-icon';
                link.href = cloak.icon + (cloak.icon.includes('?') ? '&' : '?') + 'v=' + Date.now();

                // Add error handling for failed favicon loads
                link.onerror = () => {
                    console.warn(`Failed to load favicon: ${cloak.icon}, falling back to default`);
                    const defaultLink = document.createElement('link');
                    defaultLink.rel = 'icon';
                    defaultLink.type = 'image/x-icon';
                    defaultLink.href = 'data:image/x-icon;base64,AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAAAAAAAAAAP8A//8AAAD//wD/AAAAAP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/';
                    document.head.appendChild(defaultLink);
                };

                document.head.appendChild(link);
                StorageUtils.setObject('cloak', { title: cloak.title, icon: cloak.icon });
            } catch (error) {
                console.warn('Error setting favicon:', error);
                // Fallback to default favicon on any error
                const defaultLink = document.createElement('link');
                defaultLink.rel = 'icon';
                defaultLink.type = 'image/x-icon';
                defaultLink.href = 'data:image/x-icon;base64,AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAAAAAAAAAAP8A//8AAAD//wD/AAAAAP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/';
                document.head.appendChild(defaultLink);
            }
        }
    }

    initializeCloakRotation() {
        const { cloakRotation, rotationInterval } = this.settings.privacy;

        if (!cloakRotation) {
            // rotation disabled; nothing to schedule
            return;
        }

        let currentCloakIndex = 0;
        let rotationTimeout;

        const rotateCloak = () => {
            try {
                const cloak = this.cloaks[currentCloakIndex];
                if (!cloak) return;

                this.applyCloak(cloak.name);
                currentCloakIndex = (currentCloakIndex + 1) % this.cloaks.length;

                // Store current index for persistence
                StorageUtils.set('currentCloakIndex', currentCloakIndex.toString());

            } catch (error) {
                console.warn('Error rotating cloak:', error);
            }
        };

        const startRotation = () => {
            const intervalMs = Math.max(500, Math.min(10000, rotationInterval * 1000));
            rotationTimeout = setTimeout(() => {
                rotateCloak();
                startRotation(); // Continue rotation
            }, intervalMs);
        };

        const stopRotation = () => {
            if (rotationTimeout) {
                clearTimeout(rotationTimeout);
                rotationTimeout = null;
            }
        };

        // Initialize with saved index
        const savedIndex = parseInt(StorageUtils.get('currentCloakIndex', '0'));
        currentCloakIndex = Math.min(savedIndex, this.cloaks.length - 1);

        // Start initial rotation
        startRotation();

    }

    applyAntiClose(enabled) {
        // Centralized: driven by unblockee_antiClose (set from Cloaks/Privacy)
        const targetWindow = window.inFrame ? window.top : window;
        const handler = (e) => {
            e.preventDefault();
            e.returnValue = 'Are you sure you want to leave?';
            return 'Are you sure you want to leave?';
        };

        try {
            targetWindow.removeEventListener('beforeunload', handler);
            if (enabled) {
                targetWindow.addEventListener('beforeunload', handler);
            }
        } catch (error) {
            console.warn('Failed to apply anti-close handler:', error);
        }
    }

    // Legacy auto-launch is deprecated in the new model; kept as a no-op for safety.
    handleAutoLaunch() {
        return;
    }

    // Helper methods for UI updates
    toggleRotationIntervalVisibility() {
        if (this.elements.rotationIntervalGroup) {
            this.elements.rotationIntervalGroup.style.display = this.elements.cloakRotation.checked ? 'block' : 'none';
        }
    }

    updateRotationIntervalDisplay() {
        if (this.elements.rotationIntervalValue) {
            this.elements.rotationIntervalValue.textContent = this.elements.rotationInterval.value + 's';
        }
    }

    toggleAboutBlankSubgroupVisibility() {
        if (this.elements.aboutBlankLaunching && this.modal) {
            const subgroup = this.modal.querySelector('#about-blank-subgroup');
            if (subgroup) {
                subgroup.style.display = this.elements.aboutBlankLaunching.checked ? 'block' : 'none';
            }
        }
    }

    isValidColor(color) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    }

    isLikelyImageUrl(url) {
        return /\.(jpe?g|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url);
    }

    updateThemePreviewChips() {
        if (!this.elements.themePreview) return;
        const rootStyles = getComputedStyle(document.documentElement);
        const chips = this.elements.themePreview.querySelectorAll('.theme-preview-chip');
        chips.forEach(chip => {
            if (chip.classList.contains('primary')) {
                chip.style.backgroundColor = rootStyles.getPropertyValue('--primary-color') || '#a1a1a6';
            } else if (chip.classList.contains('secondary')) {
                chip.style.backgroundColor = rootStyles.getPropertyValue('--secondary-color') || '#ffffff';
            } else if (chip.classList.contains('bg')) {
                chip.style.backgroundColor = rootStyles.getPropertyValue('--background-color') || '#0d0d0d';
            } else if (chip.classList.contains('text')) {
                chip.style.backgroundColor = rootStyles.getPropertyValue('--text-color') || '#ffffff';
            }
        });
    }

    renderCloakList() {
        if (!this.elements.cloakList) return;

        const saved = (window.StorageUtils && StorageUtils.getObject)
            ? StorageUtils.getObject('cloak', {})
            : {};

        const customCloaks = window.CloakRotationManager ? window.CloakRotationManager.getCustomCloaks() : [];
        const allCloaks = [...this.cloaks, ...customCloaks];

        this.elements.cloakList.innerHTML = allCloaks.map((cloak, index) => {
            const isCustom = index >= this.cloaks.length;
            const customIndex = isCustom ? index - this.cloaks.length : -1;
            const selected = saved && saved.title === cloak.title && saved.icon === cloak.icon;
            const isRotating = window.CloakRotationManager?.getStatus().isRotating;

            return `
                <div class="cloak-item ${selected ? 'cloak-item-selected' : ''} ${isRotating ? 'cloak-item-disabled' : ''}" 
                     data-cloak-name="${cloak.name}" 
                     data-is-custom="${isCustom}"
                     data-custom-index="${customIndex}">
                    <div class="cloak-item-icon">
                        <img src="${cloak.icon}" alt="${cloak.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxsaW5lIHgxPSIxMiIgeTE9IjgiIHgyPSIxMiIgeTI9IjEyIi8+PGxpbmUgeDE9IjEyIiB5MT0iMTYiIHgyPSIxMi4wMSIgeTI9IjE2Ii8+PC9zdmc+'">
                    </div>
                    <div class="cloak-item-labels">
                        <div class="cloak-item-name">${cloak.name}</div>
                        <div class="cloak-item-title">${cloak.title}</div>
                    </div>
                    ${isCustom ? `
                        <button class="delete-cloak-btn" title="Remove Cloak">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6 6 18M6 6l12 12"/>
                            </svg>
                        </button>
                    ` : ''}
                </div>
            `;
        }).join('') + `
            <div class="cloak-item add-new-cloak-card" id="add-new-cloak-trigger">
                <div class="cloak-item-icon add-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                </div>
                <div class="cloak-item-labels">
                    <div class="cloak-item-name">Add New</div>
                    <div class="cloak-item-title">Cloak</div>
                </div>
            </div>
        `;

        // Bind events
        this.elements.cloakList.querySelectorAll('.cloak-item:not(.add-new-cloak-card)').forEach(item => {
            item.addEventListener('click', (e) => {
                // Handle delete button click
                if (e.target.closest('.delete-cloak-btn')) {
                    e.stopPropagation();
                    const customIndex = parseInt(item.dataset.customIndex);
                    if (confirm('Remove this custom cloak?')) {
                        window.CloakRotationManager.removeCustomCloak(customIndex);
                        this.renderCloakList();
                    }
                    return;
                }

                const name = item.getAttribute('data-cloak-name');
                if (!name) return;

                if (window.CloakRotationManager?.getStatus().isRotating) {
                    if (window.notify) window.notify('Cannot manually select cloak while rotation is active.', 'warn');
                    return;
                }

                this.elements.cloakList.querySelectorAll('.cloak-item').forEach(el => el.classList.remove('cloak-item-selected'));
                item.classList.add('cloak-item-selected');

                // If custom, we might need to pass the object directly or handle it in applyCloak
                // But applyCloak looks up by name in this.cloaks. 
                // We need to update applyCloak to handle custom cloaks too.
                // Actually, let's just pass the data directly if it's custom.

                if (item.dataset.isCustom === 'true') {
                    const customIndex = parseInt(item.dataset.customIndex);
                    const cloak = customCloaks[customIndex];
                    this.applyCustomCloakDirectly(cloak);
                } else {
                    this.applyCloak(name);
                }
            });
        });

        // Bind Add New button
        const addBtn = this.elements.cloakList.querySelector('#add-new-cloak-trigger');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const modal = document.getElementById('add-cloak-modal');
                if (modal) {
                    modal.classList.remove('hidden');
                    modal.querySelector('input').focus();
                }
            });
        }
    }

    applyCustomCloakDirectly(cloak) {
        if (!cloak) return;
        document.title = cloak.title;

        const existingFavicon = document.querySelector("link[rel*='icon']");
        if (existingFavicon) existingFavicon.remove();

        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = cloak.icon;
        document.head.appendChild(link);

        StorageUtils.setObject('cloak', { title: cloak.title, icon: cloak.icon });
    }

    /**
     * Initialize cloak rotation UI components
     */
    initializeCloakRotationUI() {
        if (!window.CloakRotationManager) return;

        const manager = window.CloakRotationManager;
        const status = manager.getStatus();

        // Set initial toggle state
        if (this.elements.cloakRotationToggle) {
            this.elements.cloakRotationToggle.checked = status.rotationEnabled;
            this.elements.cloakRotationToggle.addEventListener('change', (e) => {
                manager.setRotationEnabled(e.target.checked);
            });
        }

        // Set initial interval
        if (this.elements.cloakRotationInterval) {
            this.elements.cloakRotationInterval.value = status.rotationInterval;
            this.updateRotationIntervalDisplay();

            this.elements.cloakRotationInterval.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                manager.setRotationInterval(value);
                this.updateRotationIntervalDisplay();
            });
        }

        // Show/hide rotation settings based on toggle
        this.updateRotationSettingsVisibility();



        // Listen for rotation events
        this.setupCloakRotationEventListeners();
    }

    /**
     * Initialize cloak rotation toggle behavior to show/hide slider immediately
     */
    initializeCloakRotationToggleBehavior() {
        if (!this.elements.cloakRotationToggle) return;

        this.elements.cloakRotationToggle.addEventListener('change', (e) => {
            this.updateRotationSettingsVisibility();
        });
    }

    /**
     * Update rotation interval display
     */
    updateRotationIntervalDisplay() {
        if (this.elements.rotationIntervalValue && this.elements.cloakRotationInterval) {
            const value = this.elements.cloakRotationInterval.value;
            this.elements.rotationIntervalValue.textContent = `${value}s`;
        }
    }

    /**
     * Update rotation settings visibility
     */
    updateRotationSettingsVisibility() {
        if (this.elements.cloakRotationSettings && this.elements.cloakRotationToggle) {
            this.elements.cloakRotationSettings.style.display =
                this.elements.cloakRotationToggle.checked ? 'block' : 'none';
        }
    }



    /**
     * Setup event listeners for cloak rotation events
     */
    setupCloakRotationEventListeners() {
        // Listen for rotation status changes
        document.addEventListener('cloakRotationEnabledChanged', (e) => {
            if (this.elements.cloakRotationToggle) {
                this.elements.cloakRotationToggle.checked = e.detail.enabled;
            }
            this.updateRotationSettingsVisibility();
            this.updateRotationIndicator();
            this.renderCloakList(); // Update cloak list disabled state
        });

        document.addEventListener('cloakRotationIntervalChanged', (e) => {
            if (this.elements.cloakRotationInterval) {
                this.elements.cloakRotationInterval.value = e.detail.interval;
                this.updateRotationIntervalDisplay();
            }
        });

        document.addEventListener('cloakRotationStarted', () => {
            this.updateRotationIndicator();
            this.renderCloakList();
        });

        document.addEventListener('cloakRotationStopped', () => {
            this.updateRotationIndicator();
            this.renderCloakList();
        });

        document.addEventListener('customCloakAdded', () => {
            this.renderCloakList();
        });

        document.addEventListener('customCloakRemoved', () => {
            this.renderCloakList();
        });
    }

    /**
     * Update rotation indicator visibility
     */
    updateRotationIndicator() {
        if (!this.elements.cloakRotationIndicator || !window.CloakRotationManager) return;

        const isRotating = window.CloakRotationManager.getStatus().isRotating;
        this.elements.cloakRotationIndicator.style.display = isRotating ? 'inline' : 'none';
    }

    switchTab(tabName) {
        if (!this.elements || !this.elements.navItems || !this.elements.tabs) return;

        // Validate tab exists
        const validTabs = this.tabs.map(tab => tab.id);
        if (!validTabs.includes(tabName)) {
            console.warn(`Invalid tab name: ${tabName}, defaulting to general`);
            tabName = 'general';
        }

        // Update navigation (visual + ARIA)
        this.elements.navItems.forEach(item => {
            const isActive = item.dataset.tab === tabName;
            item.classList.toggle('active', isActive);
            item.setAttribute('aria-selected', isActive ? 'true' : 'false');
            item.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        // Update tab panels
        this.elements.tabs.forEach(tab => {
            const isActive = tab.dataset.tab === tabName;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        });

        this.currentTab = tabName;

        // Lazy-load offline games when Offline tab is shown
        if (tabName === 'offline') {
            this.loadOfflineGamesIntoList();
            this.loadCachedGamesIntoList();
        }
    }

    updateColorPreview(fieldId, color) {
        // Add color preview functionality
        const preview = document.querySelector(`#${fieldId}-preview`);
        if (preview) {
            preview.style.backgroundColor = color;
        }
    }

    /**
     * Debounced theme application to prevent excessive DOM manipulation.
     * Triggers a settings recompute + persistence shortly after user stops changing colors.
     */
    debounceThemeApplication() {
        if (this.themeApplicationDebounce) {
            clearTimeout(this.themeApplicationDebounce);
        }

        this.themeApplicationDebounce = setTimeout(() => {
            const snapshot = this.collectSettings();
            this.applyThemePreset(snapshot.themePreset, snapshot.customBackground);
            this.persistSettings(snapshot);
            this.themeApplicationDebounce = null;
        }, 150);
    }

    // Deprecated in favor of applyThemePreset; retained as no-op wrapper.
    applyThemeToApp() {
        return;
    }

    // Layout tuning removed from UI; keep no-op for compatibility.
    applyLayoutSettings() {
        return;
    }

    // Animation tuning removed from UI; keep no-op for compatibility.
    applyAnimationSettings() {
        return;
    }

    // Legacy helpers below are unused in the new simplified settings, but kept
    // as stubs where needed for backward compatibility with any external calls.
    getSelectedThemeName() {
        return 'Custom';
    }

    getSelectedBackgroundType() {
        const backgroundSelect = this.elements.backgroundSelect;
        if (!backgroundSelect) return 'color';

        const selectedValue = backgroundSelect.value;
        const background = this.backgrounds.find(b => b.name === selectedValue);
        return background ? background.type : 'color';
    }

    getSelectedBackgroundValue() {
        const backgroundSelect = this.elements.backgroundSelect;
        if (!backgroundSelect) return '#0d0d0d';

        const selectedValue = backgroundSelect.value;
        if (selectedValue === 'Custom') {
            const customUrl = this.elements.customBackgroundUrl.value;
            return customUrl || '#0d0d0d';
        } else if (selectedValue === 'YouTube Video') {
            const youtubeUrl = this.elements.youtubeUrl.value;
            return youtubeUrl || '';
        } else if (selectedValue === 'Image URL') {
            const imageUrl = this.elements.imageUrl.value;
            return imageUrl || '';
        }

        const background = this.backgrounds.find(b => b.name === selectedValue);
        return background ? background.value : '#0d0d0d';
    }

    populateThemePresets() {
        // Presets already rendered via select; ensure a valid value.
        if (this.elements.themePresetSelect) {
            const value = this.elements.themePresetSelect.value || 'dark';
            if (!['dark', 'ocean', 'forest'].includes(value)) {
                this.elements.themePresetSelect.value = 'dark';
            }
        }
    }

    populateBackgroundOptions() {
        // No-op: background handled via custom background controls.
    }

    selectThemePreset(theme) {
        // Update form values
        this.elements.primaryColor.value = theme.primaryColor;
        this.elements.primaryColorText.value = theme.primaryColor;
        this.elements.secondaryColor.value = theme.secondaryColor;
        this.elements.secondaryColorText.value = theme.secondaryColor;
        this.elements.bgColor.value = theme.bgColor;
        this.elements.bgColorText.value = theme.bgColor;
        this.elements.cardColor.value = theme.cardColor;
        this.elements.cardColorText.value = theme.cardColor;
        this.elements.textColor.value = theme.textColor;
        this.elements.textColorText.value = theme.textColor;

        // Update settings
        this.settings.themeName = theme.name;
        this.settings.primaryColor = theme.primaryColor;
        this.settings.secondaryColor = theme.secondaryColor;
        this.settings.colors.bgColor = theme.bgColor;
        this.settings.colors.cardColor = theme.cardColor;
        this.settings.colors.textColor = theme.textColor;

        // Apply theme immediately
        this.applyThemeToApp(this.settings);

        // Highlight selected preset
        const presetItems = this.elements.themePresetGrid.querySelectorAll('.theme-preset-item');
        presetItems.forEach(item => item.classList.remove('selected'));
        const selectedItem = this.elements.themePresetGrid.querySelector(`[data-theme="${theme.name}"]`);
        if (selectedItem) selectedItem.classList.add('selected');
    }

    updateCustomBackgroundVisibility() {
        const backgroundSelect = this.elements.backgroundSelect;
        const customGroup = this.elements.customBackgroundGroup;

        if (backgroundSelect && customGroup) {
            customGroup.style.display = backgroundSelect.value === 'Custom' ? 'block' : 'none';
        }
    }

    updateYouTubeUrlVisibility() {
        const backgroundSelect = this.elements.backgroundSelect;
        const youtubeGroup = this.elements.youtubeUrlGroup;

        if (backgroundSelect && youtubeGroup) {
            youtubeGroup.style.display = backgroundSelect.value === 'YouTube Video' ? 'block' : 'none';
        }
    }

    updateImageUrlVisibility() {
        const backgroundSelect = this.elements.backgroundSelect;
        const imageGroup = this.elements.imageUrlGroup;

        if (backgroundSelect && imageGroup) {
            imageGroup.style.display = backgroundSelect.value === 'Image URL' ? 'block' : 'none';
        }
    }

    updateBackgroundPreviewVisibility() {
        const backgroundSelect = this.elements.backgroundSelect;
        const previewGroup = this.elements.backgroundPreviewGroup;

        if (backgroundSelect && previewGroup) {
            const selectedValue = backgroundSelect.value;
            const showPreview = selectedValue === 'YouTube Video' || selectedValue === 'Image URL' || selectedValue === 'Custom';
            previewGroup.style.display = showPreview ? 'block' : 'none';
        }
    }

    validateYouTubeUrl() {
        const url = this.elements.youtubeUrl.value;
        if (!url) return;

        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/;
        this.setFieldValidity(this.elements.youtubeUrl, youtubeRegex.test(url));
    }

    validateImageUrl() {
        const url = this.elements.imageUrl.value;
        if (!url) return;

        const imageRegex = /\.(jpeg|jpg|gif|png|webp|bmp|svg)(\?.*)?$/i;
        this.setFieldValidity(this.elements.imageUrl, imageRegex.test(url));
    }

    updateBackgroundPreview() {
        const preview = this.elements.backgroundPreview;
        if (!preview) return;

        const selectedValue = this.elements.backgroundSelect.value;
        let previewContent = '';

        if (selectedValue === 'YouTube Video') {
            const url = this.elements.youtubeUrl.value;
            if (url) {
                const videoId = this.extractYouTubeVideoId(url);
                if (videoId) {
                    previewContent = `<iframe width="300" height="200" src="https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1" frameborder="0" allowfullscreen></iframe>`;
                } else {
                    previewContent = '<div class="preview-error">Invalid YouTube URL</div>';
                }
            } else {
                previewContent = '<div class="preview-placeholder">Enter a YouTube URL to see preview</div>';
            }
        } else if (selectedValue === 'Image URL') {
            const url = this.elements.imageUrl.value;
            if (url) {
                previewContent = `<img src="${url}" alt="Background preview" style="max-width: 300px; max-height: 200px; object-fit: cover;">`;
            } else {
                previewContent = '<div class="preview-placeholder">Enter an image URL to see preview</div>';
            }
        } else if (selectedValue === 'Custom') {
            const url = this.elements.customBackgroundUrl.value;
            if (url) {
                if (url.includes('youtube.com') || url.includes('youtu.be')) {
                    const videoId = this.extractYouTubeVideoId(url);
                    if (videoId) {
                        previewContent = `<iframe width="300" height="200" src="https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1" frameborder="0" allowfullscreen></iframe>`;
                    } else {
                        previewContent = '<div class="preview-error">Invalid YouTube URL</div>';
                    }
                } else {
                    previewContent = `<img src="${url}" alt="Background preview" style="max-width: 300px; max-height: 200px; object-fit: cover;">`;
                }
            } else {
                previewContent = '<div class="preview-placeholder">Enter a URL to see preview</div>';
            }
        } else {
            previewContent = '<div class="preview-placeholder">Select a background to see preview</div>';
        }

        preview.innerHTML = previewContent;
    }

    extractYouTubeVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length == 11) ? match[2] : null;
    }

    updateBackgroundColorVisibility() {
        const backgroundSelect = this.elements.backgroundSelect;
        const backgroundColorGroup = this.elements.backgroundColorGroup;

        if (backgroundSelect && backgroundColorGroup) {
            const selectedValue = backgroundSelect.value;
            const background = this.backgrounds.find(b => b.name === selectedValue);
            const isColorBackground = selectedValue === 'Custom' || (background && background.type === 'color');

            backgroundColorGroup.style.display = isColorBackground ? 'block' : 'none';
        }
    }

    testFavicon() {
        const url = this.elements.faviconUrl.value;
        if (!url || !this.isValidUrl(url)) {
            alert('Please enter a valid favicon URL');
            return;
        }

        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = url;
        link.onload = () => alert('Favicon loaded successfully!');
        link.onerror = () => alert('Failed to load favicon');
        document.head.appendChild(link);
    }


    testGemini() {
        const apiKey = this.elements.geminiApiKey.value;
        if (!apiKey) {
            alert('Please enter a Gemini API key');
            return;
        }

        if (!apiKey.startsWith('AIza')) {
            alert('Please enter a valid Gemini API key (starts with AIza)');
            return;
        }

        this.elements.testGemini.textContent = 'Testing...';
        this.elements.testGemini.disabled = true;

        fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: 'Hello' }]
                }],
                generationConfig: {
                    maxOutputTokens: 10
                }
            })
        })
            .then(response => {
                if (response.ok) {
                    alert('Gemini API key is valid!');
                } else {
                    throw new Error('Invalid API key');
                }
            })
            .catch(error => {
                alert('Gemini API test failed: ' + error.message);
            })
            .finally(() => {
                this.elements.testGemini.textContent = 'Test';
                this.elements.testGemini.disabled = false;
            });
    }

    testOpenAI() {
        const apiKey = this.elements.openaiApiKey.value;
        if (!apiKey) {
            alert('Please enter an OpenAI API key');
            return;
        }

        if (!apiKey.startsWith('sk-')) {
            alert('Please enter a valid OpenAI API key (starts with sk-)');
            return;
        }

        this.elements.testOpenai.textContent = 'Testing...';
        this.elements.testOpenai.disabled = true;

        fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.data && data.data.length > 0) {
                    alert('OpenAI API key is valid!');
                } else {
                    throw new Error('Invalid API key');
                }
            })
            .catch(error => {
                alert('OpenAI API test failed: ' + error.message);
            })
            .finally(() => {
                this.elements.testOpenai.textContent = 'Test';
                this.elements.testOpenai.disabled = false;
            });
    }

    setPanicKey() {
        const input = this.elements.panicKey;
        input.value = 'Press a key...';
        input.classList.add('recording');

        const keyHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const key = e.key === ' ' ? 'Space' : e.key;
            if (['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
                alert('Please use a non-modifier key.');
                return;
            }

            input.value = key;
            input.classList.remove('recording');
            document.removeEventListener('keydown', keyHandler, true);
        };

        document.addEventListener('keydown', keyHandler, true);
    }


    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const settings = JSON.parse(e.target.result);
                    this.applySettings(settings);
                    alert('Settings imported successfully!');
                } catch (error) {
                    alert('Failed to import settings: Invalid JSON');
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }

    exportSettings() {
        const settings = this.collectSettings();
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'unblockee-settings.json';
        a.click();

        URL.revokeObjectURL(url);
    }

    resetSettings() {
        if (confirm('Reset all settings to defaults?')) {
            // Clear known StorageUtils keys
            StorageUtils.remove('settings');
            StorageUtils.remove('selectedCloak');
            StorageUtils.remove('panicKey');
            StorageUtils.remove('panicAction');
            StorageUtils.remove('antiClose');
            StorageUtils.remove('aboutBlankLaunching');
            StorageUtils.remove('autoAboutBlankLaunch');
            StorageUtils.remove('autoBlobTabLaunch');
            StorageUtils.remove('offlineMode');
            StorageUtils.remove('theme');
            StorageUtils.remove('selectedTheme');
            StorageUtils.remove('cloak');
            StorageUtils.remove('currentCloakIndex');
            StorageUtils.remove('autoLaunchExecuted');
            StorageUtils.remove('proxServer');
            this.settings = this.getDefaultSettings();
            this.populateForm();
            alert('Settings reset to defaults');
        }
    }

    clearCache() {
        if (confirm('Clear all cached data?')) {
            // Use service worker to clear cache if available
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'CLEAR_CACHE'
                });

                // Listen for response
                const messageChannel = new MessageChannel();
                messageChannel.port1.onmessage = (event) => {
                    if (event.data.success) {
                        StorageUtils.remove('gamePlayCount');
                        StorageUtils.remove('cachedGames');
                        this.updateCachedGamesList();
                        alert('Cache cleared successfully');
                    }
                };

                navigator.serviceWorker.controller.postMessage({
                    type: 'CLEAR_CACHE'
                }, [messageChannel.port2]);
            } else {
                // Fallback to manual cache clearing
                if ('caches' in window) {
                    caches.keys().then(names => {
                        names.forEach(name => {
                            caches.delete(name);
                        });
                    });
                }

                // Clear all StorageUtils keys - since we can't clear all localStorage, we'll need to be selective
                // For now, clear specific known keys
                StorageUtils.remove('gamePlayCount');
                StorageUtils.remove('cachedGames');
                StorageUtils.remove('settings');
                StorageUtils.remove('cloak');
                StorageUtils.remove('currentCloakIndex');
                StorageUtils.remove('autoLaunchExecuted');
                // Add more keys as needed
                this.elements.cachedGamesList.innerHTML = '<div class="no-games">Cache cleared</div>';
                alert('Cache cleared successfully');
            }
        }
    }

    // Update cached games list in settings
    updateCachedGamesList() {
        this.loadCachedGames();
    }

    // Load cached games from service worker
    async loadCachedGames() {
        try {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                const messageChannel = new MessageChannel();
                messageChannel.port1.onmessage = (event) => {
                    this.renderCachedGames(event.data);
                };

                navigator.serviceWorker.controller.postMessage({
                    type: 'GET_CACHE_STATUS'
                }, [messageChannel.port2]);
            } else {
                // Fallback: load from localStorage
                const cachedGames = StorageUtils.getObject('cachedGames', []);
                this.renderCachedGames({
                    cachedGamesCount: cachedGames.length,
                    topGames: [],
                    recentGames: cachedGames.slice(-5).reverse()
                });
            }
        } catch (error) {
            console.warn('Failed to load cached games:', error);
            this.elements.cachedGamesList.innerHTML = '<div class="no-games">Failed to load cached games</div>';
        }
    }

    // Load cached games into the split-view list
    loadCachedGamesIntoList() {
        if (!this.elements.cachedGamesList) return;

        try {
            // Load from service worker cache status
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                const messageChannel = new MessageChannel();
                messageChannel.port1.onmessage = (event) => {
                    this.renderCachedGamesList(event.data);
                };

                navigator.serviceWorker.controller.postMessage({
                    type: 'GET_CACHE_STATUS'
                }, [messageChannel.port2]);
            } else {
                // Fallback to localStorage
                const cachedGames = StorageUtils.getObject('cachedGames', []);
                this.renderCachedGamesList({
                    cachedGamesCount: cachedGames.length,
                    cacheSize: 0, // Can't calculate without service worker
                    recentGames: cachedGames.slice(-10).reverse()
                });
            }
        } catch (error) {
            console.warn('Failed to load cached games list:', error);
            this.elements.cachedGamesList.innerHTML = '<div class="no-games">Failed to load cached games</div>';
        }
    }

    // Render cached games in the split-view layout
    renderCachedGamesList(cacheData) {
        const container = this.elements.cachedGamesList;

        // Update statistics
        if (this.elements.cacheGamesCount) {
            this.elements.cacheGamesCount.textContent = cacheData.cachedGamesCount || 0;
        }
        if (this.elements.cacheTotalSize) {
            this.elements.cacheTotalSize.textContent = this.formatBytes(cacheData.cacheSize || 0);
        }

        if (!cacheData.cachedGamesCount || cacheData.cachedGamesCount === 0) {
            container.innerHTML = '<div class="no-games">No cached games</div>';
            return;
        }

        const gamesHtml = cacheData.recentGames.map(game => `
            <div class="cached-game-card" data-game-id="${game.id}">
                <div class="game-card-thumbnail">
                    <img src="${game.cover || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdhbWU8L3RleHQ+PC9zdmc+'}"
                         alt="${game.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdhbWU8L3RleHQ+PC9zdmc+'">
                </div>
                <div class="game-card-info">
                    <div class="game-card-name">${game.name || 'Unknown Game'}</div>
                    <div class="game-card-size">${this.formatBytes(game.size || 0)}</div>
                </div>
                <button type="button" class="btn-remove-game" title="Remove from cache">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `).join('');

        container.innerHTML = gamesHtml;
    }

    // Remove a specific cached game
    async removeCachedGame(gameId) {
        if (!confirm('Remove this game from cache?')) return;

        try {
            // Update localStorage
            const cachedGames = StorageUtils.getObject('cachedGames', []);
            const filtered = cachedGames.filter(game => game.id !== gameId);
            StorageUtils.setObject('cachedGames', filtered);

            // Refresh the cached games list
            this.loadCachedGames();

            alert('Game removed from cache');
        } catch (error) {
            console.error('Failed to remove cached game:', error);
            alert('Failed to remove game from cache');
        }
    }

    // Format bytes to human readable format
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Format timestamp to readable date
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        return date.toLocaleDateString();
    }

    // Listen for service worker messages
    setupServiceWorkerListener() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data.type === 'GAME_CACHED') {
                    this.loadCachedGames();
                }
            });
        }
    }

    // Game selection methods
    async openGameSelectionModal() {
        try {
            // Load zones.json data
            const response = await fetch('components/zones.json');
            const games = await response.json();

            // Filter out non-game entries (like Discord link)
            const actualGames = games.filter(game => game.id >= 0);

            // Get currently selected games
            const selectedGames = StorageUtils.getObject('selectedGamesForOffline', []);

            // Create modal
            const modal = document.createElement('div');
            modal.className = 'game-selection-modal';
            modal.innerHTML = `
                <div class="game-selection-content">
                    <div class="game-selection-header">
                        <h3>Select Games for Offline Mode</h3>
                        <p>Choose up to 30 games to cache for offline play</p>
                        <div class="selection-count">
                            <span id="modal-selected-count">${selectedGames.length}</span> / 30 selected
                        </div>
                        <button type="button" class="close-modal" id="close-game-modal">✕</button>
                    </div>
                    <div class="game-selection-filters">
                        <input type="text" id="modal-game-search" placeholder="Search games...">
                        <select id="modal-game-filter">
                            <option value="all">All Games</option>
                            <option value="featured">Featured</option>
                            <option value="flash">Flash Games</option>
                            <option value="port">Ports</option>
                            <option value="emulator">Emulators</option>
                        </select>
                    </div>
                    <div class="games-grid" id="games-grid">
                        ${this.renderGamesGrid(actualGames, selectedGames)}
                    </div>
                    <div class="game-selection-footer">
                        <button type="button" id="save-game-selection" class="btn btn-primary">Save Selection</button>
                        <button type="button" id="cancel-game-selection" class="btn btn-secondary">Cancel</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Bind events
            this.bindGameSelectionEvents(modal, actualGames, selectedGames);

        } catch (error) {
            console.error('Failed to open game selection modal:', error);
            alert('Failed to load games. Please try again.');
        }
    }

    renderGamesGrid(games, selectedGames) {
        const selectedIds = selectedGames.map(g => g.id);

        return games.map(game => {
            const isSelected = selectedIds.includes(game.id);
            const hasSpecial = game.special && game.special.length > 0;
            const isFeatured = game.featured;

            return `
                <div class="game-item ${isSelected ? 'selected' : ''}" data-game-id="${game.id}">
                    <div class="game-cover">
                        <img src="${game.cover}" alt="${game.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdhbWU8L3RleHQ+PC9zdmc+'">
                        ${isFeatured ? '<div class="featured-badge">⭐</div>' : ''}
                        ${hasSpecial ? `<div class="special-badge">${game.special[0]}</div>` : ''}
                    </div>
                    <div class="game-info">
                        <h4 class="game-name">${game.name}</h4>
                        <p class="game-author">${game.author || 'Unknown'}</p>
                    </div>
                    <div class="game-select-checkbox">
                        <input type="checkbox" ${isSelected ? 'checked' : ''}>
                    </div>
                </div>
            `;
        }).join('');
    }

    bindGameSelectionEvents(modal, games, selectedGames) {
        const closeBtn = modal.querySelector('#close-game-modal');
        const cancelBtn = modal.querySelector('#cancel-game-selection');
        const saveBtn = modal.querySelector('#save-game-selection');
        const searchInput = modal.querySelector('#modal-game-search');
        const filterSelect = modal.querySelector('#modal-game-filter');
        const gamesGrid = modal.querySelector('#games-grid');
        const selectedCount = modal.querySelector('#modal-selected-count');

        // Close events
        closeBtn?.addEventListener('click', () => modal.remove());
        cancelBtn?.addEventListener('click', () => modal.remove());

        // Filter events
        searchInput?.addEventListener('input', () => this.filterModalGames(modal, games, selectedGames));
        filterSelect?.addEventListener('change', () => this.filterModalGames(modal, games, selectedGames));

        // Game selection events
        gamesGrid?.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const gameItem = e.target.closest('.game-item');
                const gameId = parseInt(gameItem.dataset.gameId);

                if (e.target.checked) {
                    if (selectedGames.length >= 30) {
                        e.target.checked = false;
                        alert('You can only select up to 30 games for offline mode.');
                        return;
                    }
                    selectedGames.push(games.find(g => g.id === gameId));
                } else {
                    const index = selectedGames.findIndex(g => g.id === gameId);
                    if (index > -1) selectedGames.splice(index, 1);
                }

                gameItem.classList.toggle('selected', e.target.checked);
                selectedCount.textContent = selectedGames.length;
            }
        });

        // Save selection
        saveBtn?.addEventListener('click', () => {
            StorageUtils.setObject('selectedGamesForOffline', selectedGames);
            this.updateSelectedGamesCount();
            modal.remove();
            alert(`Selected ${selectedGames.length} games for offline caching.`);
        });
    }

    filterModalGames(modal, games, selectedGames) {
        const searchTerm = modal.querySelector('#modal-game-search').value.toLowerCase();
        const filter = modal.querySelector('#modal-game-filter').value;

        let filteredGames = games.filter(game => {
            // Search filter
            if (searchTerm && !game.name.toLowerCase().includes(searchTerm)) {
                return false;
            }

            // Category filter
            switch (filter) {
                case 'featured':
                    return game.featured;
                case 'flash':
                    return game.special && game.special.includes('flash');
                case 'port':
                    return game.special && game.special.includes('port');
                case 'emulator':
                    return game.special && game.special.includes('emulator');
                default:
                    return true;
            }
        });

        const gamesGrid = modal.querySelector('#games-grid');
        gamesGrid.innerHTML = this.renderGamesGrid(filteredGames, selectedGames);
    }

    filterGames() {
        // Update the display of selected games count
        this.updateSelectedGamesCount();
    }

    updateSelectedGamesCount() {
        const selectedGames = StorageUtils.getObject('selectedGamesForOffline', []);
        if (this.elements.selectedGamesCount) {
            this.elements.selectedGamesCount.textContent = selectedGames.length;
        }
    }

    async cacheSelectedGames() {
        const selectedGames = StorageUtils.getObject('selectedGamesForOffline', []);

        if (selectedGames.length === 0) {
            alert('No games selected for caching. Please select games first.');
            return;
        }

        if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
            alert('Service worker not available. Please refresh the page and try again.');
            return;
        }

        const confirmed = confirm(`Cache ${selectedGames.length} games for offline play? This may take a few minutes.`);
        if (!confirmed) return;

        // Send cache request to service worker
        navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_GAMES',
            games: selectedGames
        });

        // Show loading indicator
        if (this.elements.cacheSelectedGames) {
            this.elements.cacheSelectedGames.textContent = 'Caching...';
            this.elements.cacheSelectedGames.disabled = true;
        }

        // Listen for completion
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
            if (event.data.type === 'CACHE_COMPLETE') {
                if (this.elements.cacheSelectedGames) {
                    this.elements.cacheSelectedGames.textContent = 'Cache Selected Games';
                    this.elements.cacheSelectedGames.disabled = false;
                }
                this.loadCachedGames();
                alert(`Successfully cached ${event.data.cachedCount} games for offline play.`);
            } else if (event.data.type === 'CACHE_ERROR') {
                if (this.elements.cacheSelectedGames) {
                    this.elements.cacheSelectedGames.textContent = 'Cache Selected Games';
                    this.elements.cacheSelectedGames.disabled = false;
                }
                alert('Error caching games: ' + event.data.error);
            }
        };

        navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_GAMES',
            games: selectedGames
        }, [messageChannel.port2]);
    }

    loadSettings() {
        // Legacy aggregator retained only for migration-related helpers; core config is per-key now.
        const defaults = this.getDefaultSettings();
        try {
            return {
                ...defaults,
                ...(window.StorageUtils ? StorageUtils.getObject('settings', {}) : {})
            };
        } catch (error) {
            console.warn('Failed to load settings:', error);
            return defaults;
        }
    }

    getDefaultSettings() {
        // Defaults only used as a convenience; persisted state is per-key.
        return {
            themePreset: 'dark',
            customBackground: { type: 'hex-grid' }, // hex grid as default
            cloakMode: 'none',
            antiClose: false,
            panicKeys: 'none',
            primaryLibrary: 'default',
            altLibraryFile: '',
            offlineMode: true,
            offlineGames: [],
            maxRating: 'R',
            moviesProxyEnabled: false
        };
    }

    collectSettings() {
        // Read current UI state into the new unified keys.
        const themePreset = this.elements.themePresetSelect
            ? this.elements.themePresetSelect.value
            : 'dark';

        let customBgConfig = null;
        // Collect from preset dropdown first (authoritative)
        if (this.elements.backgroundPresetSelect) {
            switch (this.elements.backgroundPresetSelect.value) {
                case 'night-city':
                    customBgConfig = { type: 'image', url: 'https://images.pexels.com/photos/2837009/pexels-photo-2837009.jpeg?auto=compress&cs=tinysrgb&w=1600' };
                    break;
                case 'neon-grid':
                    customBgConfig = { type: 'image', url: 'https://images.pexels.com/photos/1322185/pexels-photo-1322185.jpeg?auto=compress&cs=tinysrgb&w=1600' };
                    break;
                case 'racing-f1':
                    customBgConfig = { type: 'youtube', videoId: '2x5bT-k64hA' };
                    break;
                case 'racing-rally':
                    customBgConfig = { type: 'youtube', videoId: 'dR2vR8VnXj0' };
                    break;
                case 'racing-motogp':
                    customBgConfig = { type: 'youtube', videoId: 'z4zE8ApsW6s' };
                    break;
                default:
                    customBgConfig = null;
            }
        }

        // If no preset selected, fall back to explicit custom mode/url
        if (!customBgConfig && this.elements.customBgUrl && this.elements.customBgModeRadios) {
            const url = this.elements.customBgUrl.value.trim();
            let mode = 'none';
            this.elements.customBgModeRadios.forEach(r => {
                if (r.checked) mode = r.value;
            });

            if (mode !== 'none' && url) {
                if (mode === 'youtube') {
                    const videoId = this.extractYouTubeVideoId(url);
                    if (videoId) {
                        customBgConfig = { type: 'youtube', videoId };
                    }
                } else if (mode === 'image' && this.isLikelyImageUrl(url)) {
                    customBgConfig = { type: 'image', url };
                }
            }
        }

        let cloakMode = 'none';
        if (this.elements.cloakModeSelect && this.elements.cloakModeSelect.value) {
            cloakMode = this.elements.cloakModeSelect.value;
        }

        // Enforce mutual exclusivity semantics defensively:
        // 'none' = no cloaking, 'about:blank' = about:blank cloaking, 'blob' = blob cloaking.
        if (!['none', 'about:blank', 'blob'].includes(cloakMode)) {
            cloakMode = 'none';
        }

        const antiClose =
            (this.elements.antiCloseToggle && this.elements.antiCloseToggle.checked) ||
            (this.elements.privacyAntiClose && this.elements.privacyAntiClose.checked);

        const panicKeys = this.elements.panicKeysSelect
            ? this.elements.panicKeysSelect.value
            : 'none';

        const primaryLibrary = this.elements.primaryLibrarySelect
            ? this.elements.primaryLibrarySelect.value || 'default'
            : 'default';

        const altLibraryFile = this.elements.altLibrarySelect
            ? this.elements.altLibrarySelect.value || ''
            : '';

        const offlineMode = this.elements.offlineModeToggle
            ? !!this.elements.offlineModeToggle.checked
            : true;

        // Global Color Thief setting
        const globalColorThief = this.elements.globalColorThiefToggle
            ? !!this.elements.globalColorThiefToggle.checked
            : false;

        // Movies settings
        const maxRating = this.elements.maxRatingSelect
            ? this.elements.maxRatingSelect.value
            : 'R';
        const moviesProxyEnabled = this.elements.moviesProxyEnabledToggle
            ? !!this.elements.moviesProxyEnabledToggle.checked
            : false;

        // Custom panic key settings
        let customPanicKey = null;
        let customPanicUrl = null;
        if (panicKeys === 'custom') {
            customPanicKey = this.elements.customPanicKey?.value?.trim() || null;
            customPanicUrl = this.elements.customPanicUrl?.value?.trim() || null;
        }

        // Offline selected games list (ids) from checkboxes in offlineGamesList
        const offlineGames = [];
        if (this.elements.offlineGamesList) {
            const checkboxes = this.elements.offlineGamesList.querySelectorAll(
                'input[type="checkbox"][data-game-id]:checked'
            );
            checkboxes.forEach(cb => {
                offlineGames.push(cb.getAttribute('data-game-id'));
            });
        }

        return {
            themePreset,
            customBackground: customBgConfig,
            cloakMode,
            antiClose,
            panicKeys,
            customPanicKey,
            customPanicUrl,
            primaryLibrary,
            altLibraryFile,
            offlineMode,
            offlineGames,
            globalColorThief,
            widgetbotEnabled,
            maxRating,
            moviesProxyEnabled
        };
    }

    applySettings(settings) {
        this.settings = { ...this.getDefaultSettings(), ...settings };
        this.populateForm();
    }

    populateForm() {
        const s = this.settings || this.getDefaultSettings();

        // General
        if (this.elements.primaryLibrarySelect) {
            this.elements.primaryLibrarySelect.value = s.primaryLibrary || 'default';
        }

        if (this.elements.altLibrarySelect) {
            this.elements.altLibrarySelect.value = s.altLibraryFile || '';
        }

        if (this.elements.offlineModeToggle) {
            // Default ON if missing
            this.elements.offlineModeToggle.checked = s.offlineMode !== false;
        }

        if (this.elements.offlineSelectedCount && Array.isArray(s.offlineGames)) {
            this.elements.offlineSelectedCount.textContent = Math.min(
                s.offlineGames.length,
                30
            );
        }

        // Appearance
        if (this.elements.themePresetSelect) {
            const preset = s.themePreset || 'dark';
            this.elements.themePresetSelect.value = ['dark', 'ocean', 'forest', 'custom'].includes(preset)
                ? preset
                : 'dark';
        }

        // Global Color Thief
        if (this.elements.globalColorThiefToggle) {
            this.elements.globalColorThiefToggle.checked = !!s.globalColorThief;
        }

        // WidgetBot
        if (this.elements.widgetbotEnabledToggle) {
            this.elements.widgetbotEnabledToggle.checked = s.widgetbotEnabled !== false;
        }

        // Movies settings
        if (this.elements.maxRatingSelect) {
            this.elements.maxRatingSelect.value = s.maxRating || 'R';
        }
        if (this.elements.moviesProxyEnabledToggle) {
            this.elements.moviesProxyEnabledToggle.checked = !!s.moviesProxyEnabled;
        }

        // Restore background preset + custom fields from customBackground
        if (s.customBackground) {
            const cb = s.customBackground;
            if (this.elements.backgroundPresetSelect) {
                if (cb.type === 'image') {
                    if (cb.url && cb.url.includes('2837009')) {
                        this.elements.backgroundPresetSelect.value = 'night-city';
                    } else if (cb.url && cb.url.includes('1322185')) {
                        this.elements.backgroundPresetSelect.value = 'neon-grid';
                    } else {
                        this.elements.backgroundPresetSelect.value = 'none';
                    }
                } else if (cb.type === 'youtube') {
                    if (cb.videoId === '2x5bT-k64hA') {
                        this.elements.backgroundPresetSelect.value = 'racing-f1';
                    } else if (cb.videoId === 'dR2vR8VnXj0') {
                        this.elements.backgroundPresetSelect.value = 'racing-rally';
                    } else if (cb.videoId === 'z4zE8ApsW6s') {
                        this.elements.backgroundPresetSelect.value = 'racing-motogp';
                    } else {
                        this.elements.backgroundPresetSelect.value = 'none';
                    }
                } else {
                    this.elements.backgroundPresetSelect.value = 'none';
                }
            }

            if (this.elements.customBgUrl) {
                if (cb.type === 'image' && cb.url) {
                    this.elements.customBgUrl.value = cb.url;
                } else if (cb.type === 'youtube' && cb.videoId) {
                    this.elements.customBgUrl.value = `https://www.youtube.com/watch?v=${cb.videoId}`;
                }
            }

            if (this.elements.customBgModeRadios) {
                const mode = cb.type || 'none';
                this.elements.customBgModeRadios.forEach(r => {
                    r.checked = r.value === mode;
                });
            }
        } else {
            if (this.elements.backgroundPresetSelect) {
                this.elements.backgroundPresetSelect.value = 'dark-grid';
            }
            if (this.elements.customBgUrl) {
                this.elements.customBgUrl.value = '';
            }
            if (this.elements.customBgModeRadios) {
                this.elements.customBgModeRadios.forEach(r => {
                    r.checked = r.value === 'none';
                });
            }
        }

        // Cloaks
        if (this.elements.cloakModeSelect) {
            const mode = ['none', 'about:blank', 'blob'].includes(s.cloakMode)
                ? s.cloakMode
                : 'none';
            this.elements.cloakModeSelect.value = mode;
        }

        if (this.elements.antiCloseToggle) {
            this.elements.antiCloseToggle.checked = !!s.antiClose;
        }

        if (this.elements.panicKeysSelect) {
            this.elements.panicKeysSelect.value = s.panicKeys || 'none';
        }

        // Custom panic key settings
        if (s.panicKeys === 'custom') {
            if (this.elements.customPanicSettings) {
                this.elements.customPanicSettings.style.display = 'block';
            }
            if (this.elements.customPanicKey && s.customPanicKey) {
                this.elements.customPanicKey.value = s.customPanicKey;
            }
            if (this.elements.customPanicUrl && s.customPanicUrl) {
                this.elements.customPanicUrl.value = s.customPanicUrl;
            }
        }

        // Privacy (mirror anti-close)
        if (this.elements.privacyAntiClose) {
            this.elements.privacyAntiClose.checked = !!s.antiClose;
        }
    }
    saveSettings() {
        const settings = this.collectSettings();

        // Basic defensive validation for critical values
        if (settings.customBackground && settings.customBackground.type === 'image') {
            try {
                // Throws if invalid; we only warn in console, not block save
                new URL(settings.customBackground.url);
            } catch {
                console.warn('Custom background image URL appears invalid, continuing without blocking save.');
            }
        }

        this.applySettings(settings);
        this.persistSettings(settings);
    }
    persistSettings(settings) {
        // New single-source-of-truth keys (no multiple booleans).
        try {
            // Persist unified theme preset including "custom"
            localStorage.setItem('unblockee_themePreset', settings.themePreset || 'dark');

            // Persist structured customBackground when present
            if (settings.customBackground) {
                localStorage.setItem(
                    'unblockee_customBackground',
                    JSON.stringify(settings.customBackground)
                );
            } else {
                localStorage.removeItem('unblockee_customBackground');
            }

            localStorage.setItem(
                'unblockee_cloakMode',
                settings.cloakMode || 'none'
            );

            localStorage.setItem(
                'unblockee_panicKeys',
                settings.panicKeys || 'none'
            );

            localStorage.setItem(
                'unblockee_primaryLibrary',
                settings.primaryLibrary || 'default'
            );

            localStorage.setItem(
                'unblockee_altLibraryFile',
                settings.altLibraryFile || ''
            );

            localStorage.setItem(
                'unblockee_offlineMode',
                settings.offlineMode ? 'true' : 'false'
            );

            // Enforce 30-game cap strictly
            const offlineGames = Array.isArray(settings.offlineGames)
                ? settings.offlineGames.slice(0, 30)
                : [];
            localStorage.setItem(
                'unblockee_offlineGames',
                JSON.stringify(offlineGames)
            );

            // Mirror anti-close as explicit key for centralized readers
            localStorage.setItem(
                'unblockee_antiClose',
                settings.antiClose ? 'true' : 'false'
            );

            // Persist AI settings
            localStorage.setItem('unblockee_aiTemperature', String(settings.aiTemperature || 0.7));
            localStorage.setItem('unblockee_aiAutoSave', settings.aiAutoSave ? 'true' : 'false');

            // Persist WidgetBot setting
            localStorage.setItem('unblockee_widgetbotEnabled', settings.widgetbotEnabled ? 'true' : 'false');

            // Persist movies settings
            localStorage.setItem('unblockee_maxRating', settings.maxRating || 'R');
            localStorage.setItem('unblockee_moviesProxyEnabled', settings.moviesProxyEnabled ? 'true' : 'false');

            // Persist custom panic key settings
            if (settings.customPanicKey) {
                localStorage.setItem('unblockee_customPanicKey', settings.customPanicKey);
            } else {
                localStorage.removeItem('unblockee_customPanicKey');
            }

            if (settings.customPanicUrl) {
                localStorage.setItem('unblockee_customPanicUrl', settings.customPanicUrl);
            } else {
                localStorage.removeItem('unblockee_customPanicUrl');
            }
        } catch (e) {
            console.warn('Failed to persist settings:', e);
        }

        // Apply immediate effects where appropriate
        this.applyThemePreset(settings.themePreset, settings.customBackground);
        this.applyAntiClose(!!settings.antiClose);
    }

    /**
     * Auto-save hook: recompute and persist settings when any watched control changes.
     */
    autoSaveFromEvent() {
        if (!this.isOpen) return;
        const settings = this.collectSettings();
        this.applySettings(settings);
        this.persistSettings(settings);
    }

    loadInitialState() {
        // Theme preset (supports "custom" and legacy values)
        const storedPreset = localStorage.getItem('unblockee_themePreset') || 'dark';
        const themePreset = ['dark', 'ocean', 'forest', 'custom'].includes(storedPreset)
            ? storedPreset
            : 'dark';

        // Custom background
        let customBackground = null;
        try {
            const raw = localStorage.getItem('unblockee_customBackground');
            if (raw) customBackground = JSON.parse(raw);
        } catch {
            customBackground = null;
        }

        // Global Color Thief
        const globalColorThief = localStorage.getItem('unblockee_globalColorThief') === 'true';

        // WidgetBot
        const widgetbotEnabled = localStorage.getItem('unblockee_widgetbotEnabled') !== 'false';

        // Movies settings
        const maxRating = localStorage.getItem('unblockee_maxRating') || 'R';
        const moviesProxyEnabled = localStorage.getItem('unblockee_moviesProxyEnabled') === 'true';

        // Cloaks
        const cloakMode = localStorage.getItem('unblockee_cloakMode') || 'none';

        // Panic keys
        const panicKeys = localStorage.getItem('unblockee_panicKeys') || 'none';

        // Custom panic keys
        const customPanicKey = localStorage.getItem('unblockee_customPanicKey') || null;
        const customPanicUrl = localStorage.getItem('unblockee_customPanicUrl') || null;

        // Libraries
        const primaryLibrary =
            localStorage.getItem('unblockee_primaryLibrary') || 'default';
        const altLibraryFile =
            localStorage.getItem('unblockee_altLibraryFile') || '';

        // AI settings
        const aiTemperature = parseFloat(localStorage.getItem('unblockee_aiTemperature')) || 0.7;
        const aiAutoSave = localStorage.getItem('unblockee_aiAutoSave') !== 'false'; // Default true

        // Offline
        let offlineMode = localStorage.getItem('unblockee_offlineMode');
        if (offlineMode === null) {
            // Default ON per requirements
            offlineMode = 'true';
            localStorage.setItem('unblockee_offlineMode', 'true');
        }
        const offlineModeBool = offlineMode === 'true';

        let offlineGames = [];
        try {
            const raw = localStorage.getItem('unblockee_offlineGames');
            if (raw) offlineGames = JSON.parse(raw) || [];
        } catch {
            offlineGames = [];
        }
        offlineGames = Array.isArray(offlineGames)
            ? offlineGames.slice(0, 30)
            : [];

        const antiClose =
            localStorage.getItem('unblockee_antiClose') === 'true';

        this.settings = {
            ...this.getDefaultSettings(),
            themePreset,
            customBackground,
            globalColorThief,
            cloakMode,
            panicKeys,
            customPanicKey,
            customPanicUrl,
            primaryLibrary,
            altLibraryFile,
            offlineMode: offlineModeBool,
            offlineGames,
            antiClose,
            aiTemperature,
            aiAutoSave,
            widgetbotEnabled,
            maxRating,
            moviesProxyEnabled
        };

        this.populateForm();
        this.applyThemePreset(themePreset, customBackground);
        this.applyAntiClose(antiClose);

        // Preload offline games list markup so Offline tab is instant on first open
        this.loadOfflineGamesIntoList();

        // Load cached games list
        this.loadCachedGamesIntoList();
    }

    handleOfflineGameSelectionChange(checkbox) {
        const id = checkbox.getAttribute('data-game-id');
        if (!id) return;

        let offlineGames = Array.isArray(this.settings.offlineGames)
            ? [...this.settings.offlineGames]
            : [];

        if (checkbox.checked) {
            if (!offlineGames.includes(id)) {
                if (offlineGames.length >= 30) {
                    // Enforce cap: revert checkbox
                    checkbox.checked = false;
                    if (window.notify) {
                        window.notify(
                            'You can only select up to 30 games for offline mode.',
                            'warn'
                        );
                    } else {
                        alert('You can only select up to 30 games for offline mode.');
                    }
                    return;
                }
                offlineGames.push(id);
            }
        } else {
            offlineGames = offlineGames.filter(g => g !== id);
        }

        this.settings.offlineGames = offlineGames;
        if (this.elements.offlineSelectedCount) {
            this.elements.offlineSelectedCount.textContent = offlineGames.length;
        }
    }

    applyThemePreset(presetKey, customBackground) {
        const THEME_PRESETS = {
            dark: {
                primary: '#a1a1a6',
                secondary: '#ffffff',
                background: '#0d0d0d',
                card: '#1a1a1a',
                text: '#ffffff'
            },
            ocean: {
                primary: '#3ba7ff',
                secondary: '#e0f7ff',
                background: '#02121f',
                card: '#052238',
                text: '#ffffff'
            },
            forest: {
                primary: '#4caf50',
                secondary: '#e8f5e9',
                background: '#08150b',
                card: '#0f2613',
                text: '#ffffff'
            }
        };

        const effectivePresetKey = THEME_PRESETS[presetKey] ? presetKey : 'dark';
        const preset = THEME_PRESETS[effectivePresetKey];

        const root = document.documentElement;
        root.style.setProperty('--primary-color', preset.primary);
        root.style.setProperty('--secondary-color', preset.secondary);
        root.style.setProperty('--background-color', preset.background);
        root.style.setProperty('--card-color', preset.card);
        root.style.setProperty('--text-color', preset.text);

        // Keep the theme preset select in sync even when applied programmatically.
        if (this.elements && this.elements.themePresetSelect) {
            this.elements.themePresetSelect.value = effectivePresetKey;
        }

        // If using a non-custom preset and custom color inputs exist,
        // update them for visual coherence.
        if (effectivePresetKey !== 'custom' && this.elements) {
            if (this.elements.primaryColor && this.elements.primaryColorText) {
                this.elements.primaryColor.value = preset.primary;
                this.elements.primaryColorText.value = preset.primary;
            }
            if (this.elements.secondaryColor && this.elements.secondaryColorText) {
                this.elements.secondaryColor.value = preset.secondary;
                this.elements.secondaryColorText.value = preset.secondary;
            }
            if (this.elements.bgColor && this.elements.bgColorText) {
                this.elements.bgColor.value = preset.background;
                this.elements.bgColorText.value = preset.background;
            }
            if (this.elements.textColor && this.elements.textColorText) {
                this.elements.textColor.value = preset.text;
                this.elements.textColorText.value = preset.text;
            }
        }

        // Centralized background strategy:
        // - #app-background provides base hex pattern
        // - customBackground augments via image or video
        const appBg = document.getElementById('app-background');

        // Always remove any existing dynamic video layer
        if (appBg) {
            const existingVideoLayer = appBg.querySelector('#bg-video-layer');
            if (existingVideoLayer) {
                existingVideoLayer.remove();
            }
        } else {
            // Ensure body isn't left with stale overrides
            document.body.style.backgroundImage = '';
            document.body.style.backgroundAttachment = '';
            document.body.style.backgroundSize = '';
        }

        // Default pattern: no customBackground -> clear overrides and rely on CSS.
        if (!customBackground) {
            if (appBg) {
                appBg.style.backgroundImage = '';
                appBg.style.backgroundSize = '';
                appBg.style.backgroundPosition = '';
                appBg.style.opacity = '0.9';
            } else {
                document.body.style.backgroundImage = '';
                document.body.style.backgroundAttachment = '';
                document.body.style.backgroundSize = '';
            }
            // Refresh preview chips to align with CSS vars
            this.updateThemePreviewChips();
            return;
        }

        // None preset: explicitly remove background image to show solid color only
        if (customBackground.type === 'none') {
            if (appBg) {
                appBg.style.backgroundImage = 'none';
                appBg.style.backgroundSize = '';
                appBg.style.backgroundPosition = '';
                appBg.style.opacity = '0.9';
            } else {
                document.body.style.backgroundImage = 'none';
                document.body.style.backgroundAttachment = '';
                document.body.style.backgroundSize = '';
            }
            // Refresh preview chips to align with CSS vars
            this.updateThemePreviewChips();
            return;
        }

        // Image URL: validate before applying
        if (customBackground.type === 'image' && customBackground.url && this.isLikelyImageUrl(customBackground.url)) {
            if (appBg) {
                appBg.style.backgroundImage = `url("${customBackground.url}")`;
                appBg.style.backgroundSize = 'cover';
                appBg.style.backgroundPosition = 'center center';
                appBg.style.opacity = '1';
            } else {
                document.body.style.backgroundImage = `url("${customBackground.url}")`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundAttachment = 'fixed';
            }
            this.updateThemePreviewChips();
            return;
        }

        // YouTube video: extract / use videoId and inject iframe under #app-background
        if (customBackground.type === 'youtube' && customBackground.videoId) {
            if (!appBg) {
                console.warn('Custom YouTube background requested but #app-background is missing.');
                this.updateThemePreviewChips();
                return;
            }

            const vid = customBackground.videoId;
            const layer = document.createElement('iframe');
            layer.id = 'bg-video-layer';
            layer.setAttribute('title', 'Decorative background video');
            layer.setAttribute('aria-hidden', 'true');
            layer.style.position = 'fixed';
            layer.style.top = '0';
            layer.style.left = '0';
            layer.style.width = '100%';
            layer.style.height = '100%';
            layer.style.zIndex = '-1';
            layer.style.border = 'none';
            layer.style.pointerEvents = 'none';
            layer.loading = 'lazy';
            layer.referrerPolicy = 'no-referrer';
            layer.src =
                `https://www.youtube.com/embed/${vid}` +
                `?controls=0&autoplay=1&mute=1&loop=1&playlist=${vid}`;

            appBg.appendChild(layer);
            appBg.style.backgroundImage = '';
            appBg.style.opacity = '1';
        }

        // Ensure UI swatches reflect the latest theme variables.
        this.updateThemePreviewChips();
    }

    /**
     * Load available games into the Offline tab checkbox list.
     * - Reads primary/alt library settings.
     * - Renders "Loading..." while fetching.
     * - Marks games from unblockee_offlineGames as checked.
     * - Enforces MAX 30 selection visually.
     */
    async loadOfflineGamesIntoList() {
        if (!this.elements.offlineGamesList) return;

        const container = this.elements.offlineGamesList;
        container.innerHTML = '<div class="no-games">Loading games...</div>';

        // Read configured libraries from localStorage (single source of truth)
        const primary = localStorage.getItem('unblockee_primaryLibrary') || 'default';
        const alt = localStorage.getItem('unblockee_altLibraryFile') || '';

        const libraryUrls = [];
        if (primary === 'default') {
            libraryUrls.push('components/zones.json');
        } else if (primary) {
            libraryUrls.push(primary);
        }
        if (alt) {
            libraryUrls.push(alt);
        }
        if (libraryUrls.length === 0) {
            libraryUrls.push('components/zones.json');
        }

        // Load persisted offline selection (ids as strings)
        let persistedIds = [];
        try {
            const raw = localStorage.getItem('unblockee_offlineGames');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    persistedIds = parsed.map(String);
                }
            }
        } catch {
            persistedIds = [];
        }

        try {
            const allGames = [];

            for (const url of libraryUrls) {
                try {
                    const res = await fetch(url);
                    if (!res.ok) continue;
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        data.forEach(g => {
                            if (!g || g.id == null) return;
                            // Avoid duplicates by id
                            if (!allGames.find(existing => String(existing.id) === String(g.id))) {
                                allGames.push(g);
                            }
                        });
                    }
                } catch {
                    // Ignore individual library failures; fall through to others
                }
            }

            if (allGames.length === 0) {
                container.innerHTML = '<div class="no-games">No games available from configured libraries.</div>';
                if (this.elements.offlineSelectedCount) {
                    this.elements.offlineSelectedCount.textContent = '0';
                }
                return;
            }

            // Render checkbox list
            const MAX = 30;
            const limitedPersisted = persistedIds.slice(0, MAX);
            const html = allGames.map(game => {
                const id = String(game.id);
                const checked = limitedPersisted.includes(id);
                const safeName = (game.name || `Game ${id}`).toString();
                return `
                    <label class="offline-game-item">
                        <input
                            type="checkbox"
                            data-game-id="${id}"
                            ${checked ? 'checked' : ''}
                        >
                        <span class="offline-game-name">${safeName}</span>
                    </label>
                `;
            }).join('');

            container.innerHTML = html;

            const selectedCount = container.querySelectorAll('input[type="checkbox"][data-game-id]:checked').length;
            if (this.elements.offlineSelectedCount) {
                this.elements.offlineSelectedCount.textContent = String(Math.min(selectedCount, MAX));
            }

            // Normalize and persist back to storage (enforce cap)
            const normalizedIds = Array.from(
                container.querySelectorAll('input[type="checkbox"][data-game-id]:checked')
            ).map(cb => cb.getAttribute('data-game-id')).slice(0, MAX);
            localStorage.setItem('unblockee_offlineGames', JSON.stringify(normalizedIds));

            // Keep settings snapshot in sync
            this.settings.offlineGames = normalizedIds;

        } catch (error) {
            console.warn('Failed to load offline games list:', error);
            container.innerHTML = '<div class="no-games">Failed to load games for offline selection.</div>';
            if (this.elements.offlineSelectedCount) {
                this.elements.offlineSelectedCount.textContent = '0';
            }
        }
    }

    open() {
        this.isOpen = true;

        // Ensure modal is fully initialized
        if (!this.modal) {
            console.error('Settings modal not properly initialized');
            return;
        }

        this.modal.classList.remove('hidden');
        document.body.classList.add('modal-open');

        // Reload cloak mode from localStorage to ensure we have the latest value
        const currentCloakMode = localStorage.getItem('unblockee_cloakMode') || 'none';
        if (this.settings) {
            this.settings.cloakMode = currentCloakMode;
        }

        this.populateForm();

        // Focus first input
        setTimeout(() => {
            const firstInput = this.modal.querySelector('.settings-input');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    close() {
        this.isOpen = false;
        this.modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }

    // Static method to wait for component to be ready
    static waitForReady() {
        return new Promise((resolve) => {
            const checkReady = () => {
                if (window.componentsReady && window.componentsReady.settings) {
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });
    }
}

SettingsModal.initSlider = function (sliderId) {
    const slider = document.getElementById(sliderId);
    if (slider) {
        slider.classList.add('slider-track');
    }
};

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize component tracking
    window.componentsReady = window.componentsReady || {};

    window.SettingsModal = new SettingsModal();

    // Mark component as ready
    window.componentsReady.settings = true;
    window.dispatchEvent(new CustomEvent('settingsReady'));
});

// Export for module usage
function initOfflineModeUI() {
    let desc = document.getElementById('offline-mode-desc');
    if (!desc) {
        desc = document.createElement('div');
        desc.id = 'offline-mode-desc';
        document.body.appendChild(desc);
    }
    desc.textContent = "Click games to cache for offline play; cached games load from storage";
}

function addNewCloakButton(container) {
    const button = document.createElement('button');
    button.className = 'cloak-btn add-new';
    button.innerHTML = '+';
    container.appendChild(button);
    button.onclick = () => {
        const faviconUrl = prompt('Favicon URL:');
        const tabTitle = prompt('Tab title:');
        if (faviconUrl && tabTitle) {
            let cloaks = JSON.parse(localStorage.getItem('cloaks') || '[]');
            cloaks.push({ faviconUrl, tabTitle });
            localStorage.setItem('cloaks', JSON.stringify(cloaks));
        }
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SettingsModal,
        addNewCloakButton
    };
}