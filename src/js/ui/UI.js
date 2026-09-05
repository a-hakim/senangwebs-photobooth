/**
 * SenangWebs Photobooth - UI Manager
 * @version 2.2.0
 */

import { Events } from '../core/EventEmitter.js';
import '@bookklik/senangstart-icons';
import { Toast } from './Toast.js';
import { Dialog } from './Dialog.js';
import { OptionsSheet } from './OptionsSheet.js';

export class UI {
  constructor(app) {
    this.app = app;
    this.container = null;
    this.currentMenu = null;
    this.isFullscreen = false;
    this.toast = null;
    this.dialog = null;
    this.optionsSheet = null;
    this._isEmpty = true;
    this._pushSeq = 0;
    this._lastPreview = null;
  }

  /**
   * Tool rail definition: all tools + document operations
   */
  static RAIL_ITEMS = [
    { id: 'move', icon: 'cursor', label: 'Move', type: 'tool' },
    { id: 'crop', icon: 'crop', label: 'Crop', type: 'tool' },
    { id: 'eraser', icon: 'eraser', label: 'Erase', type: 'tool' },
    { id: 'brush', icon: 'brush', label: 'Draw', type: 'tool' },
    { id: 'shape', icon: 'shapes', label: 'Shape', type: 'tool' },
    { id: 'text', icon: 'text', label: 'Text', type: 'tool' },
    { id: 'marquee', icon: 'marquee', label: 'Select', type: 'tool' },
    { id: 'fill', icon: 'contrast', label: 'Fill', type: 'tool' },
    { id: 'gradient', icon: 'gradient', label: 'Gradient', type: 'tool' },
    { id: 'eyedropper', icon: 'crosshair', label: 'Pick', type: 'tool' },
    { id: 'zoom', icon: 'magnifying-glass', label: 'Zoom', type: 'tool' },
    { id: 'hand', icon: 'hand', label: 'Pan', type: 'tool' },
    { id: 'rotate', icon: 'arrow-path', label: 'Rotate', type: 'op' },
    { id: 'flip', icon: 'arrow-left-arrow-right', label: 'Flip', type: 'op' },
    { id: 'resize', icon: 'sliders-vertical', label: 'Resize', type: 'op' },
    { id: 'adjust', icon: 'sliders-horizontal', label: 'Adjust', type: 'op' },
    { id: 'filter', icon: 'magic-wand', label: 'Filter', type: 'op' }
  ];

  init(container) {
    this.container = container;
    this.container.classList.add('swp-app');
    this._handlers = {};
    this.toast = new Toast(this.app, this.container);
    this.dialog = new Dialog(this.app, this.container);
    this.optionsSheet = new OptionsSheet(this.app, this);
    this.createLayout();
    this.bindEvents();
    this.bindFileInputHelpers();
  }

  createLayout() {
    this.swpRoot = document.createElement('div');
    this.swpRoot.className = 'swp-root';
    this.swpRoot.innerHTML = `
      <!-- Header Bar -->
      <div class="swp-header">
        <div class="swp-header-left">
          <button class="swp-header-btn" data-action="load" title="Load Image" aria-label="Load image">
            <ss-icon icon="folder-open" thickness="2"></ss-icon>
            <span>Load</span>
          </button>
          <button class="swp-header-btn" data-action="export" title="Export" aria-label="Export image">
            <ss-icon icon="save" thickness="2"></ss-icon>
            <span>Export</span>
          </button>
          <div class="swp-divider"></div>
          <div class="swp-color-widget" title="Colors — click to edit, X to swap, D to reset" aria-label="Current colors">
            <button type="button" class="swp-color-swatch swp-color-fg" data-action="fg-color" title="Foreground color"></button>
            <button type="button" class="swp-color-swatch swp-color-bg" data-action="bg-color" title="Background color"></button>
          </div>
          <input type="color" class="swp-color-proxy" id="fgColorInput" aria-label="Foreground color picker" tabindex="-1">
          <input type="color" class="swp-color-proxy" id="bgColorInput" aria-label="Background color picker" tabindex="-1">
        </div>
        <div class="swp-header-center">
          <button class="swp-icon-btn" data-action="undo" title="Undo (Ctrl+Z)">
            <ss-icon icon="arrow-rotate-ccw" thickness="2"></ss-icon>
          </button>
          <button class="swp-icon-btn" data-action="redo" title="Redo (Ctrl+Shift+Z)">
            <ss-icon icon="arrow-rotate-cw" thickness="2"></ss-icon>
          </button>
          <div class="swp-divider"></div>
          <button class="swp-icon-btn" data-action="history" title="History">
            <ss-icon icon="clock" thickness="2"></ss-icon>
          </button>
          <button class="swp-icon-btn" data-action="layers" title="Layers">
            <ss-icon icon="layer-stacks" thickness="2"></ss-icon>
          </button>
          <div class="swp-divider"></div>
          <button class="swp-icon-btn" data-action="reset" title="Reset">
            <ss-icon icon="time-reset" thickness="2"></ss-icon>
          </button>
        </div>
        <div class="swp-header-right">
          <button class="swp-icon-btn" data-action="center" title="Center Canvas">
            <ss-icon icon="container" thickness="2"></ss-icon>
          </button>
          <button class="swp-icon-btn" data-action="fullscreen" title="Fullscreen">
            <ss-icon icon="focus" thickness="2"></ss-icon>
          </button>
        </div>
      </div>

      <!-- Main Workspace (full width canvas) -->
      <div class="swp-workspace"></div>

      <!-- Empty State (drop / browse / paste) -->
      <div class="swp-empty-state" role="button" tabindex="0" aria-label="Load an image to start editing">
        <div class="swp-empty-inner">
          <ss-icon icon="image" thickness="1.5"></ss-icon>
          <div class="swp-empty-title">No image yet</div>
          <div class="swp-empty-hint">Drag &amp; drop an image here, paste from clipboard, or</div>
          <button class="swp-btn swp-btn-primary swp-empty-browse" type="button">Browse Files</button>
        </div>
      </div>

      <!-- Busy Overlay -->
      <div class="swp-busy-overlay" hidden>
        <div class="swp-busy-box">
          <div class="swp-spinner"></div>
          <div class="swp-busy-label">Workingâ€¦</div>
        </div>
      </div>

      <!-- Side Panel (History / Layers) -->
      <div class="swp-side-panel" hidden>
        <div class="swp-side-panel-header">
          <span class="swp-side-panel-title">Panel</span>
          <button class="swp-icon-btn swp-side-panel-close" data-action="close-panel">
            <ss-icon icon="cross" thickness="2"></ss-icon>
          </button>
        </div>
        <div class="swp-side-panel-content"></div>
      </div>
      <!-- Options Sheet (contextual panel) -->
      <div class="swp-submenu" hidden></div>

      <!-- Tool Rail -->
      <div class="swp-menu-bar" role="toolbar" aria-label="Tools">
        ${UI.RAIL_ITEMS.map(item => `
          <button class="swp-menu-item" data-menu="${item.id}" data-type="${item.type}" title="${item.label}">
            <ss-icon icon="${item.icon}" thickness="2"></ss-icon>
            <span>${item.label}</span>
          </button>
        `).join('')}
      </div>
    `;

    this.container.appendChild(this.swpRoot);

    // Accessibility: propagate titles to aria-labels for icon-only buttons
    this.swpRoot.querySelectorAll('[title]:not([aria-label])').forEach(el => {
      el.setAttribute('aria-label', el.getAttribute('title'));
    });

    this.bindHeaderActions();
    this.bindMenuActions();
  }

  bindHeaderActions() {
    const header = this.swpRoot.querySelector('.swp-header');
    const sidePanel = this.swpRoot.querySelector('.swp-side-panel');
    
    // Close panel button
    sidePanel?.querySelector('[data-action="close-panel"]')?.addEventListener('click', () => {
      this.closeSidePanel();
    });
    
    // Color inputs
    const fgInput = this.swpRoot.querySelector('#fgColorInput');
    const bgInput = this.swpRoot.querySelector('#bgColorInput');
    fgInput?.addEventListener('input', (e) => this.app.colors.setForeground(e.target.value));
    bgInput?.addEventListener('input', (e) => this.app.colors.setBackground(e.target.value));

    // Initialize color widget state
    this.updateColorWidget();

    header.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      switch (action) {
        case 'load':
          this.openFileDialog();
          break;
        case 'export':
          this.openExportModal();
          break;
        case 'fg-color':
          this.swpRoot.querySelector('#fgColorInput')?.click();
          break;
        case 'bg-color':
          this.swpRoot.querySelector('#bgColorInput')?.click();
          break;
        case 'undo':
          this.app.history.undo();
          break;
        case 'redo':
          this.app.history.redo();
          break;
        case 'history':
          this.toggleSidePanel('history');
          break;
        case 'layers':
          this.toggleSidePanel('layers');
          break;
        case 'reset':
          this.confirmReset();
          break;
        case 'center':
          this.app.canvas.fitToScreen();
          break;
        case 'fullscreen':
          this.toggleFullscreen();
          break;
      }
    });
  }

  bindMenuActions() {
    const menuBar = this.swpRoot.querySelector('.swp-menu-bar');
    
    menuBar.addEventListener('click', (e) => {
      const menuItem = e.target.closest('.swp-menu-item');
      if (!menuItem) return;

      const menu = menuItem.dataset.menu;
      this.selectMenu(menu);
    });
  }

  _getRailItem(id) {
    return UI.RAIL_ITEMS.find(item => item.id === id) || null;
  }

  selectMenu(id) {
    // Toggle off if same item clicked
    if (this.currentMenu === id) {
      this.closeSubmenu();
      return;
    }

    const item = this._getRailItem(id);
    if (!item) return;

    this.currentMenu = id;

    this.closeSidePanel();

    // Update rail active state
    this.swpRoot.querySelectorAll('.swp-menu-item').forEach(el => {
      el.classList.toggle('active', el.dataset.menu === id);
    });

    if (item.type === 'tool') {
      this.app.tools.setTool(id);
      // Options sheet is rendered by the TOOL_SELECT listener
    } else {
      this.showSubmenu(id);
    }
  }

  /**
   * Show the options sheet for the given rail id (tool or op)
   */
  showOptionsFor(id) {
    const item = this._getRailItem(id);
    if (!item) return;

    const submenu = this.swpRoot.querySelector('.swp-submenu');
    if (!submenu) return;

    if (item.type === 'tool') {
      const tool = this.app.tools.getTool(id);
      const rendered = this.optionsSheet.render(submenu, tool, id);
      if (!rendered) {
        // Tool has no options - keep sheet closed
        submenu.hidden = true;
        submenu.innerHTML = '';
        return;
      }
    } else {
      this.showSubmenu(id);
      return;
    }

    submenu.hidden = false;
  }

  showSubmenu(id) {
    const submenu = this.swpRoot.querySelector('.swp-submenu');
    submenu.hidden = false;

    switch (id) {
      case 'rotate':
        this.renderRotateSubmenu(submenu);
        break;
      case 'flip':
        this.renderFlipSubmenu(submenu);
        break;
      case 'resize':
        this.renderResizeSubmenu(submenu);
        break;
      case 'adjust':
        this.renderAdjustSubmenu(submenu);
        break;
      case 'filter':
        this.renderFilterSubmenu(submenu);
        break;
      default:
        submenu.hidden = true;
        submenu.innerHTML = '';
    }
  }

  closeSubmenu() {
    this.app.filters.cancelPreview();
    this.currentMenu = null;
    this.swpRoot.querySelectorAll('.swp-menu-item').forEach(item => {
      item.classList.remove('active');
    });
    const submenu = this.swpRoot.querySelector('.swp-submenu');
    submenu.hidden = true;
    submenu.innerHTML = '';
  }

  renderRotateSubmenu(submenu) {
    submenu.innerHTML = `
      <div class="swp-submenu-content">
        <div class="swp-submenu-title">Rotate</div>
        <div class="swp-submenu-group">
          <div class="swp-btn-group" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
            <button class="swp-submenu-btn" data-rotate="-90">
              <ss-icon icon="rotate-minus" thickness="2"></ss-icon>
              <span>-90Â°</span>
            </button>
            <button class="swp-submenu-btn" data-rotate="90">
              <ss-icon icon="rotate-add" thickness="2"></ss-icon>
              <span>+90Â°</span>
            </button>
          </div>
        </div>
        <div class="swp-submenu-group">
          <label class="swp-submenu-label">Custom Angle</label>
          <div class="swp-range-wrap">
            <input type="range" class="swp-slider" id="rotateAngle" min="-180" max="180" value="0">
            <span class="swp-range-value">0Â°</span>
          </div>
        </div>
        <div class="swp-submenu-actions">
          <button class="swp-btn" data-action="cancel">Cancel</button>
          <button class="swp-btn swp-btn-primary" data-action="apply">Apply</button>
        </div>
      </div>
    `;

    this.bindRotateSubmenuEvents(submenu);
  }

  bindRotateSubmenuEvents(submenu) {
    let currentAngle = 0;

    submenu.querySelectorAll('[data-rotate]').forEach(btn => {
      btn.addEventListener('click', () => {
        const angle = parseInt(btn.dataset.rotate);
        this.rotateCanvas(angle);
      });
    });

    const slider = submenu.querySelector('#rotateAngle');
    const valueDisplay = submenu.querySelector('.swp-range-value');
    
    slider?.addEventListener('input', (e) => {
      currentAngle = parseInt(e.target.value);
      valueDisplay.textContent = `${currentAngle}Â°`;
    });

    submenu.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
      this.closeSubmenu();
    });

    submenu.querySelector('[data-action="apply"]')?.addEventListener('click', () => {
      if (currentAngle !== 0) {
        this.rotateCanvas(currentAngle);
      }
      this.closeSubmenu();
    });
  }

  renderFlipSubmenu(submenu) {
    submenu.innerHTML = `
      <div class="swp-submenu-content">
        <div class="swp-submenu-title">Flip</div>
        <div class="swp-submenu-group">
          <div class="swp-btn-group swp-btn-group-lg">
            <button class="swp-submenu-btn" data-flip="horizontal">
              <ss-icon icon="flip-horizontal" thickness="2"></ss-icon>
              <span>Horizontal</span>
            </button>
            <button class="swp-submenu-btn" data-flip="vertical">
              <ss-icon icon="flip-vertical" thickness="2"></ss-icon>
              <span>Vertical</span>
            </button>
          </div>
        </div>
      </div>
    `;

    submenu.querySelectorAll('[data-flip]').forEach(btn => {
      btn.addEventListener('click', () => {
        const direction = btn.dataset.flip;
        this.flipCanvas(direction);
      });
    });
  }

  renderResizeSubmenu(submenu) {
    const currentWidth = this.app.canvas.width;
    const currentHeight = this.app.canvas.height;

    submenu.innerHTML = `
      <div class="swp-submenu-content">
        <div class="swp-submenu-title">Resize Canvas</div>
        <div class="swp-submenu-group">
          <label class="swp-submenu-label">Dimensions</label>
          <div class="swp-resize-inputs">
            <div class="swp-input-group">
              <label>Width</label>
              <input type="number" class="swp-input" id="resizeWidth" value="${currentWidth}" min="1" max="10000">
            </div>
            <div class="swp-input-group">
              <label>Height</label>
              <input type="number" class="swp-input" id="resizeHeight" value="${currentHeight}" min="1" max="10000">
            </div>
          </div>
        </div>
        <div class="swp-submenu-group">
          <label class="swp-checkbox-label">
            <input type="checkbox" id="lockAspectRatio" checked>
            <span>Lock aspect ratio</span>
          </label>
        </div>
        <div class="swp-submenu-group">
          <label class="swp-submenu-label">Presets</label>
          <div class="swp-btn-group swp-btn-group-wrap">
            <button class="swp-submenu-btn swp-preset-btn" data-width="1920" data-height="1080">1920Ã—1080</button>
            <button class="swp-submenu-btn swp-preset-btn" data-width="1280" data-height="720">1280Ã—720</button>
            <button class="swp-submenu-btn swp-preset-btn" data-width="800" data-height="600">800Ã—600</button>
            <button class="swp-submenu-btn swp-preset-btn" data-width="500" data-height="500">500Ã—500</button>
          </div>
        </div>
        <div class="swp-submenu-actions">
          <button class="swp-btn" data-action="cancel">Cancel</button>
          <button class="swp-btn swp-btn-primary" data-action="apply">Apply</button>
        </div>
      </div>
    `;

    this.bindResizeSubmenuEvents(submenu, currentWidth, currentHeight);
  }

  bindResizeSubmenuEvents(submenu, originalWidth, originalHeight) {
    const widthInput = submenu.querySelector('#resizeWidth');
    const heightInput = submenu.querySelector('#resizeHeight');
    const lockCheckbox = submenu.querySelector('#lockAspectRatio');
    const aspectRatio = originalWidth / originalHeight;

    widthInput?.addEventListener('input', () => {
      if (lockCheckbox?.checked) {
        const newWidth = parseInt(widthInput.value) || 1;
        heightInput.value = Math.round(newWidth / aspectRatio);
      }
    });

    heightInput?.addEventListener('input', () => {
      if (lockCheckbox?.checked) {
        const newHeight = parseInt(heightInput.value) || 1;
        widthInput.value = Math.round(newHeight * aspectRatio);
      }
    });

    submenu.querySelectorAll('.swp-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        widthInput.value = btn.dataset.width;
        heightInput.value = btn.dataset.height;
        lockCheckbox.checked = false; // Uncheck to allow preset change
      });
    });

    submenu.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
      this.closeSubmenu();
    });

    submenu.querySelector('[data-action="apply"]')?.addEventListener('click', () => {
      const newWidth = parseInt(widthInput.value) || originalWidth;
      const newHeight = parseInt(heightInput.value) || originalHeight;
      
      if (newWidth !== originalWidth || newHeight !== originalHeight) {
        this.resizeCanvas(newWidth, newHeight);
      }
      this.closeSubmenu();
    });
  }

  resizeCanvas(width, height) {
    this.app.canvas.resize(width, height);
    this.app.canvas.fitToScreen();
    this.app.canvas.render();
    this.app.history.pushState(`Resize to ${width}Ã—${height}`);
  }

  renderFilterSubmenu(submenu) {
    submenu.innerHTML = `
      <div class="swp-submenu-content swp-submenu-wide">
        <div class="swp-submenu-title">Filter</div>
        <div class="swp-submenu-group">
          <div class="swp-filter-grid">
            <button class="swp-filter-btn" data-filter="none">
              <div class="swp-filter-preview"></div>
              <span>None</span>
            </button>
            <button class="swp-filter-btn" data-filter="grayscale">
              <div class="swp-filter-preview"></div>
              <span>Grayscale</span>
            </button>
            <button class="swp-filter-btn" data-filter="sepia">
              <div class="swp-filter-preview"></div>
              <span>Sepia</span>
            </button>
            <button class="swp-filter-btn" data-filter="invert">
              <div class="swp-filter-preview"></div>
              <span>Invert</span>
            </button>
            <button class="swp-filter-btn" data-filter="blur">
              <div class="swp-filter-preview"></div>
              <span>Blur</span>
            </button>
            <button class="swp-filter-btn" data-filter="brightness">
              <div class="swp-filter-preview"></div>
              <span>Brighten</span>
            </button>
            <button class="swp-filter-btn" data-filter="contrast">
              <div class="swp-filter-preview"></div>
              <span>Contrast</span>
            </button>
            <button class="swp-filter-btn" data-filter="saturation">
              <div class="swp-filter-preview"></div>
              <span>Saturate</span>
            </button>
            <button class="swp-filter-btn" data-filter="sharpen">
              <div class="swp-filter-preview"></div>
              <span>Sharpen</span>
            </button>
          </div>
        </div>
        <div class="swp-submenu-group swp-filter-intensity" hidden>
          <label class="swp-submenu-label">Intensity</label>
          <div class="swp-range-wrap">
            <input type="range" class="swp-slider" id="filterIntensity" min="0" max="100" value="50">
            <span class="swp-range-value">50%</span>
          </div>
        </div>
        <div class="swp-submenu-actions">
          <button class="swp-btn" data-action="compare" title="Press and hold to compare with original">Compare</button>
          <button class="swp-btn" data-action="cancel">Cancel</button>
          <button class="swp-btn swp-btn-primary" data-action="apply">Apply</button>
        </div>
      </div>
    `;

    this._generateFilterThumbnails(submenu);
    this.bindFilterSubmenuEvents(submenu);
  }

  /**
   * Neutral default intensity per filter (used when a filter is selected)
   */
  _defaultIntensity(filterName) {
    switch (filterName) {
      case 'grayscale':
      case 'sepia':
      case 'invert':
        return 100;
      case 'blur':
      case 'sharpen':
        return 30;
      case 'hueRotate':
        return 0;
      default:
        return 50;
    }
  }

  /**
   * Thumbnail preview options per filter (for the filter grid)
   */
  _filterThumbOptions(filterName) {
    switch (filterName) {
      case 'grayscale':
      case 'sepia':
      case 'invert':
        return { value: 100 };
      case 'blur':
        return { radius: 2 };
      case 'sharpen':
        return { amount: 0.5 };
      case 'brightness':
      case 'contrast':
        return { value: 40 };
      case 'saturation':
        return { value: 60 };
      default:
        return {};
    }
  }

  /**
   * Render live filter thumbnails from the current canvas composite
   */
  _generateFilterThumbnails(submenu) {
    const work = this.app.canvas.workCanvas;
    if (!work || !work.width || !work.height) return;

    const TW = 96;
    const TH = 96;
    const scale = Math.min(TW / work.width, TH / work.height);
    const w = Math.max(1, Math.round(work.width * scale));
    const h = Math.max(1, Math.round(work.height * scale));

    submenu.querySelectorAll('.swp-filter-btn').forEach(btn => {
      const filter = btn.dataset.filter;
      const previewEl = btn.querySelector('.swp-filter-preview');
      if (!previewEl) return;

      try {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        ctx.drawImage(work, 0, 0, w, h);
        if (filter === 'none') {
          previewEl.style.backgroundImage = `url(${c.toDataURL()})`;
          previewEl.style.backgroundSize = 'cover';
          previewEl.style.backgroundPosition = 'center';
          return;
        }
        const imgData = ctx.getImageData(0, 0, w, h);
        const filtered = this.app.filters.processFilter(filter, imgData, this._filterThumbOptions(filter));
        ctx.putImageData(filtered, 0, 0);
        previewEl.style.backgroundImage = `url(${c.toDataURL()})`;
        previewEl.style.backgroundSize = 'cover';
        previewEl.style.backgroundPosition = 'center';
      } catch (err) {
        console.error('SWP: filter thumbnail failed', err);
      }
    });
  }

  /**
   * Bind compare (press & hold) behavior to a button
   */
  _bindCompareButton(btn, getLastPreview) {
    if (!btn) return;
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const last = getLastPreview();
      if (last) {
        this.app.filters.cancelPreview();
      }
    });
    const restore = () => {
      const last = getLastPreview();
      if (last) {
        this.app.filters.previewFilter(last.filterName, last.options);
      }
    };
    btn.addEventListener('pointerup', restore);
    btn.addEventListener('pointerleave', restore);
    btn.addEventListener('pointercancel', restore);
  }

  bindFilterSubmenuEvents(submenu) {
    let selectedFilter = 'none';
    let intensity = 50;

    const intensityGroup = submenu.querySelector('.swp-filter-intensity');
    const intensitySlider = submenu.querySelector('#filterIntensity');
    const intensityValue = submenu.querySelector('.swp-filter-intensity .swp-range-value');

    const getCurrentOptions = () => this._convertIntensity(selectedFilter, intensity);
    const getLastPreview = () => (selectedFilter !== 'none' ? { filterName: selectedFilter, options: getCurrentOptions() } : null);

    submenu.querySelectorAll('.swp-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        submenu.querySelectorAll('.swp-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedFilter = btn.dataset.filter;

        // Show/hide intensity slider with neutral default per filter
        if (selectedFilter !== 'none') {
          intensity = this._defaultIntensity(selectedFilter);
          if (intensitySlider) intensitySlider.value = intensity;
          if (intensityValue) intensityValue.textContent = `${intensity}%`;
          intensityGroup.hidden = false;
          this.app.filters.previewFilter(selectedFilter, getCurrentOptions());
          this._lastPreview = { filterName: selectedFilter, options: getCurrentOptions() };
        } else {
          intensityGroup.hidden = true;
          this._lastPreview = null;
          this.app.filters.cancelPreview();
        }
      });
    });

    intensitySlider?.addEventListener('input', (e) => {
      intensity = parseInt(e.target.value);
      intensityValue.textContent = `${intensity}%`;
      if (selectedFilter !== 'none') {
        this.app.filters.previewFilter(selectedFilter, getCurrentOptions());
        this._lastPreview = { filterName: selectedFilter, options: getCurrentOptions() };
      }
    });

    this._bindCompareButton(submenu.querySelector('[data-action="compare"]'), getLastPreview);

    submenu.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
      this.app.filters.cancelPreview();
      this.closeSubmenu();
    });

    submenu.querySelector('[data-action="apply"]')?.addEventListener('click', () => {
      if (selectedFilter !== 'none') {
        this.app.filters.applyFilter(selectedFilter, getCurrentOptions());
        this._lastPreview = null;
      }
      this.closeSubmenu();
    });
  }

  // Canvas manipulation methods
  rotateCanvas(angle) {
    const layers = this.app.layers.getLayers();
    if (layers.length === 0) return;

    const rad = (angle * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));

    for (const layer of layers) {
      if (!layer.canvas || !layer.ctx) continue;

      const w = layer.width;
      const h = layer.height;
      const newW = Math.round(w * cos + h * sin);
      const newH = Math.round(w * sin + h * cos);

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = newW;
      tempCanvas.height = newH;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.translate(newW / 2, newH / 2);
      tempCtx.rotate(rad);
      tempCtx.drawImage(layer.canvas, -w / 2, -h / 2);

      layer.clear();
      layer.canvas.width = newW;
      layer.canvas.height = newH;
      layer.width = newW;
      layer.height = newH;
      layer.ctx.drawImage(tempCanvas, 0, 0);
    }

    if (angle === 90 || angle === -90) {
      this.app.canvas.resize(this.app.canvas.height, this.app.canvas.width);
    }
    this.app.canvas.render();
    this.app.history.pushState(`Rotate ${angle}Â°`);
  }

  flipCanvas(direction) {
    const layers = this.app.layers.getLayers();
    if (layers.length === 0) return;

    for (const layer of layers) {
      if (!layer.canvas || !layer.ctx) continue;

      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = layer.width;
      tempCanvas.height = layer.height;

      if (direction === 'horizontal') {
        tempCtx.translate(layer.width, 0);
        tempCtx.scale(-1, 1);
      } else {
        tempCtx.translate(0, layer.height);
        tempCtx.scale(1, -1);
      }

      tempCtx.drawImage(layer.canvas, 0, 0);
      layer.clear();
      layer.ctx.drawImage(tempCanvas, 0, 0);
    }

    this.app.canvas.render();
    this.app.history.pushState(`Flip ${direction}`);
  }

  /**
   * Convert 0-100 intensity to filter-specific options
   */
  _convertIntensity(filterName, intensity) {
    switch (filterName) {
      case 'brightness':
      case 'contrast':
        // Convert 0-100 to -128 to 128 range (50 = 0 change)
        return { value: Math.round((intensity - 50) * 2.56) };
      case 'saturation':
        // Convert 0-100 to -100 to 100 range (50 = 0 change)
        return { value: (intensity - 50) * 2 };
      case 'blur':
        // Convert 0-100 to 1-10 radius
        return { radius: Math.max(1, Math.round(intensity / 10)) };
      case 'sharpen':
        // Convert 0-100 to 0-2 amount
        return { amount: intensity / 50 };
      case 'hueRotate':
        // Convert 0-100 to 0-360 degrees
        return { angle: intensity * 3.6 };
      case 'adjust':
        return intensity;
      default:
        // grayscale / sepia / invert use raw intensity as value
        return { value: intensity };
    }
  }

  /**
   * Render the Adjust panel with live per-channel sliders
   */
  renderAdjustSubmenu(submenu) {
    submenu.innerHTML = `
      <div class="swp-submenu-content">
        <div class="swp-submenu-title">Adjust</div>
        <div class="swp-submenu-group">
          <label class="swp-submenu-label">Brightness <span class="swp-hint">(double-tap to reset)</span></label>
          <div class="swp-range-wrap">
            <input type="range" class="swp-slider" data-adjust="brightness" min="-100" max="100" value="0">
            <span class="swp-range-value">0</span>
          </div>
        </div>
        <div class="swp-submenu-group">
          <label class="swp-submenu-label">Contrast</label>
          <div class="swp-range-wrap">
            <input type="range" class="swp-slider" data-adjust="contrast" min="-100" max="100" value="0">
            <span class="swp-range-value">0</span>
          </div>
        </div>
        <div class="swp-submenu-group">
          <label class="swp-submenu-label">Saturation</label>
          <div class="swp-range-wrap">
            <input type="range" class="swp-slider" data-adjust="saturation" min="-100" max="100" value="0">
            <span class="swp-range-value">0</span>
          </div>
        </div>
        <div class="swp-submenu-actions">
          <button class="swp-btn" data-action="compare" title="Press and hold to compare with original">Compare</button>
          <button class="swp-btn" data-action="cancel">Cancel</button>
          <button class="swp-btn swp-btn-primary" data-action="apply">Apply</button>
        </div>
      </div>
    `;

    this.bindAdjustSubmenuEvents(submenu);
  }

  bindAdjustSubmenuEvents(submenu) {
    const values = { brightness: 0, contrast: 0, saturation: 0 };
    let rafId = null;

    const currentOptions = () => ({ ...values });
    const getLastPreview = () => ({ filterName: 'adjust', options: currentOptions() });

    const schedulePreview = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;
        this.app.filters.previewFilter('adjust', currentOptions());
        this._lastPreview = { filterName: 'adjust', options: currentOptions() };
      });
    };

    submenu.querySelectorAll('[data-adjust]').forEach(slider => {
      const key = slider.dataset.adjust;
      const valueEl = slider.parentElement.querySelector('.swp-range-value');

      slider.addEventListener('input', (e) => {
        values[key] = parseInt(e.target.value, 10);
        if (valueEl) valueEl.textContent = `${values[key]}`;
        schedulePreview();
      });

      // Double-tap / double-click slider to reset
      slider.addEventListener('dblclick', () => {
        values[key] = 0;
        slider.value = 0;
        if (valueEl) valueEl.textContent = '0';
        schedulePreview();
      });
    });

    this._bindCompareButton(submenu.querySelector('[data-action="compare"]'), getLastPreview);

    submenu.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
      this.app.filters.cancelPreview();
      this._lastPreview = null;
      this.closeSubmenu();
    });

    submenu.querySelector('[data-action="apply"]')?.addEventListener('click', () => {
      const opts = currentOptions();
      const hasChange = opts.brightness !== 0 || opts.contrast !== 0 || opts.saturation !== 0;
      if (rafId) cancelAnimationFrame(rafId);
      if (hasChange) {
        this.app.filters.applyFilter('adjust', opts);
        this._lastPreview = null;
      } else {
        this.app.filters.cancelPreview();
      }
      this.closeSubmenu();
    });
  }

  previewFilter(filterName, intensity) {
    this.app.filters.previewFilter(filterName, this._convertIntensity(filterName, intensity));
  }

  applyFilter(filterName, intensity) {
    this.app.filters.applyFilter(filterName, this._convertIntensity(filterName, intensity));
  }

  async confirmReset() {
    if (this._isEmpty) {
      this.resetCanvas();
      return;
    }
    const ok = await this.dialog.confirm({
      title: 'Reset canvas?',
      message: 'This will discard the current document and all your edits. This cannot be undone.',
      confirmLabel: 'Reset',
      danger: true
    });
    if (ok) this.resetCanvas();
  }

  resetCanvas() {
    this.app.file.newDocument({
      width: this.app.options.width,
      height: this.app.options.height
    });
    this.closeSubmenu();
  }

  bindFileInputHelpers() {
    const workspace = this.getWorkspace();
    const emptyState = this.swpRoot.querySelector('.swp-empty-state');

    // Empty state click / keyboard activation
    emptyState?.addEventListener('click', (e) => {
      if (e.target.closest('.swp-empty-browse') || e.target === emptyState || e.target.closest('.swp-empty-inner')) {
        this.openFileDialog();
      }
    });
    emptyState?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.openFileDialog();
      }
    });

    // Drag & drop
    this._onDragOver = (e) => {
      e.preventDefault();
      emptyState?.classList.add('swp-drop-hover');
      workspace?.classList.add('swp-drag-over');
    };
    this._onDragLeave = () => {
      emptyState?.classList.remove('swp-drop-hover');
      workspace?.classList.remove('swp-drag-over');
    };
    this._onDrop = (e) => {
      e.preventDefault();
      emptyState?.classList.remove('swp-drop-hover');
      workspace?.classList.remove('swp-drag-over');
      const file = e.dataTransfer?.files?.[0];
      if (file) this.loadFile(file);
    };
    this.container.addEventListener('dragover', this._onDragOver);
    this.container.addEventListener('dragleave', this._onDragLeave);
    this.container.addEventListener('drop', this._onDrop);

    // Paste image from OS clipboard
    this._onPaste = (e) => {
      if (this.dialog?.isOpen) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            this.loadFile(file);
          }
          break;
        }
      }
    };
    document.addEventListener('paste', this._onPaste);
  }

  /**
   * Load a dropped/pasted/browsed file (image or .sws project)
   * @param {File} file
   */
  async loadFile(file) {
    try {
      if (file.name?.toLowerCase().endsWith('.sws')) {
        await this.app.file.openProject(file);
        this.toast.success(`Project "${this.app.file.projectName}" opened`);
      } else if (file.type.startsWith('image/')) {
        await this.withBusy('Loading imageâ€¦', async () => {
          const url = URL.createObjectURL(file);
          await this.app.loadImage(url);
          URL.revokeObjectURL(url);
        });
        this.toast.success('Image loaded');
      } else {
        this.toast.error('Unsupported file type');
      }
    } catch (err) {
      console.error('SWP: Failed to load file', err);
      this.toast.error('Failed to load file');
    }
  }

  /**
   * Ask for confirmation before replacing existing content
   * @returns {Promise<boolean>}
   */
  async confirmReplaceIfContent() {
    if (this._isEmpty) return true;
    return this.dialog.confirm({
      title: 'Replace current work?',
      message: 'Loading a new image will replace the current document. Your changes will be lost.',
      confirmLabel: 'Replace',
      danger: true
    });
  }

  // Busy indicator
  showBusy(label = 'Workingâ€¦') {
    const overlay = this.swpRoot.querySelector('.swp-busy-overlay');
    if (!overlay) return;
    overlay.querySelector('.swp-busy-label').textContent = label;
    overlay.hidden = false;
  }

  hideBusy() {
    const overlay = this.swpRoot.querySelector('.swp-busy-overlay');
    if (overlay) overlay.hidden = true;
  }

  /**
   * Run an operation behind the busy overlay (lets the spinner paint first)
   * @param {string} label
   * @param {Function} fn - Async operation
   */
  async withBusy(label, fn) {
    this.showBusy(label);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    try {
      return await fn();
    } finally {
      this.hideBusy();
    }
  }

  // Empty state management
  _setEmptyState(empty) {
    this._isEmpty = empty;
    const emptyState = this.swpRoot.querySelector('.swp-empty-state');
    if (emptyState) emptyState.hidden = !empty;
  }

  _scheduleEmptyCheck() {
    const seqAtSchedule = this._pushSeq;
    // Delay so synchronous follow-up content (e.g. image load right after
    // newDocument) is visible before deciding the document is empty
    setTimeout(() => {
      // A real content push after scheduling means the document has content
      if (seqAtSchedule !== this._pushSeq) {
        this._setEmptyState(false);
        return;
      }
      const layers = this.app.layers.getLayers();
      const isFresh = this.app.history.count <= 1; // only 'Initial State'
      this._setEmptyState(layers.length === 0 || isFresh);
    }, 50);
  }

  /**
   * Export modal: format, quality, filename + project save
   */
  openExportModal() {
    if (this._exportOverlay?.isConnected) return;

    const formats = [
      { id: 'png', label: 'PNG', lossless: true },
      { id: 'jpeg', label: 'JPEG', lossless: false },
      { id: 'webp', label: 'WebP', lossless: false }
    ];

    let format = 'png';
    let quality = 92;
    let estimateTimer = null;

    const overlay = document.createElement('div');
    overlay.className = 'swp-dialog-overlay';
    overlay.innerHTML = `
      <div class="swp-dialog swp-export-dialog" role="dialog" aria-modal="true" aria-label="Export image">
        <div class="swp-dialog-title">Export Image</div>
        <div class="swp-submenu-group">
          <label class="swp-submenu-label">Format</label>
          <div class="swp-btn-group" id="exportFormats">
            ${formats.map(f => `
              <button type="button" class="swp-submenu-btn ${f.id === 'png' ? 'active' : ''}" data-format-id="${f.id}">${f.label}</button>
            `).join('')}
          </div>
        </div>
        <div class="swp-submenu-group" id="exportQualityGroup" hidden>
          <label class="swp-submenu-label">Quality</label>
          <div class="swp-range-wrap">
            <input type="range" class="swp-slider" id="exportQuality" min="10" max="100" value="${quality}">
            <span class="swp-range-value">${quality}%</span>
          </div>
        </div>
        <div class="swp-submenu-group">
          <label class="swp-submenu-label">File name</label>
          <input type="text" class="swp-input" id="exportName" value="${this.app.file.projectName.replace(/"/g, '&quot;')}" maxlength="80">
        </div>
        <div class="swp-export-info" id="exportInfo">
          ${this.app.canvas.width} Ã— ${this.app.canvas.height} px
        </div>
        <div class="swp-dialog-actions swp-export-actions">
          <button type="button" class="swp-btn" id="exportSaveProject">Save Project (.sws)</button>
          <button type="button" class="swp-btn" id="exportCancel">Cancel</button>
          <button type="button" class="swp-btn swp-btn-primary" id="exportConfirm">Export</button>
        </div>
      </div>
    `;

    const close = () => {
      if (estimateTimer) clearTimeout(estimateTimer);
      document.removeEventListener('keydown', onKey, true);
      overlay.classList.add('swp-dialog-out');
      setTimeout(() => overlay.remove(), 150);
      this._exportOverlay = null;
    };

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener('keydown', onKey, true);

    const qualityGroup = overlay.querySelector('#exportQualityGroup');
    const qualitySlider = overlay.querySelector('#exportQuality');
    const qualityValue = overlay.querySelector('#exportQualityGroup .swp-range-value');
    const infoEl = overlay.querySelector('#exportInfo');
    const nameInput = overlay.querySelector('#exportName');

    const updateQualityVisibility = () => {
      qualityGroup.hidden = format === 'png';
    };

    const updateEstimate = () => {
      if (estimateTimer) clearTimeout(estimateTimer);
      infoEl.textContent = `${this.app.canvas.width} Ã— ${this.app.canvas.height} px`;
      if (format === 'png') return;
      estimateTimer = setTimeout(async () => {
        try {
          const mimeType = `image/${format}`;
          const dataURL = this.app.canvas.toDataURL(mimeType, quality / 100);
          const bytes = Math.round((dataURL.length - 'data:;base64,'.length) * 0.75);
          const kb = bytes / 1024;
          const sizeText = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
          infoEl.textContent = `${this.app.canvas.width} Ã— ${this.app.canvas.height} px Â· ~${sizeText}`;
        } catch (err) {
          // Estimate is best-effort only
        }
      }, 350);
    };

    overlay.querySelectorAll('[data-format-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.querySelectorAll('[data-format-id]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        format = btn.dataset.formatId;
        updateQualityVisibility();
        updateEstimate();
      });
    });

    qualitySlider?.addEventListener('input', (e) => {
      quality = parseInt(e.target.value, 10);
      if (qualityValue) qualityValue.textContent = `${quality}%`;
      updateEstimate();
    });

    overlay.querySelector('#exportCancel').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    overlay.querySelector('#exportSaveProject').addEventListener('click', async () => {
      const name = nameInput.value.trim();
      if (name) this.app.file.setProjectName(name);
      try {
        await this.withBusy('Saving projectâ€¦', () => this.app.file.save());
        this.toast.success(`Project saved as ${this.app.file.projectName}.sws`);
        close();
      } catch (err) {
        console.error('SWP: Save project failed', err);
        this.toast.error('Failed to save project');
      }
    });

    overlay.querySelector('#exportConfirm').addEventListener('click', async () => {
      const name = nameInput.value.trim();
      try {
        await this.withBusy(`Exporting ${format.toUpperCase()}â€¦`, () => this.app.file.export(format, quality / 100, name));
        this.toast.success(`Exported ${name || this.app.file.projectName}.${format}`);
        close();
      } catch (err) {
        console.error('SWP: Export failed', err);
        this.toast.error('Export failed');
      }
    });

    this.container.appendChild(overlay);
    this._exportOverlay = overlay;
    requestAnimationFrame(() => overlay.classList.add('swp-dialog-in'));
    overlay.querySelector('#exportConfirm').focus();
  }

  openFileDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.sws';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) this.loadFile(file);
    };
    input.click();
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.container.requestFullscreen();
      this.isFullscreen = true;
    } else {
      document.exitFullscreen();
      this.isFullscreen = false;
    }
  }

  // Side Panel Methods
  toggleSidePanel(panelType) {
    const sidePanel = this.swpRoot.querySelector('.swp-side-panel');
    if (!sidePanel) return;

    // If already showing this panel, close it
    if (!sidePanel.hidden && this.currentPanel === panelType) {
      this.closeSidePanel();
      return;
    }

    // Show panel
    sidePanel.hidden = false;
    this.currentPanel = panelType;

    // Update title
    const title = sidePanel.querySelector('.swp-side-panel-title');
    if (title) {
      title.textContent = panelType.charAt(0).toUpperCase() + panelType.slice(1);
    }

    // Render content
    const content = sidePanel.querySelector('.swp-side-panel-content');
    if (panelType === 'history') {
      this.renderHistorySidePanel(content);
    } else if (panelType === 'layers') {
      this.renderLayersSidePanel(content);
    }

    // Update button active states
    this.swpRoot.querySelectorAll('[data-action="history"], [data-action="layers"]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.action === panelType);
    });
  }

  closeSidePanel() {
    const sidePanel = this.swpRoot.querySelector('.swp-side-panel');
    if (sidePanel) {
      sidePanel.hidden = true;
    }
    this.currentPanel = null;

    // Remove active states
    this.swpRoot.querySelectorAll('[data-action="history"], [data-action="layers"]').forEach(btn => {
      btn.classList.remove('active');
    });
  }

  renderHistorySidePanel(content) {
    const states = this.app.history.getStates();
    
    content.innerHTML = `
      <div class="swp-panel-list">
        ${states.length === 0 ? '<div class="swp-panel-empty">No history yet</div>' : ''}
        ${states.map(state => `
          <div class="swp-panel-item ${state.isCurrent ? 'active' : ''}" data-index="${state.index}">
            <ss-icon icon="clock" thickness="2"></ss-icon>
            <span>${state.name}</span>
          </div>
        `).join('')}
      </div>
    `;

    content.querySelectorAll('.swp-panel-item').forEach(item => {
      item.addEventListener('click', () => {
        this.app.history.goToState(parseInt(item.dataset.index));
        this.renderHistorySidePanel(content);
      });
    });
  }

  renderLayersSidePanel(content) {
    const layers = this.app.layers.getLayers().slice().reverse();
    const active = this.app.layers.getActiveLayer();

    const blendModes = [
      ['source-over', 'Normal'],
      ['multiply', 'Multiply'],
      ['screen', 'Screen'],
      ['overlay', 'Overlay'],
      ['darken', 'Darken'],
      ['lighten', 'Lighten'],
      ['color-dodge', 'Color Dodge'],
      ['color-burn', 'Color Burn'],
      ['hard-light', 'Hard Light'],
      ['soft-light', 'Soft Light'],
      ['difference', 'Difference'],
      ['exclusion', 'Exclusion'],
      ['hue', 'Hue'],
      ['saturation', 'Saturation'],
      ['color', 'Color'],
      ['luminosity', 'Luminosity']
    ];

    content.innerHTML = `
      <div class="swp-panel-list">
        ${layers.length === 0 ? '<div class="swp-panel-empty">No layers</div>' : ''}
        ${layers.map(layer => `
          <div class="swp-panel-item ${layer.id === active?.id ? 'active' : ''}" data-id="${layer.id}">
            <button class="swp-layer-vis-btn ${layer.visible ? 'visible' : ''}" data-action="toggle-visibility" title="Toggle visibility">
              <ss-icon icon="${layer.visible ? 'eye' : 'eye-slash'}" thickness="2"></ss-icon>
            </button>
            <span class="swp-layer-name">${layer.name}</span>
            <button class="swp-layer-lock-btn ${layer.locked ? 'locked' : ''}" data-action="toggle-lock" title="${layer.locked ? 'Unlock' : 'Lock'}">
              <ss-icon icon="${layer.locked ? 'lock-closed' : 'lock-open'}" thickness="2"></ss-icon>
            </button>
          </div>
        `).join('')}
      </div>
      ${active ? `
      <div class="swp-layer-controls">
        <div class="swp-submenu-group">
          <label class="swp-submenu-label">Opacity</label>
          <div class="swp-range-wrap">
            <input type="range" class="swp-slider" id="layerOpacity" min="0" max="100" value="${active.opacity}">
            <span class="swp-range-value">${active.opacity}%</span>
          </div>
        </div>
        <div class="swp-submenu-group">
          <label class="swp-submenu-label">Blend Mode</label>
          <select class="swp-select" id="layerBlend">
            ${blendModes.map(([value, label]) => `
              <option value="${value}" ${active.blendMode === value ? 'selected' : ''}>${label}</option>
            `).join('')}
          </select>
        </div>
        <div class="swp-submenu-group">
          <label class="swp-submenu-label">Name</label>
          <input type="text" class="swp-input" id="layerName" value="${active.name.replace(/"/g, '&quot;')}" maxlength="50">
        </div>
      </div>
      ` : ''}
      <div class="swp-panel-actions">
        <button class="swp-btn swp-btn-sm" data-action="add-layer" title="Add layer">
          <ss-icon icon="plus" thickness="2"></ss-icon>
        </button>
        <button class="swp-btn swp-btn-sm" data-action="layer-up" title="Move up">
          <ss-icon icon="arrow-up" thickness="2"></ss-icon>
        </button>
        <button class="swp-btn swp-btn-sm" data-action="layer-down" title="Move down">
          <ss-icon icon="arrow-down" thickness="2"></ss-icon>
        </button>
        <button class="swp-btn swp-btn-sm" data-action="duplicate-layer" title="Duplicate layer">
          <ss-icon icon="document-duplicate" thickness="2"></ss-icon>
        </button>
        <button class="swp-btn swp-btn-sm" data-action="merge-down" title="Merge down">
          <ss-icon icon="arrow-down" thickness="2"></ss-icon><ss-icon icon="layer-stacks" thickness="2"></ss-icon>
        </button>
        <button class="swp-btn swp-btn-sm swp-btn-danger" data-action="delete-layer" title="Delete layer">
          <ss-icon icon="trash" thickness="2"></ss-icon>
        </button>
      </div>
    `;

    // Layer click handlers
    content.querySelectorAll('.swp-panel-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('[data-action]')) {
          this.app.layers.setActiveLayer(item.dataset.id);
          this.renderLayersSidePanel(content);
        }
      });

      item.querySelector('[data-action="toggle-visibility"]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const layer = this.app.layers.getLayer(item.dataset.id);
        if (layer) {
          this.app.layers.setLayerVisibility(item.dataset.id, !layer.visible);
          this.renderLayersSidePanel(content);
        }
      });

      item.querySelector('[data-action="toggle-lock"]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const layer = this.app.layers.getLayer(item.dataset.id);
        if (layer) {
          this.app.layers.setLayerLocked(item.dataset.id, !layer.locked);
          this.renderLayersSidePanel(content);
        }
      });
    });

    // Active layer controls
    const opacitySlider = content.querySelector('#layerOpacity');
    const opacityValue = content.querySelector('.swp-layer-controls .swp-range-value');
    opacitySlider?.addEventListener('input', (e) => {
      const opacity = parseInt(e.target.value, 10);
      if (opacityValue) opacityValue.textContent = `${opacity}%`;
      this.app.layers.setLayerOpacity(active.id, opacity);
    });

    const blendSelect = content.querySelector('#layerBlend');
    blendSelect?.addEventListener('change', (e) => {
      this.app.layers.setLayerBlendMode(active.id, e.target.value);
    });

    const nameInput = content.querySelector('#layerName');
    nameInput?.addEventListener('change', (e) => {
      const name = e.target.value.trim();
      if (name) this.app.layers.renameLayer(active.id, name);
    });

    // Action buttons
    content.querySelector('[data-action="add-layer"]')?.addEventListener('click', () => {
      this.app.layers.addLayer();
      this.renderLayersSidePanel(content);
    });

    content.querySelector('[data-action="layer-up"]')?.addEventListener('click', () => {
      this.app.layers.moveLayerUp(active.id);
      this.renderLayersSidePanel(content);
    });

    content.querySelector('[data-action="layer-down"]')?.addEventListener('click', () => {
      this.app.layers.moveLayerDown(active.id);
      this.renderLayersSidePanel(content);
    });

    content.querySelector('[data-action="duplicate-layer"]')?.addEventListener('click', () => {
      this.app.layers.duplicateLayer(active.id);
      this.renderLayersSidePanel(content);
    });

    content.querySelector('[data-action="merge-down"]')?.addEventListener('click', () => {
      this.app.layers.mergeDown(active.id);
      this.renderLayersSidePanel(content);
    });

    content.querySelector('[data-action="delete-layer"]')?.addEventListener('click', async () => {
      const activeLayer = this.app.layers.getActiveLayer();
      if (activeLayer) {
        const ok = await this.dialog.confirm({
          title: 'Delete layer?',
          message: `"${activeLayer.name}" will be removed. You can undo this with Ctrl+Z.`,
          confirmLabel: 'Delete',
          danger: true
        });
        if (!ok) return;
        this.app.layers.removeLayer(activeLayer.id);
        this.renderLayersSidePanel(content);
      }
    });
  }

  bindEvents() {
    // History events - update buttons and panel
    this.app.events.on(Events.HISTORY_PUSH, (data) => {
      // 'Initial State' is the fresh-document baseline, not user content
      const isInitial = !data || data.actionName === 'Initial State';
      if (!isInitial) {
        this._pushSeq++;
        this._setEmptyState(false);
      }
      this.updateHistoryButtons();
      this.updateHistoryPanel();
    });
    this.app.events.on(Events.HISTORY_UNDO, () => {
      this.updateHistoryButtons();
      this.updateHistoryPanel();
    });
    this.app.events.on(Events.HISTORY_REDO, () => {
      this.updateHistoryButtons();
      this.updateHistoryPanel();
    });

    // Layer events - update layers panel
    this.app.events.on(Events.LAYER_ADD, () => this.updateLayersPanel());
    this.app.events.on(Events.LAYER_REMOVE, () => this.updateLayersPanel());
    this.app.events.on(Events.LAYER_SELECT, () => this.updateLayersPanel());
    this.app.events.on(Events.LAYER_VISIBILITY, () => this.updateLayersPanel());
    this.app.events.on(Events.LAYER_UPDATE, () => this.updateLayersPanel());
    this.app.events.on(Events.LAYER_RENAME, () => this.updateLayersPanel());
    this.app.events.on(Events.LAYER_REORDER, () => this.updateLayersPanel());
    this.app.events.on(Events.LAYER_OPACITY, () => this.updateLayersPanel());
    this.app.events.on(Events.LAYER_REMOVE, () => this._scheduleEmptyCheck());
    this.app.events.on(Events.DOCUMENT_NEW, () => this._scheduleEmptyCheck());

    // Tool changes (rail click or keyboard shortcut) sync rail + options sheet
    this.app.events.on(Events.TOOL_SELECT, ({ tool }) => {
      if (!this._getRailItem(tool)) return;
      this.currentMenu = tool;
      this.swpRoot.querySelectorAll('.swp-menu-item').forEach(el => {
        el.classList.toggle('active', el.dataset.menu === tool);
      });
      this.showOptionsFor(tool);
    });

    // Color changes sync the header color widget
    this.app.events.on(Events.COLOR_FOREGROUND, () => this.updateColorWidget());
    this.app.events.on(Events.COLOR_BACKGROUND, () => this.updateColorWidget());
    this.app.events.on(Events.COLOR_SWAP, () => this.updateColorWidget());
  }

  /**
   * Reflect current foreground/background colors in the header widget
   */
  updateColorWidget() {
    if (!this.swpRoot) return;
    const fg = this.swpRoot.querySelector('.swp-color-fg');
    const bg = this.swpRoot.querySelector('.swp-color-bg');
    const fgInput = this.swpRoot.querySelector('#fgColorInput');
    const bgInput = this.swpRoot.querySelector('#bgColorInput');
    const colors = this.app.colors;
    if (fg) {
      fg.style.backgroundColor = colors.foreground;
      fg.title = `Foreground: ${colors.foreground} (X to swap, D to reset)`;
      fg.setAttribute('aria-label', fg.title);
    }
    if (bg) {
      bg.style.backgroundColor = colors.background;
      bg.title = `Background: ${colors.background} (X to swap, D to reset)`;
      bg.setAttribute('aria-label', bg.title);
    }
    if (fgInput) fgInput.value = colors.foreground;
    if (bgInput) bgInput.value = colors.background;
  }

  updateHistoryButtons() {
    const undoBtn = this.swpRoot.querySelector('[data-action="undo"]');
    const redoBtn = this.swpRoot.querySelector('[data-action="redo"]');
    
    if (undoBtn) {
      undoBtn.disabled = !this.app.history.canUndo();
    }
    if (redoBtn) {
      redoBtn.disabled = !this.app.history.canRedo();
    }
  }

  // Update layers panel if it's currently visible
  updateLayersPanel() {
    if (this.currentPanel === 'layers') {
      const content = this.swpRoot.querySelector('.swp-side-panel-content');
      if (content) {
        this.renderLayersSidePanel(content);
      }
    }
  }

  // Update history panel if it's currently visible
  updateHistoryPanel() {
    if (this.currentPanel === 'history') {
      const content = this.swpRoot.querySelector('.swp-side-panel-content');
      if (content) {
        this.renderHistorySidePanel(content);
      }
    }
  }

  updateToolbox() {
    // Refresh the options sheet for the current tool (called after tool activation)
    if (!this.swpRoot || !this.currentMenu) return;
    const item = this._getRailItem(this.currentMenu);
    if (item?.type === 'tool') {
      this.showOptionsFor(this.currentMenu);
    }
  }

  getWorkspace() {
    return this.swpRoot.querySelector('.swp-workspace');
  }

  destroy() {
    if (this.swpRoot && this.swpRoot.parentNode) {
      this.swpRoot.remove();
      this.swpRoot = null;
    }
    if (this._exportOverlay?.isConnected) this._exportOverlay.remove();
    this._exportOverlay = null;
    if (this._onDragOver) this.container.removeEventListener('dragover', this._onDragOver);
    if (this._onDragLeave) this.container.removeEventListener('dragleave', this._onDragLeave);
    if (this._onDrop) this.container.removeEventListener('drop', this._onDrop);
    if (this._onPaste) document.removeEventListener('paste', this._onPaste);
    this.toast?.destroy();
    this.dialog?.destroy();
    this.container.classList.remove('swp-app');
    this.container = null;
  }
}

export default UI;
