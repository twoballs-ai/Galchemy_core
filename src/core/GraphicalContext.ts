// src/core/GraphicalContext.js
import { WebGLRenderer } from './Renderer/WebGLRenderer.js';
import { ColorMixin }    from '../utils/ColorMixin.js';

export class GraphicalContext {
  constructor(canvasId, background = '#000', width = 800, height = 600) {
    /* Canvas */
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) throw new Error(`Canvas "${canvasId}" not found`);
    this.canvas.width  = width;
    this.canvas.height = height;

  this.ctx = this.canvas.getContext('webgl2') as WebGL2RenderingContext;
  if (!this.ctx) throw new Error('WebGL2 is not supported in this browser');
      /* Цвет очистки */
    const clearColor = ColorMixin(background);
    this.renderer    = new WebGLRenderer(this, clearColor);
  }

  getContext()  { return this.ctx;    }
  getCanvas()   { return this.canvas; }
  getRenderer() { return this.renderer; }

resize(w, h) {
  this.canvas.width  = w;
  this.canvas.height = h;
  this.ctx.viewport(0, 0, w, h);
  this.renderer.resize?.(w, h);          // уведомляем рендерер
}
}
