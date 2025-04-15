import { Canvas2dGameObject } from '../Canvas2dGameObject.js';

export class SpriteGrid extends Canvas2dGameObject {
 constructor({
  id,
    image,
    x,
    y,
    width,
    height,
    repeatX = 1,
    repeatY = 1,
    spacingX = 0,
    spacingY = 0,
    preserveAspectRatio = false,
    enablePhysics = false,
    isStatic = false,
    layer = 0,
}) {
    super({
      id,
        x: x,
        y: y,
        width: width * repeatX + spacingX * (repeatX - 1),
        height: height * repeatY + spacingY * (repeatY - 1),
        color: null,
        enablePhysics: enablePhysics,
        isStatic: isStatic,
        layer: layer,
    });

    if (typeof image === 'string') {
        this.image = new Image();
        this.image.src = image;
        this.image.onerror = () => console.error(`Ошибка загрузки изображения для SpriteGrid: ${image}`);
    } else {
        this.image = image;
    }

    this.repeatX = repeatX;
    this.repeatY = repeatY;
    this.spacingX = spacingX;
    this.spacingY = spacingY;
    this.preserveAspectRatio = preserveAspectRatio;
}

  update(deltaTime) {
    if (this.rigidBody) {
      this.x = this.rigidBody.x;
      this.y = this.rigidBody.y;
    }
  }

  containsPoint(x, y) {
    // Проверка, находится ли точка внутри области спрайт-сетки
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
  }

  getBoundingBox() {
    // Возвращаем ограничивающий прямоугольник спрайт-сетки
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  render(context) {
    if (this.image.complete) {
      const renderWidth = this.width / this.repeatX;
      const renderHeight = this.height / this.repeatY;

      for (let i = 0; i < this.repeatX; i++) {
        for (let j = 0; j < this.repeatY; j++) {
          context.drawImage(
            this.image,
            this.x + (renderWidth + this.spacingX) * i,
            this.y + (renderHeight + this.spacingY) * j,
            renderWidth,
            renderHeight
          );
        }
      }
    }
  }
}
