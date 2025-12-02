// --- START OF FILE popup.js ---

// Global state for the popup
let currentGameHTML = null;
let currentMediaContext = null;
let activeGameUrl = null; // FIX: Track current URL to prevent race conditions

// --- CSS STYLES ---
const popupStyles = `
    :root {
        /* UBG2000 Color Palette */
        --m-bg-overlay: rgba(0, 0, 0, 0.8);
        --m-card-bg: #0a0a0a;
        --m-border-color: rgba(255, 255, 255, 0.1);
        --m-text-main: #fff;
        --m-text-muted: #aaa;
        --m-btn-bg: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
        --m-btn-hover: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
        --m-font: 'Inter', system-ui, -apple-system, sans-serif;
    }

    /* Animation Keyframes */
    @keyframes modalSlideIn {
        from { opacity: 0; transform: translateY(20px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .hidden { display: none !important; }
    
    /* 1. Backdrop Overlay */
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: var(--m-bg-overlay);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        animation: fadeIn 0.3s forwards;
    }
    
    @keyframes fadeIn { to { opacity: 1; } }

    /* 2. The Popup Box */
    .modal-container {
        background: var(--m-card-bg);
        width: 900px;
        height: 700px;
        max-width: 90vw;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        border-radius: 16px;
        border: 1px solid var(--m-border-color);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        overflow: hidden;
        animation: modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    /* Header styling */
    .modal-bar {
        height: 70px;
        padding: 0 25px;
        background: var(--m-card-bg);
        border-bottom: 1px solid var(--m-border-color);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
    }

    .modal-header h2 {
        margin: 0;
        font-family: var(--m-font);
        font-size: 20px; 
        font-weight: 600;
        color: var(--m-text-main);
        display: flex;
        align-items: center;
        gap: 10px;
    }

    /* 3. The Close Button */
    .modal-close-btn {
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        border-radius: 50%;
        color: var(--m-text-muted);
        font-size: 20px;
        cursor: pointer;
        transition: opacity 0.3s ease, color 0.3s ease;
    }

    .modal-close-btn:hover {
        background: transparent;
        color: var(--m-text-main);
        opacity: 0.7;
        transform: none;
    }

    /* Body */
    .modal-body {
        flex: 1;
        background: var(--m-card-bg); 
        position: relative;
        overflow: hidden;
    }
    
    #universalModalFrame {
        width: 100%;
        height: 100%;
        border: none;
        display: block;
        background: #000; 
    }

    /* Footer */
    .modal-footer {
        height: 70px;
        border-top: 1px solid var(--m-border-color);
        background: var(--m-card-bg);
        padding: 0 25px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
    }

    .footer-group {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    /* 4. The Styled Buttons */
    .btn {
        background: var(--m-btn-bg);
        border: 1px solid var(--m-border-color);
        color: var(--m-text-main);
        padding: 10px 18px;
        border-radius: 8px;
        font-family: var(--m-font);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s ease;
        text-decoration: none;
        backdrop-filter: blur(4px);
    }

    .btn:hover {
        background: var(--m-btn-hover);
        border-color: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    
    .btn i { font-size: 14px; }

    /* Dropdowns styling */
    .modal-select {
        background: var(--m-btn-bg);
        border: 1px solid var(--m-border-color);
        color: var(--m-text-main);
        padding: 10px 14px;
        border-radius: 8px;
        font-family: var(--m-font);
        font-size: 14px;
        outline: none;
        cursor: pointer;
        transition: all 0.2s ease;
        height: 38px; 
    }
    .modal-select:hover {
        border-color: rgba(255, 255, 255, 0.3);
        background: var(--m-btn-hover);
    }
    .modal-select option { background: #111; color: #fff; }

    /* Label Text and Control Grouping */
    .control-item {
        color: var(--m-text-muted);
        font-family: var(--m-font);
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .control-item span {
        color: var(--m-text-main);
    }

    /* Toggle Switch */
    .toggle-switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
    }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    
    .slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: rgba(255,255,255,0.1);
        transition: .3s;
        border-radius: 24px;
        border: 1px solid var(--m-border-color);
    }
    
    .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 2px;
        bottom: 2px;
        background-color: #fff;
        transition: .3s;
        border-radius: 50%;
    }
    
    input:checked + .slider { 
        background-color: rgba(255, 255, 255, 0.2); 
        border-color: transparent; 
    }
    
    input:checked + .slider:before { 
        transform: translateX(20px); 
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
        .modal-container {
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            border-radius: 0;
            border: none;
        }
        .modal-footer {
            flex-direction: column;
            height: auto;
            padding: 15px 25px;
            align-items: stretch;
            gap: 10px;
        }
        .footer-group {
            justify-content: space-between;
        }
    }
`;

/**
 * Ensures the modal HTML structure exists in the DOM.
 */
function ensureModalExists() {
    if (document.getElementById('universalModal')) return;

    // Inject CSS
    const styleSheet = document.createElement("style");
    styleSheet.innerText = popupStyles;
    document.head.appendChild(styleSheet);

    // Inject HTML - FIX: Added 'allow' attributes for better game compatibility
    const modalHTML = `
        <div id="universalModal" class="modal-overlay hidden">
            <div class="modal-container">
                <div class="modal-header modal-bar">
                    <h2 id="universalModalTitle">Content Viewer</h2>
                    <button class="modal-close-btn" onclick="closeUniversalModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <iframe id="universalModalFrame" 
                        allowfullscreen="true" 
                        allow="autoplay; fullscreen; gamepad; clipboard-read; clipboard-write; encrypted-media" 
                        sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation">
                    </iframe>
                </div>
                <div id="universalModalFooter" class="modal-footer modal-bar">
                    <!-- Content injected dynamically -->
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// --- Main Entry Point ---

window.openMediaModal = function (mediaData, contentType = 'game', callbacks = {}) {
    ensureModalExists();

    const modal = document.getElementById('universalModal');
    const frame = document.getElementById('universalModalFrame');
    const title = document.getElementById('universalModalTitle');
    const footer = document.getElementById('universalModalFooter');

    // Reset State
    // FIX: Explicitly clear the previous src to prevent bleeding
    frame.removeAttribute('srcdoc'); 
    frame.src = "about:blank";
    
    currentGameHTML = null;
    currentMediaContext = callbacks;
    activeGameUrl = null;

    // Set Title
    title.textContent = mediaData.name || mediaData.title || "Content Viewer";

    // Build Footer
    if (contentType === 'game') {
        buildGameFooter(footer, mediaData);
        loadGameContent(mediaData.url, frame);
    } else {
        buildMovieFooter(footer, callbacks);
        if (callbacks.onInit) callbacks.onInit(frame);
    }

    // Show Modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; 
};

window.closeUniversalModal = function () {
    const modal = document.getElementById('universalModal');
    const frame = document.getElementById('universalModalFrame');
    
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Stop any audio/video by clearing src
        setTimeout(() => {
            frame.src = 'about:blank';
            frame.removeAttribute('srcdoc');
            currentGameHTML = null;
            currentMediaContext = null;
            activeGameUrl = null;
        }, 100);
    }
};

// --- Internal Builder Functions ---

function getCommonButtonsHTML() {
    return `
        <button class="btn btn-secondary" onclick="fullscreenModalFrame()">
            <i class="fas fa-expand"></i> Fullscreen
        </button>
        <button class="btn btn-secondary" onclick="launchGameNewTab()">
            <i class="fas fa-external-link-alt"></i> Open in About:blank
        </button>
    `;
}

function buildGameFooter(footerContainer, mediaData) {
    const filename = (mediaData.name || 'game').replace(/'/g, "\\'");
    
    footerContainer.innerHTML = `
        <div class="footer-group footer-left"></div>
        <div class="footer-group">
            <button class="btn btn-secondary" onclick="downloadGame('${filename}')">
                <i class="fas fa-download"></i> Download
            </button>
            ${getCommonButtonsHTML()}
        </div>
    `;
}

function buildMovieFooter(footerContainer, context) {
    let optionsHTML = '';
    if (context.providerList) {
        context.providerList.forEach(p => {
            const selected = p.name === context.currentProvider ? 'selected' : '';
            optionsHTML += `<option value="${p.name}" ${selected}>${p.name}</option>`;
        });
    }

    const proxyChecked = context.isProxyEnabled ? 'checked' : '';

    footerContainer.innerHTML = `
        <div class="footer-group footer-left">
            <div class="control-item">
                <i class="fas fa-server"></i>
                <select id="modalProviderSelect" class="modal-select">
                    ${optionsHTML}
                </select>
            </div>
            <div class="control-item">
                <label class="toggle-switch">
                    <input type="checkbox" id="modalProxyToggle" ${proxyChecked}>
                    <span class="slider"></span>
                </label>
                <span>Use proxy</span>
            </div>
        </div>
        <div class="footer-group footer-right">
            ${getCommonButtonsHTML()}
        </div>
    `;

    const providerSelect = document.getElementById('modalProviderSelect');
    const proxyToggle = document.getElementById('modalProxyToggle');

    if (providerSelect && context.onProviderChange) {
        providerSelect.addEventListener('change', (e) => context.onProviderChange(e.target.value));
    }
    if (proxyToggle && context.onProxyToggle) {
        proxyToggle.addEventListener('change', (e) => context.onProxyToggle(e.target.checked));
    }
}

// --- Logic Functions ---

function loadGameContent(url, frame) {
    console.log(`[Popup] Loading game from ${url}`);
    
    // FIX: Set active URL to track requests
    activeGameUrl = url;

    // Show loading state
    const doc = frame.contentDocument || frame.contentWindow.document;
    doc.open();
    doc.write(`
        <style>body{background:#0a0a0a;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#fff;font-family:sans-serif;}</style>
        <h3>Loading Game...</h3>
    `);
    doc.close();

    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch game code');
            return res.text();
        })
        .then(html => {
            // FIX: Race Condition Check
            if (activeGameUrl !== url) {
                console.log("[Popup] Fetch ignored, url changed.");
                return;
            }

            // FIX: Ensure Modal wasn't closed during fetch
            const currentFrame = document.getElementById('universalModalFrame');
            if (!currentFrame) return;

            currentGameHTML = html;
            
            // FIX: Robust document writing
            const doc = currentFrame.contentDocument || currentFrame.contentWindow.document;
            
            // Explicitly clear before writing
            doc.open();
            doc.write(html);
            doc.close();
            
            // FIX: Ensure focus is on the game for keyboard controls
            currentFrame.contentWindow.focus();
        })
        .catch(err => {
            if (activeGameUrl !== url) return;
            const doc = frame.contentDocument || frame.contentWindow.document;
            doc.open();
            doc.write(`<h3 style="color:white;font-family:sans-serif;text-align:center;margin-top:20%">Failed to load content: ${err.message}</h3>`);
            doc.close();
        });
}

window.fullscreenModalFrame = function () {
    const frame = document.getElementById('universalModalFrame');
    if (!frame) return;
    if (frame.requestFullscreen) frame.requestFullscreen();
    else if (frame.webkitRequestFullscreen) frame.webkitRequestFullscreen();
};

/**
 * FIX: Completely rewritten to handle Games vs Movies differently.
 * Games must NOT be wrapped in another HTML/Body tag, or they break.
 */
window.launchGameNewTab = function () {
    // 1. Determine Mode
    const isMovie = currentMediaContext && currentMediaContext.getPayloadUrl;
    
    // 2. Prepare Window
    let win;
    if (window.AboutBlank && window.AboutBlank.openAboutBlank) {
        // Use custom launcher if available
        win = window.AboutBlank.openAboutBlank(""); 
    } else {
        win = window.open('about:blank', '_blank');
    }

    if (!win) {
        alert("Popups are blocked. Please allow popups for this site.");
        return;
    }

    // 3. Logic Branching
    if (isMovie) {
        // --- MOVIE MODE ---
        // Movies need an iframe wrapper to play the source URL
        const url = currentMediaContext.getPayloadUrl();
        if (!url) return;

        const wrapperHTML = `
            <!DOCTYPE html>
            <html style="width:100%; height:100%; margin:0; padding:0; background-color:#000;">
            <head>
                <title>Content Player</title>
                <style>
                    html, body { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; background-color: #000; }
                    iframe { width: 100%; height: 100%; border: none; background: #000; }
                </style>
            </head>
            <body>
                <iframe src="${url}" allowfullscreen allow="autoplay; encrypted-media"></iframe>
            </body>
            </html>
        `;
        
        win.document.open();
        win.document.write(wrapperHTML);
        win.document.close();
        
    } else {
        // --- GAME MODE ---
        // Games are usually FULL HTML documents. 
        // FIX: Do NOT wrap them in <html><body>...</body></html>. Write the raw HTML.
        
        if (!currentGameHTML) {
            alert("Game content is still loading...");
            win.close();
            return;
        }

        win.document.open();
        win.document.write(currentGameHTML);
        win.document.close();
    }
};

window.downloadGame = function (filename) {
    if (!currentGameHTML) return alert("Nothing to download.");
    
    const blob = new Blob([currentGameHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.html`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
};

// --- COMPATIBILITY ALIASES ---
window.openGameModal = window.openMediaModal;
window.closeGameModal = window.closeUniversalModal;
window.fullscreenGame = window.fullscreenModalFrame;