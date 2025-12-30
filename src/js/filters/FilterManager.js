/**
 * SenangWebs Studio - Filter Manager
 * @version 2.0.0
 */

import { Events } from '../core/EventEmitter.js';

export class FilterManager {
  constructor(app) {
    this.app = app;
    this.previewActive = false;
    this.originalImageData = null;
  }

  startPreview() {
    const layer = this.app.layers.getActiveLayer();
    if (!layer?.ctx) return;
    this.originalImageData = layer.ctx.getImageData(0, 0, layer.width, layer.height);
    this.previewActive = true;
  }

  cancelPreview() {
    if (!this.previewActive || !this.originalImageData) return;
    const layer = this.app.layers.getActiveLayer();
    if (layer?.ctx) {
      layer.ctx.putImageData(this.originalImageData, 0, 0);
      this.app.canvas.scheduleRender();
    }
    this.originalImageData = null;
    this.previewActive = false;
    this.app.events.emit(Events.FILTER_CANCEL);
  }

  applyFilter(filterName, options = {}) {
    const layer = this.app.layers.getActiveLayer();
    if (!layer?.ctx) return;
    
    // Use original image data if preview was active, otherwise get current
    const imageData = this.originalImageData 
      ? new ImageData(
          new Uint8ClampedArray(this.originalImageData.data),
          this.originalImageData.width, 
          this.originalImageData.height
        )
      : layer.ctx.getImageData(0, 0, layer.width, layer.height);
    
    const filtered = this.processFilter(filterName, imageData, options);
    
    layer.ctx.putImageData(filtered, 0, 0);
    this.originalImageData = null;
    this.previewActive = false;
    
    this.app.history.pushState(`Filter: ${filterName}`);
    this.app.canvas.scheduleRender();
    this.app.events.emit(Events.FILTER_APPLY, { filter: filterName, options });
  }

  previewFilter(filterName, options = {}) {
    if (!this.previewActive) this.startPreview();
    const layer = this.app.layers.getActiveLayer();
    if (!layer?.ctx || !this.originalImageData) return;
    
    const filtered = this.processFilter(filterName, new ImageData(
      new Uint8ClampedArray(this.originalImageData.data),
      this.originalImageData.width, this.originalImageData.height
    ), options);
    
    layer.ctx.putImageData(filtered, 0, 0);
    this.app.canvas.scheduleRender();
    this.app.events.emit(Events.FILTER_PREVIEW, { filter: filterName, options });
  }

  processFilter(filterName, imageData, options) {
    switch (filterName) {
      case 'brightness': return this.adjustBrightness(imageData, options.value || 0);
      case 'contrast': return this.adjustContrast(imageData, options.value || 0);
      case 'saturation': return this.adjustSaturation(imageData, options.value || 0);
      case 'grayscale': return this.grayscale(imageData);
      case 'sepia': return this.sepia(imageData);
      case 'invert': return this.invert(imageData);
      case 'blur': return this.blur(imageData, options.radius || 5);
      case 'sharpen': return this.sharpen(imageData, options.amount || 1);
      case 'hueRotate': return this.hueRotate(imageData, options.angle || 0);
      default: return imageData;
    }
  }

  adjustBrightness(imageData, value) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, data[i] + value));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + value));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + value));
    }
    return imageData;
  }

  adjustContrast(imageData, value) {
    const data = imageData.data;
    const factor = (259 * (value + 255)) / (255 * (259 - value));
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
      data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
      data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
    }
    return imageData;
  }

  adjustSaturation(imageData, value) {
    const data = imageData.data;
    const factor = 1 + value / 100;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = Math.min(255, Math.max(0, gray + factor * (data[i] - gray)));
      data[i + 1] = Math.min(255, Math.max(0, gray + factor * (data[i + 1] - gray)));
      data[i + 2] = Math.min(255, Math.max(0, gray + factor * (data[i + 2] - gray)));
    }
    return imageData;
  }

  grayscale(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = data[i + 1] = data[i + 2] = gray;
    }
    return imageData;
  }

  sepia(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
      data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
      data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }
    return imageData;
  }

  invert(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
    return imageData;
  }

  blur(imageData, radius) {
    // Simple box blur
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const result = new Uint8ClampedArray(data);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, count = 0;
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const idx = (ny * width + nx) * 4;
              r += data[idx]; g += data[idx + 1]; b += data[idx + 2];
              count++;
            }
          }
        }
        const idx = (y * width + x) * 4;
        result[idx] = r / count;
        result[idx + 1] = g / count;
        result[idx + 2] = b / count;
      }
    }
    
    return new ImageData(result, width, height);
  }

  sharpen(imageData, amount) {
    const kernel = [0, -amount, 0, -amount, 1 + 4 * amount, -amount, 0, -amount, 0];
    return this.convolve(imageData, kernel);
  }

  hueRotate(imageData, angle) {
    const data = imageData.data;
    const cos = Math.cos(angle * Math.PI / 180);
    const sin = Math.sin(angle * Math.PI / 180);
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      data[i] = Math.min(255, Math.max(0, r * (0.213 + cos * 0.787 - sin * 0.213) +
        g * (0.715 - cos * 0.715 - sin * 0.715) + b * (0.072 - cos * 0.072 + sin * 0.928)));
      data[i + 1] = Math.min(255, Math.max(0, r * (0.213 - cos * 0.213 + sin * 0.143) +
        g * (0.715 + cos * 0.285 + sin * 0.140) + b * (0.072 - cos * 0.072 - sin * 0.283)));
      data[i + 2] = Math.min(255, Math.max(0, r * (0.213 - cos * 0.213 - sin * 0.787) +
        g * (0.715 - cos * 0.715 + sin * 0.715) + b * (0.072 + cos * 0.928 + sin * 0.072)));
    }
    return imageData;
  }

  convolve(imageData, kernel) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const result = new Uint8ClampedArray(data);
    const kSize = Math.sqrt(kernel.length);
    const half = Math.floor(kSize / 2);
    
    for (let y = half; y < height - half; y++) {
      for (let x = half; x < width - half; x++) {
        let r = 0, g = 0, b = 0;
        for (let ky = 0; ky < kSize; ky++) {
          for (let kx = 0; kx < kSize; kx++) {
            const idx = ((y + ky - half) * width + (x + kx - half)) * 4;
            const k = kernel[ky * kSize + kx];
            r += data[idx] * k;
            g += data[idx + 1] * k;
            b += data[idx + 2] * k;
          }
        }
        const idx = (y * width + x) * 4;
        result[idx] = Math.min(255, Math.max(0, r));
        result[idx + 1] = Math.min(255, Math.max(0, g));
        result[idx + 2] = Math.min(255, Math.max(0, b));
      }
    }
    
    return new ImageData(result, width, height);
  }

  getAvailableFilters() {
    return [
      { name: 'brightness', label: 'Brightness', hasOptions: true },
      { name: 'contrast', label: 'Contrast', hasOptions: true },
      { name: 'saturation', label: 'Saturation', hasOptions: true },
      { name: 'hueRotate', label: 'Hue/Saturation', hasOptions: true },
      { name: 'grayscale', label: 'Grayscale', hasOptions: false },
      { name: 'sepia', label: 'Sepia', hasOptions: false },
      { name: 'invert', label: 'Invert', hasOptions: false },
      { name: 'blur', label: 'Blur', hasOptions: true },
      { name: 'sharpen', label: 'Sharpen', hasOptions: true }
    ];
  }
}

export default FilterManager;
