export class GameObject {
    constructor({ imageSrc, x, y, width, height, physics = false }) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      
      this.image = new Image();
      this.image.src = imageSrc;
  
      this.physicsBody = physics ? {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        velocity: { x: 0, y: 0 },
        isStatic: false
      } : null;
    }
  
    update(deltaTime) {
      if (this.physicsBody) {
        this.x = this.physicsBody.x;
        this.y = this.physicsBody.y;
      }
    }
  
    render(ctx) {
      if (this.image.complete) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      }
    }
  }
  