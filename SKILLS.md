---
name: senangwebs-photobooth
description: Browser-based image editor with layers, 24 blend modes, drawing tools, filters, selections, and export workflows.
version: 2.1.1
package: senangwebs-photobooth
---

# SenangWebs Photobooth (SWP)

## Quick Reference

- **Purpose**: Full-featured canvas-based image editor with layers, tools, and effects
- **Entry**: `dist/swp.js`
- **Dependencies**: `@bookklik/senangstart-icons`
- **Scripts**: `npm run build`, `npm run dev`, `npm run start` (`npm test` is currently a placeholder)

## Workflow

Start in `C:\wamp64\www\sw-libraries\senangwebs-photobooth`. Read `README.md`, `package.json`, and touched source files. Match existing patterns, CSS prefix `swp-`. **Canvas library — verify visual output after changes.**

## HTML Data Attributes

| Attribute | Values |
|---|---|
| `data-swp` | Editor container flag |
| `data-swp-width` | Canvas width (px) |
| `data-swp-height` | Canvas height (px) |
| `data-swp-theme` | Theme name |
| `data-swp-accent-color` | UI accent color (hex) |

## JavaScript API

```js
const editor = new SWP(container, options)
```

### Sub-APIs
```js
editor.layers        // add, remove, reorder, visibility, opacity, blend mode, lock, toJSON/fromJSON
editor.canvas        // render, resize, composite, clear
editor.selection     // rectangle, ellipse, lasso, march ants display
editor.clipboard     // cut, copy, paste
editor.colors        // foreground/background, palette
editor.filters       // brightness, contrast, saturation, hue, blur, sharpen, grayscale, sepia, invert
editor.history       // undo/redo (20 states)
editor.keyboard      // shortcut registration
editor.tools         // Move, Marquee, Crop, Rotate, Flip, Resize, Brush, Eraser, Gradient, Fill, Shape, Text, Eyedropper, Zoom, Hand, Filter
```

### Events
`ready`, `change`, `error`, plus tool/layer/history/canvas/selection/filter/color-specific events

Use `editor.on()`, `editor.once()`, and `editor.off()` for public event subscriptions. Both `on()` and `once()` return unsubscribe functions.
The `ready` event is deferred to a microtask so callers can subscribe immediately after `new SWP(...)`.

### Lifecycle

- `editor.destroy()` is idempotent and must release tool, keyboard, selection, canvas, UI, and event-listener resources.
- Auto-initialized editors are tracked in `SWP.instances` and on `element.swpInstance`.
- Destroying an auto-initialized editor must remove both references so `SWP.autoInit()` can initialize the same element again.

## Focus Areas

- Layer compositing: 24 blend modes (multiply, screen, overlay, etc.), opacity, visibility, lock
- Drawing tools: brush size/opacity, eraser, gradient (linear/radial), shape primitives, text with font selection
- Selection: rectangle, ellipse, lasso with marching ants animation; cut/copy/paste within selection bounds
- Filters: non-destructive filter application to layers
- History: 20-state undo/redo stack
- File I/O: load PNG/JPEG/WebP, save canvas to PNG/JPEG/WebP
- Layer serialization: toJSON()/fromJSON() for persistence
- Performance: large canvases, many layers, brush stroke rate

## Implementation Guidance

- Preserve backward compatibility for all sub-API method names and event types
- Preserve the auto-init lifecycle: initialize once, track once, remove references on destroy, and allow re-initialization
- Always visually verify canvas output after rendering changes
- Test layer composition correctness with various blend modes
- Check selection tool accuracy and clipboard behavior

## Validation

```bash
npm run build
npm run start    # webpack serve for visual verification
npm test         # placeholder; expected to fail until a test suite is added
```
