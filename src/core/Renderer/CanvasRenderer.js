// src/core/Renderer/CanvasRenderer.js
import { Renderer } from './Renderer.js';

export class CanvasRenderer extends Renderer {
  constructor(graphicalContext, backgroundColor) {
    super(graphicalContext.getContext(), backgroundColor);
    this.canvas = graphicalContext.getCanvas();
  }

  clear() {
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  render(scene) {
    this.clear();
    const sorted = [...scene.objects].sort((a, b) => (a.layer||0) - (b.layer||0));
    for (const obj of sorted) {
      if (typeof obj.render === 'function') obj.render(this.ctx);
    }
  }
}
