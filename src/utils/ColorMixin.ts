/**
 * Преобразует цвет в массив [r, g, b] (0…1).
 * При Hex-строке использует hexToRGB() ниже.
 */
export function ColorMixin(color) {
  /* Уже float-массив */
  if (Array.isArray(color)) {
    if (color.length >= 3) return color.slice(0, 3);
    throw new Error('Color array must have at least 3 components');
  }

  /* Hex */
  if (typeof color === 'string' && color[0] === '#') {
    return hexToRGB(color).slice(0, 3);      // ← используем новую функцию
  }

  /* Имя цвета → canvas-парсер */
  if (typeof color === 'string') {
    const tmp = document.createElement('canvas').getContext('2d');
    tmp.fillStyle = color;
    const m = tmp.fillStyle.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (m) return [+m[1]/255, +m[2]/255, +m[3]/255];
  }

  throw new Error(`ColorMixin: unsupported color format → ${color}`);
}

/* --------------------------------------------------------------------- */
/* Публичная утилита: hex-строка → [r,g,b,(a)] в диапазоне 0…1           */
/* Поддерживает #RGB #RRGGBB #RGBA #RRGGBBAA                              */
export function hexToRGB(hex) {
  if (typeof hex !== 'string' || hex[0] !== '#')
    throw new Error('hexToRGB: argument must be a hex color string');

  const h = hex.slice(1);
  const expand = h.length === 3 || h.length === 4;

  const read = (i) => {
    const s = expand ? h[i] + h[i] : h.slice(i, i + 2);
    return parseInt(s, 16) / 255;
  };

  if ([3, 4, 6, 8].includes(h.length)) {
    const r = read(0);
    const g = read(expand ? 1 : 2);
    const b = read(expand ? 2 : 4);
    const a = (h.length === 4 || h.length === 8) ? read(expand ? 3 : 6) : 1;
    return [r, g, b, a];
  }

  throw new Error(`hexToRGB: unsupported hex length → #${h}`);
}
