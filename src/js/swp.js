/**
 * SenangWebs Photobooth (SWP)
 * A lightweight client-side photo editing library
 * @version 1.0.0
 */

import '../css/swp.css';

class SWP {
        constructor(container, options = {}) {
            this.container = container;
            this.options = {
                imageUrl: options.imageUrl || null,
                width: options.width || 800,
                height: options.height || 600
            };

            this.canvas = null;
            this.ctx = null;
            this.originalImage = null;
            this.currentImage = null;
            this.history = [];
            this.currentState = {
                brightness: 100,
                contrast: 100,
                saturation: 100,
                rotation: 0,
                flipH: false,
                flipV: false,
                filter: 'none'
            };
            this.eventListeners = {};

            this.init();
        }

        init() {
            this.createUI();
            if (this.options.imageUrl) {
                this.loadImage(this.options.imageUrl);
            }
        }

        createUI() {
            // Clear container
            this.container.innerHTML = '';
            this.container.classList.add('swp-container');

            // Create main structure
            const wrapper = document.createElement('div');
            wrapper.className = 'swp-wrapper';

            // Create toolbar
            const toolbar = document.createElement('div');
            toolbar.className = 'swp-toolbar';
            toolbar.innerHTML = this.createToolbarHTML();

            // Create canvas container
            const canvasContainer = document.createElement('div');
            canvasContainer.className = 'swp-canvas-container';

            // Create canvas
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.options.width;
            this.canvas.height = this.options.height;
            this.canvas.className = 'swp-canvas';
            this.ctx = this.canvas.getContext('2d');

            canvasContainer.appendChild(this.canvas);

            // Create adjustments panel
            const adjustmentsPanel = document.createElement('div');
            adjustmentsPanel.className = 'swp-adjustments-panel';
            adjustmentsPanel.innerHTML = this.createAdjustmentsPanelHTML();

            // Create filters panel
            const filtersPanel = document.createElement('div');
            filtersPanel.className = 'swp-filters-panel';
            filtersPanel.innerHTML = this.createFiltersPanelHTML();

            // Create resize panel
            const resizePanel = document.createElement('div');
            resizePanel.className = 'swp-resize-panel';
            resizePanel.innerHTML = this.createResizePanelHTML();

            // Append elements
            wrapper.appendChild(toolbar);
            wrapper.appendChild(canvasContainer);
            wrapper.appendChild(adjustmentsPanel);
            wrapper.appendChild(filtersPanel);
            wrapper.appendChild(resizePanel);
            this.container.appendChild(wrapper);

            // Bind events
            this.bindEvents();
        }

        createToolbarHTML() {
            return `
                <div class="swp-toolbar-group">
                    <button class="swp-btn" data-action="upload" title="Upload Image">
                        <span class="swp-icon">📁</span>
                        <span>Upload</span>
                    </button>
                    <input type="file" id="swp-file-input" accept="image/*" style="display: none;">
                </div>
                <div class="swp-toolbar-group">
                    <button class="swp-btn" data-action="rotate-left" title="Rotate Left">
                        <span class="swp-icon">↶</span>
                    </button>
                    <button class="swp-btn" data-action="rotate-right" title="Rotate Right">
                        <span class="swp-icon">↷</span>
                    </button>
                    <button class="swp-btn" data-action="flip-h" title="Flip Horizontal">
                        <span class="swp-icon">⇄</span>
                    </button>
                    <button class="swp-btn" data-action="flip-v" title="Flip Vertical">
                        <span class="swp-icon">⇅</span>
                    </button>
                </div>
                <div class="swp-toolbar-group">
                    <button class="swp-btn" data-action="toggle-resize" title="Resize">
                        <span class="swp-icon">📐</span>
                        <span>Resize</span>
                    </button>
                </div>
                <div class="swp-toolbar-group">
                    <button class="swp-btn" data-action="toggle-adjustments" title="Adjustments">
                        <span class="swp-icon">🎨</span>
                        <span>Adjust</span>
                    </button>
                    <button class="swp-btn" data-action="toggle-filters" title="Filters">
                        <span class="swp-icon">✨</span>
                        <span>Filters</span>
                    </button>
                </div>
                <div class="swp-toolbar-group">
                    <button class="swp-btn" data-action="reset" title="Reset">
                        <span class="swp-icon">↺</span>
                        <span>Reset</span>
                    </button>
                    <button class="swp-btn swp-btn-primary" data-action="download" title="Download">
                        <span class="swp-icon">💾</span>
                        <span>Save</span>
                    </button>
                </div>
            `;
        }

        createAdjustmentsPanelHTML() {
            return `
                <h3>Adjustments</h3>
                <div class="swp-adjustment">
                    <label>Brightness</label>
                    <input type="range" id="swp-brightness" min="0" max="200" value="100">
                    <span class="swp-value">100%</span>
                </div>
                <div class="swp-adjustment">
                    <label>Contrast</label>
                    <input type="range" id="swp-contrast" min="0" max="200" value="100">
                    <span class="swp-value">100%</span>
                </div>
                <div class="swp-adjustment">
                    <label>Saturation</label>
                    <input type="range" id="swp-saturation" min="0" max="200" value="100">
                    <span class="swp-value">100%</span>
                </div>
            `;
        }

        createResizePanelHTML() {
            return `
                <h3>Resize Image</h3>
                <div class="swp-resize-controls">
                    <div class="swp-adjustment">
                        <label>Width (px)</label>
                        <input type="number" id="swp-resize-width" min="1" max="5000" value="800">
                    </div>
                    <div class="swp-adjustment">
                        <label>Height (px)</label>
                        <input type="number" id="swp-resize-height" min="1" max="5000" value="600">
                    </div>
                    <div class="swp-adjustment">
                        <label>
                            <input type="checkbox" id="swp-maintain-ratio" checked>
                            Maintain aspect ratio
                        </label>
                    </div>
                    <button class="swp-btn swp-btn-primary" data-action="apply-resize">Apply Resize</button>
                </div>
            `;
        }

        createFiltersPanelHTML() {
            const filters = [
                { name: 'none', label: 'None' },
                { name: 'grayscale', label: 'Grayscale' },
                { name: 'sepia', label: 'Sepia' },
                { name: 'invert', label: 'Invert' },
                { name: 'blur', label: 'Blur' }
            ];

            return `
                <h3>Filters</h3>
                <div class="swp-filters-grid">
                    ${filters.map(filter => `
                        <button class="swp-filter-btn ${filter.name === 'none' ? 'active' : ''}" 
                                data-filter="${filter.name}">
                            <span class="swp-filter-preview" data-filter="${filter.name}"></span>
                            <span>${filter.label}</span>
                        </button>
                    `).join('')}
                </div>
            `;
        }

        bindEvents() {
            // Toolbar buttons
            this.container.querySelectorAll('[data-action]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const action = e.currentTarget.getAttribute('data-action');
                    this.handleAction(action);
                });
            });

            // File input
            const fileInput = this.container.querySelector('#swp-file-input');
            if (fileInput) {
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            this.loadImage(event.target.result);
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }

            // Adjustment sliders
            ['brightness', 'contrast', 'saturation'].forEach(adj => {
                const slider = this.container.querySelector(`#swp-${adj}`);
                if (slider) {
                    slider.addEventListener('input', (e) => {
                        const value = parseInt(e.target.value);
                        e.target.nextElementSibling.textContent = value + '%';
                        this.setAdjustment(adj, value);
                    });
                }
            });

            // Filter buttons
            this.container.querySelectorAll('[data-filter]').forEach(btn => {
                if (btn.classList.contains('swp-filter-btn')) {
                    btn.addEventListener('click', (e) => {
                        const filter = e.currentTarget.getAttribute('data-filter');
                        this.applyFilter(filter);
                        
                        // Update active state
                        this.container.querySelectorAll('.swp-filter-btn').forEach(b => {
                            b.classList.remove('active');
                        });
                        e.currentTarget.classList.add('active');
                    });
                }
            });

            // Resize inputs with aspect ratio maintenance
            const widthInput = this.container.querySelector('#swp-resize-width');
            const heightInput = this.container.querySelector('#swp-resize-height');
            const maintainRatio = this.container.querySelector('#swp-maintain-ratio');
            
            if (widthInput && heightInput && this.currentImage) {
                let aspectRatio = this.currentImage.width / this.currentImage.height;
                
                widthInput.addEventListener('input', (e) => {
                    if (maintainRatio.checked) {
                        heightInput.value = Math.round(parseInt(e.target.value) / aspectRatio);
                    }
                });
                
                heightInput.addEventListener('input', (e) => {
                    if (maintainRatio.checked) {
                        widthInput.value = Math.round(parseInt(e.target.value) * aspectRatio);
                    }
                });
            }
        }

        handleAction(action) {
            switch(action) {
                case 'upload':
                    this.container.querySelector('#swp-file-input').click();
                    break;
                case 'rotate-left':
                    this.rotate(-90);
                    break;
                case 'rotate-right':
                    this.rotate(90);
                    break;
                case 'flip-h':
                    this.flip('horizontal');
                    break;
                case 'flip-v':
                    this.flip('vertical');
                    break;
                case 'toggle-adjustments':
                    this.togglePanel('.swp-adjustments-panel');
                    break;
                case 'toggle-filters':
                    this.togglePanel('.swp-filters-panel');
                    break;
                case 'toggle-resize':
                    this.togglePanel('.swp-resize-panel');
                    break;
                case 'apply-resize':
                    this.applyResize();
                    break;
                case 'reset':
                    this.reset();
                    break;
                case 'download':
                    this.download();
                    break;
            }
        }

        togglePanel(selector) {
            const panel = this.container.querySelector(selector);
            if (panel) {
                panel.classList.toggle('active');
                
                // Close other panels
                const panels = ['.swp-adjustments-panel', '.swp-filters-panel', '.swp-resize-panel'];
                panels.forEach(p => {
                    if (p !== selector) {
                        this.container.querySelector(p)?.classList.remove('active');
                    }
                });
            }
        }

        loadImage(imageUrl) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                this.originalImage = img;
                this.currentImage = img;
                
                // Set canvas to exact image dimensions
                this.canvas.width = img.width;
                this.canvas.height = img.height;
                
                // Update resize inputs
                const widthInput = this.container.querySelector('#swp-resize-width');
                const heightInput = this.container.querySelector('#swp-resize-height');
                if (widthInput) widthInput.value = img.width;
                if (heightInput) heightInput.value = img.height;
                
                this.drawImage();
                this.emit('load');
            };

            img.onerror = () => {
                console.error('Failed to load image');
            };

            img.src = imageUrl;
        }

        drawImage() {
            if (!this.currentImage) return;

            const canvas = this.canvas;
            const ctx = this.ctx;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Apply transformations
            ctx.save();
            
            // Move to center for transformations
            ctx.translate(canvas.width / 2, canvas.height / 2);
            
            // Apply rotation
            ctx.rotate(this.currentState.rotation * Math.PI / 180);
            
            // Apply flips
            ctx.scale(
                this.currentState.flipH ? -1 : 1,
                this.currentState.flipV ? -1 : 1
            );

            // Apply CSS filters
            ctx.filter = this.getFilterString();

            // Draw image at actual size (canvas matches image dimensions)
            ctx.drawImage(
                this.currentImage,
                -canvas.width / 2,
                -canvas.height / 2,
                canvas.width,
                canvas.height
            );

            ctx.restore();

            this.emit('change');
        }

        getFilterString() {
            let filters = [];

            if (this.currentState.brightness !== 100) {
                filters.push(`brightness(${this.currentState.brightness}%)`);
            }
            if (this.currentState.contrast !== 100) {
                filters.push(`contrast(${this.currentState.contrast}%)`);
            }
            if (this.currentState.saturation !== 100) {
                filters.push(`saturate(${this.currentState.saturation}%)`);
            }

            switch(this.currentState.filter) {
                case 'grayscale':
                    filters.push('grayscale(100%)');
                    break;
                case 'sepia':
                    filters.push('sepia(100%)');
                    break;
                case 'invert':
                    filters.push('invert(100%)');
                    break;
                case 'blur':
                    filters.push('blur(5px)');
                    break;
            }

            return filters.length > 0 ? filters.join(' ') : 'none';
        }

        rotate(degrees) {
            if (!this.currentImage) return;
            
            this.currentState.rotation = (this.currentState.rotation + degrees) % 360;
            this.drawImage();
        }

        flip(direction) {
            if (!this.currentImage) return;

            if (direction === 'horizontal') {
                this.currentState.flipH = !this.currentState.flipH;
            } else if (direction === 'vertical') {
                this.currentState.flipV = !this.currentState.flipV;
            }

            this.drawImage();
        }

        setAdjustment(adjustment, value) {
            if (!this.currentImage) return;

            this.currentState[adjustment] = value;
            this.drawImage();
        }

        applyFilter(filterName) {
            if (!this.currentImage) return;

            this.currentState.filter = filterName;
            this.drawImage();
        }

        applyResize() {
            if (!this.currentImage) return;

            const widthInput = this.container.querySelector('#swp-resize-width');
            const heightInput = this.container.querySelector('#swp-resize-height');
            
            const newWidth = parseInt(widthInput.value);
            const newHeight = parseInt(heightInput.value);

            if (!newWidth || !newHeight || newWidth < 1 || newHeight < 1) {
                alert('Please enter valid dimensions');
                return;
            }

            // Create temporary canvas for resizing
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = newWidth;
            tempCanvas.height = newHeight;
            const tempCtx = tempCanvas.getContext('2d');

            // Apply current filters while resizing
            tempCtx.filter = this.getFilterString();

            // Draw resized image
            tempCtx.drawImage(this.currentImage, 0, 0, newWidth, newHeight);

            // Load resized image
            const resizedImage = new Image();
            resizedImage.onload = () => {
                this.currentImage = resizedImage;
                this.originalImage = resizedImage;
                
                // Update canvas size
                this.canvas.width = newWidth;
                this.canvas.height = newHeight;
                
                this.drawImage();
            };
            resizedImage.src = tempCanvas.toDataURL();
        }

        crop(x, y, width, height) {
            if (!this.currentImage) return;

            // Create temporary canvas for cropping
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');

            // Draw cropped area
            tempCtx.drawImage(this.canvas, x, y, width, height, 0, 0, width, height);

            // Load cropped image
            const croppedImage = new Image();
            croppedImage.onload = () => {
                this.currentImage = croppedImage;
                this.drawImage();
            };
            croppedImage.src = tempCanvas.toDataURL();
        }

        reset() {
            // Reset all states
            this.currentState = {
                brightness: 100,
                contrast: 100,
                saturation: 100,
                rotation: 0,
                flipH: false,
                flipV: false,
                filter: 'none'
            };

            // Reset sliders
            ['brightness', 'contrast', 'saturation'].forEach(adj => {
                const slider = this.container.querySelector(`#swp-${adj}`);
                if (slider) {
                    slider.value = 100;
                    slider.nextElementSibling.textContent = '100%';
                }
            });

            // Reset filter selection
            this.container.querySelectorAll('.swp-filter-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-filter') === 'none') {
                    btn.classList.add('active');
                }
            });

            // Reset image
            if (this.originalImage) {
                this.currentImage = this.originalImage;
                this.drawImage();
            }
        }

        getImageData(format = 'jpeg', quality = 0.9) {
            if (!this.canvas) return null;

            const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
            return this.canvas.toDataURL(mimeType, quality);
        }

        download() {
            const dataUrl = this.getImageData('png');
            if (!dataUrl) return;

            const link = document.createElement('a');
            link.download = `swp-edited-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();

            this.emit('save');
        }

        // Event system
        on(event, callback) {
            if (!this.eventListeners[event]) {
                this.eventListeners[event] = [];
            }
            this.eventListeners[event].push(callback);
        }

        emit(event, data) {
            if (this.eventListeners[event]) {
                this.eventListeners[event].forEach(callback => {
                    callback(data);
                });
            }
        }
    }

// Auto-initialize for declarative approach
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const declarativeContainers = document.querySelectorAll('[data-swp]');
        declarativeContainers.forEach(container => {
            new SWP(container);
        });
    });
}

// Export
export default SWP;

// Also attach to window for non-module usage
if (typeof window !== 'undefined') {
    window.SWP = SWP;
}
