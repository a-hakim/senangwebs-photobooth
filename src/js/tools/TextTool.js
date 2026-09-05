/**
 * SenangWebs Photobooth - Text Tool
 * Add and edit text layers
 * @version 2.2.0
 */

import { BaseTool } from './BaseTool.js';

export class TextTool extends BaseTool {
  constructor(app) {
    super(app);
    this.name = 'text';
    this.icon = 'font';
    this.cursor = 'text';
    this.shortcut = 't';
    
    this.options = {
      fontFamily: 'Arial',
      fontSize: 48,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      color: '#000000',
      lineHeight: 1.2
    };
    this.defaultOptions = { ...this.options };
    
    // Text editing state
    this.editingLayer = null;
    this._inputEl = null;
    this._onInput = this._handleInput.bind(this);
    this._onInputKeyDown = this._handleInputKeyDown.bind(this);
    this._onInputBlur = this._handleInputBlur.bind(this);
  }

  onActivate() {
    super.onActivate();
  }

  onDeactivate() {
    this.commitText();
    this._removeInput();
    super.onDeactivate();
  }

  /**
   * Create (once) and show the hidden textarea used for text entry.
   * Uses a real input so mobile virtual keyboards, IME and paste all work.
   */
  _ensureInput() {
    if (this._inputEl?.isConnected) return this._inputEl;
    const workspace = this.app.ui.getWorkspace();
    if (!workspace) return null;

    const input = document.createElement('textarea');
    input.className = 'swp-text-input';
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('aria-label', 'Text editor');
    input.rows = 1;
    input.addEventListener('input', this._onInput);
    input.addEventListener('keydown', this._onInputKeyDown);
    input.addEventListener('blur', this._onInputBlur);
    workspace.appendChild(input);
    this._inputEl = input;
    return input;
  }

  _removeInput() {
    if (this._inputEl) {
      this._inputEl.removeEventListener('input', this._onInput);
      this._inputEl.removeEventListener('keydown', this._onInputKeyDown);
      this._inputEl.removeEventListener('blur', this._onInputBlur);
      this._inputEl.remove();
      this._inputEl = null;
    }
  }

  _handleInput(e) {
    if (!this.editingLayer) return;
    this.editingLayer.textContent = e.target.value;
    this.app.canvas.scheduleRender();
  }

  _handleInputKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.commitText();
      this._removeInput();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      this.commitText();
      this._removeInput();
    }
    // Plain Enter / Backspace / characters: native textarea behavior
  }

  _handleInputBlur(e) {
    // Don't commit when focus moves into the options sheet (style tweaking)
    if (e.relatedTarget && e.relatedTarget.closest?.('.swp-submenu')) return;
    if (this.editingLayer) {
      this.commitText();
      this._removeInput();
    }
  }

  /**
   * Position the hidden input near the text being edited (helps mobile
   * scroll the virtual keyboard into view without covering the text).
   */
  _positionInput(layer) {
    if (!this._inputEl) return;
    const bounds = this.getTextBounds(layer);
    const canvas = this.app.canvas;
    const workspace = this.app.ui.getWorkspace();
    if (!workspace) return;
    const wsRect = workspace.getBoundingClientRect();

    const scale = (canvas.zoom || 100) / 100;
    const x = wsRect.left + (canvas.panX || 0) + bounds.x * scale;
    const y = wsRect.top + (canvas.panY || 0) + bounds.y * scale;
    this._inputEl.style.left = `${Math.max(0, Math.round(x - wsRect.left))}px`;
    this._inputEl.style.top = `${Math.max(0, Math.round(y - wsRect.top))}px`;
  }

  onPointerDown(e) {
    super.onPointerDown(e);
    
    // Check if clicking on existing text layer
    const existingLayer = this.findTextLayerAt(this.startPoint);
    
    if (existingLayer) {
      // Edit existing text
      this.startEditingLayer(existingLayer);
    } else {
      // Create new text layer
      this.commitText(); // Commit any existing edit first
      this.createTextLayer(this.startPoint);
    }
  }

  findTextLayerAt(point) {
    const layers = this.app.layers.getLayers().reverse();
    
    for (const layer of layers) {
      if (layer.type !== 'text' || !layer.visible) continue;
      
      // Simple bounds check
      const bounds = this.getTextBounds(layer);
      if (point.x >= bounds.x && point.x <= bounds.x + bounds.width &&
          point.y >= bounds.y && point.y <= bounds.y + bounds.height) {
        return layer;
      }
    }
    
    return null;
  }

  getTextBounds(layer) {
    const ctx = this.app.canvas.workCtx;
    if (!ctx) {
      return { x: layer.position.x, y: layer.position.y, width: 100, height: layer.textStyle.fontSize };
    }
    
    ctx.font = `${layer.textStyle.fontStyle} ${layer.textStyle.fontWeight} ${layer.textStyle.fontSize}px ${layer.textStyle.fontFamily}`;
    
    const lines = (layer.textContent || '').split('\n');
    let maxWidth = 100; // Minimum width
    
    lines.forEach(line => {
      const metrics = ctx.measureText(line || ' ');
      maxWidth = Math.max(maxWidth, metrics.width);
    });
    
    const height = Math.max(1, lines.length) * layer.textStyle.fontSize * layer.textStyle.lineHeight;
    
    return {
      x: layer.position.x,
      y: layer.position.y,
      width: maxWidth,
      height
    };
  }

  createTextLayer(position) {
    const layer = this.app.layers.addLayer({
      name: 'Text Layer',
      type: 'text'
    });
    
    layer.position = { x: position.x, y: position.y };
    layer.textContent = '';
    layer.textStyle = { 
      ...this.options,
      color: this.app.colors?.foreground || this.options.color
    };
    
    this.startEditingLayer(layer);
    this.app.layers.setActiveLayer(layer.id);
  }

  startEditingLayer(layer) {
    this.editingLayer = layer;

    const input = this._ensureInput();
    if (input) {
      input.value = layer.textContent || '';
      this._positionInput(layer);
      input.focus({ preventScroll: false });
    }

    this.app.canvas.scheduleRender();
  }

  commitText() {
    if (!this.editingLayer) return;
    
    // Remove empty text layer
    if (!this.editingLayer.textContent || !this.editingLayer.textContent.trim()) {
      this.app.layers.removeLayer(this.editingLayer.id);
    } else {
      this.app.history.pushState('Add Text');
    }
    
    this.editingLayer = null;
    this._removeInput();
    this.app.canvas.scheduleRender();
  }

  renderOverlay(ctx) {
    if (!this.editingLayer) return;
    
    const bounds = this.getTextBounds(this.editingLayer);
    
    // Draw text cursor/bounding box
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(bounds.x - 4, bounds.y - 4, bounds.width + 8, bounds.height + 8);
    
    // Draw blinking cursor
    const now = Date.now();
    if (Math.floor(now / 500) % 2 === 0) {
      ctx.setLineDash([]);
      ctx.strokeStyle = this.editingLayer.textStyle.color;
      ctx.lineWidth = 2;
      const cursorX = bounds.x + bounds.width + 2;
      const cursorY = bounds.y;
      const cursorHeight = this.editingLayer.textStyle.fontSize;
      ctx.beginPath();
      ctx.moveTo(cursorX, cursorY);
      ctx.lineTo(cursorX, cursorY + cursorHeight);
      ctx.stroke();
    }
  }

  getOptionsUI() {
    return {
      fontFamily: {
        type: 'select',
        label: 'Font',
        options: [
          { value: 'Arial', label: 'Arial' },
          { value: 'Helvetica', label: 'Helvetica' },
          { value: 'Times New Roman', label: 'Times New Roman' },
          { value: 'Georgia', label: 'Georgia' },
          { value: 'Verdana', label: 'Verdana' },
          { value: 'Courier New', label: 'Courier New' },
          { value: 'Impact', label: 'Impact' }
        ],
        value: this.options.fontFamily
      },
      fontSize: {
        type: 'slider',
        label: 'Size',
        min: 8,
        max: 200,
        value: this.options.fontSize,
        unit: 'px'
      },
      fontWeight: {
        type: 'select',
        label: 'Weight',
        options: [
          { value: 'normal', label: 'Regular' },
          { value: 'bold', label: 'Bold' }
        ],
        value: this.options.fontWeight
      },
      fontStyle: {
        type: 'select',
        label: 'Style',
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'italic', label: 'Italic' }
        ],
        value: this.options.fontStyle
      },
      textAlign: {
        type: 'select',
        label: 'Align',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ],
        value: this.options.textAlign
      },
      color: {
        type: 'color',
        label: 'Color',
        value: this.options.color
      }
    };
  }
}

export default TextTool;
