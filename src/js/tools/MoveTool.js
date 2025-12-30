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
      showTransform: true,
      snapToEdges: true,
      snapThreshold: 4
    };
    this.defaultOptions = { ...this.options };
    
    // Transform state
    this.transforming = false;
    this.transformHandle = null;
    this.originalBounds = null;
    this.originalImageData = null; // Store original image for quality resize
    
    // Snap state
    this.activeSnaps = { x: null, y: null };
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
      // Store original image data for quality resize
      if (layer.canvas) {
        this.originalImageData = layer.ctx.getImageData(0, 0, layer.width, layer.height);
      }
    } else {
      // Auto-select layer at click position if enabled
      if (this.options.autoSelect) {
        this.selectLayerAtPoint(this.startPoint);
      }
    }
    
    // Reset snaps
    this.activeSnaps = { x: null, y: null };
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
      
      // Apply snapping
      if (this.options.snapToEdges) {
        const snap = this.calculateSnap(layer);
        if (snap.x !== null) {
          layer.position.x = snap.x;
        }
        if (snap.y !== null) {
          layer.position.y = snap.y;
        }
        this.activeSnaps = { x: snap.snapX, y: snap.snapY };
      } else {
        this.activeSnaps = { x: null, y: null };
      }
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
    this.originalImageData = null;
    this.activeSnaps = { x: null, y: null };
    
    super.onPointerUp(e);
    this.app.canvas.scheduleRender();
  }

  /**
   * Calculate snap positions for layer
   * @param {Layer} layer - Layer to snap
   * @returns {Object} Snap result with x, y positions and snap line positions
   */
  calculateSnap(layer) {
    const threshold = this.options.snapThreshold;
    const canvasWidth = this.app.canvas.width;
    const canvasHeight = this.app.canvas.height;
    
    const bounds = this.getLayerBounds(layer);
    const layerLeft = bounds.x;
    const layerRight = bounds.x + bounds.width;
    const layerTop = bounds.y;
    const layerBottom = bounds.y + bounds.height;
    const layerCenterX = bounds.x + bounds.width / 2;
    const layerCenterY = bounds.y + bounds.height / 2;
    
    const canvasCenterX = canvasWidth / 2;
    const canvasCenterY = canvasHeight / 2;
    
    let snapX = null;
    let snapY = null;
    let newX = null;
    let newY = null;
    
    // Horizontal snapping (X axis)
    // Left edge to canvas left
    if (Math.abs(layerLeft) < threshold) {
      newX = 0;
      snapX = 0;
    }
    // Right edge to canvas right
    else if (Math.abs(layerRight - canvasWidth) < threshold) {
      newX = canvasWidth - bounds.width;
      snapX = canvasWidth;
    }
    // Center to canvas center
    else if (Math.abs(layerCenterX - canvasCenterX) < threshold) {
      newX = canvasCenterX - bounds.width / 2;
      snapX = canvasCenterX;
    }
    
    // Vertical snapping (Y axis)
    // Top edge to canvas top
    if (Math.abs(layerTop) < threshold) {
      newY = 0;
      snapY = 0;
    }
    // Bottom edge to canvas bottom
    else if (Math.abs(layerBottom - canvasHeight) < threshold) {
      newY = canvasHeight - bounds.height;
      snapY = canvasHeight;
    }
    // Center to canvas center
    else if (Math.abs(layerCenterY - canvasCenterY) < threshold) {
      newY = canvasCenterY - bounds.height / 2;
      snapY = canvasCenterY;
    }
    
    return { x: newX, y: newY, snapX, snapY };
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
    if (!this.originalBounds || !this.originalImageData) return;
    
    const minSize = 10;
    
    // Calculate new bounds based on delta from start point
    const totalDx = this.currentPoint.x - this.startPoint.x;
    const totalDy = this.currentPoint.y - this.startPoint.y;
    
    let newX = this.originalBounds.x;
    let newY = this.originalBounds.y;
    let newWidth = this.originalBounds.width;
    let newHeight = this.originalBounds.height;
    
    switch (handle) {
      case 'nw':
        newX += totalDx;
        newY += totalDy;
        newWidth -= totalDx;
        newHeight -= totalDy;
        break;
      case 'n':
        newY += totalDy;
        newHeight -= totalDy;
        break;
      case 'ne':
        newY += totalDy;
        newWidth += totalDx;
        newHeight -= totalDy;
        break;
      case 'e':
        newWidth += totalDx;
        break;
      case 'se':
        newWidth += totalDx;
        newHeight += totalDy;
        break;
      case 's':
        newHeight += totalDy;
        break;
      case 'sw':
        newX += totalDx;
        newWidth -= totalDx;
        newHeight += totalDy;
        break;
      case 'w':
        newX += totalDx;
        newWidth -= totalDx;
        break;
    }
    
    // Enforce minimum size
    if (newWidth < minSize) {
      if (handle.includes('w')) {
        newX = this.originalBounds.x + this.originalBounds.width - minSize;
      }
      newWidth = minSize;
    }
    if (newHeight < minSize) {
      if (handle.includes('n')) {
        newY = this.originalBounds.y + this.originalBounds.height - minSize;
      }
      newHeight = minSize;
    }
    
    newWidth = Math.round(newWidth);
    newHeight = Math.round(newHeight);
    
    // Apply position change
    layer.position.x = newX;
    layer.position.y = newY;
    
    // Resize from original image to prevent quality loss
    if (newWidth !== layer.width || newHeight !== layer.height) {
      // Create temp canvas with original image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.originalImageData.width;
      tempCanvas.height = this.originalImageData.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.putImageData(this.originalImageData, 0, 0);
      
      // Resize layer canvas
      layer.canvas.width = newWidth;
      layer.canvas.height = newHeight;
      layer.width = newWidth;
      layer.height = newHeight;
      
      // Draw scaled original to layer
      layer.ctx.imageSmoothingEnabled = true;
      layer.ctx.imageSmoothingQuality = 'high';
      layer.ctx.drawImage(tempCanvas, 0, 0, newWidth, newHeight);
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

  /**
   * Check if layer has any visible content
   * @param {Layer} layer - Layer to check
   * @returns {boolean} True if layer is empty
   */
  isLayerEmpty(layer) {
    if (!layer || !layer.canvas || !layer.ctx) return true;
    
    // Sample pixels to check if layer has any content
    // For performance, we check a grid of points rather than every pixel
    const sampleSize = 20;
    const stepX = Math.max(1, Math.floor(layer.width / sampleSize));
    const stepY = Math.max(1, Math.floor(layer.height / sampleSize));
    
    for (let y = 0; y < layer.height; y += stepY) {
      for (let x = 0; x < layer.width; x += stepX) {
        const pixel = layer.ctx.getImageData(x, y, 1, 1).data;
        if (pixel[3] > 0) {
          return false; // Found non-transparent pixel
        }
      }
    }
    
    return true; // No visible content found
  }

  renderOverlay(ctx) {
    const layer = this.app.layers.getActiveLayer();
    if (!layer) return;
    
    const bounds = this.getLayerBounds(layer);
    const handleSize = 8;
    const canvasWidth = this.app.canvas.width;
    const canvasHeight = this.app.canvas.height;
    
    // Draw snap guides
    if (this.options.snapToEdges && this.isDrawing) {
      ctx.save();
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      
      // Vertical snap guide
      if (this.activeSnaps.x !== null) {
        ctx.beginPath();
        ctx.moveTo(this.activeSnaps.x, 0);
        ctx.lineTo(this.activeSnaps.x, canvasHeight);
        ctx.stroke();
      }
      
      // Horizontal snap guide
      if (this.activeSnaps.y !== null) {
        ctx.beginPath();
        ctx.moveTo(0, this.activeSnaps.y);
        ctx.lineTo(canvasWidth, this.activeSnaps.y);
        ctx.stroke();
      }
      
      ctx.restore();
    }
    
    // Draw transform controls
    if (!this.options.showTransform) return;
    
    // Don't show bounding box for empty layers
    if (this.isLayerEmpty(layer)) return;
    
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
      },
      snapToEdges: {
        type: 'checkbox',
        label: 'Snap to Edges',
        value: this.options.snapToEdges
      }
    };
  }
}

export default MoveTool;
