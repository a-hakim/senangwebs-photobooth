/**
 * SenangWebs Studio - Brush Tool
 * Freehand drawing with customizable brush
 * @version 2.0.0
 */

import { BaseTool } from './BaseTool.js';

export class BrushTool extends BaseTool {
  constructor(app) {
    super(app);
    this.name = 'brush';
    this.icon = 'brush';
    this.cursor = 'crosshair';
    this.shortcut = 'b';
    
    this.options = {
      size: 20,
      hardness: 100,
      opacity: 100,
      flow: 100,
      spacing: 25,
      smoothing: 50,
      pressureSize: true,
      pressureOpacity: false
    };
    this.defaultOptions = { ...this.options };
    
    // Drawing state
    this.points = [];
    this.brushCanvas = null;
    this.brushCtx = null;
  }

  onActivate() {
    this.createBrushTip();
    this.updateCursor();
  }

  /**
   * Create brush tip canvas
   */
  createBrushTip() {
    const size = Math.ceil(this.options.size);
    this.brushCanvas = document.createElement('canvas');
    this.brushCanvas.width = size;
    this.brushCanvas.height = size;
    this.brushCtx = this.brushCanvas.getContext('2d');
    this.updateBrushTip();
  }

  /**
   * Update brush tip based on options
   */
  updateBrushTip() {
    const size = this.options.size;
    const hardness = this.options.hardness / 100;
    
    this.brushCanvas.width = Math.ceil(size);
    this.brushCanvas.height = Math.ceil(size);
    
    const ctx = this.brushCtx;
    const center = size / 2;
    
    // Create gradient for soft brush
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    
    if (hardness >= 1) {
      // Hard brush
      gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
    } else {
      // Soft brush with hardness control
      const hardnessStop = hardness * 0.9;
      gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
      gradient.addColorStop(hardnessStop, 'rgba(0, 0, 0, 1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }
    
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(center, center, center, 0, Math.PI * 2);
    ctx.fill();
  }

  onPointerDown(e) {
    super.onPointerDown(e);
    
    const layer = this.app.layers.getActiveLayer();
    if (!layer || layer.locked) return;
    
    this.points = [{ ...this.startPoint, pressure: this.getPressure(e) }];
    
    // Draw initial point
    this.drawStroke(layer.ctx, [this.startPoint], this.getPressure(e));
    this.app.canvas.scheduleRender();
  }

  onPointerMove(e) {
    super.onPointerMove(e);
    
    if (!this.isDrawing) return;
    
    const layer = this.app.layers.getActiveLayer();
    if (!layer || layer.locked) return;
    
    const point = { ...this.currentPoint, pressure: this.getPressure(e) };
    this.points.push(point);
    
    // Draw line from last point to current
    this.drawStroke(layer.ctx, [this.lastPoint, this.currentPoint], this.getPressure(e));
    this.app.canvas.scheduleRender();
  }

  onPointerUp(e) {
    if (this.isDrawing && this.points.length > 0) {
      this.app.history.pushState('Brush Stroke');
    }
    
    this.points = [];
    super.onPointerUp(e);
  }

  /**
   * Draw stroke on context
   * @param {CanvasRenderingContext2D} ctx - Target context
   * @param {Array} points - Points to draw
   * @param {number} pressure - Current pressure
   */
  drawStroke(ctx, points, pressure = 0.5) {
    if (points.length < 1) return;
    
    const color = this.app.colors?.foreground || '#000000';
    const size = this.options.pressureSize 
      ? this.options.size * pressure 
      : this.options.size;
    const opacity = this.options.pressureOpacity 
      ? (this.options.opacity / 100) * pressure 
      : this.options.opacity / 100;
    const flow = this.options.flow / 100;
    const spacing = Math.max(1, (this.options.size * this.options.spacing) / 100);
    
    ctx.save();
    ctx.globalAlpha = opacity * flow;
    ctx.globalCompositeOperation = 'source-over';
    
    if (points.length === 1) {
      // Single point
      this.drawBrushDab(ctx, points[0].x, points[0].y, size, color);
    } else {
      // Interpolate between points
      for (let i = 1; i < points.length; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];
        const interpolated = this.interpolatePoints(p1, p2, spacing);
        
        interpolated.forEach(p => {
          this.drawBrushDab(ctx, p.x, p.y, size, color);
        });
      }
    }
    
    ctx.restore();
  }

  /**
   * Draw single brush dab
   * @param {CanvasRenderingContext2D} ctx - Target context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} size - Brush size
   * @param {string} color - Brush color
   */
  drawBrushDab(ctx, x, y, size, color) {
    const halfSize = size / 2;
    
    // Use brush tip canvas for soft brushes
    if (this.options.hardness < 100) {
      // Scale brush tip to current size
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      
      // Create colored version of brush tip
      const colorCanvas = document.createElement('canvas');
      colorCanvas.width = this.brushCanvas.width;
      colorCanvas.height = this.brushCanvas.height;
      const colorCtx = colorCanvas.getContext('2d');
      
      colorCtx.fillStyle = color;
      colorCtx.fillRect(0, 0, colorCanvas.width, colorCanvas.height);
      colorCtx.globalCompositeOperation = 'destination-in';
      colorCtx.drawImage(this.brushCanvas, 0, 0);
      
      ctx.drawImage(colorCanvas, x - halfSize, y - halfSize, size, size);
      ctx.restore();
    } else {
      // Hard brush - simple circle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, halfSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  onOptionChange(key, value) {
    if (key === 'size' || key === 'hardness') {
      this.updateBrushTip();
    }
  }

  updateCursor() {
    // Custom cursor showing brush size
    const size = Math.max(4, this.options.size * (this.app.canvas?.zoom || 100) / 100);
    
    if (size > 4) {
      const canvas = document.createElement('canvas');
      canvas.width = size + 2;
      canvas.height = size + 2;
      const ctx = canvas.getContext('2d');
      
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(size / 2 + 1, size / 2 + 1, size / 2, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.strokeStyle = '#ffffff';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(size / 2 + 1, size / 2 + 1, size / 2, 0, Math.PI * 2);
      ctx.stroke();
      
      const dataURL = canvas.toDataURL();
      this.cursor = `url(${dataURL}) ${size / 2 + 1} ${size / 2 + 1}, crosshair`;
    } else {
      this.cursor = 'crosshair';
    }
    
    if (this.isActive && this.app.canvas?.displayCanvas) {
      this.app.canvas.displayCanvas.style.cursor = this.cursor;
    }
  }

  renderOverlay(ctx) {
    // Optional: Show brush preview on hover
    if (this.currentPoint && !this.isDrawing) {
      const size = this.options.size;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(this.currentPoint.x, this.currentPoint.y, size / 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  getOptionsUI() {
    return {
      size: {
        type: 'slider',
        label: 'Size',
        min: 1,
        max: 500,
        value: this.options.size,
        unit: 'px'
      },
      hardness: {
        type: 'slider',
        label: 'Hardness',
        min: 0,
        max: 100,
        value: this.options.hardness,
        unit: '%'
      },
      opacity: {
        type: 'slider',
        label: 'Opacity',
        min: 1,
        max: 100,
        value: this.options.opacity,
        unit: '%'
      },
      flow: {
        type: 'slider',
        label: 'Flow',
        min: 1,
        max: 100,
        value: this.options.flow,
        unit: '%'
      },
      smoothing: {
        type: 'slider',
        label: 'Smoothing',
        min: 0,
        max: 100,
        value: this.options.smoothing,
        unit: '%'
      },
      pressureSize: {
        type: 'checkbox',
        label: 'Pressure affects Size',
        value: this.options.pressureSize
      },
      pressureOpacity: {
        type: 'checkbox',
        label: 'Pressure affects Opacity',
        value: this.options.pressureOpacity
      }
    };
  }
}

export default BrushTool;
