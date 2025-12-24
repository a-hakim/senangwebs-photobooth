/**
 * SenangWebs Studio - Layer Manager
 * Managing multiple layers
 * @version 2.0.0
 */

import { Events } from '../core/EventEmitter.js';
import { Layer } from './Layer.js';

export class LayerManager {
  constructor(app) {
    this.app = app;
    this.layers = [];
    this.activeLayer = null;
  }

  /**
   * Initialize with default background layer
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  init(width, height) {
    this.clear();
    
    // Create background layer
    const bgLayer = this.addLayer({
      name: 'Background',
      type: 'raster'
    });
    
    bgLayer.initCanvas(width, height);
    bgLayer.fill('#ffffff');
    
    this.setActiveLayer(bgLayer.id);
  }

  /**
   * Add a new layer
   * @param {Object} options - Layer options
   * @returns {Layer}
   */
  addLayer(options = {}) {
    const layer = new Layer(options);
    layer.app = this.app;
    
    // Initialize canvas if dimensions available
    if (!layer.canvas && this.app.canvas) {
      layer.initCanvas(this.app.canvas.width, this.app.canvas.height);
    }
    
    // Insert at top (or at specified index)
    const insertIndex = options.index !== undefined ? options.index : this.layers.length;
    this.layers.splice(insertIndex, 0, layer);
    
    // Set as active if no active layer
    if (!this.activeLayer) {
      this.activeLayer = layer;
    }
    
    this.app.events.emit(Events.LAYER_ADD, { layer, index: insertIndex });
    
    return layer;
  }

  /**
   * Remove a layer
   * @param {string} layerId - Layer ID
   * @returns {boolean}
   */
  removeLayer(layerId) {
    const index = this.layers.findIndex(l => l.id === layerId);
    if (index === -1) return false;
    
    // Don't remove the last layer
    if (this.layers.length === 1) {
      console.warn('Cannot remove the last layer');
      return false;
    }
    
    const removed = this.layers.splice(index, 1)[0];
    
    // Update active layer if needed
    if (this.activeLayer?.id === layerId) {
      this.activeLayer = this.layers[Math.min(index, this.layers.length - 1)];
    }
    
    this.app.events.emit(Events.LAYER_REMOVE, { layer: removed, index });
    this.app.canvas.scheduleRender();
    
    return true;
  }

  /**
   * Get layer by ID
   * @param {string} layerId - Layer ID
   * @returns {Layer|null}
   */
  getLayer(layerId) {
    return this.layers.find(l => l.id === layerId) || null;
  }

  /**
   * Get all layers
   * @returns {Layer[]}
   */
  getLayers() {
    return [...this.layers];
  }

  /**
   * Get visible layers
   * @returns {Layer[]}
   */
  getVisibleLayers() {
    return this.layers.filter(l => l.visible);
  }

  /**
   * Set active layer
   * @param {string} layerId - Layer ID
   */
  setActiveLayer(layerId) {
    const layer = this.getLayer(layerId);
    if (layer) {
      this.activeLayer = layer;
      this.app.events.emit(Events.LAYER_SELECT, { layer });
    }
  }

  /**
   * Get active layer
   * @returns {Layer|null}
   */
  getActiveLayer() {
    return this.activeLayer;
  }

  /**
   * Move layer to new position
   * @param {string} layerId - Layer ID
   * @param {number} newIndex - New index
   */
  moveLayer(layerId, newIndex) {
    const currentIndex = this.layers.findIndex(l => l.id === layerId);
    if (currentIndex === -1) return;
    
    const [layer] = this.layers.splice(currentIndex, 1);
    this.layers.splice(newIndex, 0, layer);
    
    this.app.events.emit(Events.LAYER_REORDER, { layer, oldIndex: currentIndex, newIndex });
    this.app.canvas.scheduleRender();
  }

  /**
   * Move layer up
   * @param {string} layerId - Layer ID
   */
  moveLayerUp(layerId) {
    const index = this.layers.findIndex(l => l.id === layerId);
    if (index < this.layers.length - 1) {
      this.moveLayer(layerId, index + 1);
    }
  }

  /**
   * Move layer down
   * @param {string} layerId - Layer ID
   */
  moveLayerDown(layerId) {
    const index = this.layers.findIndex(l => l.id === layerId);
    if (index > 0) {
      this.moveLayer(layerId, index - 1);
    }
  }

  /**
   * Rename layer
   * @param {string} layerId - Layer ID
   * @param {string} name - New name
   */
  renameLayer(layerId, name) {
    const layer = this.getLayer(layerId);
    if (layer) {
      layer.name = name;
      this.app.events.emit(Events.LAYER_RENAME, { layer, name });
    }
  }

  /**
   * Set layer visibility
   * @param {string} layerId - Layer ID
   * @param {boolean} visible - Visibility
   */
  setLayerVisibility(layerId, visible) {
    const layer = this.getLayer(layerId);
    if (layer) {
      layer.visible = visible;
      this.app.events.emit(Events.LAYER_VISIBILITY, { layer, visible });
      this.app.canvas.scheduleRender();
    }
  }

  /**
   * Set layer opacity
   * @param {string} layerId - Layer ID
   * @param {number} opacity - Opacity (0-100)
   */
  setLayerOpacity(layerId, opacity) {
    const layer = this.getLayer(layerId);
    if (layer) {
      layer.opacity = Math.max(0, Math.min(100, opacity));
      this.app.events.emit(Events.LAYER_OPACITY, { layer, opacity: layer.opacity });
      this.app.canvas.scheduleRender();
    }
  }

  /**
   * Set layer blend mode
   * @param {string} layerId - Layer ID
   * @param {string} blendMode - Blend mode
   */
  setLayerBlendMode(layerId, blendMode) {
    const layer = this.getLayer(layerId);
    if (layer) {
      layer.blendMode = blendMode;
      this.app.events.emit(Events.LAYER_BLEND_MODE, { layer, blendMode });
      this.app.canvas.scheduleRender();
    }
  }

  /**
   * Lock/unlock layer
   * @param {string} layerId - Layer ID
   * @param {boolean} locked - Lock state
   */
  setLayerLocked(layerId, locked) {
    const layer = this.getLayer(layerId);
    if (layer) {
      layer.locked = locked;
      this.app.events.emit(Events.LAYER_LOCK, { layer, locked });
    }
  }

  /**
   * Duplicate layer
   * @param {string} layerId - Layer ID
   * @returns {Layer|null}
   */
  duplicateLayer(layerId) {
    const layer = this.getLayer(layerId);
    if (!layer) return null;
    
    const cloned = layer.clone();
    cloned.app = this.app;
    
    const index = this.layers.findIndex(l => l.id === layerId);
    this.layers.splice(index + 1, 0, cloned);
    
    this.app.events.emit(Events.LAYER_DUPLICATE, { original: layer, duplicate: cloned });
    this.app.canvas.scheduleRender();
    
    return cloned;
  }

  /**
   * Merge layer with layer below
   * @param {string} layerId - Layer ID
   */
  mergeDown(layerId) {
    const index = this.layers.findIndex(l => l.id === layerId);
    if (index <= 0) return; // Can't merge bottom layer
    
    const topLayer = this.layers[index];
    const bottomLayer = this.layers[index - 1];
    
    if (topLayer.locked || bottomLayer.locked) {
      console.warn('Cannot merge locked layers');
      return;
    }
    
    // Draw top layer onto bottom layer
    bottomLayer.ctx.save();
    bottomLayer.ctx.globalAlpha = topLayer.opacity / 100;
    bottomLayer.ctx.globalCompositeOperation = topLayer.getCompositeOperation();
    bottomLayer.ctx.translate(topLayer.position.x, topLayer.position.y);
    bottomLayer.ctx.drawImage(topLayer.canvas, 0, 0);
    bottomLayer.ctx.restore();
    
    // Remove top layer
    this.layers.splice(index, 1);
    
    if (this.activeLayer?.id === layerId) {
      this.activeLayer = bottomLayer;
    }
    
    this.app.events.emit(Events.LAYER_MERGE, { merged: bottomLayer, removed: topLayer });
    this.app.canvas.scheduleRender();
  }

  /**
   * Merge all visible layers
   * @returns {Layer}
   */
  mergeVisible() {
    const visibleLayers = this.getVisibleLayers();
    if (visibleLayers.length === 0) return null;
    
    // Create new layer for merged result
    const mergedLayer = new Layer({
      name: 'Merged',
      type: 'raster'
    });
    mergedLayer.app = this.app;
    mergedLayer.initCanvas(this.app.canvas.width, this.app.canvas.height);
    
    // Composite visible layers
    visibleLayers.forEach(layer => {
      mergedLayer.ctx.save();
      mergedLayer.ctx.globalAlpha = layer.opacity / 100;
      mergedLayer.ctx.globalCompositeOperation = layer.getCompositeOperation();
      mergedLayer.ctx.translate(layer.position.x, layer.position.y);
      if (layer.canvas) {
        mergedLayer.ctx.drawImage(layer.canvas, 0, 0);
      }
      mergedLayer.ctx.restore();
    });
    
    // Remove old visible layers and add merged
    this.layers = this.layers.filter(l => !l.visible);
    this.layers.push(mergedLayer);
    this.activeLayer = mergedLayer;
    
    this.app.canvas.scheduleRender();
    
    return mergedLayer;
  }

  /**
   * Flatten all layers into one
   * @returns {Layer}
   */
  flatten() {
    const flatLayer = new Layer({
      name: 'Background',
      type: 'raster'
    });
    flatLayer.app = this.app;
    flatLayer.initCanvas(this.app.canvas.width, this.app.canvas.height);
    
    // Fill with white background
    flatLayer.fill('#ffffff');
    
    // Composite all layers
    this.layers.forEach(layer => {
      if (!layer.visible) return;
      
      flatLayer.ctx.save();
      flatLayer.ctx.globalAlpha = layer.opacity / 100;
      flatLayer.ctx.globalCompositeOperation = layer.getCompositeOperation();
      flatLayer.ctx.translate(layer.position.x, layer.position.y);
      if (layer.canvas) {
        flatLayer.ctx.drawImage(layer.canvas, 0, 0);
      }
      flatLayer.ctx.restore();
    });
    
    this.layers = [flatLayer];
    this.activeLayer = flatLayer;
    
    this.app.canvas.scheduleRender();
    
    return flatLayer;
  }

  /**
   * Render all layers to context
   * @param {CanvasRenderingContext2D} ctx - Target context
   */
  render(ctx) {
    // Render layers from bottom to top
    this.layers.forEach(layer => {
      if (layer.visible) {
        layer.render(ctx);
      }
    });
  }

  /**
   * Clear all layers
   */
  clear() {
    this.layers = [];
    this.activeLayer = null;
  }

  /**
   * Delete content in selection on active layer
   */
  deleteSelection() {
    if (!this.activeLayer || this.activeLayer.locked) return;
    if (!this.app.selection?.hasSelection()) {
      this.activeLayer.clear();
    } else {
      // TODO: Clear selection area
      this.app.selection.clearSelection(this.activeLayer);
    }
    this.app.canvas.scheduleRender();
    this.app.history.pushState('Delete');
  }

  /**
   * Serialize all layers to JSON
   * @returns {Array}
   */
  toJSON() {
    return this.layers.map(l => l.toJSON());
  }

  /**
   * Load layers from JSON
   * @param {Array} layersData - Layers data
   */
  async fromJSON(layersData) {
    this.clear();
    
    for (const data of layersData) {
      const layer = await Layer.fromJSON(data);
      layer.app = this.app;
      this.layers.push(layer);
    }
    
    if (this.layers.length > 0) {
      this.activeLayer = this.layers[this.layers.length - 1];
    }
    
    this.app.canvas.scheduleRender();
  }

  /**
   * Get layer count
   * @returns {number}
   */
  get count() {
    return this.layers.length;
  }
}

export default LayerManager;
