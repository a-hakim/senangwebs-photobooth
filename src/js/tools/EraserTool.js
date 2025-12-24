/**
 * SenangWebs Studio - Eraser Tool
 * Erase pixels from layer
 * @version 2.0.0
 */

import { BaseTool } from './BaseTool.js';

export class EraserTool extends BaseTool {
  constructor(app) {
    super(app);
    this.name = 'eraser';
    this.icon = 'eraser';
    this.cursor = 'crosshair';
    this.shortcut = 'e';
    
    this.options = {
      size: 20,
      hardness: 100,
      opacity: 100,
      mode: 'brush' // 'brush', 'block'
    };
    this.defaultOptions = { ...this.options };
    
    this.points = [];
  }

  onPointerDown(e) {
    super.onPointerDown(e);
    
    const layer = this.app.layers.getActiveLayer();
    if (!layer || layer.locked) return;
    
    this.points = [this.startPoint];
    this.eraseAt(layer.ctx, this.startPoint);
    this.app.canvas.scheduleRender();
  }

  onPointerMove(e) {
    super.onPointerMove(e);
    
    if (!this.isDrawing) return;
    
    const layer = this.app.layers.getActiveLayer();
    if (!layer || layer.locked) return;
    
    this.points.push(this.currentPoint);
    
    // Interpolate between points
    const spacing = Math.max(1, this.options.size / 4);
    const interpolated = this.interpolatePoints(this.lastPoint, this.currentPoint, spacing);
    
    interpolated.forEach(point => {
      this.eraseAt(layer.ctx, point);
    });
    
    this.app.canvas.scheduleRender();
  }

  onPointerUp(e) {
    if (this.isDrawing && this.points.length > 0) {
      this.app.history.pushState('Erase');
    }
    
    this.points = [];
    super.onPointerUp(e);
  }

  /**
   * Erase at position
   * @param {CanvasRenderingContext2D} ctx - Target context
   * @param {Object} point - Erase position
   */
  eraseAt(ctx, point) {
    const size = this.options.size;
    const halfSize = size / 2;
    const opacity = this.options.opacity / 100;
    
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = opacity;
    
    if (this.options.mode === 'block') {
      // Block eraser
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.fillRect(point.x - halfSize, point.y - halfSize, size, size);
    } else {
      // Brush eraser
      if (this.options.hardness < 100) {
        // Soft eraser
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, halfSize
        );
        const hardness = this.options.hardness / 100;
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(hardness, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, halfSize, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Hard eraser
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.beginPath();
        ctx.arc(point.x, point.y, halfSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.restore();
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
      mode: {
        type: 'select',
        label: 'Mode',
        options: [
          { value: 'brush', label: 'Brush' },
          { value: 'block', label: 'Block' }
        ],
        value: this.options.mode
      }
    };
  }
}

export default EraserTool;
