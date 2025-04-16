// GameObject.js
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
    layer = 0,
    isEnemy = false,
    fallSpeed = 0,   // скорость падения
    fallOffsetX = 0  // горизонтальное смещение
  }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.layer = layer;

    // Параметры для фона (repeat)
    this.repeatX = repeatX;
    this.repeatY = repeatY;
    this.scale = scale;

    // Если это враг (моб), в update() будем двигать
    this.isEnemy = isEnemy;
    this.fallSpeed = fallSpeed;
    this.fallOffsetX = fallOffsetX;

    // Спрайт
    this.image = new Image();
    this.image.src = imageSrc;

    // Физика
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

  /**
   * Задаёт режим движения для врага (если isEnemy = true).
   * @param {string} pattern - 'static', 'fall', 'fallRandom', 'horizontal', ...
   */
  setMovementPattern(pattern) {
    this.movementPattern = pattern;
    // Простейшие варианты
    if (pattern === 'static') {
      this.fallSpeed = 0;
      this.fallOffsetX = 0;
    }
    else if (pattern === 'fall') {
      this.fallSpeed = 100;  // падает вниз со скоростью 100
      this.fallOffsetX = 0;
    }
    else if (pattern === 'fallRandom') {
      this.fallSpeed = 100 + Math.random() * 50;      // 100..150
      this.fallOffsetX = (Math.random() < 0.5)
        ? Math.random() * 20
        : -Math.random() * 20;
    }
    else if (pattern === 'horizontal') {
      this.fallSpeed = 0;
      // Пусть двигается по X влево или вправо
      this.fallOffsetX = (Math.random() < 0.5)
        ? 80
        : -80;
    }
    // Можно добавить другие («diagonal», «circle», «fly» и т.д.)
  }

  update(deltaTime) {
    // Если у нас есть физика, подгоняем позицию
    if (this.physicsBody) {
      this.x = this.physicsBody.x;
      this.y = this.physicsBody.y;
    }
    // Простая логика движения врагов
    if (this.isEnemy) {
      this.y += this.fallSpeed * deltaTime;
      this.x += this.fallOffsetX * deltaTime;
    }
  }

  render(ctx) {
    if (!this.image.complete) return;

    const drawWidth = this.width * this.scale;
    const drawHeight = this.height * this.scale;

    // Если это фон, может быть режим repeat
    if (this.repeatX || this.repeatY) {
      let repeatType = 'no-repeat';
      if (this.repeatX && this.repeatY) {
        repeatType = 'repeat';
      } else if (this.repeatX) {
        repeatType = 'repeat-x';
      } else if (this.repeatY) {
        repeatType = 'repeat-y';
      }
      const pattern = ctx.createPattern(this.image, repeatType);
      ctx.fillStyle = pattern;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.fillRect(0, 0, drawWidth, drawHeight);
      ctx.restore();
    } else {
      // Обычный спрайт
      ctx.drawImage(this.image, this.x, this.y, drawWidth, drawHeight);
    }
  }
}
