/**
 * Color Thief Manager Utility
 * Shared Color Thief manager for extracting dominant colors from images
 * Provides global enable/disable via localStorage, caching, debouncing, and fallback support
 */

class ColorThiefManager {
    constructor() {
        this.enabled = localStorage.getItem('unblockee_globalColorThief') === 'true';
        this.colorCache = new Map(); // imageUrl -> [color1, color2, color3, color4]
        this.debounceTimer = null;
        this.fallbackColors = [
            [102, 105, 155], // #66699b
            [115, 118, 145], // #737691
            [138, 165, 196], // #8da5c4
            [184, 166, 217]  // #b8a6d9
        ];
        this.initializeLibrary();
    }

    async initializeLibrary() {
        if (window.ColorThief) return;

        try {
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.0/color-thief.umd.js');
            console.log('Color Thief library loaded successfully');
        } catch (error) {
            console.error('Failed to load Color Thief library:', error);
        }
    }

    async loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    enable() {
        this.enabled = true;
        localStorage.setItem('unblockee_globalColorThief', 'true');
        console.log('Color Thief manager enabled globally');
    }

    disable() {
        this.enabled = false;
        localStorage.setItem('unblockee_globalColorThief', 'false');
        this.restoreDefaults();
        console.log('Color Thief manager disabled, defaults restored');
    }

    restoreDefaults() {
        document.documentElement.style.setProperty('--color-1', `rgb(${this.fallbackColors[0].join(',')})`);
        document.documentElement.style.setProperty('--color-2', `rgb(${this.fallbackColors[1].join(',')})`);
        document.documentElement.style.setProperty('--color-3', `rgb(${this.fallbackColors[2].join(',')})`);
        document.documentElement.style.setProperty('--color-4', `rgb(${this.fallbackColors[3].join(',')})`);
        this.emitApplied();
    }

    extractAndApplyColors(imageElement, targetElement) {
        if (!this.enabled || !window.ColorThief || !imageElement) return;

        const url = imageElement.src;
        if (!url) return;

        // Check cache first
        if (this.colorCache.has(url)) {
            this.applyColors(this.colorCache.get(url));
            return;
        }

        // Extract colors
        try {
            const colorThief = new ColorThief();
            let colors;

            if (imageElement.complete && imageElement.naturalHeight > 0) {
                colors = colorThief.getPalette(imageElement, 4);
            } else {
                // Wait for image to load
                imageElement.onload = () => {
                    try {
                        const loadedColors = colorThief.getPalette(imageElement, 4);
                        this.colorCache.set(url, loadedColors);
                        this.applyColors(loadedColors);
                        this.emitApplied();
                    } catch (e) {
                        console.error('Color extraction failed on load:', e);
                        this.applyFallback();
                    }
                };
                return; // Don't apply yet
            }

            if (colors && colors.length >= 4) {
                this.colorCache.set(url, colors);
                this.applyColors(colors);
                this.emitApplied();
            } else {
                throw new Error('Insufficient colors extracted');
            }
        } catch (error) {
            console.error('Color extraction failed:', error);
            this.applyFallback();
        }
    }

    applyColors(colors) {
        if (!Array.isArray(colors) || colors.length < 4) {
            this.applyFallback();
            return;
        }

        // Apply to CSS variables
        document.documentElement.style.setProperty('--color-1', `rgb(${colors[0].join(',')})`);
        document.documentElement.style.setProperty('--color-2', `rgb(${colors[1].join(',')})`);
        document.documentElement.style.setProperty('--color-3', `rgb(${colors[2].join(',')})`);
        document.documentElement.style.setProperty('--color-4', `rgb(${colors[3].join(',')})`);
    }

    applyFallback() {
        this.applyColors(this.fallbackColors);
    }

    applyToPage() {
        if (!this.enabled) return;

        // Debounce to prevent excessive processing
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this._scanAndApply();
        }, 500);
    }

    _scanAndApply() {
        // Scan for dominant images (album art, posters, etc.)
        const selectors = [
            'img[alt*="album"]',
            'img[alt*="cover"]',
            'img[alt*="poster"]',
            'img[data-dominant]',
            '.album-art img',
            '.poster img'
        ];

        let dominantImage = null;
        let maxArea = 0;

        selectors.forEach(selector => {
            const images = document.querySelectorAll(selector);
            images.forEach(img => {
                const rect = img.getBoundingClientRect();
                const area = rect.width * rect.height;
                if (area > maxArea && img.src) {
                    dominantImage = img;
                    maxArea = area;
                }
            });
        });

        if (dominantImage) {
            this.extractAndApplyColors(dominantImage);
        } else {
            // No dominant image found, apply fallback
            this.applyFallback();
        }
    }

    emitApplied() {
        const currentColors = this.getCurrentColors();
        document.dispatchEvent(new CustomEvent('colorThiefApplied', {
            detail: { colors: currentColors }
        }));
    }

    getCurrentColors() {
        const computed = getComputedStyle(document.documentElement);
        return [
            this.rgbStringToArray(computed.getPropertyValue('--color-1')),
            this.rgbStringToArray(computed.getPropertyValue('--color-2')),
            this.rgbStringToArray(computed.getPropertyValue('--color-3')),
            this.rgbStringToArray(computed.getPropertyValue('--color-4'))
        ];
    }

    rgbStringToArray(rgbString) {
        const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [0, 0, 0];
    }

    clearCache() {
        this.colorCache.clear();
        console.log('Color Thief cache cleared');
    }
}

// Initialize globally
window.ColorThiefManager = new ColorThiefManager();

// Auto-apply on page load if enabled
document.addEventListener('DOMContentLoaded', () => {
    if (window.ColorThiefManager.enabled) {
        window.ColorThiefManager.applyToPage();
    }
});

// Export for modules
const isColorThiefEnabled = () => localStorage.getItem('unblockee_globalColorThief') === 'true';

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ColorThiefManager, isColorThiefEnabled };
}