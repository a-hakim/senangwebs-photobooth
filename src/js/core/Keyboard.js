/**
 * SenangWebs Studio - Keyboard Manager
 * Keyboard shortcuts and hotkey management
 * @version 2.0.0
 */

export class Keyboard {
  constructor(app) {
    this.app = app;
    this.shortcuts = new Map();
    this.enabled = true;
    this.modifiers = {
      ctrl: false,
      shift: false,
      alt: false,
      meta: false
    };
    this.spacePressed = false;

    this.init();
  }

  /**
   * Initialize keyboard listeners
   */
  init() {
    this.registerDefaultShortcuts();

    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    window.addEventListener('blur', this.resetModifiers.bind(this));
  }

  /**
   * Register default Photoshop-like shortcuts
   */
  registerDefaultShortcuts() {
    // Tool shortcuts
    this.register('v', () => this.app.tools.setTool('move'));
    this.register('m', () => this.app.tools.setTool('marquee'));
    this.register('l', () => this.app.tools.setTool('lasso'));
    this.register('w', () => this.app.tools.setTool('magicWand'));
    this.register('b', () => this.app.tools.setTool('brush'));
    this.register('e', () => this.app.tools.setTool('eraser'));
    this.register('g', () => this.app.tools.setTool('gradient'));
    this.register('t', () => this.app.tools.setTool('text'));
    this.register('u', () => this.app.tools.setTool('shape'));
    this.register('i', () => this.app.tools.setTool('eyedropper'));
    this.register('z', () => this.app.tools.setTool('zoom'));
    this.register('h', () => this.app.tools.setTool('hand'));
    this.register('s', () => this.app.tools.setTool('cloneStamp'));
    this.register('c', () => this.app.tools.setTool('crop'));

    // File operations
    this.register('ctrl+n', () => this.app.file.newDocument());
    this.register('ctrl+o', () => this.app.file.open());
    this.register('ctrl+s', () => this.app.file.save());
    this.register('ctrl+shift+s', () => this.app.file.saveAs());
    this.register('ctrl+e', () => this.app.file.export());
    this.register('ctrl+shift+e', () => this.app.file.exportAs());

    // Edit operations
    this.register('ctrl+z', () => this.app.history.undo());
    this.register('ctrl+shift+z', () => this.app.history.redo());
    this.register('ctrl+y', () => this.app.history.redo());
    this.register('ctrl+a', () => this.app.selection.selectAll());
    this.register('ctrl+d', () => this.app.selection.deselect());
    this.register('ctrl+shift+i', () => this.app.selection.invert());
    this.register('ctrl+c', () => this.app.clipboard.copy());
    this.register('ctrl+v', () => this.app.clipboard.paste());
    this.register('ctrl+x', () => this.app.clipboard.cut());
    this.register('ctrl+t', () => this.app.tools.startTransform());
    this.register('delete', () => this.app.layers.deleteSelection());
    this.register('backspace', () => this.app.layers.deleteSelection());

    // View operations
    this.register('ctrl+0', () => this.app.canvas.fitToScreen());
    this.register('ctrl+1', () => this.app.canvas.setZoom(100));
    this.register('ctrl+plus', () => this.app.canvas.zoomIn());
    this.register('ctrl+minus', () => this.app.canvas.zoomOut());
    this.register('tab', () => this.app.ui.togglePanels());
    this.register('f', () => this.app.ui.toggleFullscreen());

    // Brush size
    this.register('[', () => this.app.tools.decreaseBrushSize());
    this.register(']', () => this.app.tools.increaseBrushSize());
    this.register('shift+[', () => this.app.tools.decreaseBrushHardness());
    this.register('shift+]', () => this.app.tools.increaseBrushHardness());

    // Layer operations
    this.register('ctrl+shift+n', () => this.app.layers.addLayer());
    this.register('ctrl+j', () => this.app.layers.duplicateLayer());
    this.register('ctrl+shift+e', () => this.app.layers.mergeVisible());
    this.register('ctrl+e', () => this.app.layers.mergeDown());

    // Color
    this.register('x', () => this.app.colors.swap());
    this.register('d', () => this.app.colors.reset());

    // Escape
    this.register('escape', () => this.app.cancelCurrentAction());
    this.register('enter', () => this.app.confirmCurrentAction());
  }

  /**
   * Register a keyboard shortcut
   * @param {string} shortcut - Shortcut string (e.g., 'ctrl+s', 'shift+a')
   * @param {Function} callback - Callback function
   * @param {Object} options - Options
   */
  register(shortcut, callback, options = {}) {
    const key = this.normalizeShortcut(shortcut);
    this.shortcuts.set(key, {
      callback,
      preventDefault: options.preventDefault !== false,
      allowInInput: options.allowInInput || false,
      description: options.description || ''
    });
  }

  /**
   * Unregister a keyboard shortcut
   * @param {string} shortcut - Shortcut string
   */
  unregister(shortcut) {
    const key = this.normalizeShortcut(shortcut);
    this.shortcuts.delete(key);
  }

  /**
   * Normalize shortcut string
   * @param {string} shortcut - Shortcut string
   * @returns {string} Normalized shortcut
   */
  normalizeShortcut(shortcut) {
    return shortcut
      .toLowerCase()
      .split('+')
      .sort((a, b) => {
        const order = ['ctrl', 'alt', 'shift', 'meta'];
        const aIndex = order.indexOf(a);
        const bIndex = order.indexOf(b);
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      })
      .join('+');
  }

  /**
   * Build shortcut string from event
   * @param {KeyboardEvent} e - Keyboard event
   * @returns {string} Shortcut string
   */
  buildShortcutFromEvent(e) {
    const parts = [];
    
    if (e.ctrlKey || e.metaKey) parts.push('ctrl');
    if (e.altKey) parts.push('alt');
    if (e.shiftKey) parts.push('shift');

    let key = e.key.toLowerCase();
    
    // Normalize special keys
    const keyMap = {
      ' ': 'space',
      'arrowup': 'up',
      'arrowdown': 'down',
      'arrowleft': 'left',
      'arrowright': 'right',
      '=': 'plus',
      '-': 'minus'
    };

    key = keyMap[key] || key;

    // Don't add modifier keys as the main key
    if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
      parts.push(key);
    }

    return this.normalizeShortcut(parts.join('+'));
  }

  /**
   * Handle keydown event
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyDown(e) {
    // Update modifier state
    this.modifiers.ctrl = e.ctrlKey || e.metaKey;
    this.modifiers.shift = e.shiftKey;
    this.modifiers.alt = e.altKey;
    this.modifiers.meta = e.metaKey;

    // Handle space for temporary hand tool
    if (e.code === 'Space' && !this.spacePressed) {
      // Don't activate hand tool if text tool is editing
      const currentTool = this.app.tools?.currentTool;
      if (currentTool?.name === 'text' && currentTool?.editingLayer) {
        return; // Allow space in text
      }
      this.spacePressed = true;
      this.app.tools.activateTemporaryTool('hand');
      e.preventDefault();
      return;
    }

    if (!this.enabled) return;

    // Check if text tool is actively editing - allow all typing
    const currentTool = this.app.tools?.currentTool;
    if (currentTool?.name === 'text' && currentTool?.editingLayer) {
      // Only process shortcuts with modifiers (Ctrl, Alt, Meta) during text editing
      if (!e.ctrlKey && !e.altKey && !e.metaKey) {
        // Allow normal typing, don't process tool shortcuts
        return;
      }
    }

    // Check if in input field
    const target = e.target;
    const isInputField = target.tagName === 'INPUT' || 
                         target.tagName === 'TEXTAREA' || 
                         target.contentEditable === 'true';

    // Build shortcut string
    const shortcut = this.buildShortcutFromEvent(e);

    // Look up shortcut
    const handler = this.shortcuts.get(shortcut);

    if (handler) {
      // Skip if in input field and not allowed
      if (isInputField && !handler.allowInInput) return;

      if (handler.preventDefault) {
        e.preventDefault();
      }

      try {
        handler.callback(e);
      } catch (error) {
        console.error(`Error executing shortcut "${shortcut}":`, error);
      }
    }
  }

  /**
   * Handle keyup event
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyUp(e) {
    // Update modifier state
    this.modifiers.ctrl = e.ctrlKey || e.metaKey;
    this.modifiers.shift = e.shiftKey;
    this.modifiers.alt = e.altKey;
    this.modifiers.meta = e.metaKey;

    // Handle space release
    if (e.code === 'Space') {
      this.spacePressed = false;
      this.app.tools.deactivateTemporaryTool();
    }
  }

  /**
   * Reset modifier states
   */
  resetModifiers() {
    this.modifiers.ctrl = false;
    this.modifiers.shift = false;
    this.modifiers.alt = false;
    this.modifiers.meta = false;
    this.spacePressed = false;
    this.app.tools.deactivateTemporaryTool();
  }

  /**
   * Enable/disable keyboard shortcuts
   * @param {boolean} enabled - Enable state
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Check if a modifier is pressed
   * @param {string} modifier - Modifier name
   * @returns {boolean}
   */
  isModifierPressed(modifier) {
    return this.modifiers[modifier] || false;
  }

  /**
   * Get all registered shortcuts
   * @returns {Array} Shortcuts with descriptions
   */
  getShortcuts() {
    const shortcuts = [];
    this.shortcuts.forEach((handler, key) => {
      shortcuts.push({
        shortcut: key,
        description: handler.description
      });
    });
    return shortcuts;
  }

  /**
   * Destroy keyboard manager
   */
  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.resetModifiers);
    this.shortcuts.clear();
  }
}

export default Keyboard;
