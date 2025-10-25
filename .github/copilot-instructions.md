# SenangWebs Photobooth - AI Agent Instructions

## Project Overview
A zero-dependency, client-side photo editing library built as a UMD module. All image processing happens in the browser using HTML5 Canvas API and CSS filters. Single-class architecture exported as both ES6 module and global `window.SWP`.

## Architecture & Design Principles

### Core Philosophy
- **Zero runtime dependencies** - Pure vanilla JavaScript, no frameworks
- **Client-side only** - No server-side processing, all Canvas API based
- **Single responsibility** - One `SWP` class handles all functionality (`src/js/swp.js`)
- **UMD export** - Works in browser (global), CommonJS, AMD, and ES6 modules

### Key Architectural Pattern
The library follows a **self-contained UI generator** pattern:
```javascript
// Constructor -> init() -> createUI() -> bindEvents()
class SWP {
  constructor(container, options) {
    // State setup
    this.currentState = { brightness: 100, contrast: 100, saturation: 100, ... }
    this.init();
  }
  
  createUI() {
    // Dynamically generates complete UI: toolbar, canvas, adjustment panels
    // All HTML is template strings, no external templates
  }
  
  drawImage() {
    // Core rendering loop - ALL visual changes go through here
    // Applies state transformations to canvas on every change
  }
}
```

**Critical:** Every image manipulation (rotate, flip, adjust, filter) calls `drawImage()` which re-renders from `currentState`. Never manipulate canvas directly outside `drawImage()`.

## Build System & Workflows

### Development Commands
```bash
npm run dev      # Webpack dev server @ localhost:3000 with HMR
npm run build    # Production: dist/swp.min.js (~10KB) + swp.min.css (~4KB)
npm run watch    # Auto-rebuild without dev server
```

### Build Configuration (webpack.config.js)
- **Single entry point:** `src/js/swp.js` (no separate demo bundle)
- **CSS imports in JS:** `import '../css/swp.css'` at top of swp.js
- **Output naming:**
  - Dev: `swp.js` + `swp.css`
  - Prod: `swp.min.js` + `swp.min.css`
- **UMD library config:** Exports as `SWP` global + default ES6 export

### File Structure
```
src/
├── js/swp.js      # Single 530-line class - ALL library logic
├── css/swp.css    # Complete styling (~6KB)
dist/              # Generated build artifacts
spec.md            # Original specification - source of truth for features
```

## Code Conventions & Patterns

### State Management Pattern
All edits are **non-destructive** until export:
```javascript
this.currentState = {
  brightness: 100,    // 0-200 range
  contrast: 100,      // 0-200 range
  saturation: 100,    // 0-200 range
  rotation: 0,        // 0, 90, 180, 270
  flipH: false,       // boolean
  flipV: false,       // boolean
  filter: 'none'      // 'none' | 'grayscale' | 'sepia' | 'invert' | 'blur'
};
```
State is applied via Canvas transforms + CSS filter strings in `drawImage()`.

### Event System
Simple pub-sub pattern (`on()` / `emit()`):
```javascript
swp.on('load', () => {});    // Image loaded
swp.on('change', () => {});  // Any edit applied
swp.on('save', () => {});    // Image exported
```

### UI Generation Pattern
All UI is **template strings** in `create*HTML()` methods:
- `createToolbarHTML()` - Toolbar with data-action attributes
- `createAdjustmentsPanelHTML()` - Sliders for brightness/contrast/saturation
- `createFiltersPanelHTML()` - Filter button grid

Event delegation via `data-action` attributes → `handleAction(action)` dispatcher.

### CSS Filter Application
Filters use **CSS filter property** applied to canvas context:
```javascript
getFilterString() {
  let filters = [];
  if (this.currentState.brightness !== 100) filters.push(`brightness(${this.currentState.brightness}%)`);
  // ... combine all active filters
  return filters.join(' ');
}
ctx.filter = this.getFilterString(); // Applied before drawImage()
```

## Common Development Tasks

### Adding a New Filter
1. Add to `createFiltersPanelHTML()` button grid
2. Add case in `getFilterString()` switch statement
3. CSS filter property examples: `grayscale(100%)`, `sepia(100%)`, `blur(5px)`

### Adding a New Adjustment
1. Add to `currentState` with default value
2. Add slider in `createAdjustmentsPanelHTML()`
3. Add event binding in `bindEvents()` for the slider
4. Include in `getFilterString()` filter chain

### Modifying Canvas Rendering
**Always work in `drawImage()` method** - this is the single rendering pipeline:
```javascript
drawImage() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  // Apply all transforms based on currentState
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(this.currentState.rotation * Math.PI / 180);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.filter = this.getFilterString();
  ctx.drawImage(this.currentImage, ...);
  ctx.restore();
  this.emit('change');
}
```

## Critical Implementation Details

### Image Loading & CORS
Images loaded with `crossOrigin = 'anonymous'` to enable canvas export:
```javascript
const img = new Image();
img.crossOrigin = 'anonymous';  // Required for toDataURL()
img.onload = () => { ... };
```

### Auto-initialization Pattern
Supports declarative HTML usage via `data-swp` attribute:
```javascript
// In module footer:
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-swp]').forEach(container => {
      new SWP(container);
    });
  });
}
```

### Export Format
```javascript
getImageData(format = 'jpeg', quality = 0.9) {
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  return this.canvas.toDataURL(mimeType, quality);
}
```

## Testing & Debugging

### Manual Testing
Use dev server console:
```javascript
swpInstance.loadImage('https://picsum.photos/800/600');
swpInstance.rotate(90);
swpInstance.setAdjustment('brightness', 150);
swpInstance.applyFilter('grayscale');
```

### Common Pitfalls
- **Don't manipulate canvas outside `drawImage()`** - breaks state sync
- **Always call `drawImage()` after state changes** - or UI won't update
- **CSS import must be first line in swp.js** - webpack extracts it
- **Filter values are percentages (0-200)** - not 0-1 or 0-255
- **Rotation is in degrees** - convert to radians in drawImage()

## Integration Points

### Browser APIs Used
- **Canvas 2D Context:** All rendering (`getContext('2d')`)
- **FileReader API:** Image upload (`readAsDataURL`)
- **Canvas.toDataURL():** Image export
- **CSS filter property:** Filter effects

### No External Dependencies
- No npm runtime dependencies
- No framework requirements
- Works in vanilla HTML, React, Vue, etc.

## Documentation References
- `spec.md` - Original feature specification (source of truth)
- `README.md` - API documentation and usage examples
- `BUILD.md` - Detailed build system documentation
- `examples/standalone.html` - No-build usage example
