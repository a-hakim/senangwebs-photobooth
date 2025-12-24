/**
 * SenangWebs Studio - EventEmitter
 * Central event bus for module communication
 * @version 2.0.0
 */

export class EventEmitter {
  constructor() {
    this.events = new Map();
    this.onceEvents = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Subscribe to an event once
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  once(event, callback) {
    if (!this.onceEvents.has(event)) {
      this.onceEvents.set(event, new Set());
    }
    this.onceEvents.get(event).add(callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.events.has(event)) {
      this.events.get(event).delete(callback);
    }
    if (this.onceEvents.has(event)) {
      this.onceEvents.get(event).delete(callback);
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    // Call regular listeners
    if (this.events.has(event)) {
      this.events.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error);
        }
      });
    }

    // Call once listeners and remove them
    if (this.onceEvents.has(event)) {
      this.onceEvents.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in once listener for "${event}":`, error);
        }
      });
      this.onceEvents.delete(event);
    }

    // Also emit a wildcard event for debugging
    if (event !== '*') {
      this.emit('*', { event, data });
    }
  }

  /**
   * Remove all listeners for an event
   * @param {string} event - Event name (optional, removes all if not provided)
   */
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
      this.onceEvents.delete(event);
    } else {
      this.events.clear();
      this.onceEvents.clear();
    }
  }

  /**
   * Get listener count for an event
   * @param {string} event - Event name
   * @returns {number} Listener count
   */
  listenerCount(event) {
    const regular = this.events.has(event) ? this.events.get(event).size : 0;
    const once = this.onceEvents.has(event) ? this.onceEvents.get(event).size : 0;
    return regular + once;
  }
}

// Event name constants
export const Events = {
  // Document events
  DOCUMENT_NEW: 'document:new',
  DOCUMENT_OPEN: 'document:open',
  DOCUMENT_SAVE: 'document:save',
  DOCUMENT_EXPORT: 'document:export',
  DOCUMENT_CLOSE: 'document:close',
  DOCUMENT_RESIZE: 'document:resize',

  // Layer events
  LAYER_ADD: 'layer:add',
  LAYER_REMOVE: 'layer:remove',
  LAYER_SELECT: 'layer:select',
  LAYER_RENAME: 'layer:rename',
  LAYER_REORDER: 'layer:reorder',
  LAYER_VISIBILITY: 'layer:visibility',
  LAYER_OPACITY: 'layer:opacity',
  LAYER_BLEND_MODE: 'layer:blendMode',
  LAYER_LOCK: 'layer:lock',
  LAYER_MERGE: 'layer:merge',
  LAYER_DUPLICATE: 'layer:duplicate',
  LAYER_UPDATE: 'layer:update',

  // Tool events
  TOOL_SELECT: 'tool:select',
  TOOL_OPTIONS_CHANGE: 'tool:optionsChange',
  TOOL_START: 'tool:start',
  TOOL_MOVE: 'tool:move',
  TOOL_END: 'tool:end',

  // Canvas events
  CANVAS_DRAW: 'canvas:draw',
  CANVAS_CLEAR: 'canvas:clear',
  CANVAS_RENDER: 'canvas:render',
  CANVAS_ZOOM: 'canvas:zoom',
  CANVAS_PAN: 'canvas:pan',

  // History events
  HISTORY_PUSH: 'history:push',
  HISTORY_UNDO: 'history:undo',
  HISTORY_REDO: 'history:redo',
  HISTORY_CLEAR: 'history:clear',

  // Selection events
  SELECTION_CREATE: 'selection:create',
  SELECTION_MODIFY: 'selection:modify',
  SELECTION_CLEAR: 'selection:clear',
  SELECTION_INVERT: 'selection:invert',

  // Filter events
  FILTER_APPLY: 'filter:apply',
  FILTER_PREVIEW: 'filter:preview',
  FILTER_CANCEL: 'filter:cancel',

  // Color events
  COLOR_FOREGROUND: 'color:foreground',
  COLOR_BACKGROUND: 'color:background',
  COLOR_SWAP: 'color:swap',

  // UI events
  UI_PANEL_TOGGLE: 'ui:panelToggle',
  UI_DIALOG_OPEN: 'ui:dialogOpen',
  UI_DIALOG_CLOSE: 'ui:dialogClose',
  UI_MENU_ACTION: 'ui:menuAction',

  // General
  CHANGE: 'change',
  ERROR: 'error',
  READY: 'ready'
};

export default EventEmitter;
