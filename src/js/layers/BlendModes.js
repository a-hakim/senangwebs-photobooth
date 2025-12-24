/**
 * SenangWebs Studio - Blend Modes
 * Custom blend mode implementations for pixel-level operations
 * @version 2.0.0
 */

/**
 * Blend mode functions
 * Each function takes two values (base and blend) and returns the result
 * Values are normalized to 0-1 range
 */
export const BlendModes = {
  // Normal
  normal: (base, blend) => blend,

  // Darken modes
  darken: (base, blend) => Math.min(base, blend),
  
  multiply: (base, blend) => base * blend,
  
  colorBurn: (base, blend) => {
    if (blend === 0) return 0;
    return Math.max(0, 1 - (1 - base) / blend);
  },
  
  linearBurn: (base, blend) => Math.max(0, base + blend - 1),
  
  // Lighten modes
  lighten: (base, blend) => Math.max(base, blend),
  
  screen: (base, blend) => 1 - (1 - base) * (1 - blend),
  
  colorDodge: (base, blend) => {
    if (blend === 1) return 1;
    return Math.min(1, base / (1 - blend));
  },
  
  linearDodge: (base, blend) => Math.min(1, base + blend),
  
  // Contrast modes
  overlay: (base, blend) => {
    return base < 0.5 
      ? 2 * base * blend 
      : 1 - 2 * (1 - base) * (1 - blend);
  },
  
  softLight: (base, blend) => {
    if (blend < 0.5) {
      return base - (1 - 2 * blend) * base * (1 - base);
    }
    const d = base <= 0.25 
      ? ((16 * base - 12) * base + 4) * base 
      : Math.sqrt(base);
    return base + (2 * blend - 1) * (d - base);
  },
  
  hardLight: (base, blend) => {
    return blend < 0.5 
      ? 2 * base * blend 
      : 1 - 2 * (1 - base) * (1 - blend);
  },
  
  vividLight: (base, blend) => {
    if (blend < 0.5) {
      return blend === 0 ? 0 : Math.max(0, 1 - (1 - base) / (2 * blend));
    }
    return blend === 1 ? 1 : Math.min(1, base / (2 * (1 - blend)));
  },
  
  linearLight: (base, blend) => {
    return Math.max(0, Math.min(1, base + 2 * blend - 1));
  },
  
  pinLight: (base, blend) => {
    if (blend < 0.5) {
      return Math.min(base, 2 * blend);
    }
    return Math.max(base, 2 * blend - 1);
  },
  
  hardMix: (base, blend) => {
    return (base + blend >= 1) ? 1 : 0;
  },
  
  // Inversion modes
  difference: (base, blend) => Math.abs(base - blend),
  
  exclusion: (base, blend) => base + blend - 2 * base * blend,
  
  subtract: (base, blend) => Math.max(0, base - blend),
  
  divide: (base, blend) => {
    if (blend === 0) return 1;
    return Math.min(1, base / blend);
  },
  
  // Component modes (require special handling for HSL)
  hue: null, // Handled separately
  saturation: null,
  color: null,
  luminosity: null
};

/**
 * Apply blend mode to two image data arrays
 * @param {ImageData} baseData - Base image data
 * @param {ImageData} blendData - Blend image data
 * @param {string} mode - Blend mode name
 * @param {number} opacity - Opacity (0-1)
 * @returns {ImageData}
 */
export function applyBlendMode(baseData, blendData, mode, opacity = 1) {
  const base = baseData.data;
  const blend = blendData.data;
  const result = new Uint8ClampedArray(base.length);
  
  const blendFn = BlendModes[mode];
  
  if (!blendFn) {
    // Handle HSL-based blend modes
    if (['hue', 'saturation', 'color', 'luminosity'].includes(mode)) {
      return applyHSLBlendMode(baseData, blendData, mode, opacity);
    }
    // Default to normal
    for (let i = 0; i < base.length; i += 4) {
      const alpha = (blend[i + 3] / 255) * opacity;
      result[i] = base[i] * (1 - alpha) + blend[i] * alpha;
      result[i + 1] = base[i + 1] * (1 - alpha) + blend[i + 1] * alpha;
      result[i + 2] = base[i + 2] * (1 - alpha) + blend[i + 2] * alpha;
      result[i + 3] = Math.min(255, base[i + 3] + blend[i + 3] * opacity);
    }
    return new ImageData(result, baseData.width, baseData.height);
  }
  
  for (let i = 0; i < base.length; i += 4) {
    const blendAlpha = (blend[i + 3] / 255) * opacity;
    
    if (blendAlpha === 0) {
      result[i] = base[i];
      result[i + 1] = base[i + 1];
      result[i + 2] = base[i + 2];
      result[i + 3] = base[i + 3];
      continue;
    }
    
    // Apply blend function to each channel
    for (let c = 0; c < 3; c++) {
      const baseVal = base[i + c] / 255;
      const blendVal = blend[i + c] / 255;
      const blended = blendFn(baseVal, blendVal);
      
      // Mix based on blend alpha
      const mixed = baseVal * (1 - blendAlpha) + blended * blendAlpha;
      result[i + c] = Math.round(mixed * 255);
    }
    
    // Combine alpha
    result[i + 3] = Math.min(255, base[i + 3] + blend[i + 3] * opacity);
  }
  
  return new ImageData(result, baseData.width, baseData.height);
}

/**
 * Apply HSL-based blend mode
 * @param {ImageData} baseData - Base image data
 * @param {ImageData} blendData - Blend image data
 * @param {string} mode - Blend mode (hue, saturation, color, luminosity)
 * @param {number} opacity - Opacity (0-1)
 * @returns {ImageData}
 */
function applyHSLBlendMode(baseData, blendData, mode, opacity) {
  const base = baseData.data;
  const blend = blendData.data;
  const result = new Uint8ClampedArray(base.length);
  
  for (let i = 0; i < base.length; i += 4) {
    const blendAlpha = (blend[i + 3] / 255) * opacity;
    
    if (blendAlpha === 0) {
      result[i] = base[i];
      result[i + 1] = base[i + 1];
      result[i + 2] = base[i + 2];
      result[i + 3] = base[i + 3];
      continue;
    }
    
    const baseHSL = rgbToHsl(base[i], base[i + 1], base[i + 2]);
    const blendHSL = rgbToHsl(blend[i], blend[i + 1], blend[i + 2]);
    
    let resultHSL;
    switch (mode) {
      case 'hue':
        resultHSL = [blendHSL[0], baseHSL[1], baseHSL[2]];
        break;
      case 'saturation':
        resultHSL = [baseHSL[0], blendHSL[1], baseHSL[2]];
        break;
      case 'color':
        resultHSL = [blendHSL[0], blendHSL[1], baseHSL[2]];
        break;
      case 'luminosity':
        resultHSL = [baseHSL[0], baseHSL[1], blendHSL[2]];
        break;
      default:
        resultHSL = baseHSL;
    }
    
    const rgb = hslToRgb(...resultHSL);
    
    // Mix based on blend alpha
    result[i] = Math.round(base[i] * (1 - blendAlpha) + rgb[0] * blendAlpha);
    result[i + 1] = Math.round(base[i + 1] * (1 - blendAlpha) + rgb[1] * blendAlpha);
    result[i + 2] = Math.round(base[i + 2] * (1 - blendAlpha) + rgb[2] * blendAlpha);
    result[i + 3] = Math.min(255, base[i + 3] + blend[i + 3] * opacity);
  }
  
  return new ImageData(result, baseData.width, baseData.height);
}

/**
 * Convert RGB to HSL
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {number[]} [h, s, l] (0-1 range)
 */
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  
  if (max === min) {
    return [0, 0, l];
  }
  
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  
  let h;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    case b:
      h = ((r - g) / d + 4) / 6;
      break;
  }
  
  return [h, s, l];
}

/**
 * Convert HSL to RGB
 * @param {number} h - Hue (0-1)
 * @param {number} s - Saturation (0-1)
 * @param {number} l - Lightness (0-1)
 * @returns {number[]} [r, g, b] (0-255 range)
 */
function hslToRgb(h, s, l) {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  
  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255)
  ];
}

/**
 * Get list of available blend modes
 * @returns {Object[]} Blend mode options
 */
export function getBlendModeList() {
  return [
    { group: 'Normal', modes: ['normal'] },
    { group: 'Darken', modes: ['darken', 'multiply', 'colorBurn', 'linearBurn'] },
    { group: 'Lighten', modes: ['lighten', 'screen', 'colorDodge', 'linearDodge'] },
    { group: 'Contrast', modes: ['overlay', 'softLight', 'hardLight', 'vividLight', 'linearLight', 'pinLight', 'hardMix'] },
    { group: 'Inversion', modes: ['difference', 'exclusion', 'subtract', 'divide'] },
    { group: 'Component', modes: ['hue', 'saturation', 'color', 'luminosity'] }
  ];
}

/**
 * Get human-readable blend mode name
 * @param {string} mode - Blend mode key
 * @returns {string} Human-readable name
 */
export function getBlendModeName(mode) {
  const names = {
    normal: 'Normal',
    darken: 'Darken',
    multiply: 'Multiply',
    colorBurn: 'Color Burn',
    linearBurn: 'Linear Burn',
    lighten: 'Lighten',
    screen: 'Screen',
    colorDodge: 'Color Dodge',
    linearDodge: 'Linear Dodge (Add)',
    overlay: 'Overlay',
    softLight: 'Soft Light',
    hardLight: 'Hard Light',
    vividLight: 'Vivid Light',
    linearLight: 'Linear Light',
    pinLight: 'Pin Light',
    hardMix: 'Hard Mix',
    difference: 'Difference',
    exclusion: 'Exclusion',
    subtract: 'Subtract',
    divide: 'Divide',
    hue: 'Hue',
    saturation: 'Saturation',
    color: 'Color',
    luminosity: 'Luminosity'
  };
  return names[mode] || mode;
}

export default BlendModes;
