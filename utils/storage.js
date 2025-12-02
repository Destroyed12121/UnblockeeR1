/**
 * Storage Utilities for Unblockee Alpha
 * Centralized localStorage management with error handling and type safety
 * Includes migration support for legacy storage keys
 */

(function(global) {
    'use strict';

    // Standardized storage keys configuration for better maintainability
    const STORAGE_KEYS = {
        // Privacy & Security
        ANTI_CLOSE: 'antiClose',
        PANIC_KEY: 'panicKey',
        PANIC_ACTION: 'panicAction',
        SELECTED_CLOAK: 'selectedCloak',
        CLOAK_DATA: 'cloak',
        CLOAK_ROTATION: 'cloakRotation',
        CLOAK_ROTATION_INTERVAL: 'cloakRotationInterval',
        AUTO_ABOUT_BLANK: 'autoAboutBlank',
        AUTO_BLOB_TAB: 'autoBlobTab',
        
        // Appearance & Theme
        THEME: 'theme',
        LANGUAGE: 'language',
        SELECTED_THEME: 'selectedTheme',
        CUSTOM_BG_COLOR: 'customBgColor',
        CUSTOM_GRADIENT: 'customGradient',
        CUSTOM_VIDEO_URL: 'customVideoUrl',
        BACKGROUND_OVERRIDE: 'backgroundOverride',
        CACHED_BG_STYLE: 'cachedBgStyle',
        
        // Performance & Effects
        PERFORMANCE_MODE: 'performanceMode',
        EFFECT_DENSITY: 'effectDensity',
        SELECTED_DOT_SPEED: 'selectedDotSpeed',
        PARTICLE_DENSITY: 'particleDensity',
        PARTICLE_SPEED: 'particleSpeed',
        
        // Favicons
        CUSTOM_FAVICONS: 'customFavicons',
        FAVICON_ROTATION: 'faviconRotation',
        FAVICON_ROTATION_INTERVAL: 'faviconRotationInterval',
        FAVICON_VISIBILITY_TOGGLE: 'faviconVisibilityToggle',
        CURRENT_FAVICON_INDEX: 'currentFaviconIndex',
        
        // Settings
        SETTINGS: 'settings',
        PROX_SERVER: 'proxServer',
        OFFLINE_MODE: 'offlineMode',
        
        // API Keys
        OPENAI_API_KEY: 'openAiApiKey',
        GEMINI_API_KEY: 'geminiApiKey',
        OPENROUTER_API_KEY: 'openRouterApiKey',
        
        // Shortcuts
        SHORTCUTS: 'shortcuts',
        
        // Chatbot
        CHATBOT_MESSAGES: 'chatbotMessages',
        
        // Changelog
        LAST_SEEN_CHANGELOG_VERSION: 'lastSeenChangelogVersion',
        CHANGELOG_DISMISSED_AT: 'changelogDismissedAt',
        
        // Caching
        GAME_PLAY_COUNT: 'gamePlayCount',
        CACHED_GAMES: 'cachedGames',
        AUTO_LAUNCH_EXECUTED: 'autoLaunchExecuted',
        
        // Search
        SEARCH_ENGINE: 'searchEngine',
        
        // Error Logging
        ERROR_LOGS: 'errorLogs',
        
        // Movies
        SELECTED_SERVER: 'selectedServer',
        HEALTH_CHECK_CACHE: 'healthCheckCache',
        
        // Game Library
        ALTERNATE_GAME_LIBRARY_ENABLED: 'alternateGameLibraryEnabled'
    };

    // Default values for storage keys
    const DEFAULTS = {
        ANTI_CLOSE: false,
        PANIC_KEY: 'Escape',
        PANIC_ACTION: 'https://edpuzzle.com/notifications',
        SELECTED_CLOAK: 'default',
        CLOAK_ROTATION: false,
        CLOAK_ROTATION_INTERVAL: 2.0,
        AUTO_ABOUT_BLANK: false,
        AUTO_BLOB_TAB: false,
        THEME: 'dark',
        LANGUAGE: 'en',
        SELECTED_THEME: 'dark',
        CUSTOM_BG_COLOR: '#000000',
        CUSTOM_GRADIENT: '',
        CUSTOM_VIDEO_URL: '',
        BACKGROUND_OVERRIDE: '',
        CACHED_BG_STYLE: '',
        PERFORMANCE_MODE: false,
        EFFECT_DENSITY: 'high',
        SELECTED_DOT_SPEED: 'normal',
        PARTICLE_DENSITY: 'high',
        PARTICLE_SPEED: 'normal',
        FAVICON_ROTATION: false,
        FAVICON_ROTATION_INTERVAL: 2,
        FAVICON_VISIBILITY_TOGGLE: false,
        CURRENT_FAVICON_INDEX: 0,
        SETTINGS: {},
        PROX_SERVER: 'https://wisp.onder.cc',
        OFFLINE_MODE: false,
        OPENAI_API_KEY: '',
        GEMINI_API_KEY: '',
        OPENROUTER_API_KEY: '',
        SHORTCUTS: [],
        CHATBOT_MESSAGES: [],
        LAST_SEEN_CHANGELOG_VERSION: '0.0.0',
        CHANGELOG_DISMISSED_AT: '',
        GAME_PLAY_COUNT: 0,
        CACHED_GAMES: [],
        AUTO_LAUNCH_EXECUTED: false,
        SEARCH_ENGINE: 'duckduckgo',
        ERROR_LOGS: [],
        SELECTED_SERVER: 'Vidplus',
        HEALTH_CHECK_CACHE: '',
        ALTERNATE_GAME_LIBRARY_ENABLED: false
    };

    // Legacy key mappings for migration
    const LEGACY_KEY_MAPPINGS = {
        // Common variations and typos
        'anti-close': 'antiClose',
        'anti_close': 'antiClose',
        'anticlose': 'antiClose',
        
        'panic-key': 'panicKey',
        'panic_key': 'panicKey',
        'panickey': 'panicKey',
        
        'panic-action': 'panicAction',
        'panic_action': 'panicAction',
        'panicaction': 'panicAction',
        
        'selected-cloak': 'selectedCloak',
        'selected_cloak': 'selectedCloak',
        'cloak-select': 'selectedCloak',
        'cloak_select': 'selectedCloak',
        'cloak-rotation': 'cloakRotation',
        'cloak_rotation': 'cloakRotation',
        'cloak-rotation-interval': 'cloakRotationInterval',
        'cloak_rotation_interval': 'cloakRotationInterval',
        
        'auto-about-blank': 'autoAboutBlank',
        'auto_about_blank': 'autoAboutBlank',
        'autoaboutblank': 'autoAboutBlank',
        'about-blank-auto': 'autoAboutBlank',
        
        'auto-blob-tab': 'autoBlobTab',
        'auto_blob_tab': 'autoBlobTab',
        'autoblobtab': 'autoBlobTab',
        
        // Theme variations
        'selected-theme': 'selectedTheme',
        'selected_theme': 'selectedTheme',
        'themeselected': 'selectedTheme',
        
        // Performance variations
        'performance-mode': 'performanceMode',
        'performance_mode': 'performanceMode',
        'performancemode': 'performanceMode',
        
        // Favicon variations
        'custom-favicons': 'customFavicons',
        'custom_favicons': 'customFavicons',
        'favicon-rotation': 'faviconRotation',
        'favicon_rotation': 'faviconRotation',
        'faviconrotation': 'faviconRotation',
        'favicon-rotation-interval': 'faviconRotationInterval',
        'favicon_rotation_interval': 'faviconRotationInterval',
        'favicon-visibility-toggle': 'faviconVisibilityToggle',
        'favicon_visibility_toggle': 'faviconVisibilityToggle',
        
        // Proxy variations
        'prox-server': 'proxServer',
        'prox_server': 'proxServer',
        'proxy-server': 'proxServer',
        'proxy_server': 'proxServer',
        'wisp-url': 'proxServer',
        'wisp_url': 'proxServer',
        
        // API key variations
        'openai-api-key': 'openAiApiKey',
        'openai_api_key': 'openAiApiKey',
        'gemini-api-key': 'geminiApiKey',
        'gemini_api_key': 'geminiApiKey',
        'openrouter-api-key': 'openRouterApiKey',
        'openrouter_api_key': 'openRouterApiKey',
        
        // Search engine
        'search-engine': 'searchEngine',
        'search_engine': 'searchEngine',
        
        // Shortcuts
        'user-shortcuts': 'shortcuts',
        'user_shortcuts': 'shortcuts',
        'custom-shortcuts': 'shortcuts',
        'custom_shortcuts': 'shortcuts'
    };

    /**
     * Safely get an item from localStorage with error handling
     * @param {string} key - The storage key
     * @param {*} defaultValue - Default value if key doesn't exist or on error
     * @returns {*} The stored value or default value
     */
    const safeGet = (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            if (item === null || item === undefined) {
                return defaultValue;
            }
            
            // Try to parse as JSON first
            try {
                return JSON.parse(item);
            } catch {
                // If JSON parsing fails, return as string
                return item;
            }
        } catch (error) {
            console.warn(`Failed to get localStorage key "${key}":`, error);
            return defaultValue;
        }
    };

    /**
     * Safely set an item in localStorage with error handling
     * @param {string} key - The storage key
     * @param {*} value - The value to store
     * @returns {boolean} Success status
     */
    const safeSet = (key, value) => {
        try {
            const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
            return true;
        } catch (error) {
            console.error(`Failed to set localStorage key "${key}":`, error);
            return false;
        }
    };

    /**
     * Safely remove an item from localStorage
     * @param {string} key - The storage key to remove
     * @returns {boolean} Success status
     */
    const safeRemove = (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Failed to remove localStorage key "${key}":`, error);
            return false;
        }
    };

    /**
     * Get a boolean value with type safety
     * @param {string} key - The storage key
     * @param {boolean} defaultValue - Default boolean value
     * @returns {boolean} The boolean value
     */
    const getBoolean = (key, defaultValue = false) => {
        const value = safeGet(key, defaultValue);
        return typeof value === 'boolean' ? value : (value === 'true');
    };

    /**
     * Set a boolean value
     * @param {string} key - The storage key
     * @param {boolean} value - The boolean value to set
     * @returns {boolean} Success status
     */
    const setBoolean = (key, value) => {
        return safeSet(key, Boolean(value));
    };

    /**
     * Get a numeric value with type safety
     * @param {string} key - The storage key
     * @param {number} defaultValue - Default numeric value
     * @returns {number} The numeric value
     */
    const getNumber = (key, defaultValue = 0) => {
        const value = safeGet(key, defaultValue);
        const parsed = Number(value);
        return isNaN(parsed) ? defaultValue : parsed;
    };

    /**
     * Set a numeric value
     * @param {string} key - The storage key
     * @param {number} value - The numeric value to set
     * @returns {boolean} Success status
     */
    const setNumber = (key, value) => {
        return safeSet(key, Number(value));
    };

    /**
     * Get an object with type safety and validation
     * @param {string} key - The storage key
     * @param {Object} defaultValue - Default object value
     * @param {Function} validator - Optional validator function
     * @returns {Object} The object value
     */
    const getObject = (key, defaultValue = {}, validator = null) => {
        const value = safeGet(key, defaultValue);
        if (typeof value !== 'object' || value === null) {
            return defaultValue;
        }
        return validator ? (validator(value) ? value : defaultValue) : value;
    };

    /**
     * Set an object with validation
     * @param {string} key - The storage key
     * @param {Object} value - The object to store
     * @param {Function} validator - Optional validator function
     * @returns {boolean} Success status
     */
    const setObject = (key, value, validator = null) => {
        if (typeof value !== 'object' || value === null) {
            console.warn(`Attempted to set non-object value for key "${key}"`);
            return false;
        }
        if (validator && !validator(value)) {
            console.warn(`Object validation failed for key "${key}"`);
            return false;
        }
        return safeSet(key, value);
    };

    /**
     * Check if localStorage is available
     * @returns {boolean} Whether localStorage is available
     */
    const isAvailable = () => {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    };

    /**
     * Get all storage keys that match a prefix
     * @param {string} prefix - The prefix to match
     * @returns {string[]} Array of matching keys
     */
    const getKeysWithPrefix = (prefix) => {
        const keys = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    keys.push(key);
                }
            }
        } catch (error) {
            console.warn('Failed to iterate localStorage keys:', error);
        }
        return keys;
    };

    /**
     * Clear all storage keys that match a prefix
     * @param {string} prefix - The prefix to match and clear
     * @returns {number} Number of keys cleared
     */
    const clearWithPrefix = (prefix) => {
        const keys = getKeysWithPrefix(prefix);
        let cleared = 0;
        keys.forEach(key => {
            if (safeRemove(key)) {
                cleared++;
            }
        });
        return cleared;
    };

    /**
     * Migrate old storage keys to new standardized names
     * @returns {Object} Migration results with counts
     */
    const migrateLegacyKeys = () => {
        const results = {
            migrated: 0,
            errors: 0,
            skipped: 0,
            details: []
        };

        try {
            // Check for legacy keys and migrate them
            Object.entries(LEGACY_KEY_MAPPINGS).forEach(([legacyKey, newKey]) => {
                try {
                    const oldValue = localStorage.getItem(legacyKey);
                    if (oldValue !== null) {
                        // Check if new key already exists
                        const newValue = localStorage.getItem(newKey);
                        if (newValue === null) {
                            // Migrate the value
                            safeSet(newKey, oldValue);
                            safeRemove(legacyKey);
                            results.migrated++;
                            results.details.push(`Migrated "${legacyKey}" -> "${newKey}"`);
                        } else {
                            // Skip if new key already exists
                            results.skipped++;
                            results.details.push(`Skipped "${legacyKey}" -> "${newKey}" (new key exists)`);
                        }
                    }
                } catch (error) {
                    results.errors++;
                    results.details.push(`Error migrating "${legacyKey}": ${error.message}`);
                }
            });

            // Log migration results (critical info)
            console.info('Storage migration completed:', results);
            
        } catch (error) {
            console.error('Storage migration failed:', error);
            results.errors++;
        }

        return results;
    };

    /**
     * Get all storage keys for audit purposes
     * @returns {string[]} Array of all storage keys
     */
    const getAllKeys = () => {
        const keys = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    keys.push(key);
                }
            }
        } catch (error) {
            console.warn('Failed to iterate localStorage keys:', error);
        }
        return keys;
    };

    /**
     * Audit storage keys for consistency and deprecated usage
     * @returns {Object} Audit results
     */
    const auditKeys = () => {
        const allKeys = getAllKeys();
        const standardKeys = Object.values(STORAGE_KEYS);
        const legacyKeys = Object.keys(LEGACY_KEY_MAPPINGS);
        
        const results = {
            totalKeys: allKeys.length,
            standardKeys: [],
            legacyKeys: [],
            unknownKeys: [],
            statistics: {
                standard: 0,
                legacy: 0,
                unknown: 0
            }
        };

        allKeys.forEach(key => {
            if (standardKeys.includes(key)) {
                results.standardKeys.push(key);
                results.statistics.standard++;
            } else if (legacyKeys.includes(key)) {
                results.legacyKeys.push(key);
                results.statistics.legacy++;
            } else {
                results.unknownKeys.push(key);
                results.statistics.unknown++;
            }
        });

        return results;
    };

    // Public API
    const StorageUtils = {
        // Constants
        KEYS: STORAGE_KEYS,
        DEFAULTS: DEFAULTS,
        LEGACY_MAPPINGS: LEGACY_KEY_MAPPINGS,
        
        // Core methods
        get: safeGet,
        set: safeSet,
        remove: safeRemove,
        
        // Type-specific methods
        getBoolean,
        setBoolean,
        getNumber,
        setNumber,
        getObject,
        setObject,
        
        // Utility methods
        isAvailable,
        getKeysWithPrefix,
        clearWithPrefix,
        migrateLegacyKeys,
        getAllKeys,
        auditKeys
    };

    // Export for both module and global usage
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = StorageUtils;
    } else {
        global.StorageUtils = StorageUtils;
    }

    // Migrate legacy keys as soon as the module loads
    StorageUtils.migrateLegacyKeys();

})(typeof window !== 'undefined' ? window : this);