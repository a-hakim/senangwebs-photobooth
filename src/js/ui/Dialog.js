/**
 * SenangWebs Photobooth - Dialog Component
 * Modal confirm/prompt dialogs with promise-based API
 */

export class Dialog {
  constructor(app, container) {
    this.app = app;
    this.container = container || document.body;
    this.root = null;
    this._active = null;
    this._onKeyDown = null;
  }

  _ensureRoot() {
    if (this.root && this.root.isConnected) return this.root;
    this.root = document.createElement('div');
    this.root.className = 'swp-dialog-root';
    this.container.appendChild(this.root);
    return this.root;
  }

  /**
   * Show a confirm dialog
   * @param {Object} options
   * @param {string} options.title - Dialog title
   * @param {string} options.message - Dialog message
   * @param {string} options.confirmLabel - Confirm button label
   * @param {string} options.cancelLabel - Cancel button label
   * @param {boolean} options.danger - Danger styling for confirm button
   * @returns {Promise<boolean>} Resolves true if confirmed
   */
  confirm(options = {}) {
    const {
      title = 'Are you sure?',
      message = '',
      confirmLabel = 'Confirm',
      cancelLabel = 'Cancel',
      danger = false
    } = options;

    if (this._active) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      const root = this._ensureRoot();
      const overlay = document.createElement('div');
      overlay.className = 'swp-dialog-overlay';
      overlay.innerHTML = `
        <div class="swp-dialog" role="alertdialog" aria-modal="true" aria-labelledby="swp-dialog-title">
          <div class="swp-dialog-title" id="swp-dialog-title"></div>
          <div class="swp-dialog-message"></div>
          <div class="swp-dialog-actions">
            <button class="swp-btn" data-dialog="cancel"></button>
            <button class="swp-btn ${danger ? 'swp-btn-danger' : 'swp-btn-primary'}" data-dialog="confirm"></button>
          </div>
        </div>
      `;

      overlay.querySelector('.swp-dialog-title').textContent = title;
      overlay.querySelector('.swp-dialog-message').textContent = message;
      overlay.querySelector('[data-dialog="cancel"]').textContent = cancelLabel;
      overlay.querySelector('[data-dialog="confirm"]').textContent = confirmLabel;

      const close = (result) => {
        if (this._active !== overlay) return;
        this._active = null;
        document.removeEventListener('keydown', this._onKeyDown, true);
        this._onKeyDown = null;
        overlay.classList.add('swp-dialog-out');
        setTimeout(() => overlay.remove(), 150);
        resolve(result);
      };

      overlay.querySelector('[data-dialog="cancel"]').addEventListener('click', () => close(false));
      overlay.querySelector('[data-dialog="confirm"]').addEventListener('click', () => close(true));
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close(false);
      });

      this._onKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          close(false);
        } else if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
          e.preventDefault();
          e.stopPropagation();
          close(true);
        }
      };
      document.addEventListener('keydown', this._onKeyDown, true);

      root.appendChild(overlay);
      this._active = overlay;
      requestAnimationFrame(() => overlay.classList.add('swp-dialog-in'));
      overlay.querySelector('[data-dialog="confirm"]').focus();
    });
  }

  get isOpen() {
    return this._active !== null;
  }

  destroy() {
    if (this.root) {
      this.root.remove();
      this.root = null;
    }
    this._active = null;
  }
}

export default Dialog;
