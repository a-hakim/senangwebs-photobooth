/**
 * SenangWebs Photobooth - Toast Component
 * Non-blocking feedback messages with optional action button
 */

export class Toast {
  constructor(app, container) {
    this.app = app;
    this.container = container || document.body;
    this.root = null;
    this.queue = [];
  }

  _ensureRoot() {
    if (this.root && this.root.isConnected) return this.root;
    this.root = document.createElement('div');
    this.root.className = 'swp-toast-root';
    this.root.setAttribute('role', 'status');
    this.root.setAttribute('aria-live', 'polite');
    this.container.appendChild(this.root);
    return this.root;
  }

  /**
   * Show a toast message
   * @param {string} message - Message text
   * @param {Object} options
   * @param {string} options.type - 'info' | 'success' | 'error' | 'warning'
   * @param {number} options.duration - Auto-dismiss ms (0 = sticky)
   * @param {string} options.actionLabel - Optional action button label
   * @param {Function} options.onAction - Optional action callback
   * @returns {Function} Dismiss function
   */
  show(message, options = {}) {
    const { type = 'info', duration = 3000, actionLabel = null, onAction = null } = options;
    const root = this._ensureRoot();

    const el = document.createElement('div');
    el.className = `swp-toast swp-toast-${type}`;
    el.innerHTML = `
      <span class="swp-toast-message"></span>
      ${actionLabel ? '<button class="swp-toast-action"></button>' : ''}
      <button class="swp-toast-close" aria-label="Dismiss">&times;</button>
    `;
    el.querySelector('.swp-toast-message').textContent = message;

    let dismissed = false;
    let timer = null;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      if (timer) clearTimeout(timer);
      el.classList.add('swp-toast-out');
      setTimeout(() => el.remove(), 200);
    };

    el.querySelector('.swp-toast-close').addEventListener('click', dismiss);

    if (actionLabel) {
      const actionBtn = el.querySelector('.swp-toast-action');
      actionBtn.textContent = actionLabel;
      actionBtn.addEventListener('click', () => {
        dismiss();
        if (typeof onAction === 'function') onAction();
      });
    }

    root.appendChild(el);
    requestAnimationFrame(() => el.classList.add('swp-toast-in'));

    if (duration > 0) {
      timer = setTimeout(dismiss, duration);
    }

    return dismiss;
  }

  success(message, options = {}) {
    return this.show(message, { ...options, type: 'success' });
  }

  error(message, options = {}) {
    return this.show(message, { ...options, type: 'error', duration: 5000 });
  }

  warning(message, options = {}) {
    return this.show(message, { ...options, type: 'warning' });
  }

  info(message, options = {}) {
    return this.show(message, { ...options, type: 'info' });
  }

  destroy() {
    if (this.root) {
      this.root.remove();
      this.root = null;
    }
  }
}

export default Toast;
