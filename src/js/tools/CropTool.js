/**
 * SenangWebs Studio - Crop Tool
 * Crop the canvas
 * @version 2.0.0
 */

import { BaseTool } from './BaseTool.js';

export class CropTool extends BaseTool {
  constructor(app) {
    super(app);
    this.name = 'crop';
    this.icon = 'crop';
    this.cursor = 'crosshair';
    this.shortcut = 'c';
    
    this.options = {
      aspectRatio: 'free', // 'free', '1:1', '4:3', '16:9', 'original'
      width: null,
      height: null
    };
    this.defaultOptions = { ...this.options };
    
    // Crop state
    this.cropBounds = null;
    this.activeHandle = null;
  }

  onActivate() {
    super.onActivate();
    // Initialize crop bounds to full canvas
    this.cropBounds = {
      x: 0,
      y: 0,
      width: this.app.canvas.width,
      height: this.app.canvas.height
    };
    this.app.canvas.scheduleRender();
  }

  onDeactivate() {
    this.cropBounds = null;
    super.onDeactivate();
  }

  onPointerDown(e) {
    super.onPointerDown(e);
    
    // Check if clicking on handle
    this.activeHandle = this.hitTestHandles(this.startPoint);
    
    if (!this.activeHandle) {
      // Start new crop selection
      this.cropBounds = {
        x: this.startPoint.x,
        y: this.startPoint.y,
        width: 0,
        height: 0
      };
    }
  }

  onPointerMove(e) {
    super.onPointerMove(e);
    
    if (!this.isDrawing) return;
    
    if (this.activeHandle) {
      this.resizeCropBounds(this.activeHandle, this.currentPoint);
    } else {
      // Update crop bounds
      this.updateCropBounds(this.startPoint, this.currentPoint);
    }
    
    this.app.canvas.scheduleRender();
  }

  onPointerUp(e) {
    this.activeHandle = null;
    super.onPointerUp(e);
  }

  /**
   * Update crop bounds from two points
   * @param {Object} start - Start point
   * @param {Object} end - End point
   */
  updateCropBounds(start, end) {
    let x = Math.min(start.x, end.x);
    let y = Math.min(start.y, end.y);
    let width = Math.abs(end.x - start.x);
    let height = Math.abs(end.y - start.y);
    
    // Apply aspect ratio constraint
    const ratio = this.getAspectRatio();
    if (ratio) {
      if (width / height > ratio) {
        width = height * ratio;
      } else {
        height = width / ratio;
      }
    }
    
    // Clamp to canvas bounds
    x = Math.max(0, Math.min(x, this.app.canvas.width - width));
    y = Math.max(0, Math.min(y, this.app.canvas.height - height));
    width = Math.min(width, this.app.canvas.width - x);
    height = Math.min(height, this.app.canvas.height - y);
    
    this.cropBounds = { x, y, width, height };
  }

  /**
   * Resize crop bounds using handle
   * @param {string} handle - Handle name
   * @param {Object} point - Current point
   */
  resizeCropBounds(handle, point) {
    const bounds = this.cropBounds;
    const ratio = this.getAspectRatio();
    
    switch (handle) {
      case 'nw':
        const newWidth = bounds.x + bounds.width - point.x;
        const newHeight = bounds.y + bounds.height - point.y;
        bounds.x = point.x;
        bounds.y = point.y;
        bounds.width = newWidth;
        bounds.height = newHeight;
        break;
      case 'ne':
        bounds.width = point.x - bounds.x;
        bounds.y = point.y;
        bounds.height = bounds.y + bounds.height - point.y;
        break;
      case 'se':
        bounds.width = point.x - bounds.x;
        bounds.height = point.y - bounds.y;
        break;
      case 'sw':
        bounds.x = point.x;
        bounds.width = bounds.x + bounds.width - point.x;
        bounds.height = point.y - bounds.y;
        break;
      case 'n':
        bounds.height = bounds.y + bounds.height - point.y;
        bounds.y = point.y;
        break;
      case 's':
        bounds.height = point.y - bounds.y;
        break;
      case 'e':
        bounds.width = point.x - bounds.x;
        break;
      case 'w':
        bounds.width = bounds.x + bounds.width - point.x;
        bounds.x = point.x;
        break;
    }
    
    // Ensure positive dimensions
    if (bounds.width < 10) bounds.width = 10;
    if (bounds.height < 10) bounds.height = 10;
  }

  /**
   * Get aspect ratio from options
   * @returns {number|null}
   */
  getAspectRatio() {
    switch (this.options.aspectRatio) {
      case '1:1': return 1;
      case '4:3': return 4 / 3;
      case '3:4': return 3 / 4;
      case '16:9': return 16 / 9;
      case '9:16': return 9 / 16;
      case 'original': return this.app.canvas.width / this.app.canvas.height;
      default: return null;
    }
  }

  /**
   * Set aspect ratio
   * @param {number|null} ratio - Aspect ratio (null for free)
   */
  setAspectRatio(ratio) {
    if (ratio === null) {
      this.options.aspectRatio = 'free';
    } else if (ratio === 1) {
      this.options.aspectRatio = '1:1';
    } else if (Math.abs(ratio - 4/3) < 0.01) {
      this.options.aspectRatio = '4:3';
    } else if (Math.abs(ratio - 16/9) < 0.01) {
      this.options.aspectRatio = '16:9';
    } else {
      // For custom ratios, store as 'custom' and use numeric value
      this.options.aspectRatio = 'custom';
      this.options.customRatio = ratio;
    }
    
    // Update crop bounds if already cropping
    if (this.cropBounds && this.cropBounds.width > 0) {
      const bounds = this.cropBounds;
      if (ratio) {
        // Adjust height to match ratio
        const newHeight = bounds.width / ratio;
        bounds.height = Math.min(newHeight, this.app.canvas.height - bounds.y);
      }
      this.app.canvas.scheduleRender();
    }
  }

  /**
   * Hit test crop handles
   * @param {Object} point - Point
   * @returns {string|null} Handle name
   */
  hitTestHandles(point) {
    if (!this.cropBounds) return null;
    
    const b = this.cropBounds;
    const handleSize = 10;
    
    const handles = {
      'nw': { x: b.x, y: b.y },
      'n': { x: b.x + b.width / 2, y: b.y },
      'ne': { x: b.x + b.width, y: b.y },
      'e': { x: b.x + b.width, y: b.y + b.height / 2 },
      'se': { x: b.x + b.width, y: b.y + b.height },
      's': { x: b.x + b.width / 2, y: b.y + b.height },
      'sw': { x: b.x, y: b.y + b.height },
      'w': { x: b.x, y: b.y + b.height / 2 }
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
   * Apply the crop
   */
  applyCrop() {
    if (!this.cropBounds || this.cropBounds.width < 1 || this.cropBounds.height < 1) return;
    
    const { x, y, width, height } = this.cropBounds;
    
    // Crop all layers
    this.app.layers.getLayers().forEach(layer => {
      if (!layer.canvas) return;
      
      // Create new canvas with cropped content
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');
      
      // Draw cropped portion
      tempCtx.drawImage(
        layer.canvas,
        x - layer.position.x, y - layer.position.y, width, height,
        0, 0, width, height
      );
      
      // Update layer
      layer.canvas.width = width;
      layer.canvas.height = height;
      layer.width = width;
      layer.height = height;
      layer.ctx.drawImage(tempCanvas, 0, 0);
      layer.position = { x: 0, y: 0 };
    });
    
    // Update canvas size
    this.app.canvas.resize(width, height);
    
    // Reset crop bounds
    this.cropBounds = {
      x: 0,
      y: 0,
      width,
      height
    };
    
    this.app.history.pushState('Crop');
    this.app.canvas.scheduleRender();
  }

  /**
   * Cancel crop
   */
  cancelCrop() {
    this.cropBounds = {
      x: 0,
      y: 0,
      width: this.app.canvas.width,
      height: this.app.canvas.height
    };
    this.app.canvas.scheduleRender();
  }

  renderOverlay(ctx) {
    if (!this.cropBounds) return;
    
    const { x, y, width, height } = this.cropBounds;
    const canvasWidth = this.app.canvas.width;
    const canvasHeight = this.app.canvas.height;
    
    // Draw darkened areas outside crop
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    
    // Top
    ctx.fillRect(0, 0, canvasWidth, y);
    // Bottom
    ctx.fillRect(0, y + height, canvasWidth, canvasHeight - y - height);
    // Left
    ctx.fillRect(0, y, x, height);
    // Right
    ctx.fillRect(x + width, y, canvasWidth - x - width, height);
    
    // Draw crop border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.strokeRect(x, y, width, height);
    
    // Draw rule of thirds grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    // Vertical lines
    ctx.moveTo(x + width / 3, y);
    ctx.lineTo(x + width / 3, y + height);
    ctx.moveTo(x + width * 2 / 3, y);
    ctx.lineTo(x + width * 2 / 3, y + height);
    // Horizontal lines
    ctx.moveTo(x, y + height / 3);
    ctx.lineTo(x + width, y + height / 3);
    ctx.moveTo(x, y + height * 2 / 3);
    ctx.lineTo(x + width, y + height * 2 / 3);
    ctx.stroke();
    
    // Draw handles
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    
    const handleSize = 8;
    const handles = [
      { x, y },
      { x: x + width / 2, y },
      { x: x + width, y },
      { x: x + width, y: y + height / 2 },
      { x: x + width, y: y + height },
      { x: x + width / 2, y: y + height },
      { x, y: y + height },
      { x, y: y + height / 2 }
    ];
    
    handles.forEach(pos => {
      ctx.fillRect(pos.x - handleSize / 2, pos.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(pos.x - handleSize / 2, pos.y - handleSize / 2, handleSize, handleSize);
    });
  }

  getOptionsUI() {
    return {
      aspectRatio: {
        type: 'select',
        label: 'Aspect Ratio',
        options: [
          { value: 'free', label: 'Free' },
          { value: '1:1', label: '1:1 (Square)' },
          { value: '4:3', label: '4:3' },
          { value: '3:4', label: '3:4' },
          { value: '16:9', label: '16:9' },
          { value: '9:16', label: '9:16' },
          { value: 'original', label: 'Original Ratio' }
        ],
        value: this.options.aspectRatio
      },
      apply: {
        type: 'button',
        label: 'Apply Crop',
        action: () => this.applyCrop()
      },
      cancel: {
        type: 'button',
        label: 'Cancel',
        action: () => this.cancelCrop()
      }
    };
  }
}

export default CropTool;
