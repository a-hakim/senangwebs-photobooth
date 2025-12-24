/**
 * SenangWebs Photobooth (SWP)
 * Professional browser-based image editor
 * @version 2.0.0
 */

import '../css/swp.css';
import { EventEmitter, Events } from './core/EventEmitter.js';
import { Canvas } from './core/Canvas.js';
import { History } from './core/History.js';
import { Keyboard } from './core/Keyboard.js';
import { LayerManager } from './layers/LayerManager.js';
import { ToolManager } from './tools/ToolManager.js';
import { Selection } from './selection/Selection.js';
import { FilterManager } from './filters/FilterManager.js';
import { ColorManager } from './ui/ColorManager.js';
import { UI } from './ui/UI.js';
import { FileManager } from './io/FileManager.js';
import { Clipboard } from './io/Clipboard.js';

class SWP {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!this.container) {
      throw new Error('SWP: Container element not found');
    }

    this.options = {
      width: options.width || 1920,
      height: options.height || 1080,
      theme: options.theme || 'dark',
      ...options
    };

    // Core systems
    this.events = new EventEmitter();
    this.canvas = new Canvas(this, { width: this.options.width, height: this.options.height });
    this.history = new History(this);
    this.keyboard = new Keyboard(this);
    
    // Managers
    this.layers = new LayerManager(this);
    this.tools = new ToolManager(this);
    this.selection = new Selection(this);
    this.filters = new FilterManager(this);
    this.colors = new ColorManager(this);
    this.file = new FileManager(this);
    this.clipboard = new Clipboard(this);
    
    // UI
    this.ui = new UI(this);

    this.init();
  }

  init() {
    // Initialize UI
    this.ui.init(this.container);
    
    // Initialize canvas in workspace
    const workspace = this.ui.getWorkspace();
    this.canvas.init(workspace);
    
    // Bind tool events to canvas
    this.tools.bindCanvasEvents(this.canvas.displayCanvas);
    
    // Create initial document
    this.file.newDocument({
      width: this.options.width,
      height: this.options.height
    });
    
    // Update UI
    this.ui.updateLayersPanel();
    this.ui.updateHistoryPanel();
    this.ui.updateToolbox();
    
    // Emit ready
    this.events.emit(Events.READY);
  }

  // Public API
  
  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.file.newDocument({ width: img.width, height: img.height });
        const layer = this.layers.getActiveLayer();
        if (layer) {
          layer.ctx.drawImage(img, 0, 0);
          this.canvas.render();
        }
        resolve();
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  newDocument(width, height, background = '#ffffff') {
    this.file.newDocument({ width, height, background });
  }

  getImageData(format = 'png', quality = 1) {
    return this.canvas.toDataURL(`image/${format}`, quality);
  }

  export(format = 'png', quality = 1) {
    return this.file.export(format, quality);
  }

  undo() {
    return this.history.undo();
  }

  redo() {
    return this.history.redo();
  }

  setTool(name) {
    this.tools.setTool(name);
  }

  applyFilter(name, options) {
    this.filters.applyFilter(name, options);
  }

  on(event, callback) {
    return this.events.on(event, callback);
  }

  off(event, callback) {
    this.events.off(event, callback);
  }

  cancelCurrentAction() {
    this.filters.cancelPreview();
    this.selection.clear();
  }

  confirmCurrentAction() {
    // Confirm crop, text, etc.
    const tool = this.tools.currentTool;
    if (tool?.name === 'crop' && tool.applyCrop) {
      tool.applyCrop();
    }
    if (tool?.name === 'text' && tool.commitText) {
      tool.commitText();
    }
  }

  destroy() {
    this.keyboard.destroy();
    this.selection.destroy();
    this.canvas.destroy();
    this.container.innerHTML = '';
  }
}

// Export
export { SWP, Events };
export default SWP;

// Global access
if (typeof window !== 'undefined') {
  window.SWP = SWP;
}
