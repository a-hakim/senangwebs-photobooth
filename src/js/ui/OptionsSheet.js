/**
 * SenangWebs Photobooth - Options Sheet
 * Generic renderer for tool getOptionsUI() definitions
 */

export class OptionsSheet {
  constructor(app, ui) {
    this.app = app;
    this.ui = ui;
  }

  /**
   * Render a tool's options into a container element
   * @param {HTMLElement} container - Target container (submenu element)
   * @param {BaseTool} tool - Active tool instance
   * @param {string} toolName - Tool name
   * @returns {boolean} Whether anything was rendered
   */
  render(container, tool, toolName) {
    if (!tool || typeof tool.getOptionsUI !== 'function') return false;
    const options = tool.getOptionsUI();
    const keys = Object.keys(options || {});
    if (keys.length === 0) return false;

    const title = this._titleFor(toolName);

    const groups = keys.map(key => {
      const opt = options[key];
      return this._renderControl(key, opt, tool, toolName);
    }).join('');

    container.innerHTML = `
      <div class="swp-submenu-content">
        <div class="swp-submenu-title">${title}</div>
        ${groups}
      </div>
    `;

    this._bindControls(container, tool, options);
    return true;
  }

  _titleFor(toolName) {
    const titles = {
      move: 'Move',
      marquee: 'Select',
      brush: 'Draw',
      eraser: 'Erase',
      shape: 'Shape',
      text: 'Text',
      crop: 'Crop',
      zoom: 'Zoom',
      hand: 'Pan',
      eyedropper: 'Color Picker',
      gradient: 'Gradient',
      fill: 'Fill'
    };
    return titles[toolName] || 'Options';
  }

  _renderControl(key, opt, tool, toolName = '') {
    switch (opt.type) {
      case 'slider':
        return `
          <div class="swp-submenu-group">
            <label class="swp-submenu-label">${opt.label}</label>
            <div class="swp-range-wrap">
              <input type="range" class="swp-slider" data-opt-key="${key}"
                min="${opt.min ?? 0}" max="${opt.max ?? 100}" value="${opt.value}">
              <span class="swp-range-value">${opt.value}${opt.unit || ''}</span>
            </div>
          </div>
        `;
      case 'select':
        if (toolName === 'crop' && key === 'aspectRatio') {
          return this._renderChips(key, opt);
        }
        if ((opt.options?.length || 0) <= 3 && opt.type !== 'button') {
          return this._renderChips(key, opt);
        }
        return `
          <div class="swp-submenu-group">
            <label class="swp-submenu-label">${opt.label}</label>
            <select class="swp-select" data-opt-key="${key}">
              ${opt.options.map(o => `
                <option value="${o.value}" ${o.value === opt.value ? 'selected' : ''}>${o.label}</option>
              `).join('')}
            </select>
          </div>
        `;
      case 'checkbox':
        return `
          <div class="swp-submenu-group">
            <label class="swp-checkbox-label">
              <input type="checkbox" data-opt-key="${key}" ${opt.value ? 'checked' : ''}>
              <span>${opt.label}</span>
            </label>
          </div>
        `;
      case 'color':
        return `
          <div class="swp-submenu-group">
            <label class="swp-submenu-label">${opt.label}</label>
            <input type="color" class="swp-color-input" data-opt-key="${key}" value="${opt.value || '#000000'}">
          </div>
        `;
      case 'button':
        return `
          <div class="swp-submenu-group">
            <button class="swp-btn" data-opt-action="${key}">${opt.label}</button>
          </div>
        `;
      default:
        return '';
    }
  }

  _renderChips(key, opt) {
    return `
      <div class="swp-submenu-group">
        <label class="swp-submenu-label">${opt.label}</label>
        <div class="swp-btn-group swp-btn-group-wrap" data-chip-group="${key}">
          ${opt.options.map(o => `
            <button type="button" class="swp-submenu-btn ${o.value === opt.value ? 'active' : ''}" data-opt-key="${key}" data-opt-value="${o.value}">
              ${o.label}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  _bindControls(container, tool, options) {
    // Sliders
    container.querySelectorAll('input[type="range"][data-opt-key]').forEach(input => {
      const key = input.dataset.optKey;
      const valueEl = input.parentElement.querySelector('.swp-range-value');
      const unit = options[key]?.unit || '';
      input.addEventListener('input', (e) => {
        const value = parseInt(e.target.value, 10);
        if (valueEl) valueEl.textContent = `${value}${unit}`;
        tool.setOption(key, value);
      });
    });

    // Selects
    container.querySelectorAll('select[data-opt-key]').forEach(select => {
      const key = select.dataset.optKey;
      select.addEventListener('change', (e) => {
        tool.setOption(key, e.target.value);
      });
    });

    // Checkboxes
    container.querySelectorAll('input[type="checkbox"][data-opt-key]').forEach(checkbox => {
      const key = checkbox.dataset.optKey;
      checkbox.addEventListener('change', (e) => {
        tool.setOption(key, e.target.checked);
      });
    });

    // Colors
    container.querySelectorAll('input[type="color"][data-opt-key]').forEach(color => {
      const key = color.dataset.optKey;
      color.addEventListener('input', (e) => {
        tool.setOption(key, e.target.value);
      });
    });

    // Chip groups
    container.querySelectorAll('[data-chip-group]').forEach(group => {
      const key = group.dataset.chipGroup;
      group.querySelectorAll('.swp-submenu-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          group.querySelectorAll('.swp-submenu-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const value = btn.dataset.optValue;
          if (key === 'aspectRatio') {
            if (value === 'free') {
              tool.setAspectRatio(null);
            } else {
              const [w, h] = value.split(':').map(Number);
              tool.setAspectRatio(Number.isFinite(w) && Number.isFinite(h) ? w / h : null);
            }
          } else {
            const numeric = Number(value);
            tool.setOption(key, value !== '' && !Number.isNaN(numeric) ? numeric : value);
          }
        });
      });
    });

    // Buttons
    container.querySelectorAll('[data-opt-action]').forEach(btn => {
      const action = options[btn.dataset.optAction]?.action;
      if (typeof action === 'function') {
        btn.addEventListener('click', action);
      }
    });
  }
}

export default OptionsSheet;
