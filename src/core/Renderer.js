export class Renderer {
    constructor(ctx, backgroundColor) {
      this.ctx = ctx;
      this.bgColor = backgroundColor;
      this.canvas = ctx.canvas;
    }
  
    clear() {
      this.ctx.fillStyle = this.bgColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  
    render(scene) {
      this.clear();
      // Сортировка по слою
      const sortedObjects = [...scene.objects].sort((a, b) => a.layer - b.layer);
      sortedObjects.forEach(obj => obj.render(this.ctx));
    }
  }
  