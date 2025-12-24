/**
 * SenangWebs Studio - Gradient Tool
 * Draw gradients
 * @version 2.0.0
 */

import { BaseTool } from './BaseTool.js';

export class GradientTool extends BaseTool {
  constructor(app) {
    super(app);
    this.name = 'gradient';
    this.icon = 'gradient';
    this.cursor = 'crosshair';
    this.shortcut = 'g';
    
    this.options = {
      type: 'linear', // 'linear', 'radial', 'angle', 'diamond'
      opacity: 100,
      reverse: false,
      dither: false
    };
    this.defaultOptions = { ...this.options };
  }

  onPointerUp(e) {
    if (this.isDrawing && this.startPoint && this.currentPoint) {
      const layer = this.app.layers.getActiveLayer();
      if (layer && !layer.locked) {
        this.drawGradient(layer.ctx, this.startPoint, this.currentPoint);
        this.app.history.pushState('Gradient');
        this.app.canvas.scheduleRender();
      }
    }
    
    super.onPointerUp(e);
  }

  /**
   * Draw gradient on context
   * @param {CanvasRenderingContext2D} ctx - Target context
   * @param {Object} start - Start point
   * @param {Object} end - End point
   */
  drawGradient(ctx, start, end) {
    const foreground = this.app.colors?.foreground || '#000000';
    const background = this.app.colors?.background || '#ffffff';
    
    const color1 = this.options.reverse ? background : foreground;
    const color2 = this.options.reverse ? foreground : background;
    
    let gradient;
    
    switch (this.options.type) {
      case 'radial':
        const radius = this.distance(start, end);
        gradient = ctx.createRadialGradient(start.x, start.y, 0, start.x, start.y, radius);
        break;
        
      case 'angle':
        // Simulate angular gradient with multiple color stops
        gradient = ctx.createConicGradient(this.angle(start, end), start.x, start.y);
        break;
        
      default: // linear
        gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
    }
    
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    
    ctx.save();
    ctx.globalAlpha = this.options.opacity / 100;
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  }

  renderOverlay(ctx) {
    if (!this.isDrawing || !this.startPoint || !this.currentPoint) return;
    
    // Draw gradient preview line
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    ctx.moveTo(this.startPoint.x, this.startPoint.y);
    ctx.lineTo(this.currentPoint.x, this.currentPoint.y);
    ctx.stroke();
    
    // Start point
    ctx.fillStyle = this.app.colors?.foreground || '#000000';
    ctx.beginPath();
    ctx.arc(this.startPoint.x, this.startPoint.y, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // End point
    ctx.fillStyle = this.app.colors?.background || '#ffffff';
    ctx.beginPath();
    ctx.arc(this.currentPoint.x, this.currentPoint.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.stroke();
    
    ctx.restore();
  }

  getOptionsUI() {
    return {
      type: {
        type: 'select',
        label: 'Type',
        options: [
          { value: 'linear', label: 'Linear' },
          { value: 'radial', label: 'Radial' },
          { value: 'angle', label: 'Angle' }
        ],
        value: this.options.type
      },
      opacity: {
        type: 'slider',
        label: 'Opacity',
        min: 1,
        max: 100,
        value: this.options.opacity,
        unit: '%'
      },
      reverse: {
        type: 'checkbox',
        label: 'Reverse',
        value: this.options.reverse
      }
    };
  }
}

export default GradientTool;
