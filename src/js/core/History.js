/**
 * SenangWebs Studio - History Manager
 * Undo/redo system with state snapshots
 * @version 2.0.0
 */

import { Events } from './EventEmitter.js';

export class History {
  constructor(app, options = {}) {
    this.app = app;
    this.maxStates = options.maxStates || 50;
    this.states = [];
    this.currentIndex = -1;
    this.isPerformingAction = false;
  }

  /**
   * Initialize history with first state
   */
  init() {
    this.clear();
    this.pushState('Initial State');
  }

  /**
   * Push a new state to history
   * @param {string} actionName - Description of the action
   * @param {Object} state - State snapshot (optional, will capture current if not provided)
   */
  pushState(actionName, state = null) {
    if (this.isPerformingAction) return;

    // Remove any states after current index (for redo overwrite)
    if (this.currentIndex < this.states.length - 1) {
      this.states = this.states.slice(0, this.currentIndex + 1);
    }

    // Capture current state if not provided
    const snapshot = state || this.captureState();

    // Add new state
    this.states.push({
      name: actionName,
      timestamp: Date.now(),
      state: snapshot
    });

    // Limit history size
    if (this.states.length > this.maxStates) {
      this.states.shift();
    } else {
      this.currentIndex++;
    }

    this.app.events.emit(Events.HISTORY_PUSH, {
      actionName,
      index: this.currentIndex,
      total: this.states.length
    });
  }

  /**
   * Capture current application state
   * @returns {Object} State snapshot
   */
  captureState() {
    const layers = this.app.layers.getLayers().map(layer => ({
      id: layer.id,
      name: layer.name,
      type: layer.type,
      visible: layer.visible,
      locked: layer.locked,
      opacity: layer.opacity,
      blendMode: layer.blendMode,
      position: { ...layer.position },
      imageData: layer.canvas ? layer.canvas.toDataURL() : null
    }));

    return {
      layers,
      activeLayerId: this.app.layers.activeLayer?.id,
      canvasWidth: this.app.canvas.width,
      canvasHeight: this.app.canvas.height,
      zoom: this.app.canvas.zoom,
      panX: this.app.canvas.panX,
      panY: this.app.canvas.panY
    };
  }

  /**
   * Restore a state snapshot
   * @param {Object} snapshot - State to restore
   */
  async restoreState(snapshot) {
    this.isPerformingAction = true;

    try {
      // Clear existing layers
      this.app.layers.clear();

      // Restore canvas dimensions
      this.app.canvas.resize(snapshot.canvasWidth, snapshot.canvasHeight);
      this.app.canvas.zoom = snapshot.zoom;
      this.app.canvas.panX = snapshot.panX;
      this.app.canvas.panY = snapshot.panY;

      // Restore layers
      for (const layerData of snapshot.layers) {
        const layer = await this.app.layers.addLayer({
          id: layerData.id,
          name: layerData.name,
          type: layerData.type,
          visible: layerData.visible,
          locked: layerData.locked,
          opacity: layerData.opacity,
          blendMode: layerData.blendMode,
          position: layerData.position
        });

        // Restore image data
        if (layerData.imageData) {
          await layer.loadFromDataURL(layerData.imageData);
        }
      }

      // Restore active layer
      if (snapshot.activeLayerId) {
        this.app.layers.setActiveLayer(snapshot.activeLayerId);
      }

      // Re-render
      this.app.canvas.render();

    } finally {
      this.isPerformingAction = false;
    }
  }

  /**
   * Undo last action
   * @returns {boolean} Success
   */
  async undo() {
    if (!this.canUndo()) return false;

    this.currentIndex--;
    const state = this.states[this.currentIndex];

    await this.restoreState(state.state);

    this.app.events.emit(Events.HISTORY_UNDO, {
      actionName: state.name,
      index: this.currentIndex
    });

    return true;
  }

  /**
   * Redo last undone action
   * @returns {boolean} Success
   */
  async redo() {
    if (!this.canRedo()) return false;

    this.currentIndex++;
    const state = this.states[this.currentIndex];

    await this.restoreState(state.state);

    this.app.events.emit(Events.HISTORY_REDO, {
      actionName: state.name,
      index: this.currentIndex
    });

    return true;
  }

  /**
   * Check if undo is available
   * @returns {boolean}
   */
  canUndo() {
    return this.currentIndex > 0;
  }

  /**
   * Check if redo is available
   * @returns {boolean}
   */
  canRedo() {
    return this.currentIndex < this.states.length - 1;
  }

  /**
   * Go to specific history state
   * @param {number} index - State index
   */
  async goToState(index) {
    if (index < 0 || index >= this.states.length) return false;

    this.currentIndex = index;
    const state = this.states[this.currentIndex];

    await this.restoreState(state.state);

    return true;
  }

  /**
   * Get all history states
   * @returns {Array} History states
   */
  getStates() {
    return this.states.map((state, index) => ({
      index,
      name: state.name,
      timestamp: state.timestamp,
      isCurrent: index === this.currentIndex
    }));
  }

  /**
   * Get current state index
   * @returns {number}
   */
  getCurrentIndex() {
    return this.currentIndex;
  }

  /**
   * Clear all history
   */
  clear() {
    this.states = [];
    this.currentIndex = -1;
    this.app.events.emit(Events.HISTORY_CLEAR);
  }

  /**
   * Get history count
   * @returns {number}
   */
  get count() {
    return this.states.length;
  }
}

export default History;
