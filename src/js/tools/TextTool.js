/**
 * SenangWebs Photobooth - Text Tool
 * Add and edit text layers
 * @version 2.0.0
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
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  onActivate() {
    super.onActivate();
    document.addEventListener('keydown', this.handleKeyDown);
  }

  onDeactivate() {
    this.commitText();
    document.removeEventListener('keydown', this.handleKeyDown);
    super.onDeactivate();
  }

  handleKeyDown(e) {
    if (!this.editingLayer) return;
    
    // Don't process if modifier keys are pressed (let shortcuts work)
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const key = e.key;
    
    if (key === 'Backspace') {
      this.editingLayer.textContent = this.editingLayer.textContent.slice(0, -1);
    } else if (key === 'Enter') {
      this.editingLayer.textContent += '\n';
    } else if (key === 'Escape') {
      this.commitText();
      return;
    } else if (key.length === 1) {
      // Single character - add to text
      this.editingLayer.textContent += key;
    }
    
    this.app.canvas.scheduleRender();
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
