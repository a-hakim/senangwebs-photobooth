# SenangWebs Photobooth (SWP)

A lightweight and easy-to-use JavaScript library for client-side photo editing. No dependencies, no server-side processing - everything happens in your browser!

![SenangWebs Photobooth Preview](https://raw.githubusercontent.com/a-hakim/senangwebs-photobooth/master/swp_preview.png)

## Quick Start

### Development

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

   This will start a dev server at `http://localhost:3000` with hot reloading.

3. **Build for production:**

   ```bash
   npm run build
   ```

   This creates optimized files in the `dist/` directory.

### Using the Library

#### Include the built files:

```html
<link rel="stylesheet" href="dist/swp.min.css" />
<script src="dist/swp.min.js"></script>
```

#### Or use source files directly:

```html
<link rel="stylesheet" href="src/css/swp.css" />
<script src="src/js/swp.js"></script>
```

## Features

- Cropping\*\* - Select and crop image areas with predefined aspect ratios
- Rotating\*\* - Rotate images in 90-degree increments
- Flipping\*\* - Flip images horizontally and vertically
- Adjustments\*\* - Fine-tune brightness, contrast, and saturation
- Filters\*\* - Apply pre-defined filters (Grayscale, Sepia, Invert, Blur)
- **Export** - Save edited images in JPEG or PNG format

## Usage

### Programmatic Approach

```html
<div id="photobooth-container"></div>

<script>
  const container = document.getElementById("photobooth-container");
  const swp = new SWP(container, {
    imageUrl: "path/to/your/image.jpg",
    width: 800,
    height: 600,
  });

  // Listen to events
  swp.on("load", () => console.log("Image loaded"));
  swp.on("change", () => console.log("Image changed"));
  swp.on("save", () => console.log("Image saved"));
</script>
```

### Declarative Approach

Use HTML data attributes for zero-JavaScript configuration:

```html
<!-- Basic -->
<div data-swp></div>

<!-- With configuration -->
<div
  data-swp
  data-swp-width="900"
  data-swp-height="600"
  data-swp-show-labels="false"
></div>

<!-- With custom labels (simple format) -->
<div
  data-swp
  data-swp-labels="upload: 'Muat Naik'; save: 'Simpan'; reset: 'Set Semula'"
></div>

<!-- With custom labels (JSON format) -->
<div
  data-swp
  data-swp-labels='{"upload":"Télécharger","save":"Enregistrer"}'
></div>
```

**Available Data Attributes:**

- `data-swp` - Enable auto-initialization
- `data-swp-width` - Canvas width (number)
- `data-swp-height` - Canvas height (number)
- `data-swp-image-url` - Initial image URL
- `data-swp-show-icons` - Show/hide icons ("true" or "false")
- `data-swp-show-labels` - Show/hide labels ("true" or "false")
- `data-swp-labels` - Custom labels (see formats above)

The library will automatically initialize when the DOM is ready.

## API Reference

### Initialization

```javascript
const swp = new SWP(container, options);
```

**Options:**

- `imageUrl` (String) - URL of the image to load
- `width` (Number) - Width of the editor in pixels (default: 800)
- `height` (Number) - Height of the editor in pixels (default: 600)
- `showIcons` (Boolean) - Show icons in toolbar buttons (default: true)
- `showLabels` (Boolean) - Show text labels in toolbar buttons (default: true)
- `labels` (Object) - Custom labels for toolbar buttons
  - `upload` (String|null) - Label for upload button (default: 'Upload')
  - `rotateLeft` (String|null) - Label for rotate left button (default: null)
  - `rotateRight` (String|null) - Label for rotate right button (default: null)
  - `flipH` (String|null) - Label for flip horizontal button (default: null)
  - `flipV` (String|null) - Label for flip vertical button (default: null)
  - `resize` (String|null) - Label for resize button (default: 'Resize')
  - `adjust` (String|null) - Label for adjustments button (default: 'Adjust')
  - `filters` (String|null) - Label for filters button (default: 'Filters')
  - `reset` (String|null) - Label for reset button (default: 'Reset')
  - `save` (String|null) - Label for save button (default: 'Save')

**Customization Examples:**

```javascript
// Icons only (compact view)
const swp = new SWP(container, {
  showLabels: false,
});

// Custom labels (multilingual support)
const swp = new SWP(container, {
  labels: {
    upload: "Télécharger",
    save: "Enregistrer",
    reset: "Réinitialiser",
  },
});

// Hide specific labels (set to null)
const swp = new SWP(container, {
  labels: {
    rotateLeft: null, // No label, icon only
    rotateRight: null,
  },
});

// Show labels for rotate and flip buttons
const swp = new SWP(container, {
  labels: {
    rotateLeft: "Rotate Left",
    rotateRight: "Rotate Right",
    flipH: "Flip Horizontal",
    flipV: "Flip Vertical",
  },
});
```

**Note:** By default, `rotateLeft`, `rotateRight`, `flipH`, and `flipV` have `null` labels (icon-only display) to keep the toolbar compact. You can add custom labels to these buttons as shown above.

### Methods

#### `loadImage(imageUrl)`

Load a new image into the editor.

```javascript
swp.loadImage("path/to/image.jpg");
```

#### `rotate(degrees)`

Rotate the image by specified degrees.

```javascript
swp.rotate(90); // Rotate 90 degrees clockwise
swp.rotate(-90); // Rotate 90 degrees counter-clockwise
```

#### `flip(direction)`

Flip the image horizontally or vertically.

```javascript
swp.flip("horizontal");
swp.flip("vertical");
```

#### `setAdjustment(adjustment, value)`

Apply adjustments to the image.

```javascript
swp.setAdjustment("brightness", 150); // Range: 0-200
swp.setAdjustment("contrast", 120); // Range: 0-200
swp.setAdjustment("saturation", 80); // Range: 0-200
```

#### `applyFilter(filterName)`

Apply a pre-defined filter.

```javascript
swp.applyFilter("grayscale");
swp.applyFilter("sepia");
swp.applyFilter("invert");
swp.applyFilter("blur");
swp.applyFilter("none"); // Remove filter
```

#### `crop(x, y, width, height)`

Crop the image to specified dimensions.

```javascript
swp.crop(100, 100, 400, 300);
```

#### `reset()`

Reset all edits and revert to original image.

```javascript
swp.reset();
```

#### `getImageData(format, quality)`

Export the edited image data.

```javascript
const dataUrl = swp.getImageData("png"); // PNG format
const dataUrl = swp.getImageData("jpeg", 0.9); // JPEG with 90% quality
```

### Events

Listen to events using the `on()` method:

```javascript
swp.on("load", () => {
  console.log("Image loaded successfully");
});

swp.on("change", () => {
  console.log("Image has been edited");
});

swp.on("save", () => {
  console.log("Image saved");
});
```

## NPM Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Future Enhancements

- More filters and adjustments
- Text and sticker overlays
- Touch gesture support
- Framework integrations (React, Vue, Angular)
