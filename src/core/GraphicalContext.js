import { CanvasRenderer }     from './Renderer/CanvasRenderer.js';
import { WebGLRenderer2D }    from './Renderer/WebGLRenderer2D.js';
import { WebGLRenderer3D }    from './Renderer/WebGLRenderer3D.js';
import { WebGPURenderer }     from './Renderer/WebGPURenderer.js';
import { ColorMixin }         from '../utils/ColorMixin.js';

export class GraphicalContext {
  constructor(canvasId, type, bg, w, h) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) throw new Error(`Canvas "${canvasId}" not found`);
    this.canvas.width  = w;
    this.canvas.height = h;

    // определяем контекст
    switch (type) {
      case '2d':
        this.ctx = this.canvas.getContext('2d');
        break;
      case 'webgl':
      case 'webgl2d':
      case 'webgl3d':
        this.ctx = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        break;
      case 'webgpu':
        this.ctx = this.canvas.getContext('webgpu');
        break;
      default:
        throw new Error(`Unsupported context type: ${type}`);
    }

    // нормализуем цвет
    const normalizedBg = ColorMixin(bg, type);

    // выбираем подходящий рендерер
    switch (type) {
      case '2d':
        this.renderer = new CanvasRenderer(this, normalizedBg);
        break;
      case 'webgl2d':
        this.renderer = new WebGLRenderer2D(this, normalizedBg);
        break;
      case 'webgl':
      case 'webgl3d':
        this.renderer = new WebGLRenderer3D(this, normalizedBg);
        break;
      case 'webgpu':
        this.renderer = new WebGPURenderer(this, normalizedBg);
        break;
    }
  }

  getContext()     { return this.ctx; }
  getCanvas()      { return this.canvas; }
  getRenderer()    { return this.renderer; }

  resize(width, height) {
    this.canvas.width  = width;
    this.canvas.height = height;
    // здесь можно будет пересчитать матрицы проекции при ресайзе
  }
}
