/**
 * SenangWebs Photobooth - UI Manager
 * TOAST UI-Inspired Simple Layout
 * @version 3.0.0
 */

import { Events } from '../core/EventEmitter.js';
import '@bookklik/senangstart-icons';

export class UI {
  constructor(app) {
    this.app = app;
    this.container = null;
    this.currentMenu = null;
    this.isFullscreen = false;
  }

  init(container) {
    this.container = container;
    this.container.classList.add('swp-app');
    this.createLayout();
    this.bindEvents();
  }

  createLayout() {
    this.container.innerHTML = `
      <!-- Header Bar -->
      <div class="swp-header">
        <div class="swp-header-left">
          <button class="swp-header-btn" data-action="load" title="Load Image">
            <ss-icon icon="folder-open" thickness="2"></ss-icon>
            <span>Load</span>
          </button>
          <div class="swp-download-dropdown">
            <button class="swp-header-btn" data-action="toggle-download" title="Download">
              <ss-icon icon="save" thickness="2"></ss-icon>
              <span>Download</span>
              <ss-icon icon="chevron-down" thickness="2" class="swp-dropdown-arrow"></ss-icon>
            </button>
            <div class="swp-dropdown-menu" hidden>
              <button class="swp-dropdown-item" data-format="png">PNG</button>
              <button class="swp-dropdown-item" data-format="jpeg">JPEG</button>
              <button class="swp-dropdown-item" data-format="webp">WebP</button>
            </div>
          </div>
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
      <!-- Sub-menu Panel (contextual options) -->
      <div class="swp-submenu" hidden></div>

      <!-- Bottom Menu Bar -->
      <div class="swp-menu-bar">
        <button class="swp-menu-item" data-menu="crop">
          <ss-icon icon="crop" thickness="2"></ss-icon>
          <span>Crop</span>
        </button>
        <button class="swp-menu-item" data-menu="rotate">
          <ss-icon icon="arrow-path" thickness="2"></ss-icon>
          <span>Rotate</span>
        </button>
        <button class="swp-menu-item" data-menu="flip">
          <ss-icon icon="arrow-left-arrow-right" thickness="2"></ss-icon>
          <span>Flip</span>
        </button>
        <button class="swp-menu-item" data-menu="resize">
          <ss-icon icon="sliders-vertical" thickness="2"></ss-icon>
          <span>Resize</span>
        </button>
        <button class="swp-menu-item" data-menu="draw">
          <ss-icon icon="pencil" thickness="2"></ss-icon>
          <span>Draw</span>
        </button>
        <button class="swp-menu-item" data-menu="shape">
          <ss-icon icon="shapes" thickness="2"></ss-icon>
          <span>Shape</span>
        </button>
        <button class="swp-menu-item" data-menu="text">
          <ss-icon icon="text" thickness="2"></ss-icon>
          <span>Text</span>
        </button>
        <button class="swp-menu-item" data-menu="filter">
          <ss-icon icon="magic-wand" thickness="2"></ss-icon>
          <span>Filter</span>
        </button>
      </div>
    `;

    this.bindHeaderActions();
    this.bindMenuActions();
  }

  bindHeaderActions() {
    const header = this.container.querySelector('.swp-header');
    const sidePanel = this.container.querySelector('.swp-side-panel');
    
    // Close panel button
    sidePanel?.querySelector('[data-action="close-panel"]')?.addEventListener('click', () => {
      this.closeSidePanel();
    });
    
    // Download dropdown handling
    const downloadDropdown = this.container.querySelector('.swp-download-dropdown');
    const dropdownMenu = downloadDropdown?.querySelector('.swp-dropdown-menu');
    
    // Format selection
    dropdownMenu?.querySelectorAll('[data-format]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const format = item.dataset.format;
        this.app.file.export(format);
        dropdownMenu.hidden = true;
      });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (dropdownMenu && !downloadDropdown.contains(e.target)) {
        dropdownMenu.hidden = true;
      }
    });
    
    header.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      switch (action) {
        case 'load':
          this.openFileDialog();
          break;
        case 'toggle-download':
          if (dropdownMenu) {
            dropdownMenu.hidden = !dropdownMenu.hidden;
          }
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
          this.resetCanvas();
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
    const menuBar = this.container.querySelector('.swp-menu-bar');
    
    menuBar.addEventListener('click', (e) => {
      const menuItem = e.target.closest('.swp-menu-item');
      if (!menuItem) return;

      const menu = menuItem.dataset.menu;
      this.selectMenu(menu);
    });
  }

  selectMenu(menu) {
    // Toggle off if same menu clicked
    if (this.currentMenu === menu) {
      this.closeSubmenu();
      return;
    }

    this.currentMenu = menu;

    // Update active state
    this.container.querySelectorAll('.swp-menu-item').forEach(item => {
      item.classList.toggle('active', item.dataset.menu === menu);
    });

    // Activate corresponding tool
    this.activateToolForMenu(menu);

    // Show submenu
    this.showSubmenu(menu);
  }

  activateToolForMenu(menu) {
    const toolMap = {
      'crop': 'crop',
      'rotate': 'move',
      'flip': 'move',
      'resize': 'move',
      'draw': 'brush',
      'shape': 'shape',
      'text': 'text',
      'filter': 'move'
    };

    const toolName = toolMap[menu];
    if (toolName) {
      this.app.tools.setTool(toolName);
    }
  }

  showSubmenu(menu) {
    const submenu = this.container.querySelector('.swp-submenu');
    submenu.hidden = false;

    switch (menu) {
      case 'crop':
        this.renderCropSubmenu(submenu);
        break;
      case 'rotate':
        this.renderRotateSubmenu(submenu);
        break;
      case 'flip':
        this.renderFlipSubmenu(submenu);
        break;
      case 'resize':
        this.renderResizeSubmenu(submenu);
        break;
      case 'draw':
        this.renderDrawSubmenu(submenu);
        break;
      case 'shape':
        this.renderShapeSubmenu(submenu);
        break;
      case 'text':
        this.renderTextSubmenu(submenu);
        break;
      case 'filter':
        this.renderFilterSubmenu(submenu);
        break;
    }
  }

  closeSubmenu() {
    this.currentMenu = null;
    this.container.querySelectorAll('.swp-menu-item').forEach(item => {
      item.classList.remove('active');
    });
    const submenu = this.container.querySelector('.swp-submenu');
    submenu.hidden = true;
    submenu.innerHTML = '';
    
    // Reset tool to move
    this.app.tools.setTool('move');
  }

  renderCropSubmenu(submenu) {
    submenu.innerHTML = `
      <div class="swp-submenu-content">
        <div class="swp-submenu-title">Crop</div>
        <div class="swp-submenu-group">
          <label class="swp-submenu-label">Preset</label>
          <div class="swp-btn-group">
            <button class="swp-submenu-btn active" data-ratio="free">Free</button>
            <button class="swp-submenu-btn" data-ratio="1:1">1:1</button>
            <button class="swp-submenu-btn" data-ratio="4:3">4:3</button>
            <button class="swp-submenu-btn" data-ratio="16:9">16:9</button>
          </div>
        </div>
        <div class="swp-submenu-actions">
          <button class="swp-btn" data-action="cancel">Cancel</button>
          <button class="swp-btn swp-btn-primary" data-action="apply">Apply</button>
        </div>
      </div>
    `;

    this.bindCropSubmenuEvents(submenu);
  }

  bindCropSubmenuEvents(submenu) {
    submenu.querySelectorAll('[data-ratio]').forEach(btn => {
      btn.addEventListener('click', () => {
        submenu.querySelectorAll('[data-ratio]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const ratio = btn.dataset.ratio;
        const cropTool = this.app.tools.getTool('crop');
        if (cropTool) {
          if (ratio === 'free') {
            cropTool.setAspectRatio(null);
          } else {
            const [w, h] = ratio.split(':').map(Number);
            cropTool.setAspectRatio(w / h);
          }
        }
      });
    });

    submenu.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
      this.closeSubmenu();
    });

    submenu.querySelector('[data-action="apply"]')?.addEventListener('click', () => {
      const cropTool = this.app.tools.getTool('crop');
      if (cropTool?.applyCrop) {
        cropTool.applyCrop();
      }
      this.closeSubmenu();
    });
  }

  renderRotateSubmenu(submenu) {
    submenu.innerHTML = `
      <div class="swp-submenu-content">
        <div class="swp-submenu-title">Rotate</div>
        <div class="swp-submenu-group">
          <div class="swp-btn-group" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
            <button class="swp-submenu-btn" data-rotate="-90">
              <ss-icon icon="rotate-minus" thickness="2"></ss-icon>
              <span>-90°</span>
            </button>
            <button class="swp-submenu-btn" data-rotate="90">
              <ss-icon icon="rotate-add" thickness="2"></ss-icon>
              <span>+90°</span>
            </button>
          </div>
        </div>
        <div class="swp-submenu-group">
          <label class="swp-submenu-label">Custom Angle</label>
          <div class="swp-range-wrap">
            <input type="range" class="swp-slider" id="rotateAngle" min="-180" max="180" value="0">
            <span class="swp-range-value">0°</span>
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
      valueDisplay.textContent = `${currentAngle}°`;
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
            <button class="swp-submenu-btn swp-preset-btn" data-width="1920" data-height="1080">1920×1080</button>
            <button class="swp-submenu-btn swp-preset-btn" data-width="1280" data-height="720">1280×720</button>
            <button class="swp-submenu-btn swp-preset-btn" data-width="800" data-height="600">800×600</button>
            <button class="swp-submenu-btn swp-preset-btn" data-width="500" data-height="500">500×500</button>
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
    this.app.history.pushState(`Resize to ${width}×${height}`);
    this.app.canvas.resize(width, height);
    this.app.canvas.fitToScreen();
    this.app.canvas.render();
  }

  renderDrawSubmenu(submenu) {
    const currentColor = this.app.colors.foreground;
    const brushTool = this.app.tools.getTool('brush');
    const currentSize = brushTool?.size || 10;

    submenu.innerHTML = `
      <div class="swp-submenu-content">
        <div class="swp-submenu-title">Draw</div>
        <div class="swp-submenu-group">
          <label class="swp-submenu-label">Brush Size</label>
          <div class="swp-range-wrap">
            <input type="range" class="swp-slider" id="brushSize" min="1" max="100" value="${currentSize}">
            <span class="swp-range-value">${currentSize}px</span>
          </div>
        </div>
        <div class="swp-submenu-group">
          <label class="swp-submenu-label">Color</label>
          <input type="color" class="swp-color-input" id="brushColor" value="${currentColor}">
        </div>
      </div>
    `;

    this.bindDrawSubmenuEvents(submenu);
  }

  bindDrawSubmenuEvents(submenu) {
    const sizeSlider = submenu.querySelector('#brushSize');
    const sizeValue = submenu.querySelector('.swp-range-value');
    const colorInput = submenu.querySelector('#brushColor');

    sizeSlider?.addEventListener('input', (e) => {
      const size = parseInt(e.target.value);
      sizeValue.textContent = `${size}px`;
      const brushTool = this.app.tools.getTool('brush');
      if (brushTool) {
        brushTool.size = size;
      }
    });

    colorInput?.addEventListener('input', (e) => {
      this.app.colors.setForeground(e.target.value);
    });
  }

  renderShapeSubmenu(submenu) {
    const shapeTool = this.app.tools.getTool('shape');
    const currentShape = shapeTool?.options?.shape || 'rectangle';
    const currentFillColor = shapeTool?.options?.fillColor || this.app.colors.foreground;
    const currentStrokeWidth = shapeTool?.options?.strokeWidth || 2;

    submenu.innerHTML = `
      <div class="swp-submenu-content">
        <div class="swp-submenu-title">Shape</div>
        <div class="swp-submenu-group">
          <label class="swp-submenu-label">Shape Type</label>
          <div class="swp-btn-group">
            <button class="swp-submenu-btn ${currentShape === 'rectangle' ? 'active' : ''}" data-shape="rectangle">
              <ss-icon icon="square" thickness="2"></ss-icon>
            </button>
            <button class="swp-submenu-btn ${currentShape === 'ellipse' ? 'active' : ''}" data-shape="ellipse">
              <ss-icon icon="circle" thickness="2"></ss-icon>
            </button>
            <button class="swp-submenu-btn ${currentShape === 'line' ? 'active' : ''}" data-shape="line">
              <ss-icon icon="minus" thickness="2"></ss-icon>
            </button>
          </div>
        </div>
        <div class="swp-submenu-group">
          <label class="swp-submenu-label">Fill Color</label>
          <input type="color" class="swp-color-input" id="shapeFill" value="${currentFillColor}">
        </div>
        <div class="swp-submenu-group">
          <label class="swp-submenu-label">Stroke Width</label>
          <div class="swp-range-wrap">
            <input type="range" class="swp-slider" id="shapeStroke" min="0" max="20" value="${currentStrokeWidth}">
            <span class="swp-range-value">2px</span>
          </div>
        </div>
      </div>
    `;

    this.bindShapeSubmenuEvents(submenu);
  }

  bindShapeSubmenuEvents(submenu) {
    submenu.querySelectorAll('[data-shape]').forEach(btn => {
      btn.addEventListener('click', () => {
        submenu.querySelectorAll('[data-shape]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const shapeTool = this.app.tools.getTool('shape');
        if (shapeTool) {
          shapeTool.options.shape = btn.dataset.shape;
        }
      });
    });

    const fillInput = submenu.querySelector('#shapeFill');
    fillInput?.addEventListener('input', (e) => {
      const shapeTool = this.app.tools.getTool('shape');
      if (shapeTool) {
        shapeTool.options.fillColor = e.target.value;
        shapeTool.options.filled = true;
      }
      this.app.colors.setForeground(e.target.value);
    });

    const strokeSlider = submenu.querySelector('#shapeStroke');
    const strokeValue = submenu.querySelectorAll('.swp-range-value')[0];
    strokeSlider?.addEventListener('input', (e) => {
      const width = parseInt(e.target.value);
      if (strokeValue) strokeValue.textContent = `${width}px`;
      const shapeTool = this.app.tools.getTool('shape');
      if (shapeTool) {
        shapeTool.options.strokeWidth = width;
        if (width > 0) {
          shapeTool.options.stroked = true;
          shapeTool.options.strokeColor = this.app.colors.foreground;
        }
      }
    });
  }

  renderTextSubmenu(submenu) {
    const currentColor = this.app.colors.foreground;

    submenu.innerHTML = `
      <div class="swp-submenu-content">
        <div class="swp-submenu-title">Text</div>
        <div class="swp-submenu-group">
          <label class="swp-submenu-label">Font Size</label>
          <div class="swp-range-wrap">
            <input type="range" class="swp-slider" id="textSize" min="12" max="120" value="32">
            <span class="swp-range-value">32px</span>
          </div>
        </div>
        <div class="swp-submenu-group">
          <label class="swp-submenu-label">Font</label>
          <select class="swp-select" id="textFont">
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Impact">Impact</option>
          </select>
        </div>
        <div class="swp-submenu-group">
          <label class="swp-submenu-label">Color</label>
          <input type="color" class="swp-color-input" id="textColor" value="${currentColor}">
        </div>
        <div class="swp-submenu-group">
          <label class="swp-submenu-label">Style</label>
          <div class="swp-btn-group">
            <button class="swp-submenu-btn" data-style="bold">
              <strong>B</strong>
            </button>
            <button class="swp-submenu-btn" data-style="italic">
              <em>I</em>
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindTextSubmenuEvents(submenu);
  }

  bindTextSubmenuEvents(submenu) {
    const sizeSlider = submenu.querySelector('#textSize');
    const sizeValue = submenu.querySelector('.swp-range-value');
    
    sizeSlider?.addEventListener('input', (e) => {
      const size = parseInt(e.target.value);
      sizeValue.textContent = `${size}px`;
      const textTool = this.app.tools.getTool('text');
      if (textTool) {
        textTool.fontSize = size;
      }
    });

    const fontSelect = submenu.querySelector('#textFont');
    fontSelect?.addEventListener('change', (e) => {
      const textTool = this.app.tools.getTool('text');
      if (textTool) {
        textTool.fontFamily = e.target.value;
      }
    });

    const colorInput = submenu.querySelector('#textColor');
    colorInput?.addEventListener('input', (e) => {
      this.app.colors.setForeground(e.target.value);
    });

    submenu.querySelectorAll('[data-style]').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        const textTool = this.app.tools.getTool('text');
        if (textTool) {
          if (btn.dataset.style === 'bold') {
            textTool.bold = btn.classList.contains('active');
          } else if (btn.dataset.style === 'italic') {
            textTool.italic = btn.classList.contains('active');
          }
        }
      });
    });
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
              <div class="swp-filter-preview swp-filter-grayscale"></div>
              <span>Grayscale</span>
            </button>
            <button class="swp-filter-btn" data-filter="sepia">
              <div class="swp-filter-preview swp-filter-sepia"></div>
              <span>Sepia</span>
            </button>
            <button class="swp-filter-btn" data-filter="invert">
              <div class="swp-filter-preview swp-filter-invert"></div>
              <span>Invert</span>
            </button>
            <button class="swp-filter-btn" data-filter="blur">
              <div class="swp-filter-preview swp-filter-blur"></div>
              <span>Blur</span>
            </button>
            <button class="swp-filter-btn" data-filter="brightness">
              <div class="swp-filter-preview swp-filter-brightness"></div>
              <span>Brighten</span>
            </button>
            <button class="swp-filter-btn" data-filter="contrast">
              <div class="swp-filter-preview swp-filter-contrast"></div>
              <span>Contrast</span>
            </button>
            <button class="swp-filter-btn" data-filter="sharpen">
              <div class="swp-filter-preview swp-filter-sharpen"></div>
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
          <button class="swp-btn" data-action="cancel">Cancel</button>
          <button class="swp-btn swp-btn-primary" data-action="apply">Apply</button>
        </div>
      </div>
    `;

    this.bindFilterSubmenuEvents(submenu);
  }

  bindFilterSubmenuEvents(submenu) {
    let selectedFilter = 'none';
    let intensity = 50;

    const intensityGroup = submenu.querySelector('.swp-filter-intensity');
    const intensitySlider = submenu.querySelector('#filterIntensity');
    const intensityValue = submenu.querySelector('.swp-filter-intensity .swp-range-value');

    submenu.querySelectorAll('.swp-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        submenu.querySelectorAll('.swp-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedFilter = btn.dataset.filter;

        // Show/hide intensity slider
        if (selectedFilter !== 'none') {
          intensityGroup.hidden = false;
          this.previewFilter(selectedFilter, intensity);
        } else {
          intensityGroup.hidden = true;
          this.app.filters.cancelPreview();
        }
      });
    });

    intensitySlider?.addEventListener('input', (e) => {
      intensity = parseInt(e.target.value);
      intensityValue.textContent = `${intensity}%`;
      if (selectedFilter !== 'none') {
        this.previewFilter(selectedFilter, intensity);
      }
    });

    submenu.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
      this.app.filters.cancelPreview();
      this.closeSubmenu();
    });

    submenu.querySelector('[data-action="apply"]')?.addEventListener('click', () => {
      if (selectedFilter !== 'none') {
        this.applyFilter(selectedFilter, intensity);
      }
      this.closeSubmenu();
    });
  }

  // Canvas manipulation methods
  rotateCanvas(angle) {
    const layer = this.app.layers.getActiveLayer();
    if (!layer) return;

    // Save history
    this.app.history.pushState(`Rotate ${angle}°`);

    // Perform rotation
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    const rad = (angle * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    
    const w = layer.width;
    const h = layer.height;
    const newW = Math.round(w * cos + h * sin);
    const newH = Math.round(w * sin + h * cos);

    tempCanvas.width = newW;
    tempCanvas.height = newH;
    
    tempCtx.translate(newW / 2, newH / 2);
    tempCtx.rotate(rad);
    tempCtx.drawImage(layer.canvas, -w / 2, -h / 2);

    // Update canvas size if needed (for 90° rotations)
    if (angle === 90 || angle === -90) {
      this.app.canvas.resize(newH, newW);
    }

    layer.clear();
    layer.ctx.drawImage(tempCanvas, 0, 0);
    this.app.canvas.render();
  }

  flipCanvas(direction) {
    const layer = this.app.layers.getActiveLayer();
    if (!layer) return;

    this.app.history.pushState(`Flip ${direction}`);

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
    this.app.canvas.render();
  }

  previewFilter(filterName, intensity) {
    // Convert 0-100 intensity to appropriate filter values
    let options = {};
    switch (filterName) {
      case 'brightness':
        // Convert 0-100 to -128 to 128 range (50 = 0 change)
        options.value = Math.round((intensity - 50) * 2.56);
        break;
      case 'contrast':
        // Convert 0-100 to -128 to 128 range (50 = 0 change)
        options.value = Math.round((intensity - 50) * 2.56);
        break;
      case 'saturation':
        // Convert 0-100 to -100 to 100 range (50 = 0 change)
        options.value = (intensity - 50) * 2;
        break;
      case 'blur':
        // Convert 0-100 to 1-10 radius
        options.radius = Math.max(1, Math.round(intensity / 10));
        break;
      case 'sharpen':
        // Convert 0-100 to 0-2 amount
        options.amount = intensity / 50;
        break;
      case 'hueRotate':
        // Convert 0-100 to 0-360 degrees
        options.angle = intensity * 3.6;
        break;
      default:
        options.value = intensity;
    }
    this.app.filters.previewFilter(filterName, options);
  }

  applyFilter(filterName, intensity) {
    // Convert 0-100 intensity to appropriate filter values
    let options = {};
    switch (filterName) {
      case 'brightness':
        options.value = Math.round((intensity - 50) * 2.56);
        break;
      case 'contrast':
        options.value = Math.round((intensity - 50) * 2.56);
        break;
      case 'saturation':
        options.value = (intensity - 50) * 2;
        break;
      case 'blur':
        options.radius = Math.max(1, Math.round(intensity / 10));
        break;
      case 'sharpen':
        options.amount = intensity / 50;
        break;
      case 'hueRotate':
        options.angle = intensity * 3.6;
        break;
      default:
        options.value = intensity;
    }
    this.app.filters.applyFilter(filterName, options);
  }

  resetCanvas() {
    if (confirm('Reset all changes?')) {
      this.app.file.newDocument({
        width: this.app.options.width,
        height: this.app.options.height
      });
      this.closeSubmenu();
    }
  }

  openFileDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.app.loadImage(e.target.result);
        };
        reader.readAsDataURL(file);
      }
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
    const sidePanel = this.container.querySelector('.swp-side-panel');
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
    this.container.querySelectorAll('[data-action="history"], [data-action="layers"]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.action === panelType);
    });
  }

  closeSidePanel() {
    const sidePanel = this.container.querySelector('.swp-side-panel');
    if (sidePanel) {
      sidePanel.hidden = true;
    }
    this.currentPanel = null;

    // Remove active states
    this.container.querySelectorAll('[data-action="history"], [data-action="layers"]').forEach(btn => {
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

    content.innerHTML = `
      <div class="swp-panel-list">
        ${layers.length === 0 ? '<div class="swp-panel-empty">No layers</div>' : ''}
        ${layers.map(layer => `
          <div class="swp-panel-item ${layer.id === active?.id ? 'active' : ''}" data-id="${layer.id}">
            <button class="swp-layer-vis-btn ${layer.visible ? 'visible' : ''}" data-action="toggle-visibility">
              <ss-icon icon="${layer.visible ? 'eye' : 'eye-slash'}" thickness="2"></ss-icon>
            </button>
            <span class="swp-layer-name">${layer.name}</span>
            <span class="swp-layer-opacity">${layer.opacity}%</span>
          </div>
        `).join('')}
      </div>
      <div class="swp-panel-actions">
        <button class="swp-btn swp-btn-sm" data-action="add-layer">
          <ss-icon icon="plus" thickness="2"></ss-icon> Add
        </button>
        <button class="swp-btn swp-btn-sm swp-btn-danger" data-action="delete-layer">
          <ss-icon icon="trash" thickness="2"></ss-icon> Delete
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
    });

    // Action buttons
    content.querySelector('[data-action="add-layer"]')?.addEventListener('click', () => {
      this.app.layers.addLayer();
      this.renderLayersSidePanel(content);
    });

    content.querySelector('[data-action="delete-layer"]')?.addEventListener('click', () => {
      const activeLayer = this.app.layers.getActiveLayer();
      if (activeLayer) {
        this.app.layers.removeLayer(activeLayer.id);
        this.renderLayersSidePanel(content);
      }
    });
  }

  bindEvents() {
    this.app.events.on(Events.HISTORY_PUSH, () => this.updateHistoryButtons());
    this.app.events.on(Events.HISTORY_UNDO, () => this.updateHistoryButtons());
    this.app.events.on(Events.HISTORY_REDO, () => this.updateHistoryButtons());
  }

  updateHistoryButtons() {
    const undoBtn = this.container.querySelector('[data-action="undo"]');
    const redoBtn = this.container.querySelector('[data-action="redo"]');
    
    if (undoBtn) {
      undoBtn.disabled = !this.app.history.canUndo();
    }
    if (redoBtn) {
      redoBtn.disabled = !this.app.history.canRedo();
    }
  }

  // Keep this method for compatibility
  updateLayersPanel() {
    // No-op in simplified UI
  }

  updateHistoryPanel() {
    // No-op in simplified UI
  }

  updateToolbox() {
    // No-op in simplified UI
  }

  getWorkspace() {
    return this.container.querySelector('.swp-workspace');
  }
}

export default UI;
