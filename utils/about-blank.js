/**
 * Simple About:Blank and Blob Tab Utility
 * Opens content in new tabs using Blob URLs or about:blank
 */

(function (global) {
    'use strict';

    const AboutBlank = {
        /**
         * Open HTML content in a new Blob tab
         * @param {string} html - The HTML content to display
         */
        openBlob: (html) => {
            try {
                const blob = new Blob([html], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const win = window.open(url, '_blank');

                if (!win) {
                    console.error('Popup blocked');
                    return null;
                }

                // Clean up the blob URL after the page loads to free memory
                win.onload = () => {
                    URL.revokeObjectURL(url);
                };

                return win;
            } catch (e) {
                console.error('Failed to open blob tab:', e);
                return null;
            }
        },

        /**
         * Open HTML content in a new about:blank tab
         * @param {string} html - The HTML content to display
         */
        openAboutBlank: (html) => {
            try {
                const win = window.open('about:blank', '_blank');

                if (!win) {
                    console.error('Popup blocked');
                    return null;
                }

                win.document.write(html);
                win.document.close();

                return win;
            } catch (e) {
                console.error('Failed to open about:blank tab:', e);
                return null;
            }
        },

        /**
         * Open a URL in a new tab
         * @param {string} url - The URL to open
         */
        openURL: (url) => {
            return window.open(url, '_blank');
        }
    };

    // Expose to window
    global.AboutBlank = AboutBlank;

    // Backward compatibility if needed, otherwise you can remove this
    global.BlobTabUtils = AboutBlank;

})(window);
