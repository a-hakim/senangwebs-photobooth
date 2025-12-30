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
      accentColor: options.accentColor || '#00FF99',
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
    
    // Apply theme class
    this.applyTheme(this.options.theme);
    
    // Apply accent color
    this.applyAccentColor(this.options.accentColor);
    
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

  applyTheme(theme) {
    // The container itself has .swp-app class added by UI.init()
    const app = this.container.classList.contains('swp-app') 
      ? this.container 
      : this.container.querySelector('.swp-app');
    if (app) {
      app.classList.remove('swp-theme-dark', 'swp-theme-light');
      app.classList.add(`swp-theme-${theme}`);
    }
    this.options.theme = theme;
  }

  applyAccentColor(color) {
    const app = this.container.classList.contains('swp-app') 
      ? this.container 
      : this.container.querySelector('.swp-app');
    if (app && color) {
      // Parse hex color to RGB for variations
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      // Create lighter hover color (add 20% brightness)
      const lighten = (val) => Math.min(255, Math.round(val + (255 - val) * 0.2));
      const hoverR = lighten(r);
      const hoverG = lighten(g);
      const hoverB = lighten(b);
      const hoverColor = `#${hoverR.toString(16).padStart(2, '0')}${hoverG.toString(16).padStart(2, '0')}${hoverB.toString(16).padStart(2, '0')}`;
      
      // Calculate relative luminance for contrast (WCAG formula)
      const toLinear = (val) => {
        const sRGB = val / 255;
        return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
      };
      const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
      
      // Choose contrasting text color (black for light backgrounds, white for dark)
      // Threshold 0.179 is the crossover point where black/white have equal contrast
      const contrastColor = luminance > 0.179 ? '#000000' : '#ffffff';
      
      // Apply CSS variables
      app.style.setProperty('--swp-accent', color);
      app.style.setProperty('--swp-accent-hover', hoverColor);
      app.style.setProperty('--swp-accent-dim', `rgba(${r}, ${g}, ${b}, 0.2)`);
      app.style.setProperty('--swp-accent-contrast', contrastColor);
    }
    this.options.accentColor = color;
  }

  setAccentColor(color) {
    this.applyAccentColor(color);
    this.events.emit(Events.CHANGE, { type: 'accentColor', color });
  }

  setTheme(theme) {
    if (theme === 'light' || theme === 'dark') {
      this.applyTheme(theme);
      this.events.emit(Events.CHANGE, { type: 'theme', theme });
    }
  }

  destroy() {
    this.keyboard.destroy();
    this.selection.destroy();
    this.canvas.destroy();
    this.container.innerHTML = '';
  }
}

// Static method to parse data attributes
SWP.parseDataAttributes = function(element) {
  const options = {};
  
  // Parse data-swp-* attributes
  const dataset = element.dataset;
  
  // Width
  if (dataset.swpWidth) {
    options.width = parseInt(dataset.swpWidth, 10);
  }
  
  // Height
  if (dataset.swpHeight) {
    options.height = parseInt(dataset.swpHeight, 10);
  }
  
  // Theme
  if (dataset.swpTheme) {
    options.theme = dataset.swpTheme;
  }
  
  // Any other data-swp-* attributes (convert kebab-case to camelCase)
  for (const key in dataset) {
    if (key.startsWith('swp') && key !== 'swp') {
      // Remove 'swp' prefix and convert first char to lowercase
      const optionKey = key.slice(3).charAt(0).toLowerCase() + key.slice(4);
      if (!(optionKey in options)) {
        // Try to parse as number or boolean
        let value = dataset[key];
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (!isNaN(value) && value !== '') value = parseFloat(value);
        options[optionKey] = value;
      }
    }
  }
  
  return options;
};

// Auto-initialize elements with data-swp attribute
SWP.autoInit = function() {
  const elements = document.querySelectorAll('[data-swp]');
  const instances = [];
  
  elements.forEach(element => {
    // Skip if already initialized
    if (element.swpInstance) return;
    
    const options = SWP.parseDataAttributes(element);
    const instance = new SWP(element, options);
    element.swpInstance = instance;
    instances.push(instance);
  });
  
  return instances;
};

// Store all auto-initialized instances
SWP.instances = [];

// Export
export { SWP, Events };
export default SWP;

// Global access
if (typeof window !== 'undefined') {
  window.SWP = SWP;
  
  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      SWP.instances = SWP.autoInit();
    });
  } else {
    // DOM already loaded
    SWP.instances = SWP.autoInit();
  }
}
