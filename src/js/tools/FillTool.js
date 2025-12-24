/**
 * SenangWebs Studio - Fill Tool (Paint Bucket)
 * @version 2.0.0
 */

import { BaseTool } from './BaseTool.js';

export class FillTool extends BaseTool {
  constructor(app) {
    super(app);
    this.name = 'fill';
    this.icon = 'fill';
    this.cursor = 'crosshair';
    this.shortcut = 'g';
    
    this.options = {
      tolerance: 32,
      contiguous: true,
      opacity: 100
    };
    this.defaultOptions = { ...this.options };
  }

  onPointerDown(e) {
    super.onPointerDown(e);
    
    const layer = this.app.layers.getActiveLayer();
    if (!layer || layer.locked || !layer.ctx) return;
    
    const x = Math.floor(this.startPoint.x);
    const y = Math.floor(this.startPoint.y);
    
    if (x < 0 || x >= layer.width || y < 0 || y >= layer.height) return;
    
    const fillColor = this.app.colors?.foreground || '#000000';
    this.floodFill(layer, x, y, fillColor);
    
    this.app.history.pushState('Fill');
    this.app.canvas.scheduleRender();
  }

  floodFill(layer, startX, startY, fillColor) {
    const ctx = layer.ctx;
    const imageData = ctx.getImageData(0, 0, layer.width, layer.height);
    const data = imageData.data;
    const width = layer.width;
    const height = layer.height;
    
    const startIdx = (startY * width + startX) * 4;
    const targetR = data[startIdx];
    const targetG = data[startIdx + 1];
    const targetB = data[startIdx + 2];
    const targetA = data[startIdx + 3];
    
    const fillRGB = this.hexToRgb(fillColor);
    const fillA = Math.round((this.options.opacity / 100) * 255);
    const tolerance = this.options.tolerance;
    const visited = new Uint8Array(width * height);
    const stack = [[startX, startY]];
    
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const idx = y * width + x;
      
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (visited[idx]) continue;
      
      const pixelIdx = idx * 4;
      if (!this.colorsMatch(targetR, targetG, targetB, targetA, 
          data[pixelIdx], data[pixelIdx + 1], data[pixelIdx + 2], data[pixelIdx + 3], tolerance)) {
        continue;
      }
      
      visited[idx] = 1;
      data[pixelIdx] = fillRGB.r;
      data[pixelIdx + 1] = fillRGB.g;
      data[pixelIdx + 2] = fillRGB.b;
      data[pixelIdx + 3] = fillA;
      
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  colorsMatch(r1, g1, b1, a1, r2, g2, b2, a2, tolerance) {
    return Math.abs(r1 - r2) <= tolerance && Math.abs(g1 - g2) <= tolerance &&
           Math.abs(b1 - b2) <= tolerance && Math.abs(a1 - a2) <= tolerance;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  getOptionsUI() {
    return {
      tolerance: { type: 'slider', label: 'Tolerance', min: 0, max: 255, value: this.options.tolerance },
      contiguous: { type: 'checkbox', label: 'Contiguous', value: this.options.contiguous },
      opacity: { type: 'slider', label: 'Opacity', min: 1, max: 100, value: this.options.opacity, unit: '%' }
    };
  }
}

export default FillTool;
