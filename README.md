# SenangWebs Photobooth

A professional browser-based image editor with layers, tools, filters, and Photoshop-like features.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.md)
[![Built with SenangStart Icons](https://img.shields.io/badge/Built%20with-SenangStart%20Icons-2563EB.svg)](https://github.com/bookklik-technologies/senangstart-icons)

## Features

### Layer System
- Multiple layers with full compositing
- 24 blend modes (Normal, Multiply, Screen, Overlay, etc.)
- Layer opacity, visibility, and locking
- Merge, duplicate, and reorder layers

### Professional Tools
| Tool | Shortcut | Description |
|------|----------|-------------|
| Move | V | Move and transform layers |
| Marquee | M | Rectangular/elliptical selection |
| Brush | B | Customizable brush with pressure support |
| Eraser | E | Erase with brush or block mode |
| Fill | G | Flood fill with tolerance |
| Gradient | G | Linear, radial, angular gradients |
| Text | T | Add and edit text layers |
| Shape | U | Rectangle, ellipse, line shapes |
| Eyedropper | I | Pick colors from canvas |
| Crop | C | Crop with aspect ratio presets |
| Hand | H | Pan the canvas (or hold Space) |
| Zoom | Z | Zoom in/out |

### Filters & Adjustments
- Brightness, Contrast, Saturation
- Hue Rotation
- Blur, Sharpen
- Grayscale, Sepia, Invert

### Keyboard Shortcuts
- `Ctrl+Z` / `Ctrl+Shift+Z` - Undo / Redo
- `Ctrl+N` - New document
- `Ctrl+O` - Open image
- `Ctrl+S` - Save project
- `Ctrl+E` - Export image
- `[` / `]` - Decrease / Increase brush size
- `X` - Swap foreground/background colors
- `D` - Reset to black/white
- `Tab` - Toggle panels
- `Space` - Temporary hand tool

### File Operations
- Open images (PNG, JPEG, WebP)
- Save projects as `.swp` files
- Export to PNG, JPEG, WebP
- Copy/Cut/Paste support

## Installation

### NPM
```bash
npm install senangwebs-photobooth
```

### CDN
```html
<link rel="stylesheet" href="https://unpkg.com/senangwebs-photobooth@latest/dist/swp.css">
<script src="https://unpkg.com/senangwebs-photobooth@latest/dist/swp.js"></script>
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
  <link rel="stylesheet" href="dist/swp.css">
  <style>
    #editor { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="editor"></div>
  <script src="dist/swp.js"></script>
  <script>
    const editor = new SWP('#editor', {
      width: 1920,
      height: 1080,
      theme: 'dark'
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
  <link rel="stylesheet" href="dist/swp.css">
  <style>
    #editor { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="editor" 
       data-swp 
       data-swp-width="1920" 
       data-swp-height="1080" 
       data-swp-theme="dark">
  </div>
  <script src="dist/swp.js"></script>
</body>
</html>
```

#### Accessing Data Attribute Instances

```javascript
// Access via element property
const editor = document.getElementById('editor').swpInstance;

// Access all auto-initialized instances
const allEditors = SWP.instances;

// Manually trigger auto-init (if needed after dynamic content load)
SWP.autoInit();
```

#### Available Data Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-swp` | - | - | Required. Marks element for auto-initialization |
| `data-swp-width` | number | 1920 | Canvas width in pixels |
| `data-swp-height` | number | 1080 | Canvas height in pixels |
| `data-swp-theme` | string | 'dark' | UI theme |

## API Reference

### Constructor
```javascript
const editor = new SWP(container, options);
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | number | 1920 | Canvas width |
| `height` | number | 1080 | Canvas height |
| `theme` | string | 'dark' | UI theme |

### Methods

#### Document Operations
```javascript
// Create new document
editor.newDocument(width, height, background);

// Load image from URL
await editor.loadImage('path/to/image.jpg');

// Export as data URL
const dataURL = editor.getImageData('png', 1.0);

// Download export
editor.export('png', 1.0);
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
editor.applyFilter('blur', { radius: 5 });
editor.applyFilter('grayscale');
```

#### Events
```javascript
editor.on('ready', () => { });
editor.on('tool:select', (data) => { });
editor.on('layer:add', (data) => { });
editor.on('history:push', (data) => { });
```

### Available Events
- `ready` - Editor initialized
- `tool:select` - Tool changed
- `tool:start` - Tool action started
- `tool:end` - Tool action ended
- `layer:add` - Layer added
- `layer:remove` - Layer removed
- `layer:select` - Layer selected
- `history:push` - History state added
- `history:undo` - Undo performed
- `history:redo` - Redo performed
- `canvas:zoom` - Zoom changed
- `color:foreground` - Foreground color changed
- `color:background` - Background color changed

## Development

```bash
# Install dependencies
npm install

# Development mode with watch
npm run dev

# Production build
npm run build
```

## License

MIT License