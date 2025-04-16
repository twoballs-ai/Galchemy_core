export class Input {
  constructor() {
    this.keys = {};
    window.addEventListener('keydown', e => this.keys[e.key] = true);
    window.addEventListener('keyup', e => this.keys[e.key] = false);
  }

  isPressed(key) {
    return !!this.keys[key];
  }

  /**
   * Возвращает движение по осям с учётом разных раскладок и регистра
   */
  getMovementAxis() {
    let x = 0;
    let y = 0;

    // Горизонталь
    if (
      this.isPressed('ArrowLeft') || 
      this.isPressed('a') || this.isPressed('A') || 
      this.isPressed('ф') || this.isPressed('Ф')
    ) {
      x = -1;
    }
    if (
      this.isPressed('ArrowRight') || 
      this.isPressed('d') || this.isPressed('D') || 
      this.isPressed('в') || this.isPressed('В')
    ) {
      x = 1;
    }

    // Вертикаль
    if (
      this.isPressed('ArrowUp') || 
      this.isPressed('w') || this.isPressed('W') || 
      this.isPressed('ц') || this.isPressed('Ц')
    ) {
      y = -1;
    }
    if (
      this.isPressed('ArrowDown') || 
      this.isPressed('s') || this.isPressed('S') || 
      this.isPressed('ы') || this.isPressed('Ы')
    ) {
      y = 1;
    }

    return { x, y };
  }

  /**
   * Применяет управление к gameObject, нормализуя вектор движения, чтобы при диагональном движении скорость не увеличивалась.
   * @param {GameObject} gameObject – объект, у которого меняем скорость
   * @param {number} speed – скорость движения (пикселей/сек)
   * @param {object} options – { horizontal: true, vertical: true }
   */
  bindMovement(gameObject, speed = 200, options = { horizontal: true, vertical: true }) {
    const { x, y } = this.getMovementAxis();
    let moveX = options.horizontal ? x : 0;
    let moveY = options.vertical ? y : 0;

    const magnitude = Math.sqrt(moveX * moveX + moveY * moveY);

    if (magnitude > 0) {
      moveX /= magnitude;
      moveY /= magnitude;
    }

    gameObject.physicsBody.velocity.x = moveX * speed;
    gameObject.physicsBody.velocity.y = moveY * speed;
  }
}
