/**
 * SenangWebs Studio - Canvas Manager
 * Multi-layer canvas with viewport management
 * @version 2.0.0
 */

import { Events } from './EventEmitter.js';

export class Canvas {
  constructor(app, options = {}) {
    this.app = app;
    this.width = options.width || 1920;
    this.height = options.height || 1080;
    this.zoom = 100;
    this.panX = 0;
    this.panY = 0;
    this.minZoom = 1;
    this.maxZoom = 3200;

    // Canvas elements
    this.container = null;
    this.viewport = null;
    this.workCanvas = null;
    this.workCtx = null;
    this.displayCanvas = null;
    this.displayCtx = null;
    this.overlayCanvas = null;
    this.overlayCtx = null;

    // Rendering
    this.needsRender = false;
    this.renderScheduled = false;

    // Checkerboard pattern for transparency
    this.checkerboardPattern = null;
  }

  /**
   * Initialize canvas system
   * @param {HTMLElement} container - Container element
   */
  init(container) {
    this.container = container;
    this.createCanvasElements();
    this.createCheckerboardPattern();
    this.bindEvents();
    this.render();
  }

  /**
   * Create canvas elements
   */
  createCanvasElements() {
    // Viewport container
    this.viewport = document.createElement('div');
    this.viewport.className = 'swp-viewport';

    // Canvas wrapper (for transform)
    this.canvasWrapper = document.createElement('div');
    this.canvasWrapper.className = 'swp-canvas-wrapper';

    // Work canvas (composited layers)
    this.workCanvas = document.createElement('canvas');
    this.workCanvas.width = this.width;
    this.workCanvas.height = this.height;
    this.workCanvas.className = 'swp-work-canvas';
    this.workCtx = this.workCanvas.getContext('2d');

    // Display canvas (what user sees, with zoom/pan applied)
    this.displayCanvas = document.createElement('canvas');
    this.displayCanvas.className = 'swp-display-canvas';
    this.displayCtx = this.displayCanvas.getContext('2d');

    // Overlay canvas (selection, guides, tool feedback)
    this.overlayCanvas = document.createElement('canvas');
    this.overlayCanvas.className = 'swp-overlay-canvas';
    this.overlayCtx = this.overlayCanvas.getContext('2d');

    // Assemble
    this.canvasWrapper.appendChild(this.displayCanvas);
    this.canvasWrapper.appendChild(this.overlayCanvas);
    this.viewport.appendChild(this.canvasWrapper);
    this.container.appendChild(this.viewport);

    // Initial size
    this.updateDisplaySize();
  }

  /**
   * Create checkerboard pattern for transparency
   */
  createCheckerboardPattern() {
    const size = 16;
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = size * 2;
    patternCanvas.height = size * 2;
    const ctx = patternCanvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size * 2, size * 2);
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(0, 0, size, size);
    ctx.fillRect(size, size, size, size);

    this.checkerboardPattern = this.workCtx.createPattern(patternCanvas, 'repeat');
  }

  /**
   * Bind viewport events
   */
  bindEvents() {
    // Wheel zoom
    this.viewport.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

    // Resize observer
    this.resizeObserver = new ResizeObserver(() => {
      this.updateDisplaySize();
      this.render();
    });
    this.resizeObserver.observe(this.viewport);
  }

  /**
   * Handle mouse wheel for zoom
   * @param {WheelEvent} e - Wheel event
   */
  handleWheel(e) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();

      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.round(this.zoom * delta);

      // Zoom towards cursor position
      const rect = this.displayCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.setZoom(newZoom, x, y);
    } else {
      // Pan
      e.preventDefault();
      this.panX -= e.deltaX;
      this.panY -= e.deltaY;
      this.render();
    }
  }

  /**
   * Update display canvas size based on viewport
   */
  updateDisplaySize() {
    if (!this.viewport) return;

    const rect = this.viewport.getBoundingClientRect();
    this.displayCanvas.width = rect.width;
    this.displayCanvas.height = rect.height;
    this.overlayCanvas.width = rect.width;
    this.overlayCanvas.height = rect.height;
  }

  /**
   * Resize document
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resize(width, height) {
    this.width = width;
    this.height = height;
    this.workCanvas.width = width;
    this.workCanvas.height = height;
    this.createCheckerboardPattern();
    this.render();

    this.app.events.emit(Events.DOCUMENT_RESIZE, { width, height });
  }

  /**
   * Set zoom level
   * @param {number} zoom - Zoom percentage (1-3200)
   * @param {number} centerX - Center X for zoom
   * @param {number} centerY - Center Y for zoom
   */
  setZoom(zoom, centerX = null, centerY = null) {
    const oldZoom = this.zoom;
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));

    // Adjust pan to zoom toward point
    if (centerX !== null && centerY !== null) {
      const scale = this.zoom / oldZoom;
      this.panX = centerX - (centerX - this.panX) * scale;
      this.panY = centerY - (centerY - this.panY) * scale;
    }

    this.render();
    this.app.events.emit(Events.CANVAS_ZOOM, { zoom: this.zoom });
  }

  /**
   * Zoom in by step
   */
  zoomIn() {
    const zoomSteps = [1, 2, 3, 4, 5, 6.25, 8.33, 12.5, 16.67, 25, 33.33, 50, 66.67, 100, 150, 200, 300, 400, 500, 600, 800, 1200, 1600, 2400, 3200];
    const nextZoom = zoomSteps.find(z => z > this.zoom) || this.maxZoom;
    this.setZoom(nextZoom, this.displayCanvas.width / 2, this.displayCanvas.height / 2);
  }

  /**
   * Zoom out by step
   */
  zoomOut() {
    const zoomSteps = [1, 2, 3, 4, 5, 6.25, 8.33, 12.5, 16.67, 25, 33.33, 50, 66.67, 100, 150, 200, 300, 400, 500, 600, 800, 1200, 1600, 2400, 3200];
    const prevZoom = [...zoomSteps].reverse().find(z => z < this.zoom) || this.minZoom;
    this.setZoom(prevZoom, this.displayCanvas.width / 2, this.displayCanvas.height / 2);
  }

  /**
   * Fit canvas to screen
   */
  fitToScreen() {
    const padding = 40;
    const viewportWidth = this.displayCanvas.width - padding * 2;
    const viewportHeight = this.displayCanvas.height - padding * 2;

    const scaleX = viewportWidth / this.width;
    const scaleY = viewportHeight / this.height;
    const scale = Math.min(scaleX, scaleY);

    this.zoom = Math.round(scale * 100);
    this.panX = (this.displayCanvas.width - this.width * scale) / 2;
    this.panY = (this.displayCanvas.height - this.height * scale) / 2;

    this.render();
  }

  /**
   * Pan canvas
   * @param {number} dx - Delta X
   * @param {number} dy - Delta Y
   */
  pan(dx, dy) {
    this.panX += dx;
    this.panY += dy;
    this.render();
    this.app.events.emit(Events.CANVAS_PAN, { panX: this.panX, panY: this.panY });
  }

  /**
   * Convert viewport coordinates to canvas coordinates
   * @param {number} viewX - Viewport X
   * @param {number} viewY - Viewport Y
   * @returns {Object} Canvas coordinates
   */
  viewportToCanvas(viewX, viewY) {
    const scale = this.zoom / 100;
    return {
      x: (viewX - this.panX) / scale,
      y: (viewY - this.panY) / scale
    };
  }

  /**
   * Convert canvas coordinates to viewport coordinates
   * @param {number} canvasX - Canvas X
   * @param {number} canvasY - Canvas Y
   * @returns {Object} Viewport coordinates
   */
  canvasToViewport(canvasX, canvasY) {
    const scale = this.zoom / 100;
    return {
      x: canvasX * scale + this.panX,
      y: canvasY * scale + this.panY
    };
  }

  /**
   * Schedule a render
   */
  scheduleRender() {
    this.needsRender = true;
    if (!this.renderScheduled) {
      this.renderScheduled = true;
      requestAnimationFrame(() => {
        this.renderScheduled = false;
        if (this.needsRender) {
          this.needsRender = false;
          this.render();
        }
      });
    }
  }

  /**
   * Render the canvas
   */
  render() {
    // Clear work canvas
    this.workCtx.clearRect(0, 0, this.width, this.height);

    // Draw checkerboard background
    this.workCtx.fillStyle = this.checkerboardPattern;
    this.workCtx.fillRect(0, 0, this.width, this.height);

    // Composite all layers
    this.app.layers.render(this.workCtx);

    // Draw to display canvas with zoom/pan
    this.displayCtx.clearRect(0, 0, this.displayCanvas.width, this.displayCanvas.height);

    // Fill with gray background
    this.displayCtx.fillStyle = '#2a2a2a';
    this.displayCtx.fillRect(0, 0, this.displayCanvas.width, this.displayCanvas.height);

    // Draw work canvas with transform
    const scale = this.zoom / 100;
    this.displayCtx.save();
    this.displayCtx.translate(this.panX, this.panY);
    this.displayCtx.scale(scale, scale);

    // Draw shadow
    this.displayCtx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    this.displayCtx.shadowBlur = 20;
    this.displayCtx.shadowOffsetX = 5;
    this.displayCtx.shadowOffsetY = 5;

    this.displayCtx.drawImage(this.workCanvas, 0, 0);
    this.displayCtx.restore();

    // Draw overlay (selection, guides, etc.)
    this.renderOverlay();

    this.app.events.emit(Events.CANVAS_RENDER);
  }

  /**
   * Render overlay elements
   */
  renderOverlay() {
    this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);

    const scale = this.zoom / 100;
    this.overlayCtx.save();
    this.overlayCtx.translate(this.panX, this.panY);
    this.overlayCtx.scale(scale, scale);

    // Draw selection if any
    if (this.app.selection) {
      this.app.selection.render(this.overlayCtx);
    }

    // Draw tool overlay
    if (this.app.tools?.currentTool) {
      this.app.tools.currentTool.renderOverlay(this.overlayCtx);
    }

    this.overlayCtx.restore();
  }

  /**
   * Get image data from work canvas
   * @param {string} format - Image format
   * @param {number} quality - Quality (0-1)
   * @returns {string} Data URL
   */
  toDataURL(format = 'image/png', quality = 1) {
    return this.workCanvas.toDataURL(format, quality);
  }

  /**
   * Get image blob
   * @param {string} format - Image format
   * @param {number} quality - Quality (0-1)
   * @returns {Promise<Blob>}
   */
  toBlob(format = 'image/png', quality = 1) {
    return new Promise(resolve => {
      this.workCanvas.toBlob(resolve, format, quality);
    });
  }

  /**
   * Destroy canvas system
   */
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.viewport) {
      this.viewport.remove();
    }
  }
}

export default Canvas;
