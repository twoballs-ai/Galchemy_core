export function GridPlugin({ cellSize = 50, color = 'rgba(0,0,0,0.2)' } = {}) {
    return {
      install(core) {
        this.core = core;
      },
      render(ctx, canvas) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
  
        for (let x = 0; x < canvas.width; x += cellSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
  
        for (let y = 0; y < canvas.height; y += cellSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
  
        ctx.restore();
      }
    };
  }
  