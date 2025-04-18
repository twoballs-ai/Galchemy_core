// src/core/Input.js
export class Input {
  constructor() {
    this.keys = {};

    /* — фиксируем ВСЕ варианты названий клавиш — */
    window.addEventListener('keydown', e => {
      this.keys[e.key]                      = true;              // ' '  'a'
      this.keys[e.key.toLowerCase?.()]      = true;              // 'a'
      this.keys[e.code]                     = true;              // 'Space'
      this.keys[e.code.toLowerCase()]       = true;              // 'space'
    });

    window.addEventListener('keyup', e => {
      this.keys[e.key]                      = false;
      this.keys[e.key.toLowerCase?.()]      = false;
      this.keys[e.code]                     = false;
      this.keys[e.code.toLowerCase()]       = false;
    });
  }

  /* быстрое «нажато ли» */
  isPressed(key) { return !!this.keys[key]; }

  /* === движение (как было) === */
  getMovementAxis() {
    let x = 0, y = 0;
    if (this.isPressed('ArrowLeft')  || this.isPressed('a') || this.isPressed('ф')) x = -1;
    if (this.isPressed('ArrowRight') || this.isPressed('d') || this.isPressed('в')) x =  1;
    if (this.isPressed('ArrowUp')    || this.isPressed('w') || this.isPressed('ц')) y = -1;
    if (this.isPressed('ArrowDown')  || this.isPressed('s') || this.isPressed('ы')) y =  1;
    return { x, y };
  }

  /* привязка движения к объекту */
  bindMovement(gameObject, speed = 200,
               opt = { horizontal: true, vertical: true }) {

    const { x, y } = this.getMovementAxis();
    let mx = opt.horizontal ? x : 0;
    let my = opt.vertical   ? y : 0;

    const mag = Math.hypot(mx, my);
    if (mag) { mx /= mag; my /= mag; }

    if (gameObject.physicsBody) {
      gameObject.physicsBody.velocity.x = mx * speed;
      gameObject.physicsBody.velocity.y = my * speed;
    }
  }

  /* общие действия: { shoot:' ', melee:'x' }  */
  bindActions(obj, map = {}, game) {
    for (const [method, key] of Object.entries(map)) {
      if (this.isPressed(key) && typeof obj[method] === 'function') {
        obj[method](game);
      }
    }
  }
}
