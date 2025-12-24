/**
 * SenangWebs Photobooth - UI Manager
 * @version 2.0.0
 */

import { Events } from '../core/EventEmitter.js';
import '@bookklik/senangstart-icons';

export class UI {
  constructor(app) {
    this.app = app;
    this.container = null;
    this.panelsVisible = true;
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
      <div class="swp-main">
        <div class="swp-toolbox"></div>
        <div class="swp-workspace"></div>
        <div class="swp-sidebar">
          <div class="swp-panel swp-colors-panel">
            <div class="swp-panel-header">
              <ss-icon icon="contrast" thickness="2"></ss-icon>
              <span>Colors</span>
            </div>
            <div class="swp-panel-content swp-colors-content"></div>
          </div>
          <div class="swp-panel swp-layers-panel">
            <div class="swp-panel-header">
              <ss-icon icon="layer-stacks" thickness="2"></ss-icon>
              <span>Layers</span>
            </div>
            <div class="swp-panel-content swp-layers-list"></div>
            <div class="swp-panel-footer swp-layers-actions"></div>
          </div>
          <div class="swp-panel swp-history-panel">
            <div class="swp-panel-header">
              <ss-icon icon="time-reset" thickness="2"></ss-icon>
              <span>History</span>
            </div>
            <div class="swp-panel-content swp-history-list"></div>
          </div>
        </div>
      </div>
      <div class="swp-statusbar">
        <div class="swp-status-left">
          <span class="swp-status-zoom"></span>
          <span class="swp-status-size"></span>
        </div>
        <div class="swp-status-right">
          <span class="swp-status-tool"></span>
        </div>
      </div>
    `;

    this.renderToolbox();
    this.renderColorPanel();
    this.renderLayersActions();
    this.updateStatusBar();
  }

  renderToolbox() {
    const toolbox = this.container.querySelector('.swp-toolbox');
    const tools = [
      { name: 'move', icon: 'cursor', title: 'Move (V)' },
      { name: 'marquee', icon: 'focus', title: 'Marquee (M)' },
      { name: 'brush', icon: 'pencil', title: 'Brush (B)' },
      { name: 'eraser', icon: 'eraser', title: 'Eraser (E)' },
      { name: 'fill', icon: 'contrast', title: 'Fill (G)' },
      { name: 'gradient', icon: 'sliders-horizontal', title: 'Gradient (G)' },
      { name: 'text', icon: 'font', title: 'Text (T)' },
      { name: 'shape', icon: 'square', title: 'Shape (U)' },
      { name: 'eyedropper', icon: 'eye', title: 'Eyedropper (I)' },
      { name: 'crop', icon: 'maximize', title: 'Crop (C)' },
      { name: 'hand', icon: 'arrow-up-down-left-right', title: 'Hand (H)' },
      { name: 'zoom', icon: 'magnifying-glass-plus', title: 'Zoom (Z)' }
    ];

    toolbox.innerHTML = `
      <div class="swp-toolbox-inner">
        ${tools.map(tool => `
          <button class="swp-tool-btn" data-tool="${tool.name}" title="${tool.title}">
            <ss-icon icon="${tool.icon}" thickness="2.2"></ss-icon>
          </button>
        `).join('')}
      </div>
      <div class="swp-toolbox-colors">
        <div class="swp-quick-colors">
          <div class="swp-quick-fg" title="Foreground"></div>
          <div class="swp-quick-bg" title="Background"></div>
        </div>
        <button class="swp-quick-swap" title="Swap (X)">
          <ss-icon icon="arrow-left-right" thickness="2"></ss-icon>
        </button>
      </div>
    `;

    toolbox.addEventListener('click', e => {
      const btn = e.target.closest('[data-tool]');
      if (btn) {
        this.app.tools.setTool(btn.dataset.tool);
        this.updateToolbox();
      }
    });

    toolbox.querySelector('.swp-quick-swap')?.addEventListener('click', () => {
      this.app.colors.swap();
      this.updateQuickColors();
    });

    this.updateQuickColors();
  }

  updateQuickColors() {
    const fg = this.container.querySelector('.swp-quick-fg');
    const bg = this.container.querySelector('.swp-quick-bg');
    if (fg) fg.style.background = this.app.colors.foreground;
    if (bg) bg.style.background = this.app.colors.background;
  }

  updateToolbox() {
    const current = this.app.tools.getCurrentToolName();
    this.container.querySelectorAll('.swp-tool-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === current);
    });
  }

  renderColorPanel() {
    const content = this.container.querySelector('.swp-colors-content');
    content.innerHTML = `
      <div class="swp-color-main">
        <div class="swp-color-picker-wrap">
          <label>Foreground</label>
          <input type="color" id="swp-fg-color" value="${this.app.colors.foreground}">
        </div>
        <div class="swp-color-picker-wrap">
          <label>Background</label>
          <input type="color" id="swp-bg-color" value="${this.app.colors.background}">
        </div>
      </div>
      <div class="swp-swatches">
        ${this.app.colors.swatches.map(c => `<div class="swp-swatch" style="background:${c}" data-color="${c}"></div>`).join('')}
      </div>
    `;

    content.querySelector('#swp-fg-color').addEventListener('input', e => {
      this.app.colors.setForeground(e.target.value);
      this.updateQuickColors();
    });
    content.querySelector('#swp-bg-color').addEventListener('input', e => {
      this.app.colors.setBackground(e.target.value);
      this.updateQuickColors();
    });
    content.querySelectorAll('.swp-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        this.app.colors.setForeground(swatch.dataset.color);
        this.updateColorPanel();
        this.updateQuickColors();
      });
    });
  }

  updateColorPanel() {
    const fg = this.container.querySelector('#swp-fg-color');
    const bg = this.container.querySelector('#swp-bg-color');
    if (fg) fg.value = this.app.colors.foreground;
    if (bg) bg.value = this.app.colors.background;
  }

  renderLayersActions() {
    const footer = this.container.querySelector('.swp-layers-actions');
    footer.innerHTML = `
      <button class="swp-icon-btn" data-action="add" title="New Layer">
        <ss-icon icon="plus" thickness="2"></ss-icon>
      </button>
      <button class="swp-icon-btn" data-action="duplicate" title="Duplicate">
        <ss-icon icon="document-duplicate" thickness="2"></ss-icon>
      </button>
      <button class="swp-icon-btn" data-action="merge" title="Merge Down">
        <ss-icon icon="layer-stacks" thickness="2"></ss-icon>
      </button>
      <button class="swp-icon-btn swp-btn-danger" data-action="delete" title="Delete Layer">
        <ss-icon icon="trash" thickness="2"></ss-icon>
      </button>
    `;

    footer.addEventListener('click', e => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (!action) return;
      
      const active = this.app.layers.getActiveLayer();
      switch (action) {
        case 'add': this.app.layers.addLayer(); break;
        case 'delete': if (active) this.app.layers.removeLayer(active.id); break;
        case 'duplicate': if (active) this.app.layers.duplicateLayer(active.id); break;
        case 'merge': if (active) this.app.layers.mergeDown(active.id); break;
      }
      this.updateLayersPanel();
    });
  }

  updateLayersPanel() {
    const list = this.container.querySelector('.swp-layers-list');
    if (!list) return;

    const layers = this.app.layers.getLayers().slice().reverse();
    const active = this.app.layers.getActiveLayer();

    list.innerHTML = layers.map(layer => `
      <div class="swp-layer-item ${layer.id === active?.id ? 'active' : ''}" data-id="${layer.id}">
        <button class="swp-layer-visibility ${layer.visible ? 'visible' : ''}" data-action="visibility">
          <ss-icon icon="${layer.visible ? 'eye' : 'eye-slash'}" thickness="2"></ss-icon>
        </button>
        <div class="swp-layer-thumb"></div>
        <span class="swp-layer-name">${layer.name}</span>
        <span class="swp-layer-opacity">${layer.opacity}%</span>
      </div>
    `).join('');

    list.querySelectorAll('.swp-layer-item').forEach(item => {
      item.addEventListener('click', e => {
        if (!e.target.closest('[data-action]')) {
          this.app.layers.setActiveLayer(item.dataset.id);
          this.updateLayersPanel();
        }
      });
      item.querySelector('[data-action="visibility"]')?.addEventListener('click', () => {
        const layer = this.app.layers.getLayer(item.dataset.id);
        if (layer) {
          this.app.layers.setLayerVisibility(item.dataset.id, !layer.visible);
          this.updateLayersPanel();
        }
      });
    });
  }

  updateHistoryPanel() {
    const list = this.container.querySelector('.swp-history-list');
    if (!list) return;

    const states = this.app.history.getStates();
    list.innerHTML = states.map(state => `
      <div class="swp-history-item ${state.isCurrent ? 'current' : ''}" data-index="${state.index}">
        <ss-icon icon="clock" thickness="2"></ss-icon>
        <span>${state.name}</span>
      </div>
    `).join('');

    list.querySelectorAll('.swp-history-item').forEach(item => {
      item.addEventListener('click', () => {
        this.app.history.goToState(parseInt(item.dataset.index));
        this.updateHistoryPanel();
      });
    });
  }

  updateStatusBar() {
    const zoomEl = this.container.querySelector('.swp-status-zoom');
    const sizeEl = this.container.querySelector('.swp-status-size');
    const toolEl = this.container.querySelector('.swp-status-tool');

    if (zoomEl) zoomEl.textContent = `${this.app.canvas?.zoom || 100}%`;
    if (sizeEl) sizeEl.textContent = `${this.app.canvas?.width || 0} × ${this.app.canvas?.height || 0}`;
    if (toolEl) toolEl.textContent = this.app.tools?.getCurrentToolName() || 'move';
  }

  bindEvents() {
    this.app.events.on(Events.TOOL_SELECT, () => {
      this.updateToolbox();
      this.updateStatusBar();
    });
    this.app.events.on(Events.LAYER_ADD, () => this.updateLayersPanel());
    this.app.events.on(Events.LAYER_REMOVE, () => this.updateLayersPanel());
    this.app.events.on(Events.LAYER_SELECT, () => this.updateLayersPanel());
    this.app.events.on(Events.LAYER_REORDER, () => this.updateLayersPanel());
    this.app.events.on(Events.LAYER_VISIBILITY, () => this.updateLayersPanel());
    this.app.events.on(Events.HISTORY_PUSH, () => this.updateHistoryPanel());
    this.app.events.on(Events.HISTORY_UNDO, () => this.updateHistoryPanel());
    this.app.events.on(Events.HISTORY_REDO, () => this.updateHistoryPanel());
    this.app.events.on(Events.CANVAS_ZOOM, () => this.updateStatusBar());
    this.app.events.on(Events.COLOR_FOREGROUND, () => {
      this.updateColorPanel();
      this.updateQuickColors();
    });
    this.app.events.on(Events.COLOR_BACKGROUND, () => {
      this.updateColorPanel();
      this.updateQuickColors();
    });
  }

  togglePanels() {
    this.panelsVisible = !this.panelsVisible;
    this.container.querySelector('.swp-sidebar')?.classList.toggle('hidden', !this.panelsVisible);
    this.container.querySelector('.swp-toolbox')?.classList.toggle('hidden', !this.panelsVisible);
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

  getWorkspace() {
    return this.container.querySelector('.swp-workspace');
  }
}

export default UI;
