/**
 * SenangWebs Studio - File Manager
 * @version 2.0.0
 */

import { Events } from '../core/EventEmitter.js';

export class FileManager {
  constructor(app) {
    this.app = app;
    this.projectName = 'Untitled';
    this.projectData = null;
    this.hasUnsavedChanges = false;
    
    this.app.events.on(Events.CHANGE, () => {
      this.hasUnsavedChanges = true;
    });
  }

  newDocument(options = {}) {
    const width = options.width || 1920;
    const height = options.height || 1080;
    const background = options.background || '#ffffff';
    
    this.app.canvas.resize(width, height);
    this.app.layers.init(width, height);
    
    if (background !== 'transparent') {
      const bgLayer = this.app.layers.getLayers()[0];
      if (bgLayer) bgLayer.fill(background);
    }
    
    this.app.history.init();
    this.projectName = 'Untitled';
    this.hasUnsavedChanges = false;
    
    this.app.canvas.fitToScreen();
    this.app.events.emit(Events.DOCUMENT_NEW, { width, height });
  }

  async open() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.sws';
    
    return new Promise((resolve) => {
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return resolve(null);
        
        if (file.name.endsWith('.sws')) {
          await this.openProject(file);
        } else {
          await this.openImage(file);
        }
        resolve(file);
      };
      input.click();
    });
  }

  async openImage(file) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        this.newDocument({ width: img.width, height: img.height });
        const layer = this.app.layers.getActiveLayer();
        if (layer) {
          layer.ctx.drawImage(img, 0, 0);
        }
        URL.revokeObjectURL(url);
        this.projectName = file.name.replace(/\.[^/.]+$/, '');
        this.app.events.emit(Events.DOCUMENT_OPEN, { name: this.projectName });
        resolve();
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  async openProject(file) {
    const text = await file.text();
    const project = JSON.parse(text);
    
    this.app.canvas.resize(project.width, project.height);
    await this.app.layers.fromJSON(project.layers);
    
    this.projectName = project.name || file.name.replace('.sws', '');
    this.hasUnsavedChanges = false;
    this.app.history.init();
    this.app.canvas.fitToScreen();
    this.app.events.emit(Events.DOCUMENT_OPEN, { name: this.projectName });
  }

  async save() {
    const project = {
      name: this.projectName,
      version: '2.0.0',
      width: this.app.canvas.width,
      height: this.app.canvas.height,
      layers: this.app.layers.toJSON()
    };
    
    const blob = new Blob([JSON.stringify(project)], { type: 'application/json' });
    this.downloadBlob(blob, `${this.projectName}.sws`);
    
    this.hasUnsavedChanges = false;
    this.app.events.emit(Events.DOCUMENT_SAVE, { name: this.projectName });
  }

  async saveAs() {
    const name = prompt('Project name:', this.projectName);
    if (name) {
      this.projectName = name;
      await this.save();
    }
  }

  async export(format = 'png', quality = 1) {
    const dataURL = this.app.canvas.toDataURL(`image/${format}`, quality);
    const link = document.createElement('a');
    link.download = `${this.projectName}.${format}`;
    link.href = dataURL;
    link.click();
    
    this.app.events.emit(Events.DOCUMENT_EXPORT, { format, name: this.projectName });
  }

  async exportAs() {
    const format = prompt('Format (png, jpeg, webp):', 'png');
    if (format && ['png', 'jpeg', 'webp'].includes(format)) {
      const quality = format === 'png' ? 1 : parseFloat(prompt('Quality (0.1-1.0):', '0.9')) || 0.9;
      await this.export(format, quality);
    }
  }

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }
}

export default FileManager;
