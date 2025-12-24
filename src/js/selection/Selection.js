/**
 * SenangWebs Studio - Selection System
 * @version 2.0.0
 */

import { Events } from '../core/EventEmitter.js';

export class Selection {
  constructor(app) {
    this.app = app;
    this.path = null;
    this.bounds = null;
    this.shape = 'rectangle';
    this.feather = 0;
    this.marchingAntsOffset = 0;
    this.animationId = null;
  }

  hasSelection() {
    return this.path !== null || this.bounds !== null;
  }

  setRect(x, y, width, height, shape = 'rectangle') {
    this.bounds = { x, y, width, height };
    this.shape = shape;
    this.path = null;
    this.startMarchingAnts();
    this.app.events.emit(Events.SELECTION_CREATE, { bounds: this.bounds, shape });
  }

  setPath(points) {
    this.path = points;
    this.bounds = this.calculatePathBounds(points);
    this.shape = 'freeform';
    this.startMarchingAnts();
    this.app.events.emit(Events.SELECTION_CREATE, { bounds: this.bounds, path: this.path });
  }

  calculatePathBounds(points) {
    if (!points || points.length === 0) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    points.forEach(p => {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    });
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  clear() {
    this.path = null;
    this.bounds = null;
    this.stopMarchingAnts();
    this.app.events.emit(Events.SELECTION_CLEAR);
    this.app.canvas.scheduleRender();
  }

  selectAll() {
    this.setRect(0, 0, this.app.canvas.width, this.app.canvas.height);
  }

  deselect() {
    this.clear();
  }

  invert() {
    // TODO: Implement selection inversion
    this.app.events.emit(Events.SELECTION_INVERT);
  }

  isPointInSelection(x, y) {
    if (!this.hasSelection()) return true;
    if (this.shape === 'ellipse' && this.bounds) {
      const cx = this.bounds.x + this.bounds.width / 2;
      const cy = this.bounds.y + this.bounds.height / 2;
      const rx = this.bounds.width / 2;
      const ry = this.bounds.height / 2;
      return Math.pow(x - cx, 2) / Math.pow(rx, 2) + Math.pow(y - cy, 2) / Math.pow(ry, 2) <= 1;
    }
    if (this.bounds) {
      return x >= this.bounds.x && x <= this.bounds.x + this.bounds.width &&
             y >= this.bounds.y && y <= this.bounds.y + this.bounds.height;
    }
    return true;
  }

  startMarchingAnts() {
    this.stopMarchingAnts();
    const animate = () => {
      this.marchingAntsOffset = (this.marchingAntsOffset + 0.5) % 10;
      this.app.canvas.scheduleRender();
      this.animationId = requestAnimationFrame(animate);
    };
    this.animationId = requestAnimationFrame(animate);
  }

  stopMarchingAnts() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  render(ctx) {
    if (!this.hasSelection()) return;
    
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.lineDashOffset = -this.marchingAntsOffset;
    
    if (this.shape === 'ellipse' && this.bounds) {
      ctx.beginPath();
      ctx.ellipse(this.bounds.x + this.bounds.width/2, this.bounds.y + this.bounds.height/2,
                  this.bounds.width/2, this.bounds.height/2, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.path) {
      ctx.beginPath();
      ctx.moveTo(this.path[0].x, this.path[0].y);
      this.path.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.stroke();
    } else if (this.bounds) {
      ctx.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
    }
    
    // White stroke for contrast
    ctx.strokeStyle = '#ffffff';
    ctx.lineDashOffset = -this.marchingAntsOffset + 5;
    if (this.shape === 'ellipse' && this.bounds) {
      ctx.beginPath();
      ctx.ellipse(this.bounds.x + this.bounds.width/2, this.bounds.y + this.bounds.height/2,
                  this.bounds.width/2, this.bounds.height/2, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.bounds) {
      ctx.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
    }
    
    ctx.restore();
  }

  clearSelection(layer) {
    if (!this.hasSelection() || !layer.ctx) return;
    const ctx = layer.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    
    if (this.shape === 'ellipse' && this.bounds) {
      ctx.beginPath();
      ctx.ellipse(this.bounds.x + this.bounds.width/2, this.bounds.y + this.bounds.height/2,
                  this.bounds.width/2, this.bounds.height/2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.bounds) {
      ctx.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
    }
    
    ctx.restore();
  }

  destroy() {
    this.stopMarchingAnts();
  }
}

export default Selection;
