// src/core/GraphicalContext.js
import { CanvasRenderer } from './Renderer/CanvasRenderer.js';
import { WebGLRenderer }  from './Renderer/WebGLRenderer2D.js';
import { WebGPURenderer } from './Renderer/WebGPURenderer.js';
import { ColorMixin }     from '../utils/ColorMixin.js';

export class GraphicalContext {
  constructor(canvasId, type, bg, w, h) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) throw new Error(`Canvas "${canvasId}" not found`);
    this.canvas.width  = w;
    this.canvas.height = h;

    // контекст
    if (type === '2d')    this.ctx = this.canvas.getContext('2d');
    else if (type === 'webgl')  this.ctx = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    else if (type === 'webgpu') this.ctx = this.canvas.getContext('webgpu');
    else throw new Error(`Unsupported context type: ${type}`);

    // нормализуем цвет
    const normalizedBg = ColorMixin(bg, type);

    // выбираем рендерер
    switch (type) {
      case '2d':
        this.renderer = new CanvasRenderer(this, normalizedBg);
        break;
      case 'webgl':
        this.renderer = new WebGLRenderer(this, normalizedBg);
        break;
      case 'webgpu':
        this.renderer = new WebGPURenderer(this, normalizedBg);
        break;
    }
  }

  getContext()  { return this.ctx; }
  getCanvas()   { return this.canvas; }
  getRenderer(){ return this.renderer; }

  resize(width, height) {
    this.canvas.width  = width;
    this.canvas.height = height;
    // при необходимости переконфигурировать контекст/рендерер...
  }
}
