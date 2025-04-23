// src/utils/ColorMixin.js
/**
 * Преобразует цвет в массив [r, g, b] в диапазоне 0…1
 * Поддерживает:
 *   • '#RRGGBB', '#RGB', '#RRGGBBAA', '#RGBA'
 *   • массив float-ов [r, g, b] (уже нормализованный)
 *   • CSS-имена цвета ('red', 'skyblue' и т. д.)
 */
export function ColorMixin(color) {
  /* Уже нормализованный массив */
  if (Array.isArray(color)) {
    if (color.length >= 3) return color.slice(0, 3);
    throw new Error('Color array must have at least 3 components');
  }

  /* Hex-строка */
  if (typeof color === 'string' && color[0] === '#') {
    const hex = color.slice(1);
    const expand = hex.length === 3 || hex.length === 4;

    const toFloat = (idx) => {
      const h = hex.slice(idx, idx + (expand ? 1 : 2));
      return parseInt(expand ? h + h : h, 16) / 255;
    };

    if ([3, 4, 6, 8].includes(hex.length)) {
      return [toFloat(0), toFloat(expand ? 1 : 2), toFloat(expand ? 2 : 4)];
    }
    throw new Error(`Unsupported hex length: #${hex}`);
  }

  /* Имя цвета → парсим через временный <canvas> */
  if (typeof color === 'string') {
    const tmp = document.createElement('canvas').getContext('2d');
    tmp.fillStyle = color;                                // браузер конвертирует
    const m = tmp.fillStyle.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (m) return [+m[1] / 255, +m[2] / 255, +m[3] / 255];
  }

  throw new Error(`ColorMixin: unsupported color format → ${color}`);
}
