/**
 * SenangWebs Studio - Move Tool
 * Move and transform layers
 * @version 2.0.0
 */

import { BaseTool } from './BaseTool.js';

export class MoveTool extends BaseTool {
  constructor(app) {
    super(app);
    this.name = 'move';
    this.icon = 'move';
    this.cursor = 'move';
    this.shortcut = 'v';
    
    this.options = {
      autoSelect: false,
      showTransform: true
    };
    this.defaultOptions = { ...this.options };
    
    // Transform state
    this.transforming = false;
    this.transformHandle = null;
    this.originalBounds = null;
  }

  onPointerDown(e) {
    super.onPointerDown(e);
    
    const layer = this.app.layers.getActiveLayer();
    if (!layer || layer.locked) return;
    
    // Check if clicking on transform handle
    if (this.options.showTransform) {
      this.transformHandle = this.hitTestTransformHandles(this.startPoint);
    }
    
    if (this.transformHandle) {
      this.transforming = true;
      this.originalBounds = this.getLayerBounds(layer);
    } else {
      // Auto-select layer at click position if enabled
      if (this.options.autoSelect) {
        this.selectLayerAtPoint(this.startPoint);
      }
    }
  }

  onPointerMove(e) {
    super.onPointerMove(e);
    
    if (!this.isDrawing) return;
    
    const layer = this.app.layers.getActiveLayer();
    if (!layer || layer.locked) return;
    
    const dx = this.currentPoint.x - this.lastPoint.x;
    const dy = this.currentPoint.y - this.lastPoint.y;
    
    if (this.transforming && this.transformHandle) {
      this.applyTransform(layer, this.transformHandle, dx, dy);
    } else {
      // Move layer
      layer.position.x += dx;
      layer.position.y += dy;
    }
    
    this.app.canvas.scheduleRender();
  }

  onPointerUp(e) {
    if (this.isDrawing) {
      this.app.history.pushState('Move Layer');
    }
    
    this.transforming = false;
    this.transformHandle = null;
    this.originalBounds = null;
    
    super.onPointerUp(e);
  }

  /**
   * Get layer bounds
   * @param {Layer} layer - Layer
   * @returns {Object} Bounds
   */
  getLayerBounds(layer) {
    return {
      x: layer.position.x,
      y: layer.position.y,
      width: layer.width,
      height: layer.height
    };
  }

  /**
   * Hit test transform handles
   * @param {Object} point - Point to test
   * @returns {string|null} Handle name or null
   */
  hitTestTransformHandles(point) {
    const layer = this.app.layers.getActiveLayer();
    if (!layer) return null;
    
    const bounds = this.getLayerBounds(layer);
    const handleSize = 8 / (this.app.canvas.zoom / 100);
    
    const handles = {
      'nw': { x: bounds.x, y: bounds.y },
      'n': { x: bounds.x + bounds.width / 2, y: bounds.y },
      'ne': { x: bounds.x + bounds.width, y: bounds.y },
      'e': { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 },
      'se': { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
      's': { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
      'sw': { x: bounds.x, y: bounds.y + bounds.height },
      'w': { x: bounds.x, y: bounds.y + bounds.height / 2 }
    };
    
    for (const [name, pos] of Object.entries(handles)) {
      if (Math.abs(point.x - pos.x) < handleSize && 
          Math.abs(point.y - pos.y) < handleSize) {
        return name;
      }
    }
    
    return null;
  }

  /**
   * Apply transform based on handle
   * @param {Layer} layer - Layer
   * @param {string} handle - Handle name
   * @param {number} dx - Delta X
   * @param {number} dy - Delta Y
   */
  applyTransform(layer, handle, dx, dy) {
    // For now, just resize without maintaining aspect ratio
    // TODO: Add shift key for maintaining aspect ratio
    
    switch (handle) {
      case 'nw':
        layer.position.x += dx;
        layer.position.y += dy;
        // Would need to resize canvas
        break;
      case 'n':
        layer.position.y += dy;
        break;
      case 'ne':
        layer.position.y += dy;
        break;
      case 'e':
        // Resize width
        break;
      case 'se':
        // Resize both
        break;
      case 's':
        // Resize height
        break;
      case 'sw':
        layer.position.x += dx;
        break;
      case 'w':
        layer.position.x += dx;
        break;
    }
  }

  /**
   * Select layer at point
   * @param {Object} point - Point
   */
  selectLayerAtPoint(point) {
    // Find topmost non-transparent layer at point
    const layers = this.app.layers.getLayers().reverse();
    
    for (const layer of layers) {
      if (!layer.visible || !layer.canvas) continue;
      
      const x = Math.floor(point.x - layer.position.x);
      const y = Math.floor(point.y - layer.position.y);
      
      if (x >= 0 && x < layer.width && y >= 0 && y < layer.height) {
        const pixel = layer.ctx.getImageData(x, y, 1, 1).data;
        if (pixel[3] > 0) {
          this.app.layers.setActiveLayer(layer.id);
          return;
        }
      }
    }
  }

  renderOverlay(ctx) {
    const layer = this.app.layers.getActiveLayer();
    if (!layer || !this.options.showTransform) return;
    
    const bounds = this.getLayerBounds(layer);
    const handleSize = 8;
    
    // Draw bounding box
    ctx.strokeStyle = '#0066ff';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    
    // Draw handles
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0066ff';
    
    const handles = [
      { x: bounds.x, y: bounds.y },
      { x: bounds.x + bounds.width / 2, y: bounds.y },
      { x: bounds.x + bounds.width, y: bounds.y },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
      { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
      { x: bounds.x, y: bounds.y + bounds.height },
      { x: bounds.x, y: bounds.y + bounds.height / 2 }
    ];
    
    handles.forEach(pos => {
      ctx.fillRect(pos.x - handleSize / 2, pos.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(pos.x - handleSize / 2, pos.y - handleSize / 2, handleSize, handleSize);
    });
  }

  getOptionsUI() {
    return {
      autoSelect: {
        type: 'checkbox',
        label: 'Auto-Select Layer',
        value: this.options.autoSelect
      },
      showTransform: {
        type: 'checkbox',
        label: 'Show Transform Controls',
        value: this.options.showTransform
      }
    };
  }
}

export default MoveTool;
