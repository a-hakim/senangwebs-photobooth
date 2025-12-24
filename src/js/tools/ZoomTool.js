/**
 * SenangWebs Studio - Zoom Tool
 * Zoom the canvas viewport
 * @version 2.0.0
 */

import { BaseTool } from './BaseTool.js';

export class ZoomTool extends BaseTool {
  constructor(app) {
    super(app);
    this.name = 'zoom';
    this.icon = 'zoom-in';
    this.cursor = 'zoom-in';
    this.shortcut = 'z';
    
    this.options = {
      zoomIn: true // false = zoom out
    };
    this.defaultOptions = { ...this.options };
  }

  onPointerDown(e) {
    super.onPointerDown(e);
    
    const viewPoint = this.getViewportPoint(e);
    
    if (this.options.zoomIn) {
      this.app.canvas.zoomIn();
    } else {
      this.app.canvas.zoomOut();
    }
  }

  onPointerMove(e) {
    super.onPointerMove(e);
    
    // Update cursor based on Alt key
    if (e.altKey || !this.options.zoomIn) {
      this.cursor = 'zoom-out';
    } else {
      this.cursor = 'zoom-in';
    }
    this.updateCursor();
  }

  getOptionsUI() {
    return {
      zoomIn: {
        type: 'checkbox',
        label: 'Zoom In',
        value: this.options.zoomIn
      },
      fitToScreen: {
        type: 'button',
        label: 'Fit to Screen',
        action: () => this.app.canvas.fitToScreen()
      },
      actualSize: {
        type: 'button',
        label: '100%',
        action: () => this.app.canvas.setZoom(100)
      }
    };
  }
}

export default ZoomTool;
