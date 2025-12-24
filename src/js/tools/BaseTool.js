/**
 * SenangWebs Studio - Base Tool
 * Abstract base class for all tools
 * @version 2.0.0
 */

import { Events } from '../core/EventEmitter.js';

export class BaseTool {
  constructor(app) {
    this.app = app;
    this.name = 'base';
    this.icon = 'cursor';
    this.cursor = 'default';
    this.shortcut = null;
    
    // Tool state
    this.isActive = false;
    this.isDrawing = false;
    this.startPoint = null;
    this.lastPoint = null;
    this.currentPoint = null;
    
    // Options (to be overridden by subclasses)
    this.options = {};
    this.defaultOptions = {};
  }

  /**
   * Activate tool
   */
  activate() {
    this.isActive = true;
    this.updateCursor();
    this.onActivate();
  }

  /**
   * Deactivate tool
   */
  deactivate() {
    this.isActive = false;
    this.isDrawing = false;
    this.onDeactivate();
  }

  /**
   * Called when tool is activated (override in subclass)
   */
  onActivate() {}

  /**
   * Called when tool is deactivated (override in subclass)
   */
  onDeactivate() {}

  /**
   * Update cursor
   */
  updateCursor() {
    if (this.app.canvas?.displayCanvas) {
      this.app.canvas.displayCanvas.style.cursor = this.cursor;
    }
  }

  /**
   * Handle pointer down
   * @param {PointerEvent} e - Pointer event
   */
  onPointerDown(e) {
    this.isDrawing = true;
    this.startPoint = this.getCanvasPoint(e);
    this.lastPoint = this.startPoint;
    this.currentPoint = this.startPoint;
    
    this.app.events.emit(Events.TOOL_START, {
      tool: this.name,
      point: this.startPoint
    });
  }

  /**
   * Handle pointer move
   * @param {PointerEvent} e - Pointer event
   */
  onPointerMove(e) {
    this.lastPoint = this.currentPoint;
    this.currentPoint = this.getCanvasPoint(e);
    
    if (this.isDrawing) {
      this.app.events.emit(Events.TOOL_MOVE, {
        tool: this.name,
        point: this.currentPoint,
        delta: {
          x: this.currentPoint.x - this.lastPoint.x,
          y: this.currentPoint.y - this.lastPoint.y
        }
      });
    }
  }

  /**
   * Handle pointer up
   * @param {PointerEvent} e - Pointer event
   */
  onPointerUp(e) {
    if (this.isDrawing) {
      this.currentPoint = this.getCanvasPoint(e);
      
      this.app.events.emit(Events.TOOL_END, {
        tool: this.name,
        startPoint: this.startPoint,
        endPoint: this.currentPoint
      });
    }
    
    this.isDrawing = false;
    this.startPoint = null;
    this.lastPoint = null;
  }

  /**
   * Handle pointer leave
   * @param {PointerEvent} e - Pointer event
   */
  onPointerLeave(e) {
    // Optional: handle when pointer leaves canvas
  }

  /**
   * Get point in canvas coordinates
   * @param {PointerEvent} e - Pointer event
   * @returns {Object} Point {x, y}
   */
  getCanvasPoint(e) {
    const rect = this.app.canvas.displayCanvas.getBoundingClientRect();
    const viewX = e.clientX - rect.left;
    const viewY = e.clientY - rect.top;
    return this.app.canvas.viewportToCanvas(viewX, viewY);
  }

  /**
   * Get viewport point
   * @param {PointerEvent} e - Pointer event
   * @returns {Object} Point {x, y}
   */
  getViewportPoint(e) {
    const rect = this.app.canvas.displayCanvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  /**
   * Get pressure from pointer event (for tablet support)
   * @param {PointerEvent} e - Pointer event
   * @returns {number} Pressure (0-1)
   */
  getPressure(e) {
    return e.pressure !== undefined ? e.pressure : 0.5;
  }

  /**
   * Render tool overlay (selection boxes, guides, etc.)
   * @param {CanvasRenderingContext2D} ctx - Overlay context
   */
  renderOverlay(ctx) {
    // Override in subclass
  }

  /**
   * Set tool option
   * @param {string} key - Option key
   * @param {*} value - Option value
   */
  setOption(key, value) {
    if (key in this.options) {
      this.options[key] = value;
      this.onOptionChange(key, value);
      this.app.events.emit(Events.TOOL_OPTIONS_CHANGE, {
        tool: this.name,
        option: key,
        value
      });
    }
  }

  /**
   * Get tool option
   * @param {string} key - Option key
   * @returns {*} Option value
   */
  getOption(key) {
    return this.options[key];
  }

  /**
   * Called when option changes (override in subclass)
   * @param {string} key - Option key
   * @param {*} value - New value
   */
  onOptionChange(key, value) {}

  /**
   * Reset options to defaults
   */
  resetOptions() {
    this.options = { ...this.defaultOptions };
  }

  /**
   * Get options for UI
   * @returns {Object} Options definition
   */
  getOptionsUI() {
    return {};
  }

  /**
   * Calculate distance between two points
   * @param {Object} p1 - Point 1
   * @param {Object} p2 - Point 2
   * @returns {number} Distance
   */
  distance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  /**
   * Calculate angle between two points
   * @param {Object} p1 - Point 1
   * @param {Object} p2 - Point 2
   * @returns {number} Angle in radians
   */
  angle(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  /**
   * Interpolate points between two positions
   * @param {Object} p1 - Start point
   * @param {Object} p2 - End point
   * @param {number} spacing - Spacing between points
   * @returns {Object[]} Array of interpolated points
   */
  interpolatePoints(p1, p2, spacing) {
    const points = [];
    const dist = this.distance(p1, p2);
    const steps = Math.ceil(dist / spacing);
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      points.push({
        x: p1.x + (p2.x - p1.x) * t,
        y: p1.y + (p2.y - p1.y) * t
      });
    }
    
    return points;
  }
}

export default BaseTool;
