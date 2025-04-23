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

    render(scene, debug = false) {
        this.clear();
        const sorted = [...scene.objects].sort((a, b) => (a.layer||0) - (b.layer||0));
        for (const obj of sorted) {
          if (typeof obj.render === 'function') obj.render(this.ctx);
        }
    
        if (debug) this._drawDebugOverlay(scene);
      }
    
      _drawDebugOverlay(scene) {
        const ctx = this.ctx;
        ctx.save();
        ctx.font = '12px monospace';
        ctx.fillStyle = 'white';
        ctx.textBaseline = 'top';
    
        scene.objects.forEach(o => {
          if (!o.x || !o.y) return;
          const label = `${o.image?.src?.split('/').pop()||'obj'}  x:${o.x.toFixed(1)} y:${o.y.toFixed(1)}`;
          ctx.fillText(label, o.x, o.y - 14);
        });
        ctx.restore();
      }
}
