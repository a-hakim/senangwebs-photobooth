/**
 * SenangWebs Studio - Hand Tool
 * Pan the canvas viewport
 * @version 2.0.0
 */

import { BaseTool } from './BaseTool.js';

export class HandTool extends BaseTool {
  constructor(app) {
    super(app);
    this.name = 'hand';
    this.icon = 'hand';
    this.cursor = 'grab';
    this.shortcut = 'h';
    
    this.lastViewPoint = null;
  }

  onPointerDown(e) {
    this.isDrawing = true;
    this.lastViewPoint = this.getViewportPoint(e);
    this.cursor = 'grabbing';
    this.updateCursor();
  }

  onPointerMove(e) {
    if (!this.isDrawing) return;
    
    const currentViewPoint = this.getViewportPoint(e);
    const dx = currentViewPoint.x - this.lastViewPoint.x;
    const dy = currentViewPoint.y - this.lastViewPoint.y;
    
    this.app.canvas.pan(dx, dy);
    
    this.lastViewPoint = currentViewPoint;
  }

  onPointerUp(e) {
    this.isDrawing = false;
    this.cursor = 'grab';
    this.updateCursor();
    this.lastViewPoint = null;
  }

  getOptionsUI() {
    return {};
  }
}

export default HandTool;
