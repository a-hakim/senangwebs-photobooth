/**
 * SenangWebs Studio - Eyedropper Tool
 * Pick color from canvas
 * @version 2.0.0
 */

import { BaseTool } from './BaseTool.js';
import { Events } from '../core/EventEmitter.js';

export class EyedropperTool extends BaseTool {
  constructor(app) {
    super(app);
    this.name = 'eyedropper';
    this.icon = 'eyedropper';
    this.cursor = 'crosshair';
    this.shortcut = 'i';
    
    this.options = {
      sampleSize: 'point', // 'point', '3x3', '5x5'
      sampleLayers: 'current' // 'current', 'all'
    };
    this.defaultOptions = { ...this.options };
    
    this.previewColor = null;
  }

  onPointerDown(e) {
    super.onPointerDown(e);
    this.pickColor(this.startPoint, !e.altKey);
  }

  onPointerMove(e) {
    super.onPointerMove(e);
    
    // Preview color on hover
    if (!this.isDrawing) {
      this.previewColor = this.getColorAt(this.currentPoint);
    } else {
      this.pickColor(this.currentPoint, !e.altKey);
    }
    
    this.app.canvas.scheduleRender();
  }

  /**
   * Pick color at point
   * @param {Object} point - Point
   * @param {boolean} foreground - Set as foreground (true) or background (false)
   */
  pickColor(point, foreground = true) {
    const color = this.getColorAt(point);
    
    if (color) {
      if (foreground) {
        this.app.colors.setForeground(color);
      } else {
        this.app.colors.setBackground(color);
      }
    }
  }

  /**
   * Get color at point
   * @param {Object} point - Point
   * @returns {string|null} Hex color
   */
  getColorAt(point) {
    const x = Math.floor(point.x);
    const y = Math.floor(point.y);
    
    if (x < 0 || x >= this.app.canvas.width || y < 0 || y >= this.app.canvas.height) {
      return null;
    }
    
    let ctx;
    
    if (this.options.sampleLayers === 'current') {
      const layer = this.app.layers.getActiveLayer();
      if (!layer?.ctx) return null;
      ctx = layer.ctx;
    } else {
      // Sample from composite
      ctx = this.app.canvas.workCtx;
    }
    
    const sampleSize = this.getSampleSize();
    const halfSize = Math.floor(sampleSize / 2);
    
    // Get average color in sample area
    let r = 0, g = 0, b = 0, count = 0;
    
    for (let sy = -halfSize; sy <= halfSize; sy++) {
      for (let sx = -halfSize; sx <= halfSize; sx++) {
        const px = x + sx;
        const py = y + sy;
        
        if (px >= 0 && px < this.app.canvas.width && py >= 0 && py < this.app.canvas.height) {
          const pixel = ctx.getImageData(px, py, 1, 1).data;
          r += pixel[0];
          g += pixel[1];
          b += pixel[2];
          count++;
        }
      }
    }
    
    if (count === 0) return null;
    
    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Get sample size from options
   * @returns {number}
   */
  getSampleSize() {
    switch (this.options.sampleSize) {
      case '3x3': return 3;
      case '5x5': return 5;
      default: return 1;
    }
  }

  renderOverlay(ctx) {
    if (!this.previewColor || !this.currentPoint) return;
    
    const x = this.currentPoint.x;
    const y = this.currentPoint.y;
    
    // Draw color preview
    ctx.save();
    
    // Magnifier circle
    const radius = 30;
    ctx.beginPath();
    ctx.arc(x, y - 50, radius, 0, Math.PI * 2);
    ctx.fillStyle = this.previewColor;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Color value
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.previewColor.toUpperCase(), x, y - 50 + 4);
    
    ctx.restore();
  }

  getOptionsUI() {
    return {
      sampleSize: {
        type: 'select',
        label: 'Sample Size',
        options: [
          { value: 'point', label: 'Point' },
          { value: '3x3', label: '3×3 Average' },
          { value: '5x5', label: '5×5 Average' }
        ],
        value: this.options.sampleSize
      },
      sampleLayers: {
        type: 'select',
        label: 'Sample',
        options: [
          { value: 'current', label: 'Current Layer' },
          { value: 'all', label: 'All Layers' }
        ],
        value: this.options.sampleLayers
      }
    };
  }
}

export default EyedropperTool;
