# SenangWebs Photobooth - AI Agent Instructions

## Project Overview
A client-side image editing library built as a UMD module (`window.SWP`). All image processing happens in the browser using the HTML5 Canvas API. Current version: 2.x (multi-module architecture).

## Architecture & Design Principles

### Core Philosophy
- **Zero runtime dependencies** (except `@bookklik/senangstart-icons` for icons) - Pure vanilla JavaScript, no frameworks
- **Client-side only** - No server-side processing, all Canvas API based
- **Modular architecture** - `SWP` class composes specialized managers under `src/js/`
- **UMD export** - Works in browser (global), CommonJS, AMD, and ES6 modules

### Key Modules
```
src/js/
├── swp.js               # Main SWP class: wiring, public API, theming, auto-init
├── core/
│   ├── Canvas.js        # Viewport + work/display/overlay canvases, zoom/pan
│   ├── History.js       # Snapshot-based undo/redo (20 states, PNG data-URLs)
│   ├── Keyboard.js      # Photoshop-like keyboard shortcuts
│   └── EventEmitter.js  # Pub/sub event bus (Events constants)
├── layers/
│   ├── Layer.js         # Layer model (raster/text/shape), canvas per layer
│   ├── LayerManager.js  # Add/remove/reorder/merge/opacity/blend/lock
│   └── BlendModes.js    # 24 blend-mode math functions
├── tools/               # BaseTool + 12 tools, ToolManager routes pointer events
│   └── ToolManager.js   # Tool registry, pointer routing, 2-finger pinch/pan
├── filters/
│   └── FilterManager.js # Pixel filters + live preview/apply/cancel
├── selection/Selection.js
├── ui/
│   ├── UI.js            # Layout, header, tool rail, doc-op panels, side panels
│   ├── OptionsSheet.js  # Generic renderer for tool getOptionsUI()
│   ├── Toast.js         # Toast notifications
│   ├── Dialog.js        # Promise-based confirm dialogs
│   └── ColorManager.js
└── io/
    ├── FileManager.js   # Open/save .sws projects, export PNG/JPEG/WebP
    └── Clipboard.js
```

### Critical Patterns
- **UI is generated at runtime** by `UI.createLayout()` using template strings; styling in `src/css/swp.css` with CSS variables (dark/light themes, accent color).
- **Tool options UI**: every tool defines `getOptionsUI()` returning a declarative schema (`slider` / `select` / `checkbox` / `color` / `button`). The `OptionsSheet` renders it generically — never hand-code per-tool panels.
- **History**: push state AFTER mutating (`pushState` captures current state). UI-level canvas ops (rotate/flip/resize) and tools all follow this.
- **Filter preview**: `FilterManager.startPreview()/previewFilter()/applyFilter()/cancelPreview()` — preview rewrites the active layer from a saved `ImageData` snapshot until Apply/Cancel.
- **Events**: modules communicate via `Events` constants (e.g. `TOOL_SELECT`, `HISTORY_PUSH`, `DOCUMENT_NEW`); the UI listens to sync its state.

## Build System & Workflows

### Development Commands
```bash
npm run dev      # Webpack watch mode with auto-rebuild (no dev server)
npm run build    # Production: dist/swp.min.js + swp.min.css
```
**Note:** There is no dev server configured. Open `examples/*.html` via a local server (e.g. WAMP) — demo pages reference `dist/` files via script tags.

### Build Configuration (webpack.config.js)
- **Entry:** `src/js/swp.js` (imports `src/css/swp.css`)
- **UMD library:** exports as `SWP` global + default ES6 export
- **CSS extraction:** MiniCssExtractPlugin to a separate file
- **No HtmlWebpackPlugin** - Demo pages reference dist/ files via script tags

### UX Model (v2.2 revamp)
- **Tool rail** (bottom, scrollable): all 12 tools + document ops (Rotate/Flip/Resize/Adjust/Filter)
- **Options sheet**: contextual panel above the rail; renders the active tool's `getOptionsUI()`
- **Feedback**: `ui.toast` (success/error/info), `ui.dialog.confirm()` for destructive actions, busy overlay via `ui.withBusy(label, fn)`
- **Empty state**: shown for fresh documents; supports drag-drop, paste, browse
- **Export modal**: format, quality, filename, project save, size estimate
- **Mobile-first**: hidden textarea for text entry (IME/keyboard/paste), two-finger pinch-zoom/pan, 44px+ hit targets

### Conventions
- Keep zero runtime dependencies (icons package is the only exception)
- All destructive UI actions must be confirmable and reversible (history)
- History pushes happen after mutation, with a descriptive label
- New tools: extend `BaseTool`, implement `getOptionsUI()`, register in `ToolManager.init()`, add to `UI.RAIL_ITEMS`
