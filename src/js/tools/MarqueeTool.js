/**
 * SenangWebs Studio - Marquee Selection Tool
 * @version 2.0.0
 */

import { BaseTool } from './BaseTool.js';

export class MarqueeTool extends BaseTool {
  constructor(app) {
    super(app);
    this.name = 'marquee';
    this.icon = 'square-dashed';
    this.cursor = 'crosshair';
    this.shortcut = 'm';
    
    this.options = {
      shape: 'rectangle',
      feather: 0,
      fixed: false,
      fixedWidth: 100,
      fixedHeight: 100
    };
    this.defaultOptions = { ...this.options };
    this.previewBounds = null;
  }

  onPointerDown(e) {
    super.onPointerDown(e);
    if (!e.shiftKey && !e.altKey) {
      this.app.selection?.clear();
    }
    this.previewBounds = null;
  }

  onPointerMove(e) {
    super.onPointerMove(e);
    if (!this.isDrawing) return;
    
    this.previewBounds = this.calculateBounds(this.startPoint, this.currentPoint, e.shiftKey);
    this.app.canvas.scheduleRender();
  }

  onPointerUp(e) {
    if (this.isDrawing && this.previewBounds) {
      const bounds = this.previewBounds;
      if (bounds.width > 1 && bounds.height > 1) {
        this.app.selection?.setRect(bounds.x, bounds.y, bounds.width, bounds.height, this.options.shape);
      }
    }
    this.previewBounds = null;
    super.onPointerUp(e);
    this.app.canvas.scheduleRender();
  }

  calculateBounds(start, end, constrain) {
    let x = Math.min(start.x, end.x);
    let y = Math.min(start.y, end.y);
    let width = Math.abs(end.x - start.x);
    let height = Math.abs(end.y - start.y);
    
    if (constrain) {
      const size = Math.max(width, height);
      width = height = size;
      if (end.x < start.x) x = start.x - size;
      if (end.y < start.y) y = start.y - size;
    }
    
    return { x, y, width, height };
  }

  renderOverlay(ctx) {
    const bounds = this.previewBounds;
    if (!bounds) return;
    
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    if (this.options.shape === 'ellipse') {
      ctx.beginPath();
      ctx.ellipse(bounds.x + bounds.width/2, bounds.y + bounds.height/2, 
                  bounds.width/2, bounds.height/2, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }
    ctx.restore();
  }

  getOptionsUI() {
    return {
      shape: {
        type: 'select', label: 'Shape',
        options: [{ value: 'rectangle', label: 'Rectangle' }, { value: 'ellipse', label: 'Ellipse' }],
        value: this.options.shape
      },
      feather: { type: 'slider', label: 'Feather', min: 0, max: 100, value: this.options.feather, unit: 'px' }
    };
  }
}

export default MarqueeTool;
