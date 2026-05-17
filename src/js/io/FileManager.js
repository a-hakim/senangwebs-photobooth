/**
 * SenangWebs Studio - File Manager
 * @version 2.0.2
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
      let resolved = false;
      const cleanup = () => {
        window.removeEventListener('focus', onFocus);
        if (input.parentNode) input.remove();
      };
      const onFocus = () => {
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            cleanup();
            resolve(null);
          }
        }, 300);
      };
      input.onchange = async (e) => {
        resolved = true;
        cleanup();
        const file = e.target.files[0];
        if (!file) return resolve(null);

        if (file.name.endsWith('.sws')) {
          await this.openProject(file);
        } else {
          await this.openImage(file);
        }
        resolve(file);
      };
      window.addEventListener('focus', onFocus, { once: true });
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
          this.app.history.pushState('Open Image');
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
    let project;
    try {
      project = JSON.parse(text);
    } catch (e) {
      console.error('SWP: Failed to parse project file', e);
      throw new Error('Invalid project file: malformed JSON');
    }

    if (!project || typeof project.width !== 'number' || typeof project.height !== 'number'
        || project.width <= 0 || project.height <= 0) {
      throw new Error('Invalid project: missing or invalid canvas dimensions');
    }
    if (!Array.isArray(project.layers)) {
      throw new Error('Invalid project: missing layers array');
    }

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
      version: '2.0.2',
      width: this.app.canvas.width,
      height: this.app.canvas.height,
      layers: this.app.layers.toJSON()
    };
    
    const blob = new Blob([JSON.stringify(project)], { type: 'application/json' });
    this.downloadBlob(blob, `${this.projectName}.sws`);
    
    this.hasUnsavedChanges = false;
    this.app.events.emit(Events.DOCUMENT_SAVE, { name: this.projectName });
  }

  setProjectName(name) {
    if (name && name.trim()) {
      this.projectName = name.trim();
    }
  }

  async saveAs() {
    this.projectName = `${this.projectName}_${Date.now()}`;
    await this.save();
  }

  async export(format = 'png', quality = 1) {
    const mimeType = format.startsWith('image/') ? format : `image/${format}`;
    const dataURL = this.app.canvas.toDataURL(mimeType, quality);
    const link = document.createElement('a');
    link.download = `${this.projectName}.${format}`;
    link.href = dataURL;
    link.click();

    this.app.events.emit(Events.DOCUMENT_EXPORT, { format, name: this.projectName });
  }

  async exportAs() {
    await this.export('png', 1);
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
