export class Input {
  constructor() {
    this.keys = {};
    this._handlers = {}; // ← добавить эту строку

    window.addEventListener('keydown', e => {
      this.keys[e.key]                      = true;
      this.keys[e.key.toLowerCase?.()]      = true;
      this.keys[e.code]                     = true;
      this.keys[e.code.toLowerCase()]       = true;

      // 🔔 вызываем подписчиков
      (this._handlers[e.key] || []).forEach(fn => fn(e));
      (this._handlers[e.code] || []).forEach(fn => fn(e));
      (this._handlers[e.key.toLowerCase?.()] || []).forEach(fn => fn(e));
      (this._handlers[e.code.toLowerCase?.()] || []).forEach(fn => fn(e));
    });

    window.addEventListener('keyup', e => {
      this.keys[e.key]                      = false;
      this.keys[e.key.toLowerCase?.()]      = false;
      this.keys[e.code]                     = false;
      this.keys[e.code.toLowerCase()]       = false;
    });
  }

  isPressed(key) { return !!this.keys[key]; }

  getMovementAxis() {
    let x = 0, y = 0;
    if (this.isPressed('ArrowLeft')  || this.isPressed('a') || this.isPressed('ф')) x = -1;
    if (this.isPressed('ArrowRight') || this.isPressed('d') || this.isPressed('в')) x =  1;
    if (this.isPressed('ArrowUp')    || this.isPressed('w') || this.isPressed('ц')) y = -1;
    if (this.isPressed('ArrowDown')  || this.isPressed('s') || this.isPressed('ы')) y =  1;
    return { x, y };
  }

  bindMovement(gameObject, speed = 200, opt = { horizontal: true, vertical: true }) {
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

  bindActions(obj, map = {}, game) {
    for (const [method, key] of Object.entries(map)) {
      if (this.isPressed(key) && typeof obj[method] === 'function') {
        obj[method](game);
      }
    }
  }
  onKeyDown(key, fn) {
    window.addEventListener('keydown', e => {
      if (e.key === key) fn();
    });
  }
  onKeyUp(key, fn) {
    window.addEventListener('keyup', e => {
      if (e.key === key) fn();
    });
  }
  /** 🟩 ДОБАВЬ ЭТО: метод подписки */
  onKey(key, fn) {
    if (!this._handlers[key]) {
      this._handlers[key] = [];
    }
    this._handlers[key].push(fn);
  }
}
