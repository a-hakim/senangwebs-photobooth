# SenangWebs Photobooth

A professional browser-based image editor with layers, tools, filters, and Photoshop-like features.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.md)
[![Built with SenangStart Icons](https://img.shields.io/badge/Built%20with-SenangStart%20Icons-2563EB.svg)](https://github.com/bookklik-technologies/senangstart-icons)

| example 1                                                                                                        | example 2                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| ![SenangWebs Photobooth Preview 1](https://raw.githubusercontent.com/a-hakim/senangwebs-photobooth/master/swp_preview1.png) | ![SenangWebs Photobooth Preview 2](https://raw.githubusercontent.com/a-hakim/senangwebs-photobooth/master/swp_preview2.png) |

## Features

### Layer System
- Multiple layers with full compositing
- 24 blend modes (Normal, Multiply, Screen, Overlay, etc.)
- Layer opacity, visibility, and locking
- Merge, duplicate, and reorder layers
- Layers panel with real-time updates

### History & Layers Panels
- **History Panel** - View and navigate undo/redo history
- **Layers Panel** - Manage layers with visibility toggles and selection
- Collapsible side panels with clean UI

### Editing Tools
| Menu | Description |
|------|-------------|
| Crop | Crop with aspect ratio presets (Free, 1:1, 4:3, 16:9) |
| Rotate | Rotate by ±90° or custom angle slider |
| Flip | Flip horizontal or vertical |
| Resize | Resize canvas with presets and aspect ratio lock |
| Draw | Brush tool with customizable size and color |
| Shape | Rectangle, ellipse, line with fill and stroke options |
| Text | Add text with font, size, color, and style controls |
| Filter | Apply filters with intensity control |

### Filters & Adjustments
- Brightness, Contrast
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
- `DEL` - Delete selected layer

### File Operations
- Load images (PNG, JPEG, WebP)
- Download with format selection (PNG, JPEG, WebP)
- Save projects as `.swp` files
- Export to PNG, JPEG, WebP

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
  <link rel="stylesheet" href="https://unpkg.com/senangwebs-photobooth@latest/dist/swp.css">
  <style>
    #editor { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="editor"></div>
  <script src="https://unpkg.com/senangwebs-photobooth@latest/dist/swp.js"></script>
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
  <link rel="stylesheet" href="https://unpkg.com/senangwebs-photobooth@latest/dist/swp.css">
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
  <script src="https://unpkg.com/senangwebs-photobooth@latest/dist/swp.js"></script>
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

### Methods

#### Document Operations
```javascript
// Create new document
editor.newDocument(width, height, background);

// Load image from URL
await editor.loadImage('path/to/image.jpg');

// Export as data URL
const dataURL = editor.getImageData('png', 1.0);

// Download export (format: 'png', 'jpeg', or 'webp')
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

#### Theming
```javascript
// Change theme at runtime
editor.setTheme('light');  // or 'dark'

// Change accent color at runtime
editor.setAccentColor('#FF6B6B');
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
- `change` - Theme or accent color changed
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

## UI Overview

### Header Bar
- **Load** - Open image file
- **Download** - Export with format selection (PNG/JPEG/WebP)
- **Undo/Redo** - History navigation
- **History** - Toggle history panel
- **Layers** - Toggle layers panel
- **Reset** - Reset canvas
- **Center** - Fit canvas to screen
- **Fullscreen** - Toggle fullscreen mode

### Menu Bar (Bottom)
- **Crop** - Crop with aspect ratio presets
- **Rotate** - Rotate canvas by angle
- **Flip** - Flip horizontal/vertical
- **Resize** - Resize canvas dimensions
- **Draw** - Brush tool with size and color
- **Shape** - Draw shapes (rectangle, ellipse, line)
- **Text** - Add and style text
- **Filter** - Apply image filters

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