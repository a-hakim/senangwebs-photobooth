# SenangWebs Photobooth (SWP) - Specification

## 1. Introduction

SenangWebs Photobooth (SWP) is a lightweight and easy-to-use JavaScript library for client-side photo editing. It provides a simple and intuitive interface for users to perform basic image manipulations directly in the browser. This document outlines the technical specifications, features, and API of the SWP library.

The primary goal of SWP is to offer a straightforward solution for developers to integrate photo editing capabilities into their web applications without the need for complex server-side processing.

## 2. Features

SWP will provide the following core photo editing features:

### 2.1. Core Manipulations

*   **Cropping:** Users can select an area of the image and crop it to the desired dimensions. This includes options for predefined aspect ratios (e.g., 1:1, 4:3, 16:9) and a freeform selection.
*   **Rotating:** Users can rotate the image in 90-degree increments to the left and right.
*   **Flipping:** Users can flip the image horizontally and vertically.

### 2.2. Adjustments

Users can fine-tune the appearance of the image with the following adjustments:

*   **Brightness:** Increase or decrease the overall lightness of the image.
*   **Contrast:** Adjust the difference between the light and dark areas of the image.
*   **Saturation:** Control the intensity of the colors in the image.

### 2.3. Filters

A selection of pre-defined filters will be available to apply one-click effects to the image. These filters will be implemented using CSS `filter` properties. Initial filters will include:

*   **Grayscale:** Converts the image to shades of gray.
*   **Sepia:** Gives the image a reddish-brown tone.
*   **Invert:** Inverts the colors of the image.
*   **Blur:** Applies a Gaussian blur to the image.

## 3. Technical Specifications

### 3.1. Architecture

SWP is a client-side JavaScript library with no server-side dependencies. It will utilize the HTML5 Canvas API for image rendering and manipulation. This approach ensures that all image processing is done within the user's browser, providing a fast and responsive experience.

### 3.2. Dependencies

The library will have no external dependencies to keep it lightweight and easy to integrate.

### 3.3. Browser Compatibility

SWP will be compatible with all modern web browsers that support the HTML5 Canvas API and the CSS `filter` property. The target browsers include:

*   Google Chrome (latest 2 versions)
*   Mozilla Firefox (latest 2 versions)
*   Microsoft Edge (latest 2 versions)
*   Safari (latest 2 versions)

### 3.4. File Output

The edited image can be exported in the following formats:

*   JPEG
*   PNG

Users will be able to specify the output format and, for JPEG, the image quality.

## 4. API Reference

The SWP library will be instantiated on a container `div` element in the HTML.

### 4.1. Initialization

To initialize the photo booth, create a new instance of `SenangWebsPhotobooth`:

```javascript
const swp = new SWP(container, options);
```

**Parameters:**

*   `container` (HTMLElement): The DOM element that will contain the photo booth interface.
*   `options` (Object): An optional configuration object.

**Options:**

*   `imageUrl` (String): The URL of the image to be loaded into the editor.
*   `width` (Number): The width of the editor in pixels.
*   `height` (Number): The height of the editor in pixels.

### 4.2. Methods

The `swp` instance will expose the following public methods:

#### `loadImage(imageUrl)`

Loads a new image into the editor.

*   **`imageUrl`** (String): The URL of the image to load.

#### `crop(x, y, width, height)`

Crops the image to the specified dimensions.

*   **`x`** (Number): The x-coordinate of the top-left corner of the crop area.
*   **`y`** (Number): The y-coordinate of the top-left corner of the crop area.
*   **`width`** (Number): The width of the crop area.
*   **`height`** (Number): The height of the crop area.

#### `rotate(degrees)`

Rotates the image by the specified degrees.

*   **`degrees`** (Number): The degree of rotation. Positive values rotate clockwise, negative values rotate counter-clockwise. For the initial version, this will be limited to multiples of 90.

#### `flip(direction)`

Flips the image.

*   **`direction`** (String): The direction to flip. Can be `'horizontal'` or `'vertical'`.

#### `setAdjustment(adjustment, value)`

Applies an adjustment to the image.

*   **`adjustment`** (String): The adjustment to apply. Can be `'brightness'`, `'contrast'`, or `'saturation'`.
*   **`value`** (Number): The value of the adjustment. The range will be specific to each adjustment.

#### `applyFilter(filterName)`

Applies a pre-defined filter to the image.

*   **`filterName`** (String): The name of the filter to apply (e.g., `'grayscale'`, `'sepia'`).

#### `reset()`

Resets all edits and reverts the image to its original state.

#### `getImageData(format, quality)`

Exports the edited image data.

*   **`format`** (String): The desired output format (`'jpeg'` or `'png'`). Defaults to `'jpeg'`.
*   **`quality`** (Number): For JPEG format, a number between 0 and 1 representing the image quality. Defaults to 0.9.
*   **Returns:** A data URL representing the image.

### 4.3. Events

The SWP instance will emit the following events that can be listened to:

*   **`'load'`**: Fired when an image has been successfully loaded into the editor.
*   **`'change'`**: Fired whenever an edit is applied to the image.
*   **`'save'`**: Fired when the image data has been successfully exported.

## 5. User Interface

The SWP library will generate a user-friendly interface within the specified container element. The UI will consist of:

*   **Canvas Area:** The main area where the image is displayed and manipulated.
*   **Toolbar:** A toolbar containing buttons for all the editing features (crop, rotate, flip, adjustments, filters).
*   **Adjustment Sliders:** For adjustments like brightness and contrast, sliders will be provided for intuitive control.
*   **Filter Thumbnails:** A gallery of thumbnails will display a preview of each filter effect.

## 6. Example Usage

### HTML/Declarative Approach

```html
<!DOCTYPE html>
<html>
<head>
    <title>SenangWebs Photobooth</title>
    <link rel="stylesheet" href="swp.css">
</head>
<body>
    <!-- Basic initialization -->
    <div data-swp></div>
    
    <!-- With configuration -->
    <div data-swp
         data-swp-width="900"
         data-swp-height="600"
         data-swp-show-labels="false"></div>
    
    <!-- With custom labels -->
    <div data-swp
         data-swp-labels="upload: 'Muat Naik'; resize: 'Tukar Saiz'; save: 'Simpan'"></div>

    <script src="swp.js"></script>
</body>
</html>
```

**Supported Data Attributes:**
- `data-swp` - Enables auto-initialization
- `data-swp-width` - Canvas width in pixels
- `data-swp-height` - Canvas height in pixels
- `data-swp-image-url` - URL of image to load on initialization
- `data-swp-show-icons` - Show/hide toolbar icons ("true" or "false")
- `data-swp-show-labels` - Show/hide toolbar labels ("true" or "false")
- `data-swp-labels` - Custom button labels in simple format (`key: 'value'; key2: 'value2'`) or JSON format

### JS/Programmatic Approach

```html
<!DOCTYPE html>
<html>
<head>
    <title>SenangWebs Photobooth</title>
    <link rel="stylesheet" href="senangwebs-photobooth.css">
</head>
<body>
    <div id="photobooth-container"></div>

    <script src="swp.js"></script>
    <script>
        const container = document.getElementById('photobooth-container');
        const options = {
            imageUrl: 'path/to/your/image.jpg',
            width: 800,
            height: 600
        };

        const swp = new SWP(container, options);

        swp.on('change', () => {
            console.log('Image has been edited.');
        });

        // Example of programmatically applying an edit
        // swp.rotate(90);
    </script>
</body>
</html>
```

## 7. Future Enhancements

*   **More Filters and Adjustments:** Addition of more advanced filters and adjustments like temperature, tint, and vibrance.
*   **Text and Stickers:** Ability to add text overlays and stickers to the image.
*   **Redo/Undo Functionality:** A history mechanism to allow users to undo and redo their edits.
*   **Touch Support:** Improved support for touch gestures on mobile devices.
*   **Framework Integration:** Wrappers for popular JavaScript frameworks like React, Vue, and Angular.