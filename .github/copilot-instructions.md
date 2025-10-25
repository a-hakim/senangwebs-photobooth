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
npm run dev      # Webpack watch mode with auto-rebuild (no dev server)
npm run build    # Production: dist/swp.min.js (~10KB) + swp.min.css (~4KB)
```
**Note:** There is no dev server configured. Open `examples/index.html` directly in browser or use your own local server. The `dev` script runs webpack in watch mode for auto-rebuilding.

### Build Configuration (webpack.config.js)
- **Dual entry points:** `swp.js` and `styles.css` (separate entries, not CSS-in-JS)
- **Output naming:**
  - Dev: `swp.js` + `swp.css`
  - Prod: Uses same filenames (no .min suffix - configured elsewhere)
- **UMD library config:** Exports as `SWP` global + default ES6 export
- **NO HtmlWebpackPlugin** - Demo pages reference dist/ files via script tags
- **CSS extraction:** MiniCssExtractPlugin extracts CSS to separate file

### File Structure
```
src/
├── js/swp.js      # Single ~630-line class - ALL library logic
├── css/swp.css    # Complete styling (~6KB)
dist/              # Generated build artifacts
├── swp.js         # Built library bundle
└── swp.css        # Built styles
examples/
└── index.html     # Standalone example (uses dist/ files via script tags)
spec.md            # Original specification - source of truth
```

**Important:** Demo pages (`examples/index.html`) are NOT bundled by webpack. They reference built dist/ files directly via `<script>` tags. Always run `npm run build` first before testing demos.

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

### Resize Functionality
Canvas dimensions dynamically adjust to match loaded image:
```javascript
// In loadImage() - canvas resizes to exact image dimensions
this.canvas.width = img.width;
this.canvas.height = img.height;
```
Users can manually resize via UI panel which updates canvas dimensions and redraws.

### Crop Functionality
Crop method exists but **NO UI implementation** - only programmatic access:
```javascript
// crop(x, y, width, height) at lines ~519-538
crop(x, y, width, height) {
  // Creates temp canvas, draws cropped region from main canvas
  // Loads result as new currentImage
  tempCtx.drawImage(this.canvas, x, y, width, height, 0, 0, width, height);
}
```
**Important:** Crops from current canvas state (including all applied transforms), not original image. Coordinates are relative to current canvas dimensions.

**Missing UI features** (mentioned in spec.md but not implemented):
- Interactive crop selection overlay
- Aspect ratio presets (1:1, 4:3, 16:9, freeform)
- Visual crop handles/rectangle

If adding crop UI, follow the pattern: `createCropPanelHTML()` → add toolbar button → `handleAction('toggle-crop')` → bind mouse events for selection rectangle.

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
- `createResizePanelHTML()` - Canvas dimension controls

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

### Adding Interactive Crop UI
Currently crop only works programmatically (`swp.crop(x, y, w, h)`). To add UI:
1. Create `createCropPanelHTML()` with aspect ratio buttons
2. Add crop mode toggle to toolbar: `<button data-action="toggle-crop">Crop</button>`
3. Add case in `handleAction()`: `case 'toggle-crop': this.enableCropMode(); break;`
4. Implement selection rectangle with mouse events:
   - `mousedown`: Start selection at (x, y)
   - `mousemove`: Draw selection rectangle overlay
   - `mouseup`: Call `this.crop(x, y, width, height)`
5. Use CSS absolute positioning for overlay on `.swp-canvas-container`

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
- `examples/index.html` - Standalone usage example (uses built dist/ files)