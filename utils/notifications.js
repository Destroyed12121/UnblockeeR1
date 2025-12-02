


class NotificationManager {
  constructor() {
    this.container = null;
    this.queue = [];
    this.active = [];
    this.maxActive = 4;
    this.init();
  }

  init() {
    this.createContainer();
    this.injectStyles();
  }

  createContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'notification-container';
      this.container.className = 'notification-container';
      document.body.appendChild(this.container);
    }
  }

  injectStyles() {
    if (document.getElementById('notification-styles')) return;

    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .notification-container {
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
      }

      .notification {
        background: rgba(26, 26, 26, 0.95);
        backdrop-filter: blur(8px);
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        color: #eaeaea;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        max-width: 380px;
        min-width: 280px;
        padding: 16px 20px;
        position: relative;
        pointer-events: auto;
        opacity: 0;
        transform: translateX(-100%);
        animation: notificationSlideIn 0.4s ease-out forwards;
        border: 1px solid rgba(51, 51, 51, 0.3);
      }

      .notification.fade-out {
        animation: notificationFadeOut 0.3s ease-in forwards;
      }

      @keyframes notificationSlideIn {
        from {
          opacity: 0;
          transform: translateX(-100%) translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateX(0) translateY(0);
        }
      }

      @keyframes notificationFadeOut {
        from {
          opacity: 1;
          transform: translateX(0) translateY(0);
        }
        to {
          opacity: 0;
          transform: translateX(-100%) translateY(-10px);
        }
      }

      .notification.success {
        border-left: 4px solid #4caf50;
      }

      .notification.error {
        border-left: 4px solid #f44336;
      }

      .notification.warning {
        border-left: 4px solid #ff9800;
      }

      .notification.info {
        border-left: 4px solid #2196f3;
      }

      .notification-content {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .notification-text {
        flex: 1;
        font-size: 14px;
        line-height: 1.5;
        margin: 0;
      }

      .notification-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
        justify-content: flex-end;
      }

      .notification-btn {
        background: rgba(51, 51, 51, 0.8);
        border: 1px solid rgba(80, 80, 80, 0.5);
        border-radius: 6px;
        color: #eaeaea;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        padding: 6px 12px;
        transition: all 0.2s ease;
      }

      .notification-btn:hover {
        background: rgba(80, 80, 80, 0.9);
        transform: translateY(-1px);
      }

      .notification-btn:active {
        transform: translateY(0);
      }

      .notification-close {
        background: none;
        border: none;
        color: #a1a1a6;
        cursor: pointer;
        font-size: 16px;
        position: absolute;
        top: 8px;
        right: 8px;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
        line-height: 1;
      }

      .notification-close:hover {
        color: #eaeaea;
        background: rgba(80, 80, 80, 0.3);
      }

      @media (max-width: 768px) {
        .notification-container {
          bottom: 16px;
          left: 16px;
          right: auto;
          gap: 8px;
        }

        .notification {
          max-width: none;
          min-width: auto;
        }
      }
    `;
    document.head.appendChild(style);
  }

  notify(message, type = 'info', duration = 6000, action = null) {
    const notification = {
      id: Date.now() + Math.random(),
      message,
      type: ['success', 'error', 'info', 'warning'].includes(type) ? type : 'info',
      duration: duration > 0 ? duration : 0,
      action,
      element: null,
      timeout: null
    };

    this.queue.push(notification);
    this.processQueue();

    return notification.id;
  }

  processQueue() {
    while (this.active.length < this.maxActive && this.queue.length > 0) {
      const notification = this.queue.shift();
      this.show(notification);
    }
  }

  show(notification) {
    const element = document.createElement('div');
    element.className = `notification ${notification.type}`;
    element.setAttribute('data-id', notification.id);

    const content = document.createElement('div');
    content.className = 'notification-content';

    const text = document.createElement('p');
    text.className = 'notification-text';
    text.textContent = notification.message;
    content.appendChild(text);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => this.dismiss(notification);
    content.appendChild(closeBtn);

    element.appendChild(content);

    if (notification.action) {
      const actions = document.createElement('div');
      actions.className = 'notification-actions';

      const actionBtn = document.createElement('button');
      actionBtn.className = 'notification-btn';
      actionBtn.textContent = notification.action.label || 'Action';
      actionBtn.onclick = () => {
        if (notification.action.callback) {
          notification.action.callback();
        }
        this.dismiss(notification);
      };
      actions.appendChild(actionBtn);

      element.appendChild(actions);
    }

    notification.element = element;
    this.container.appendChild(element);
    this.active.push(notification);

    // Auto-dismiss if duration > 0
    if (notification.duration > 0) {
      notification.timeout = setTimeout(() => {
        this.dismiss(notification);
      }, notification.duration);
    }
  }

  dismiss(notification) {
    if (notification.timeout) {
      clearTimeout(notification.timeout);
    }

    notification.element.classList.add('fade-out');
    notification.element.addEventListener('animationend', () => {
      if (notification.element && notification.element.parentNode) {
        notification.element.parentNode.removeChild(notification.element);
      }
      const index = this.active.indexOf(notification);
      if (index > -1) {
        this.active.splice(index, 1);
      }
      this.processQueue();
    }, { once: true });
  }

  dismissAll() {
    this.active.forEach(notification => this.dismiss(notification));
  }

  clearQueue() {
    this.queue = [];
  }
}

// Initialize and expose globally
window.NotificationManager = new NotificationManager();

// Export for ES modules if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationManager;
}
document.addEventListener('DOMContentLoaded', () => {
    const getCurrentScriptPath = () => {
        const script = document.currentScript || document.querySelector('script[src*="pluginstuff.js"]');
        return script?.src || null;
    };

    const loadResources = () => {
        const scriptPath = getCurrentScriptPath();
        if (!scriptPath) return;
        const baseDir = scriptPath.substring(0, scriptPath.lastIndexOf('/'));
        const isActivePage = window.location.pathname.startsWith('/active');
        const resources = [
            { element: 'script', props: { async: true, src: 'https://www.googletagmanager.com/gtag/js?id=G-Z14CF8WQ1J' } },
            {
                element: 'script',
                props: { innerHTML: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'G-Z14CF8WQ1J');
                `}
            }
        ];
    };
    loadResources();
});