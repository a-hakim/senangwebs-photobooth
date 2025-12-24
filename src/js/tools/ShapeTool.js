/**
 * SenangWebs Studio - Shape Tool
 * Draw geometric shapes
 * @version 2.0.0
 */

import { BaseTool } from './BaseTool.js';

export class ShapeTool extends BaseTool {
  constructor(app) {
    super(app);
    this.name = 'shape';
    this.icon = 'square';
    this.cursor = 'crosshair';
    this.shortcut = 'u';
    
    this.options = {
      shape: 'rectangle', // rectangle, ellipse, line, polygon
      fillColor: '#000000',
      strokeColor: 'transparent',
      strokeWidth: 2,
      filled: true,
      stroked: false,
      createNewLayer: true,
      cornerRadius: 0
    };
    this.defaultOptions = { ...this.options };
    
    // Preview state
    this.previewShape = null;
  }

  onPointerDown(e) {
    super.onPointerDown(e);
    this.previewShape = null;
  }

  onPointerMove(e) {
    super.onPointerMove(e);
    
    if (!this.isDrawing) return;
    
    // Update preview
    this.previewShape = this.calculateShape(this.startPoint, this.currentPoint, e.shiftKey);
    this.app.canvas.scheduleRender();
  }

  onPointerUp(e) {
    if (this.isDrawing && this.startPoint) {
      const shape = this.calculateShape(this.startPoint, this.currentPoint, e.shiftKey);
      
      if (this.options.createNewLayer) {
        // Create shape layer
        const layer = this.app.layers.addLayer({
          name: `${this.options.shape} layer`,
          type: 'shape'
        });
        layer.shapeType = this.options.shape;
        layer.shapeData = shape;
        layer.fillColor = this.options.filled ? this.options.fillColor : 'transparent';
        layer.strokeColor = this.options.stroked ? this.options.strokeColor : 'transparent';
        layer.strokeWidth = this.options.strokeWidth;
        
        this.app.layers.setActiveLayer(layer.id);
      } else {
        // Draw directly on current layer
        const layer = this.app.layers.getActiveLayer();
        if (layer && !layer.locked) {
          this.drawShape(layer.ctx, shape);
        }
      }
      
      this.app.history.pushState(`Draw ${this.options.shape}`);
      this.app.canvas.scheduleRender();
    }
    
    this.previewShape = null;
    super.onPointerUp(e);
  }

  /**
   * Calculate shape bounds
   * @param {Object} start - Start point
   * @param {Object} end - End point
   * @param {boolean} constrain - Constrain proportions
   * @returns {Object} Shape data
   */
  calculateShape(start, end, constrain = false) {
    let x = Math.min(start.x, end.x);
    let y = Math.min(start.y, end.y);
    let width = Math.abs(end.x - start.x);
    let height = Math.abs(end.y - start.y);
    
    // Constrain to square/circle
    if (constrain) {
      const size = Math.max(width, height);
      width = size;
      height = size;
      
      if (end.x < start.x) x = start.x - size;
      if (end.y < start.y) y = start.y - size;
    }
    
    if (this.options.shape === 'line') {
      return {
        points: [
          { x: start.x, y: start.y },
          { x: constrain ? this.constrainLine(start, end).x : end.x, y: constrain ? this.constrainLine(start, end).y : end.y }
        ]
      };
    }
    
    return { x, y, width, height };
  }

  /**
   * Constrain line to 45-degree angles
   * @param {Object} start - Start point
   * @param {Object} end - End point
   * @returns {Object} Constrained end point
   */
  constrainLine(start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // Snap to 45-degree increments
    const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
    
    return {
      x: start.x + Math.cos(snappedAngle) * length,
      y: start.y + Math.sin(snappedAngle) * length
    };
  }

  /**
   * Draw shape on context
   * @param {CanvasRenderingContext2D} ctx - Target context
   * @param {Object} shape - Shape data
   */
  drawShape(ctx, shape) {
    ctx.save();
    
    ctx.fillStyle = this.options.filled ? this.options.fillColor : 'transparent';
    ctx.strokeStyle = this.options.stroked ? this.options.strokeColor : 'transparent';
    ctx.lineWidth = this.options.strokeWidth;
    
    switch (this.options.shape) {
      case 'rectangle':
        this.drawRectangle(ctx, shape);
        break;
      case 'ellipse':
        this.drawEllipse(ctx, shape);
        break;
      case 'line':
        this.drawLine(ctx, shape);
        break;
    }
    
    ctx.restore();
  }

  drawRectangle(ctx, shape) {
    const { x, y, width, height } = shape;
    const radius = this.options.cornerRadius;
    
    ctx.beginPath();
    
    if (radius > 0) {
      // Rounded rectangle
      const r = Math.min(radius, width / 2, height / 2);
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + width - r, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + r);
      ctx.lineTo(x + width, y + height - r);
      ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
      ctx.lineTo(x + r, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
    } else {
      ctx.rect(x, y, width, height);
    }
    
    ctx.closePath();
    
    if (this.options.filled) ctx.fill();
    if (this.options.stroked) ctx.stroke();
  }

  drawEllipse(ctx, shape) {
    const { x, y, width, height } = shape;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, width / 2, height / 2, 0, 0, Math.PI * 2);
    
    if (this.options.filled) ctx.fill();
    if (this.options.stroked) ctx.stroke();
  }

  drawLine(ctx, shape) {
    const { points } = shape;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.stroke();
  }

  renderOverlay(ctx) {
    if (!this.previewShape) return;
    
    ctx.save();
    ctx.fillStyle = this.options.filled ? this.options.fillColor : 'transparent';
    ctx.strokeStyle = this.options.stroked ? this.options.strokeColor : '#0066ff';
    ctx.lineWidth = this.options.strokeWidth || 1;
    ctx.setLineDash([5, 5]);
    ctx.globalAlpha = 0.7;
    
    this.drawShape(ctx, this.previewShape);
    
    ctx.restore();
  }

  getOptionsUI() {
    return {
      shape: {
        type: 'select',
        label: 'Shape',
        options: [
          { value: 'rectangle', label: 'Rectangle' },
          { value: 'ellipse', label: 'Ellipse' },
          { value: 'line', label: 'Line' }
        ],
        value: this.options.shape
      },
      filled: {
        type: 'checkbox',
        label: 'Fill',
        value: this.options.filled
      },
      fillColor: {
        type: 'color',
        label: 'Fill Color',
        value: this.options.fillColor
      },
      stroked: {
        type: 'checkbox',
        label: 'Stroke',
        value: this.options.stroked
      },
      strokeColor: {
        type: 'color',
        label: 'Stroke Color',
        value: this.options.strokeColor
      },
      strokeWidth: {
        type: 'slider',
        label: 'Stroke Width',
        min: 1,
        max: 50,
        value: this.options.strokeWidth,
        unit: 'px'
      },
      cornerRadius: {
        type: 'slider',
        label: 'Corner Radius',
        min: 0,
        max: 100,
        value: this.options.cornerRadius,
        unit: 'px'
      },
      createNewLayer: {
        type: 'checkbox',
        label: 'Create Shape Layer',
        value: this.options.createNewLayer
      }
    };
  }
}

export default ShapeTool;
