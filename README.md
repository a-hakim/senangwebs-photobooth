# SenangWebs Photobooth (SWP)

A lightweight and easy-to-use JavaScript library for client-side photo editing. No dependencies, no server-side processing - everything happens in your browser!

## 🚀 Quick Start

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
<link rel="stylesheet" href="dist/swp.min.css">
<script src="dist/swp.min.js"></script>
```

#### Or use source files directly:

```html
<link rel="stylesheet" href="src/css/swp.css">
<script src="src/js/swp.js"></script>
```

## 📦 Features

- ✂️ **Cropping** - Select and crop image areas with predefined aspect ratios
- 🔄 **Rotating** - Rotate images in 90-degree increments
- ↔️ **Flipping** - Flip images horizontally and vertically
- 🎨 **Adjustments** - Fine-tune brightness, contrast, and saturation
- ✨ **Filters** - Apply pre-defined filters (Grayscale, Sepia, Invert, Blur)
- 💾 **Export** - Save edited images in JPEG or PNG format

## 💻 Usage

### Programmatic Approach

```html
<div id="photobooth-container"></div>

<script>
    const container = document.getElementById('photobooth-container');
    const swp = new SWP(container, {
        imageUrl: 'path/to/your/image.jpg',
        width: 800,
        height: 600
    });

    // Listen to events
    swp.on('load', () => console.log('Image loaded'));
    swp.on('change', () => console.log('Image changed'));
    swp.on('save', () => console.log('Image saved'));
</script>
```

### Declarative Approach

```html
<div data-swp>
    <div data-swp-tools></div>
    <div data-swp-canvas></div>
</div>
```

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

### Methods

#### `loadImage(imageUrl)`
Load a new image into the editor.

```javascript
swp.loadImage('path/to/image.jpg');
```

#### `rotate(degrees)`
Rotate the image by specified degrees.

```javascript
swp.rotate(90);  // Rotate 90 degrees clockwise
swp.rotate(-90); // Rotate 90 degrees counter-clockwise
```

#### `flip(direction)`
Flip the image horizontally or vertically.

```javascript
swp.flip('horizontal');
swp.flip('vertical');
```

#### `setAdjustment(adjustment, value)`
Apply adjustments to the image.

```javascript
swp.setAdjustment('brightness', 150); // Range: 0-200
swp.setAdjustment('contrast', 120);   // Range: 0-200
swp.setAdjustment('saturation', 80);  // Range: 0-200
```

#### `applyFilter(filterName)`
Apply a pre-defined filter.

```javascript
swp.applyFilter('grayscale');
swp.applyFilter('sepia');
swp.applyFilter('invert');
swp.applyFilter('blur');
swp.applyFilter('none'); // Remove filter
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
const dataUrl = swp.getImageData('png');        // PNG format
const dataUrl = swp.getImageData('jpeg', 0.9);  // JPEG with 90% quality
```

### Events

Listen to events using the `on()` method:

```javascript
swp.on('load', () => {
    console.log('Image loaded successfully');
});

swp.on('change', () => {
    console.log('Image has been edited');
});

swp.on('save', () => {
    console.log('Image saved');
});
```

## Browser Compatibility

SWP works on all modern browsers that support HTML5 Canvas API and CSS filters:

- ✅ Chrome (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Edge (latest 2 versions)
- ✅ Safari (latest 2 versions)

## 📁 Project Structure

```
senangwebs-photobooth/
├── src/
│   ├── css/
│   │   └── swp.css           # Source styles
│   ├── js/
│   │   └── swp.js            # Source library
│   └── index.html            # Demo page
├── dist/                     # Built files
│   ├── swp.min.js           # Minified library (~10KB)
│   ├── swp.min.css          # Minified styles (~4KB)
│   └── index.html           # Demo
├── webpack.config.js         # Build config
├── package.json              # Dependencies
└── README.md                 # Documentation
```

## 🔧 NPM Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run watch` - Watch mode for development
- `npm run clean` - Clean dist directory

## 🌐 Browser Compatibility

SWP works on all modern browsers that support HTML5 Canvas API and CSS filters:

- ✅ Chrome (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Edge (latest 2 versions)
- ✅ Safari (latest 2 versions)

## 📝 License

MIT License - Feel free to use in your projects!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🎯 Future Enhancements

- More filters and adjustments
- Text and sticker overlays
- Undo/Redo functionality
- Touch gesture support
- Framework integrations (React, Vue, Angular)

---

Built with ❤️ by SenangWebs
