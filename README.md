# SenangWebs Photobooth

A browser-based image editor with layers, drawing tools, filters, and a mobile-first touch-friendly UX. All processing happens client-side via the HTML5 Canvas API.

[![Version](https://img.shields.io/badge/Version-2.2.0-2563EB.svg)](https://www.npmjs.com/package/senangwebs-photobooth)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.md)
[![Built with SenangStart Icons](https://img.shields.io/badge/Built%20with-SenangStart%20Icons-2563EB.svg)](https://github.com/bookklik-technologies/senangstart-icons)

| example 1                                                                                                        | example 2                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| ![SenangWebs Photobooth Preview 1](https://raw.githubusercontent.com/a-hakim/senangwebs-photobooth/master/swp_preview1.png) | ![SenangWebs Photobooth Preview 2](https://raw.githubusercontent.com/a-hakim/senangwebs-photobooth/master/swp_preview2.png) |

## Features

### Layer System
- Multiple layers with full compositing
- 24 blend modes (Normal, Multiply, Screen, Overlay, etc.)
- Layer opacity, visibility, locking, and renaming
- Merge down, merge visible, duplicate, and reorder
- Per-layer positioning (x, y offset)
- Layer types: raster, text, shape
- Layer serialization (toJSON / fromJSON)
- Full-featured Layers panel: opacity slider, blend mode, rename, reorder, duplicate, merge, lock — all with real-time updates

### History & Panels
- **History Panel** - View and navigate undo/redo history (up to 20 states)
- **Layers Panel** - Full layer management (see above)
- Collapsible side panels with clean UI
- Consistent undo behavior — every committed action is a labeled history state

### Editing Tools
All tools are reachable by touch alone — no keyboard-only features.

| Tool | Shortcut | Description |
|------|----------|-------------|
| Move | `V` | Move layers with snap-to-edges, auto-select, and transform handles |
| Select | `M` | Rectangle and ellipse selections with feather option |
| Crop | `C` | Crop with aspect ratio presets (Free, 1:1, 4:3, 3:4, 16:9, 9:16, Original) |
| Draw | `B` | Brush with size, hardness, opacity, flow, smoothing, and stylus pressure support |
| Erase | `E` | Eraser with brush/block modes, adjustable size, hardness, and opacity |
| Gradient | `G` | Linear, radial, and angle gradients with opacity and reverse options |
| Fill | `G` | Flood fill with tolerance and contiguous/non-contiguous modes |
| Shape | `U` | Rectangle, ellipse, and line with fill, stroke, and corner radius options |
| Text | `T` | Add text with font, size, color, weight, style, and alignment — works with mobile virtual keyboards, IME, and paste |
| Pick | `I` | Eyedropper with point/3×3/5×5 sampling and layer scope |
| Zoom | `Z` | Zoom in/out with fit-to-screen and 100% buttons |
| Pan | `H` / `Space` | Pan the canvas viewport |

| Document Op | Description |
|-------------|-------------|
| Rotate | Rotate by ±90° or custom angle slider |
| Flip | Flip horizontal or vertical |
| Resize | Resize canvas with presets and aspect ratio lock |
| Adjust | Live brightness/contrast/saturation sliders, double-tap to reset, press-and-hold Compare |
| Filter | Artistic filters with live thumbnails of your image |

### Selection System
- Rectangular and elliptical selections
- Freeform path selections
- Select All (`Ctrl+A`), Deselect (`Ctrl+D`), Invert Selection (`Ctrl+Shift+I`)
- Marching ants animation
- Selection-aware copy, cut, and paste

### Filters & Adjustments
- **Adjust panel** — Brightness, Contrast, Saturation as live sliders with press-and-hold Compare
- **Filter gallery** — Grayscale, Sepia, Invert, Blur, Brighten, Contrast, Saturate, Sharpen with live thumbnails of your actual image and honest intensity control (every filter responds to its slider)

### Keyboard Shortcuts

#### General
| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Ctrl+N` | New document |
| `Ctrl+O` | Open image |
| `Ctrl+S` | Save project |
| `Ctrl+Shift+S` | Save As |
| `Ctrl+E` | Export image |
| `Ctrl+Shift+E` | Export As |
| `F` | Toggle fullscreen |
| `Space` | Temporary hand tool |

#### Tools
| Shortcut | Action |
|----------|--------|
| `V` | Move tool |
| `M` | Marquee tool |
| `C` | Crop tool |
| `B` | Brush tool |
| `E` | Eraser tool |
| `G` | Gradient / Fill tool |
| `T` | Text tool |
| `U` | Shape tool |
| `I` | Eyedropper tool |
| `Z` | Zoom tool |
| `H` | Hand tool |

#### Editing
| Shortcut | Action |
|----------|--------|
| `Ctrl+A` | Select All |
| `Ctrl+D` | Deselect |
| `Ctrl+Shift+I` | Invert Selection |
| `Ctrl+C` | Copy |
| `Ctrl+V` | Paste |
| `Ctrl+X` | Cut |
| `Ctrl+Shift+N` | Add new layer |
| `Ctrl+J` | Duplicate layer |
| `Ctrl+Shift+M` | Merge down |
| `Ctrl+Shift+V` | Merge visible layers |
| `DEL` / `Backspace` | Delete selected layer or content |
| `Enter` | Confirm action (crop, text) |
| `Escape` | Cancel current action |

#### View
| Shortcut | Action |
|----------|--------|
| `Ctrl+0` | Fit to screen |
| `Ctrl+1` | Zoom to 100% |
| `Ctrl+Plus` | Zoom in |
| `Ctrl+Minus` | Zoom out |
| `[` / `]` | Decrease / Increase brush size |
| `Shift+[` / `Shift+]` | Decrease / Increase brush hardness |
| `X` | Swap foreground / background colors |
| `D` | Reset colors to black / white |

### Touch & Mobile
- Two-finger pinch-zoom and two-finger pan
- Text editing via virtual keyboard (IME composition and paste supported)
- All tools reachable by touch; 44px+ hit targets
- Thumb-zone Apply/Cancel in contextual panels

### File Operations
- Load images via browse, drag-and-drop, or clipboard paste (PNG, JPEG, WebP)
- Export modal with format selection (PNG/JPEG/WebP), quality slider, custom filename, and file-size estimate
- Save projects as `.sws` files (Export modal or `Ctrl+S`)
- Export to PNG, JPEG, WebP

### UX Details
- **Tool rail** — All 12 tools + document operations in one scrollable bar; selecting a tool opens its options sheet
- **Color widget** — Always-visible foreground/background swatches in the header (click to edit, `X` to swap, `D` to reset)
- **Toast notifications** — Success/error feedback for load, export, and project save
- **Confirmation dialogs** — For destructive actions (reset, delete layer, replace document)
- **Empty state** — Drag & drop, paste, or browse to load an image
- **Busy indicator** — Spinner during heavy operations (filters, export, project save)

## Installation

### NPM
```bash
npm install senangwebs-photobooth
```

### CDN
```html
<link rel="stylesheet" href="https://unpkg.com/senangwebs-photobooth@2.2.0/dist/swp.css">
<script src="https://unpkg.com/senangwebs-photobooth@2.2.0/dist/swp.js"></script>
```

### Manual Download
Download `swp.js` and `swp.css` from the `dist` folder.

## Quick Start

SenangWebs Photobooth supports two initialization methods: JavaScript API and data attributes.

### JavaScript API

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/senangwebs-photobooth@2.2.0/dist/swp.css">
  <style>
    #editor { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="editor"></div>
  <script src="https://unpkg.com/senangwebs-photobooth@2.2.0/dist/swp.js"></script>
  <script>
    const editor = new SWP('#editor', {
      width: 1920,
      height: 1080,
      theme: 'dark',
      accentColor: '#00FF99'
    });
    
    editor.on('ready', () => {
      console.log('Editor ready!');
    });
  </script>
</body>
</html>
```

### Data Attribute Initialization

You can also initialize the editor using data attributes for a no-code setup:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/senangwebs-photobooth@2.2.0/dist/swp.css">
  <style>
    #editor { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="editor" 
       data-swp 
       data-swp-width="1920" 
       data-swp-height="1080" 
       data-swp-theme="dark"
       data-swp-accent-color="#00FF99">
  </div>
  <script src="https://unpkg.com/senangwebs-photobooth@2.2.0/dist/swp.js"></script>
</body>
</html>
```

Any `data-swp-*` attribute is automatically converted from kebab-case to camelCase and passed as an option, so custom options are supported.

#### Accessing Data Attribute Instances

```javascript
// Access via element property
const editor = document.getElementById('editor').swpInstance;

// Access all auto-initialized instances
const allEditors = SWP.instances;

// Initialize and register editors added after page load
const newEditors = SWP.autoInit();
```

#### Available Data Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-swp` | - | - | Required. Marks element for auto-initialization |
| `data-swp-width` | number | 1920 | Canvas width in pixels |
| `data-swp-height` | number | 1080 | Canvas height in pixels |
| `data-swp-theme` | string | 'dark' | UI theme ('dark' or 'light') |
| `data-swp-accent-color` | string | '#00FF99' | UI accent color (hex format) |

## API Reference

### Constructor
```javascript
const editor = new SWP(container, options);
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | number | 1920 | Canvas width |
| `height` | number | 1080 | Canvas height |
| `theme` | string | 'dark' | UI theme ('dark' or 'light') |
| `accentColor` | string | '#00FF99' | UI accent color |

### Top-Level Methods

#### Document Operations
```javascript
// Create new document
editor.newDocument({ width: 1920, height: 1080, background: '#ffffff' });

// Load image from URL
await editor.loadImage('path/to/image.jpg');

// Export as data URL (format: 'png'/'image/png', 'jpeg'/'image/jpeg', 'webp'/'image/webp')
const dataURL = editor.getImageData('png', 1.0);

// Download export (format: 'png', 'jpeg', or 'webp'; optional quality and filename)
editor.export('png', 1.0, 'my-image');
```

#### History
```javascript
editor.undo();
editor.redo();
```

#### Tools
```javascript
editor.setTool('brush');
editor.setTool('move');
```

#### Filters
```javascript
editor.applyFilter('brightness', { value: 20 });
editor.applyFilter('saturation', { value: 50 });
editor.applyFilter('hueRotate', { angle: 90 });
editor.applyFilter('blur', { radius: 5 });
editor.applyFilter('grayscale', { value: 100 });  // intensity-honoring (0-100)
editor.applyFilter('sepia', { value: 80 });
editor.applyFilter('invert', { value: 100 });
editor.applyFilter('sharpen', { amount: 1 });
editor.applyFilter('adjust', { brightness: 20, contrast: -10, saturation: 40 });
```

#### Theming
```javascript
editor.setTheme('light');       // or 'dark' (emits 'change' event)
editor.setAccentColor('#FF6B6B'); // (emits 'change' event)
```

#### Lifecycle
```javascript
// Cancel current action (filter preview, crop, text)
editor.cancelCurrentAction();

// Confirm current action (crop, text)
editor.confirmCurrentAction();

// Destroy editor and clean up DOM
editor.destroy();

// destroy() is idempotent and clears auto-init references. This is useful
// for data-swp views that may be unmounted and initialized again.
const element = document.querySelector('[data-swp]');
const autoEditor = element.swpInstance;
autoEditor.destroy();
autoEditor.destroy();
const [replacementEditor] = SWP.autoInit();
```

#### Events
```javascript
editor.on('ready', () => { });
editor.on('tool:select', (data) => { });

// Unsubscribe
editor.off('ready', callback);

// Listen once
const unsubscribe = editor.once('ready', () => { });

// Wildcard listeners receive an object with the event name and payload
editor.on('*', ({ event, data }) => { });
```

### Sub-System APIs

#### Layers (`editor.layers`)

```javascript
// Query
editor.layers.getLayers();                // Array of all layers
editor.layers.getActiveLayer();           // Current active layer
editor.layers.getLayer(layerId);          // Get layer by ID
editor.layers.getVisibleLayers();         // Get all visible layers

// Modify
editor.layers.addLayer(options);          // Add new layer
editor.layers.removeLayer(layerId);       // Remove layer
editor.layers.setActiveLayer(layerId);    // Set active layer
editor.layers.renameLayer(layerId, name);  // Rename layer
editor.layers.setLayerVisibility(layerId, visible);  // Toggle visibility
editor.layers.setLayerOpacity(layerId, opacity);     // Set opacity (0-100)
editor.layers.setLayerBlendMode(layerId, blendMode); // Set blend mode
editor.layers.setLayerLocked(layerId, locked);        // Lock/unlock layer

// Reorder
editor.layers.moveLayer(layerId, newIndex);
editor.layers.moveLayerUp(layerId);
editor.layers.moveLayerDown(layerId);

// Merge & Flatten
editor.layers.duplicateLayer(layerId);   // Duplicate a layer
editor.layers.mergeDown(layerId);        // Merge with layer below
editor.layers.mergeVisible();            // Merge all visible layers
editor.layers.flatten();                 // Flatten all layers

// Selection
editor.layers.deleteSelection();         // Delete active layer or selection content

// Serialization
const data = editor.layers.toJSON();     // Serialize all layers
editor.layers.fromJSON(data);            // Load layers from JSON
```

#### Canvas (`editor.canvas`)

```javascript
editor.canvas.setZoom(zoom, centerX, centerY);  // Set zoom level with focal point
editor.canvas.zoomIn();                          // Zoom in
editor.canvas.zoomOut();                         // Zoom out
editor.canvas.fitToScreen();                     // Fit canvas to viewport
editor.canvas.pan(dx, dy);                       // Pan the canvas

// Coordinate conversion
const canvasPos = editor.canvas.viewportToCanvas(viewX, viewY);
const viewPos = editor.canvas.canvasToViewport(canvasX, canvasY);

// Export
const blob = await editor.canvas.toBlob('image/png', 1.0);

// Resize
editor.canvas.resize(width, height);

// Render
editor.canvas.render();
```

#### Selection (`editor.selection`)

```javascript
editor.selection.setRect(x, y, w, h, shape);  // Create rect/ellipse selection
editor.selection.setPath(points);               // Create freeform selection
editor.selection.selectAll();                   // Select entire canvas
editor.selection.deselect();                    // Clear selection
editor.selection.invert();                      // Invert selection
editor.selection.hasSelection();                // Check if selection exists
editor.selection.isPointInSelection(x, y);      // Test if point is in selection
```

#### Clipboard (`editor.clipboard`)

```javascript
editor.clipboard.copy();   // Copy active layer/selection to clipboard
editor.clipboard.cut();    // Copy then delete
editor.clipboard.paste();  // Paste clipboard data as new layer
```

#### Colors (`editor.colors`)

```javascript
editor.colors.setForeground('#ff0000');  // Set foreground color
editor.colors.setBackground('#0000ff');  // Set background color
editor.colors.swap();                     // Swap foreground/background
editor.colors.reset();                    // Reset to black/white

// Swatches
editor.colors.addSwatch('#ff6b6b');      // Add color swatch
editor.colors.removeSwatch(index);        // Remove swatch by index
editor.colors.foreground;                // Current foreground color
editor.colors.background;                // Current background color
```

#### Filters (`editor.filters`)

```javascript
editor.applyFilter('brightness', { value: 20 });  // Apply and commit

// Preview without committing
editor.filters.previewFilter('brightness', { value: 30 });
editor.filters.cancelPreview();
editor.filters.getAvailableFilters();  // List all filter descriptors
```

#### History (`editor.history`)

```javascript
editor.history.canUndo();              // Check if undo available
editor.history.canRedo();              // Check if redo available
editor.history.goToState(index);       // Jump to specific state
editor.history.getStates();            // Get all state entries
editor.history.getCurrentIndex();      // Get current state index
editor.history.clear();                 // Clear all history
editor.history.count;                  // Number of history states
```

#### Keyboard (`editor.keyboard`)

```javascript
editor.keyboard.register('Ctrl+Shift+K', (e) => { }, { description: 'Custom action' });
editor.keyboard.unregister('Ctrl+Shift+K');
editor.keyboard.setEnabled(false);      // Disable all shortcuts
editor.keyboard.setEnabled(true);       // Re-enable shortcuts
editor.keyboard.getShortcuts();          // List all registered shortcuts
```

#### Tools (`editor.tools`)

```javascript
editor.tools.registerTool('customTool', toolInstance);  // Register custom tool
editor.tools.getTool('brush');                           // Get tool instance
editor.tools.getAllTools();                               // Get all tools
editor.tools.getCurrentToolName();                        // Get current tool name
editor.tools.switchToPreviousTool();                      // Switch to previous tool
```

### Available Events

| Event | Description |
|-------|-------------|
| `ready` | Editor initialized |
| `change` | Theme or accent color changed |
| `error` | Error occurred |
| **Document** | |
| `document:new` | New document created |
| `document:open` | Image or project opened |
| `document:save` | Project saved |
| `document:export` | Image exported |
| `document:resize` | Canvas resized |
| **Tools** | |
| `tool:select` | Tool changed |
| `tool:start` | Tool action started |
| `tool:end` | Tool action ended |
| `tool:optionsChange` | Tool options changed |
| `tool:move` | Tool pointer move |
| **Layers** | |
| `layer:add` | Layer added |
| `layer:remove` | Layer removed |
| `layer:select` | Layer selected |
| `layer:rename` | Layer renamed |
| `layer:reorder` | Layer reordered |
| `layer:visibility` | Layer visibility changed |
| `layer:opacity` | Layer opacity changed |
| `layer:blendMode` | Layer blend mode changed |
| `layer:lock` | Layer lock state changed |
| `layer:merge` | Layers merged |
| `layer:duplicate` | Layer duplicated |
| `layer:update` | Layer updated |
| **History** | |
| `history:push` | History state added |
| `history:undo` | Undo performed |
| `history:redo` | Redo performed |
| `history:clear` | History cleared |
| **Canvas** | |
| `canvas:zoom` | Zoom changed |
| `canvas:pan` | Canvas panned |
| `canvas:render` | Canvas rendered |
| **Selection** | |
| `selection:create` | Selection created |
| `selection:clear` | Selection cleared |
| `selection:invert` | Selection inverted |
| **Filters** | |
| `filter:apply` | Filter applied |
| `filter:preview` | Filter preview started |
| `filter:cancel` | Filter preview cancelled |
| **Colors** | |
| `color:foreground` | Foreground color changed |
| `color:background` | Background color changed |
| `color:swap` | Foreground/background swapped |

## UI Overview

### Header Bar
- **Load** - Open image file
- **Export** - Export modal (format, quality, filename, project save)
- **Color widget** - Live foreground/background swatches (click to edit)
- **Undo/Redo** - History navigation
- **History** - Toggle history panel
- **Layers** - Toggle layers panel
- **Reset** - Reset canvas (with confirmation)
- **Center** - Fit canvas to screen
- **Fullscreen** - Toggle fullscreen mode

### Tool Rail (Bottom, scrollable)
**Tools** (each opens its options sheet):
- **Move** - Move and reposition layers
- **Crop** - Crop with aspect ratio presets (incl. 3:4, 9:16)
- **Erase** - Eraser with brush/block modes
- **Draw** - Brush with size/hardness/opacity/flow/smoothing
- **Shape** - Draw shapes (rectangle, ellipse, line)
- **Text** - Add and style text (mobile keyboard supported)
- **Select** - Rectangle and ellipse marquee with feather
- **Fill** - Flood fill with tolerance control
- **Gradient** - Linear, radial, and angle gradients
- **Pick** - Eyedropper color sampling
- **Zoom** - Zoom in/out and fit to screen
- **Pan** - Pan the canvas

**Document operations** (open their panel):
- **Rotate** - Rotate canvas by angle
- **Flip** - Flip horizontal/vertical
- **Resize** - Resize canvas dimensions
- **Adjust** - Live brightness/contrast/saturation sliders with compare
- **Filter** - Apply image filters with live thumbnails

## Development

```bash
# Install dependencies
npm install

# Development mode with watch
npm run dev

# Production build
npm run build
```

### Smoke Test
`examples/smoke-test.html` contains a runtime assertion suite (26 checks) covering the tool rail, options sheet, filters/adjustments, export modal, toasts/dialogs, color widget, crop ratios, text input, and the line shape. Serve the repo with any static server and open the page — results print at the bottom of the page. It can also be run headless:

```bash
msedge --headless=new --dump-dom "http://localhost/<path>/examples/smoke-test.html"
```

`examples/mobile-test.html` performs the same style of layout checks at mobile width (375px/320px) — header fit, compact tool rail, touch targets, options sheet bounds, and filter grid columns. Responsive behavior uses CSS container queries, so the UI follows the app's own width (embedded small containers get the mobile layout too).

## License

MIT License
