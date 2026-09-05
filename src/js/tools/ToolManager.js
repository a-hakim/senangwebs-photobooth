/**
 * SenangWebs Studio - Tool Manager
 * Manages tool selection and events
 * @version 2.2.0
 */

import { Events } from '../core/EventEmitter.js';
import { MoveTool } from './MoveTool.js';
import { BrushTool } from './BrushTool.js';
import { EraserTool } from './EraserTool.js';
import { ShapeTool } from './ShapeTool.js';
import { TextTool } from './TextTool.js';
import { CropTool } from './CropTool.js';
import { ZoomTool } from './ZoomTool.js';
import { HandTool } from './HandTool.js';
import { EyedropperTool } from './EyedropperTool.js';
import { GradientTool } from './GradientTool.js';
import { FillTool } from './FillTool.js';
import { MarqueeTool } from './MarqueeTool.js';

export class ToolManager {
  constructor(app) {
    this.app = app;
    this.tools = new Map();
    this.currentTool = null;
    this.previousTool = null;
    this.temporaryTool = null;

    // Multi-touch gesture state (pinch-zoom / two-finger pan)
    this._activePointers = new Map();
    this._gesturing = false;
    this._gestureStart = null;

    this.init();
  }

  /**
   * Initialize tools
   */
  init() {
    // Register all tools
    this.registerTool('move', new MoveTool(this.app));
    this.registerTool('marquee', new MarqueeTool(this.app));
    this.registerTool('brush', new BrushTool(this.app));
    this.registerTool('eraser', new EraserTool(this.app));
    this.registerTool('shape', new ShapeTool(this.app));
    this.registerTool('text', new TextTool(this.app));
    this.registerTool('crop', new CropTool(this.app));
    this.registerTool('zoom', new ZoomTool(this.app));
    this.registerTool('hand', new HandTool(this.app));
    this.registerTool('eyedropper', new EyedropperTool(this.app));
    this.registerTool('gradient', new GradientTool(this.app));
    this.registerTool('fill', new FillTool(this.app));

    // Set default tool
    this.setTool('move');
  }

  /**
   * Register a tool
   * @param {string} name - Tool name
   * @param {BaseTool} tool - Tool instance
   */
  registerTool(name, tool) {
    this.tools.set(name, tool);
  }

  /**
   * Get tool by name
   * @param {string} name - Tool name
   * @returns {BaseTool|null}
   */
  getTool(name) {
    return this.tools.get(name) || null;
  }

  /**
   * Set active tool
   * @param {string} name - Tool name
   */
  setTool(name) {
    const tool = this.getTool(name);
    if (!tool) {
      console.warn(`Tool "${name}" not found`);
      return;
    }

    // Deactivate current tool
    if (this.currentTool) {
      this.currentTool.deactivate();
      this.previousTool = this.currentTool;
    }

    // Activate new tool
    this.currentTool = tool;
    this.currentTool.activate();

    this.app.events.emit(Events.TOOL_SELECT, { tool: name });
  }

  /**
   * Activate temporary tool (e.g., hand tool when space is pressed)
   * @param {string} name - Tool name
   */
  activateTemporaryTool(name) {
    if (this.temporaryTool) return;

    const tool = this.getTool(name);
    if (!tool) return;

    this.temporaryTool = this.currentTool;
    this.currentTool.deactivate();
    this.currentTool = tool;
    this.currentTool.activate();
  }

  /**
   * Deactivate temporary tool
   */
  deactivateTemporaryTool() {
    if (!this.temporaryTool) return;

    this.currentTool.deactivate();
    this.currentTool = this.temporaryTool;
    this.currentTool.activate();
    this.temporaryTool = null;
  }

  /**
   * Get all tools
   * @returns {Map} Tools map
   */
  getAllTools() {
    return this.tools;
  }

  /**
   * Get current tool name
   * @returns {string|null}
   */
  getCurrentToolName() {
    for (const [name, tool] of this.tools) {
      if (tool === this.currentTool) return name;
    }
    return null;
  }

  /**
   * Switch to previous tool
   */
  switchToPreviousTool() {
    if (this.previousTool) {
      for (const [name, tool] of this.tools) {
        if (tool === this.previousTool) {
          this.setTool(name);
          return;
        }
      }
    }
  }

  /**
   * Increase brush size
   */
  increaseBrushSize() {
    if (this.currentTool?.options?.size !== undefined) {
      const size = this.currentTool.options.size;
      const newSize = Math.min(500, size + (size < 10 ? 1 : size < 100 ? 5 : 20));
      this.currentTool.setOption('size', newSize);
    }
  }

  /**
   * Decrease brush size
   */
  decreaseBrushSize() {
    if (this.currentTool?.options?.size !== undefined) {
      const size = this.currentTool.options.size;
      const newSize = Math.max(1, size - (size <= 10 ? 1 : size <= 100 ? 5 : 20));
      this.currentTool.setOption('size', newSize);
    }
  }

  /**
   * Increase brush hardness
   */
  increaseBrushHardness() {
    if (this.currentTool?.options?.hardness !== undefined) {
      const hardness = this.currentTool.options.hardness;
      this.currentTool.setOption('hardness', Math.min(100, hardness + 10));
    }
  }

  /**
   * Decrease brush hardness
   */
  decreaseBrushHardness() {
    if (this.currentTool?.options?.hardness !== undefined) {
      const hardness = this.currentTool.options.hardness;
      this.currentTool.setOption('hardness', Math.max(0, hardness - 10));
    }
  }

  /**
   * Bind canvas events
   * @param {HTMLCanvasElement} canvas - Display canvas
   */
  bindCanvasEvents(canvas) {
    this._canvas = canvas;
    this._boundPointerDown = this.handlePointerDown.bind(this);
    this._boundPointerMove = this.handlePointerMove.bind(this);
    this._boundPointerUp = this.handlePointerUp.bind(this);
    this._boundPointerLeave = this.handlePointerLeave.bind(this);
    this._boundContextMenu = e => e.preventDefault();

    canvas.addEventListener('pointerdown', this._boundPointerDown);
    canvas.addEventListener('pointermove', this._boundPointerMove);
    canvas.addEventListener('pointerup', this._boundPointerUp);
    canvas.addEventListener('pointerleave', this._boundPointerLeave);
    canvas.addEventListener('contextmenu', this._boundContextMenu);
  }

  /**
   * Handle pointer down
   * @param {PointerEvent} e - Pointer event
   */
  handlePointerDown(e) {
    // Track pointers for multi-touch gestures
    this._activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this._activePointers.size === 2 && !this._gesturing) {
      this._beginGesture();
      return;
    }
    if (this._gesturing) return;

    if (!this.currentTool) return;
    
    // Set pointer capture (non-fatal: synthetic/already-released pointers throw)
    try {
      e.target.setPointerCapture(e.pointerId);
    } catch (err) {
      // Ignore — tools still work without capture
    }
    
    this.currentTool.onPointerDown(e);
  }

  /**
   * Handle pointer move
   * @param {PointerEvent} e - Pointer event
   */
  handlePointerMove(e) {
    if (this._activePointers.has(e.pointerId)) {
      this._activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    if (this._gesturing) {
      this._updateGesture();
      return;
    }
    if (!this.currentTool) return;
    this.currentTool.onPointerMove(e);
  }

  /**
   * Handle pointer up
   * @param {PointerEvent} e - Pointer event
   */
  handlePointerUp(e) {
    this._activePointers.delete(e.pointerId);
    if (this._gesturing) {
      if (this._activePointers.size < 2) {
        this._endGesture();
      }
      return;
    }
    if (!this.currentTool) return;
    
    try {
      e.target.releasePointerCapture(e.pointerId);
    } catch (err) {
      // Pointer capture may already be released
    }
    
    this.currentTool.onPointerUp(e);
  }

  /**
   * Handle pointer leave
   * @param {PointerEvent} e - Pointer event
   */
  handlePointerLeave(e) {
    if (this._gesturing) {
      this._activePointers.delete(e.pointerId);
      if (this._activePointers.size < 2) {
        this._endGesture();
      }
      return;
    }
    if (!this.currentTool) return;
    this.currentTool.onPointerLeave(e);
  }

  /**
   * Begin two-finger gesture: end any active tool stroke, snapshot zoom/pan
   */
  _beginGesture() {
    this._gesturing = true;

    // End any in-progress tool stroke cleanly
    if (this.currentTool && !this.temporaryTool) {
      try {
        this.currentTool.onPointerUp({
          pointerId: [...this._activePointers.keys()][0],
          clientX: 0,
          clientY: 0,
          preventDefault: () => {},
          stopPropagation: () => {}
        });
      } catch (err) {
        // Ignore tool cleanup errors
      }
    }

    const [p1, p2] = [...this._activePointers.values()];
    const canvas = this.app.canvas;
    const rect = canvas.displayCanvas.getBoundingClientRect();
    this._gestureStart = {
      distance: Math.hypot(p2.x - p1.x, p2.y - p1.y),
      centerX: (p1.x + p2.x) / 2 - rect.left,
      centerY: (p1.y + p2.y) / 2 - rect.top,
      zoom: canvas.zoom,
      panX: canvas.panX,
      panY: canvas.panY
    };
  }

  /**
   * Update zoom/pan from current two-pointer state
   */
  _updateGesture() {
    if (!this._gesturing || !this._gestureStart || this._activePointers.size < 2) return;

    const [p1, p2] = [...this._activePointers.values()];
    const canvas = this.app.canvas;
    const rect = canvas.displayCanvas.getBoundingClientRect();

    const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const centerX = (p1.x + p2.x) / 2 - rect.left;
    const centerY = (p1.y + p2.y) / 2 - rect.top;

    const zoomScale = distance / (this._gestureStart.distance || 1);
    canvas.zoom = Math.max(canvas.minZoom, Math.min(canvas.maxZoom, this._gestureStart.zoom * zoomScale));

    canvas.panX = this._gestureStart.panX + (centerX - this._gestureStart.centerX);
    canvas.panY = this._gestureStart.panY + (centerY - this._gestureStart.centerY);

    canvas.render();
    this.app.events.emit(Events.CANVAS_ZOOM, { zoom: canvas.zoom });
  }

  /**
   * End gesture mode
   */
  _endGesture() {
    this._gesturing = false;
    this._gestureStart = null;
  }

  /**
   * Destroy tool manager
   */
  destroy() {
    if (this._canvas) {
      if (this._boundPointerDown) this._canvas.removeEventListener('pointerdown', this._boundPointerDown);
      if (this._boundPointerMove) this._canvas.removeEventListener('pointermove', this._boundPointerMove);
      if (this._boundPointerUp) this._canvas.removeEventListener('pointerup', this._boundPointerUp);
      if (this._boundPointerLeave) this._canvas.removeEventListener('pointerleave', this._boundPointerLeave);
      if (this._boundContextMenu) this._canvas.removeEventListener('contextmenu', this._boundContextMenu);
      this._canvas = null;
    }
    this.tools.forEach(tool => {
      if (tool.destroy) tool.destroy();
    });
    this.tools.clear();
    this.currentTool = null;
    this.previousTool = null;
    this._activePointers.clear();
    this._gesturing = false;
    this._gestureStart = null;
  }
}

export default ToolManager;
