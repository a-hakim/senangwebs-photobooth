/**
 * SenangWebs Studio - Color Manager
 * @version 2.0.0
 */

import { Events } from '../core/EventEmitter.js';

export class ColorManager {
  constructor(app) {
    this.app = app;
    this.foreground = '#000000';
    this.background = '#ffffff';
    this.swatches = [
      '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
      '#ffff00', '#00ffff', '#ff00ff', '#ff8800', '#8800ff',
      '#888888', '#444444', '#cccccc', '#880000', '#008800'
    ];
  }

  setForeground(color) {
    this.foreground = color;
    this.app.events.emit(Events.COLOR_FOREGROUND, { color });
  }

  setBackground(color) {
    this.background = color;
    this.app.events.emit(Events.COLOR_BACKGROUND, { color });
  }

  swap() {
    const temp = this.foreground;
    this.foreground = this.background;
    this.background = temp;
    this.app.events.emit(Events.COLOR_SWAP, { 
      foreground: this.foreground, 
      background: this.background 
    });
  }

  reset() {
    this.foreground = '#000000';
    this.background = '#ffffff';
    this.app.events.emit(Events.COLOR_FOREGROUND, { color: this.foreground });
    this.app.events.emit(Events.COLOR_BACKGROUND, { color: this.background });
  }

  addSwatch(color) {
    if (!this.swatches.includes(color)) {
      this.swatches.push(color);
    }
  }

  removeSwatch(index) {
    this.swatches.splice(index, 1);
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }
}

export default ColorManager;
