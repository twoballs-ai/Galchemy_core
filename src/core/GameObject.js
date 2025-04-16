export class GameObject {
  constructor({
    imageSrc,
    x,
    y,
    width,
    height,
    physics = false,
    repeatX = false,
    repeatY = false,
    scale = 1,
    layer = 0
  }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.layer = layer;

    this.repeatX = repeatX;
    this.repeatY = repeatY;
    this.scale = scale;

    this.image = new Image();
    this.image.src = imageSrc;

    this.physicsBody = physics
      ? {
          x: this.x,
          y: this.y,
          width: this.width,
          height: this.height,
          velocity: { x: 0, y: 0 },
          isStatic: false
        }
      : null;
  }

  update(deltaTime) {
    if (this.physicsBody) {
      this.x = this.physicsBody.x;
      this.y = this.physicsBody.y;
    }
  }

  render(ctx) {
    if (!this.image.complete) return;
  
    const drawWidth = this.width * this.scale;
    const drawHeight = this.height * this.scale;
  
    // Если требуется повторение по одной из осей, формируем корректный тип pattern
    if (this.repeatX || this.repeatY) {
      let repeatType = 'no-repeat';
      if (this.repeatX && this.repeatY) {
        repeatType = 'repeat';
      } else if (this.repeatX && !this.repeatY) {
        repeatType = 'repeat-x';
      } else if (!this.repeatX && this.repeatY) {
        repeatType = 'repeat-y';
      }
  
      const pattern = ctx.createPattern(this.image, repeatType);
      ctx.fillStyle = pattern;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.fillRect(0, 0, drawWidth, drawHeight);
      ctx.restore();
    } else {
      ctx.drawImage(this.image, this.x, this.y, drawWidth, drawHeight);
    }
  }
}
