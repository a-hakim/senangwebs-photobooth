# SenangWebs Photobooth

A professional browser-based image editor with Photoshop-like features. Built with vanilla JavaScript, no external dependencies except for icons.

![SenangWebs Photobooth](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Features

### 🎨 Layer System
- Multiple layers with full compositing
- 24 blend modes (Normal, Multiply, Screen, Overlay, etc.)
- Layer opacity, visibility, and locking
- Merge, duplicate, and reorder layers

### 🖌️ Professional Tools
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

### 🎛️ Filters & Adjustments
- Brightness, Contrast, Saturation
- Hue Rotation
- Blur, Sharpen
- Grayscale, Sepia, Invert

### ⌨️ Keyboard Shortcuts
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

### 💾 File Operations
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
<link rel="stylesheet" href="https://unpkg.com/senangwebs-photobooth@2/dist/swp.css">
<script src="https://unpkg.com/senangwebs-photobooth@2/dist/swp.js"></script>
```

### Manual Download
Download `swp.js` and `swp.css` from the `dist` folder.

## Quick Start

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
      height: 1080
    });
    
    editor.on('ready', () => {
      console.log('Editor ready!');
    });
  </script>
</body>
</html>
```

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

## Project Structure

```
src/
├── js/
│   ├── core/           # Core systems
│   │   ├── EventEmitter.js
│   │   ├── Canvas.js
│   │   ├── History.js
│   │   └── Keyboard.js
│   ├── layers/         # Layer system
│   │   ├── Layer.js
│   │   ├── LayerManager.js
│   │   └── BlendModes.js
│   ├── tools/          # Drawing tools
│   │   ├── BaseTool.js
│   │   ├── ToolManager.js
│   │   ├── BrushTool.js
│   │   └── ... (12 tools)
│   ├── selection/      # Selection system
│   │   └── Selection.js
│   ├── filters/        # Image filters
│   │   └── FilterManager.js
│   ├── ui/             # User interface
│   │   ├── UI.js
│   │   └── ColorManager.js
│   ├── io/             # File operations
│   │   ├── FileManager.js
│   │   └── Clipboard.js
│   └── swp.js          # Main entry
├── css/
│   └── swp.css         # Styles
└── dist/               # Built files
```

## Development

```bash
# Install dependencies
npm install

# Development mode with watch
npm run dev

# Production build
npm run build
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT License - see [LICENSE.md](LICENSE.md)

## Credits

- Icons by [SenangStart Icons](https://www.npmjs.com/package/@bookklik/senangstart-icons)
- Built by [a-hakim](https://github.com/a-hakim)
