import { CanvasRenderer } from './CanvasRenderer.js';
import { WebGLRenderer   } from './WebGLRenderer.js';
import { WebGPURenderer  } from './WebGPURenderer.js';

export class GraphicalContext {
  constructor(canvasId, type, bg, w, h) {
    this.canvas = document.getElementById(canvasId);
    this.canvas.width  = w;
    this.canvas.height = h;

    if (type==='2d')   this.ctx = this.canvas.getContext('2d');
    else if(type==='webgl') this.ctx = this.canvas.getContext('webgl');
    else if(type==='webgpu') this.ctx = this.canvas.getContext('webgpu');
    else throw new Error('Bad render type');

    switch(type) {
      case '2d':   this.renderer = new CanvasRenderer(this, bg);  break;
      case 'webgl':this.renderer = new WebGLRenderer(this, bg);  break;
      case 'webgpu':this.renderer = new WebGPURenderer(this, bg);break;
    }
  }

  getContext()  { return this.ctx; }
  getCanvas()   { return this.canvas; }
  getRenderer(){ return this.renderer; }
}
