export class Input {
  constructor() {
    this.keys = new Set();
    this._handlers = {};

    window.addEventListener('keydown', e => {
       const k = e.key?.toLowerCase();
       const c = e.code?.toLowerCase();
       if (k) this.keys.add(k);
       if (c) this.keys.add(c);      // ← теперь 'space' тоже в множестве
             for (const name of [k, c]) {
         if (name && this._handlers[name]) {
           for (const fn of this._handlers[name]) fn(e);
         }
       }
    });

    window.addEventListener('keyup', e => {
      const k = e.key?.toLowerCase();
      const c = e.code?.toLowerCase();
      if (k) this.keys.delete(k);
      if (c) this.keys.delete(c);
    });
    
  }

  isPressed(key) {
    return this.keys.has(key.toLowerCase());
  }

  onKeyDown(key, fn) {
    const k = key.toLowerCase();
    if (!this._handlers[k]) this._handlers[k] = [];
    this._handlers[k].push(fn);
  }

  onKeyUp(key, fn) {
    window.addEventListener('keyup', e => {
      if (e.key?.toLowerCase() === key.toLowerCase()) fn(e);
    });
  }

  onKey(key, fn) {
    this.onKeyDown(key, fn);
  }

  getMovementAxis() {
    let x = 0, y = 0;
    // поддержка русской и английской раскладок
    if (this.isPressed('a') || this.isPressed('ф') || this.isPressed('arrowleft'))  x = -1;
    if (this.isPressed('d') || this.isPressed('в') || this.isPressed('arrowright')) x =  1;
    if (this.isPressed('w') || this.isPressed('ц') || this.isPressed('arrowup'))    y = -1;
    if (this.isPressed('s') || this.isPressed('ы') || this.isPressed('arrowdown'))  y =  1;
    return { x, y };
  }

  bindActions(obj, map = {}, game) {
    for (const [method, key] of Object.entries(map)) {
      if (this.isPressed(key) && typeof obj[method] === 'function') {
        obj[method](game);
      }
    }
  }
}
