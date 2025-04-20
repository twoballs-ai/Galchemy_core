// src/utils/ColorMixin.js
export function ColorMixin(color, type = '2d') {
    // Для 2D просто возвращаем CSS‑строку
    if (type === '2d') return color;
  
    // WebGL/WebGPU: конвертим hex‑цвет в [0..1]
    // Поддерживаем только формы "#RRGGBB" или "#RGB"
    let r, g, b;
    if (typeof color === 'string' && color[0] === '#') {
      if (color.length === 7) {
        r = parseInt(color.substr(1,2), 16);
        g = parseInt(color.substr(3,2), 16);
        b = parseInt(color.substr(5,2), 16);
      } else if (color.length === 4) {
        r = parseInt(color[1] + color[1], 16);
        g = parseInt(color[2] + color[2], 16);
        b = parseInt(color[3] + color[3], 16);
      } else {
        throw new Error(`Unsupported hex format: ${color}`);
      }
    } else {
      // при желании сюда можно добавить разбор именованных цветов
      throw new Error(`ColorMixin: only hex strings supported for ${type}`);
    }
  
    return [r/255, g/255, b/255];
  }
  