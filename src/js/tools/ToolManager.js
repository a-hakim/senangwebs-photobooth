/**
 * SenangWebs Studio - Tool Manager
 * Manages tool selection and events
 * @version 2.0.0
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
   * Start free transform on active layer
   */
  startTransform() {
    // TODO: Implement transform mode
    console.log('Transform mode');
  }

  /**
   * Bind canvas events
   * @param {HTMLCanvasElement} canvas - Display canvas
   */
  bindCanvasEvents(canvas) {
    canvas.addEventListener('pointerdown', this.handlePointerDown.bind(this));
    canvas.addEventListener('pointermove', this.handlePointerMove.bind(this));
    canvas.addEventListener('pointerup', this.handlePointerUp.bind(this));
    canvas.addEventListener('pointerleave', this.handlePointerLeave.bind(this));
    
    // Prevent context menu on right-click
    canvas.addEventListener('contextmenu', e => e.preventDefault());
  }

  /**
   * Handle pointer down
   * @param {PointerEvent} e - Pointer event
   */
  handlePointerDown(e) {
    if (!this.currentTool) return;
    
    // Set pointer capture
    e.target.setPointerCapture(e.pointerId);
    
    this.currentTool.onPointerDown(e);
  }

  /**
   * Handle pointer move
   * @param {PointerEvent} e - Pointer event
   */
  handlePointerMove(e) {
    if (!this.currentTool) return;
    this.currentTool.onPointerMove(e);
  }

  /**
   * Handle pointer up
   * @param {PointerEvent} e - Pointer event
   */
  handlePointerUp(e) {
    if (!this.currentTool) return;
    
    e.target.releasePointerCapture(e.pointerId);
    
    this.currentTool.onPointerUp(e);
  }

  /**
   * Handle pointer leave
   * @param {PointerEvent} e - Pointer event
   */
  handlePointerLeave(e) {
    if (!this.currentTool) return;
    this.currentTool.onPointerLeave(e);
  }

  /**
   * Destroy tool manager
   */
  destroy() {
    this.tools.forEach(tool => {
      if (tool.destroy) tool.destroy();
    });
    this.tools.clear();
    this.currentTool = null;
    this.previousTool = null;
  }
}

export default ToolManager;
