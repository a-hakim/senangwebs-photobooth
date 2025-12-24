/**
 * SenangWebs Studio - Clipboard Manager
 * @version 2.0.0
 */

export class Clipboard {
  constructor(app) {
    this.app = app;
    this.data = null;
    this.type = null;
  }

  copy() {
    const layer = this.app.layers.getActiveLayer();
    if (!layer?.canvas) return;
    
    const selection = this.app.selection;
    
    if (selection?.hasSelection() && selection.bounds) {
      const { x, y, width, height } = selection.bounds;
      this.data = layer.ctx.getImageData(x, y, width, height);
      this.type = 'imageData';
    } else {
      this.data = layer.canvas.toDataURL();
      this.type = 'dataURL';
    }
  }

  cut() {
    this.copy();
    this.app.layers.deleteSelection();
  }

  async paste() {
    if (!this.data) return;
    
    const layer = this.app.layers.addLayer({ name: 'Pasted Layer' });
    
    if (this.type === 'imageData') {
      layer.initCanvas(this.data.width, this.data.height);
      layer.ctx.putImageData(this.data, 0, 0);
    } else if (this.type === 'dataURL') {
      await layer.loadFromDataURL(this.data);
    }
    
    this.app.layers.setActiveLayer(layer.id);
    this.app.history.pushState('Paste');
    this.app.canvas.scheduleRender();
  }
}

export default Clipboard;
