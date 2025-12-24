/**
 * SenangWebs Studio - Layer
 * Individual layer class
 * @version 2.0.0
 */

import { Events } from '../core/EventEmitter.js';

let layerIdCounter = 0;

export class Layer {
  constructor(options = {}) {
    this.id = options.id || `layer_${++layerIdCounter}_${Date.now()}`;
    this.name = options.name || `Layer ${layerIdCounter}`;
    this.type = options.type || 'raster'; // raster, text, shape, adjustment
    this.visible = options.visible !== undefined ? options.visible : true;
    this.locked = options.locked || false;
    this.opacity = options.opacity !== undefined ? options.opacity : 100;
    this.blendMode = options.blendMode || 'normal';
    this.position = options.position || { x: 0, y: 0 };
    this.width = options.width || 0;
    this.height = options.height || 0;

    // Canvas for raster layers
    this.canvas = null;
    this.ctx = null;

    // Text layer properties
    this.textContent = options.textContent || '';
    this.textStyle = {
      fontFamily: 'Arial',
      fontSize: 48,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      color: '#000000',
      lineHeight: 1.2,
      ...options.textStyle
    };

    // Shape layer properties
    this.shapeType = options.shapeType || null; // rectangle, ellipse, line, polygon
    this.shapeData = options.shapeData || null;
    this.fillColor = options.fillColor || '#000000';
    this.strokeColor = options.strokeColor || 'transparent';
    this.strokeWidth = options.strokeWidth || 0;

    // Layer mask
    this.mask = null;
    this.maskEnabled = false;

    // Filters/adjustments
    this.filters = options.filters || [];

    // Parent reference (set by LayerManager)
    this.app = null;
  }

  /**
   * Initialize layer canvas
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  initCanvas(width, height) {
    this.width = width;
    this.height = height;
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
  }

  /**
   * Clear layer canvas
   */
  clear() {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  /**
   * Fill layer with color
   * @param {string} color - Fill color
   */
  fill(color) {
    if (!this.ctx) return;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Load image into layer
   * @param {HTMLImageElement|string} source - Image or URL
   * @returns {Promise}
   */
  loadImage(source) {
    return new Promise((resolve, reject) => {
      const img = source instanceof HTMLImageElement ? source : new Image();

      const onLoad = () => {
        if (!this.canvas) {
          this.initCanvas(img.width, img.height);
        }
        this.ctx.drawImage(img, 0, 0);
        resolve(this);
      };

      if (source instanceof HTMLImageElement && source.complete) {
        onLoad();
      } else {
        img.onload = onLoad;
        img.onerror = reject;
        if (typeof source === 'string') {
          img.crossOrigin = 'anonymous';
          img.src = source;
        }
      }
    });
  }

  /**
   * Load from data URL
   * @param {string} dataURL - Data URL
   * @returns {Promise}
   */
  loadFromDataURL(dataURL) {
    return this.loadImage(dataURL);
  }

  /**
   * Resize layer canvas
   * @param {number} width - New width
   * @param {number} height - New height
   * @param {boolean} resizeContent - Scale content to fit
   */
  resize(width, height, resizeContent = false) {
    if (!this.canvas) {
      this.initCanvas(width, height);
      return;
    }

    // Create temp canvas with current content
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.width;
    tempCanvas.height = this.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(this.canvas, 0, 0);

    // Resize main canvas
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;

    // Restore content
    if (resizeContent) {
      this.ctx.drawImage(tempCanvas, 0, 0, width, height);
    } else {
      this.ctx.drawImage(tempCanvas, 0, 0);
    }
  }

  /**
   * Get image data at position
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width
   * @param {number} height - Height
   * @returns {ImageData}
   */
  getImageData(x = 0, y = 0, width = this.width, height = this.height) {
    if (!this.ctx) return null;
    return this.ctx.getImageData(x, y, width, height);
  }

  /**
   * Put image data at position
   * @param {ImageData} imageData - Image data
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  putImageData(imageData, x = 0, y = 0) {
    if (!this.ctx) return;
    this.ctx.putImageData(imageData, x, y);
  }

  /**
   * Draw on layer
   * @param {Function} drawFn - Drawing function receiving context
   */
  draw(drawFn) {
    if (!this.ctx) return;
    this.ctx.save();
    drawFn(this.ctx);
    this.ctx.restore();
  }

  /**
   * Render layer to context
   * @param {CanvasRenderingContext2D} ctx - Target context
   */
  render(ctx) {
    if (!this.visible) return;
    
    // For raster layers, require canvas
    if (this.type === 'raster' && !this.canvas) return;

    ctx.save();

    // Apply opacity
    ctx.globalAlpha = this.opacity / 100;

    // Apply blend mode
    ctx.globalCompositeOperation = this.getCompositeOperation();

    // Apply position
    ctx.translate(this.position.x, this.position.y);

    // Draw based on type
    switch (this.type) {
      case 'text':
        this.renderText(ctx);
        break;
      case 'shape':
        this.renderShape(ctx);
        break;
      default:
        if (this.canvas) {
          ctx.drawImage(this.canvas, 0, 0);
        }
    }

    ctx.restore();
  }

  /**
   * Render text layer
   * @param {CanvasRenderingContext2D} ctx - Target context
   */
  renderText(ctx) {
    const { fontFamily, fontSize, fontWeight, fontStyle, textAlign, color, lineHeight } = this.textStyle;

    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'top';

    const lines = this.textContent.split('\n');
    lines.forEach((line, index) => {
      ctx.fillText(line, 0, index * fontSize * lineHeight);
    });
  }

  /**
   * Render shape layer
   * @param {CanvasRenderingContext2D} ctx - Target context
   */
  renderShape(ctx) {
    if (!this.shapeData) return;

    ctx.fillStyle = this.fillColor;
    ctx.strokeStyle = this.strokeColor;
    ctx.lineWidth = this.strokeWidth;

    const { x, y, width, height, points } = this.shapeData;

    switch (this.shapeType) {
      case 'rectangle':
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        if (this.fillColor !== 'transparent') ctx.fill();
        if (this.strokeWidth > 0) ctx.stroke();
        break;

      case 'ellipse':
        ctx.beginPath();
        ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
        if (this.fillColor !== 'transparent') ctx.fill();
        if (this.strokeWidth > 0) ctx.stroke();
        break;

      case 'line':
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.stroke();
        break;

      case 'polygon':
        if (points && points.length > 2) {
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
          ctx.closePath();
          if (this.fillColor !== 'transparent') ctx.fill();
          if (this.strokeWidth > 0) ctx.stroke();
        }
        break;
    }
  }

  /**
   * Get composite operation from blend mode
   * @returns {string} Composite operation
   */
  getCompositeOperation() {
    const blendModeMap = {
      'normal': 'source-over',
      'multiply': 'multiply',
      'screen': 'screen',
      'overlay': 'overlay',
      'darken': 'darken',
      'lighten': 'lighten',
      'color-dodge': 'color-dodge',
      'color-burn': 'color-burn',
      'hard-light': 'hard-light',
      'soft-light': 'soft-light',
      'difference': 'difference',
      'exclusion': 'exclusion',
      'hue': 'hue',
      'saturation': 'saturation',
      'color': 'color',
      'luminosity': 'luminosity'
    };
    return blendModeMap[this.blendMode] || 'source-over';
  }

  /**
   * Clone layer
   * @returns {Layer}
   */
  clone() {
    const cloned = new Layer({
      name: `${this.name} copy`,
      type: this.type,
      visible: this.visible,
      locked: this.locked,
      opacity: this.opacity,
      blendMode: this.blendMode,
      position: { ...this.position },
      textContent: this.textContent,
      textStyle: { ...this.textStyle },
      shapeType: this.shapeType,
      shapeData: this.shapeData ? { ...this.shapeData } : null,
      fillColor: this.fillColor,
      strokeColor: this.strokeColor,
      strokeWidth: this.strokeWidth,
      filters: [...this.filters]
    });

    if (this.canvas) {
      cloned.initCanvas(this.width, this.height);
      cloned.ctx.drawImage(this.canvas, 0, 0);
    }

    return cloned;
  }

  /**
   * Export to data URL
   * @param {string} format - Image format
   * @param {number} quality - Quality (0-1)
   * @returns {string}
   */
  toDataURL(format = 'image/png', quality = 1) {
    if (!this.canvas) return null;
    return this.canvas.toDataURL(format, quality);
  }

  /**
   * Serialize layer to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      visible: this.visible,
      locked: this.locked,
      opacity: this.opacity,
      blendMode: this.blendMode,
      position: this.position,
      width: this.width,
      height: this.height,
      textContent: this.textContent,
      textStyle: this.textStyle,
      shapeType: this.shapeType,
      shapeData: this.shapeData,
      fillColor: this.fillColor,
      strokeColor: this.strokeColor,
      strokeWidth: this.strokeWidth,
      filters: this.filters,
      imageData: this.canvas ? this.toDataURL() : null
    };
  }

  /**
   * Create layer from JSON
   * @param {Object} json - JSON data
   * @returns {Promise<Layer>}
   */
  static async fromJSON(json) {
    const layer = new Layer(json);
    
    if (json.imageData) {
      await layer.loadFromDataURL(json.imageData);
    }
    
    return layer;
  }
}

export default Layer;
