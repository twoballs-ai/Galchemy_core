// src/Entity.js
export default class Entity {
  constructor(go, core, input) {
    this.go = go; // сам GameObject
    this.core = core; // ссылка на Core (нужна для scene / physics)
    this.input = input; // общий экземпляр Input с методом onKey
    this.moveDirections = [];
    this._updateRegistered = false; // 👈 добавляем флаг
  }

  #bindMove(keys, vx, vy) {
    const list = Array.isArray(keys) ? keys : [keys];

    for (const key of list) {
      this.input.onKeyDown(key, () => {
        // ✅ только один раз
        if (!this.moveDirections.find((d) => d.key === key)) {
          this.moveDirections.push({ vx, vy, key });
        }
      });
      this.input.onKeyUp(key, () => {
        this.moveDirections = this.moveDirections.filter((d) => d.key !== key);
      });
    }

    if (!this._updateRegistered) {
      this.core.scene.addUpdateHook((dt) => {
        let totalX = 0,
          totalY = 0;
        for (const d of this.moveDirections) {
          totalX += d.vx;
          totalY += d.vy;
        }

        if (totalX !== 0 || totalY !== 0) {
          // 1) вычисляем длину вектора
          const mag = Math.hypot(totalX, totalY);
          // 2) нормализуем (получаем единичный вектор)
          const nx = totalX / mag;
          const ny = totalY / mag;
          // 3) двигаем с постоянной скоростью v
          const v = this.go.speed ?? 200;
          this.go.x += nx * v * dt;
          this.go.y += ny * v * dt;
        }
      });
      this._updateRegistered = true;
    }

    return this;
  }

  moveLeft(keys = "ArrowLeft") {
    return this.#bindMove(keys, -1, 0);
  }
  moveRight(keys = "ArrowRight") {
    return this.#bindMove(keys, 1, 0);
  }
  moveUp(keys = "ArrowUp") {
    return this.#bindMove(keys, 0, -1);
  }
  moveDown(keys = "ArrowDown") {
    return this.#bindMove(keys, 0, 1);
  }

  /* ---------------------------------------------------- *
   *                    С Т Р Е Л Ь Б А                  *
   * ---------------------------------------------------- */
  /**
   * @param {string} key   – клавиша
   * @param {object} cfg   – параметры пули
   *   image  {string}              спрайт
   *   dir    {'up'|'down'|'left'|'right'}
   *   offset {{x:number,y:number}} смещение относительно центра
   *   speed  {number}              px/сек
   *   size   {[w:number,h:number]} размер пули
   */
  shoot(
  key = "space",
  {
    image,
    dir = "up",
    offset = { x: 0, y: 0 },
    speed = 500,
    size,
    width,
    height,
    w,
    h,
    cooldown = 0,
  } = {}
) {
  if (!image) {
    console.warn("⚠️ shoot(): параметр image обязателен");
    return this;
  }

  let bulletW, bulletH;
  if (Array.isArray(size)) {
    [bulletW, bulletH] = size;
  } else if (typeof size === "number") {
    bulletW = bulletH = size;
  } else {
    bulletW = w ?? width ?? 10;
    bulletH = h ?? height ?? 10;
  }

  let lastShot = 0;

  this.core.scene.addUpdateHook((dt) => {
    if (!this.input.isPressed(key)) return;

    const now = Date.now();
    if (now - lastShot < cooldown) return;
    lastShot = now;

    const startX = this.go.x + this.go.width / 2 - bulletW / 2 + offset.x;
    const startY = this.go.y + this.go.height / 2 - bulletH / 2 + offset.y;

    const bullet = this.core.game.spawn(image, startX, startY, {
      image,
      width: bulletW,
      height: bulletH,
      speed,
    });

    bullet.go.isBullet = true;

    bullet.onUpdate((b, dt) => {
      switch (dir) {
        case "up":    b.y -= speed * dt; break;
        case "down":  b.y += speed * dt; break;
        case "left":  b.x -= speed * dt; break;
        case "right": b.x += speed * dt; break;
      }
    });
  });

  return this;
}
  /* ---------------------------------------------------- *
   *             Х У К   П О   К А Ж Д О М У   К А Д Р У  *
   * ---------------------------------------------------- */
  /**
   * onUpdate(fn): fn получает (gameObject, deltaTime)
   */
  onUpdate(fn) {
    this.core.scene.addUpdateHook((dt) => {
      // Сначала вызываем пользовательский хук, если есть
      fn(this.go, dt);

      // Затем обновляем движение
      let totalX = 0,
        totalY = 0;
      for (const dir of this.moveDirections) {
        totalX += dir.vx;
        totalY += dir.vy;
      }
      if (totalX !== 0 || totalY !== 0) {
        const v = this.go.speed ?? 200;
        this.go.x += totalX * v * dt;
        this.go.y += totalY * v * dt;
      }
    });
    return this;
  }
}
