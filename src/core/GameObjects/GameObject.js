// src/core/GameObjects/GameObject.js
export class GameObject {
  constructor({
    imageSrc,
    x, y,
    width, height,
    layer     = 0,

    physics   = false,   // участвует в симуляции физики?
    collision = false,   // участвует в проверке столкновений?

    repeatX = false,
    repeatY = false,
    scale   = 1
  }) {
    // позиция и размеры
    this.x = x;
    this.y = y;
    this.width  = width;
    this.height = height;
    this.layer  = layer;

    // флаги
    this.physics = physics;
    this.collision = collision;
    // физическое тело (если нужно)
    this.physicsBody = physics ? {
      x, y, width, height,
      velocity: { x: 0, y: 0 },
      isStatic: false
    } : null;

    // спрайт
    this.image = new Image();
    this.image.src = imageSrc;

    // параметры отрисовки (фон может повторяться)
    this.repeatX = repeatX;
    this.repeatY = repeatY;
    this.scale   = scale;
  }

  /* --------- методы, ожидаемые движком --------- */
  update(dt) {
    /* синхронизируемся с физикой */
    if (this.physicsBody) {
      this.x = this.physicsBody.x;
      this.y = this.physicsBody.y;
    }
  }
  onCollision(other) {}         // вызывается Physics при пересечении

  render(ctx) {
    if (!this.image.complete) return;

    const w = this.width  * this.scale;
    const h = this.height * this.scale;

    if (this.repeatX || this.repeatY) {
      let mode = 'no-repeat';
      if (this.repeatX && this.repeatY) mode = 'repeat';
      else if (this.repeatX)            mode = 'repeat-x';
      else if (this.repeatY)            mode = 'repeat-y';

      const pattern = ctx.createPattern(this.image, mode);
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    } else {
      ctx.drawImage(this.image, this.x, this.y, w, h);
    }
  }
}
