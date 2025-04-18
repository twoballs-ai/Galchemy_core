// src/Entity.js
export default class Entity {
    constructor(go, core, input) {
      this.go    = go;     // сам GameObject
      this.core  = core;   // ссылка на Core (нужна для scene / physics)
      this.input = input;  // общий экземпляр Input с методом onKey
      this.moveDirections = [];
    }
  
    /* ---------------------------------------------------- *
     *                      Д В И Ж Е Н И Е                *
     * ---------------------------------------------------- */
    #bindMove(key, vx, vy) {
        // при нажатии добавляем направление
        this.input.onKeyDown(key, () => {
          this.moveDirections.push({ vx, vy, key });
        });
      
        // при отпускании убираем
        this.input.onKeyUp(key, () => {
          this.moveDirections = this.moveDirections.filter(dir => dir.key !== key);
        });
      
        return this;
      }
  
    moveLeft (key = 'ArrowLeft')  { return this.#bindMove(key, -1,  0); }
    moveRight(key = 'ArrowRight') { return this.#bindMove(key,  1,  0); }
    moveUp   (key = 'ArrowUp')    { return this.#bindMove(key,  0, -1); }
    moveDown (key = 'ArrowDown')  { return this.#bindMove(key,  0,  1); }
  
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
      key = 'Space',
      {
        image,
        dir    = 'up',
        offset = { x: 0, y: 0 },
        speed  = 500,
        size   = [10, 10]
      } = {}
    ) {
      if (!image) {
        console.warn('⚠️  shoot(): параметр image обязателен');
        return this;
      }
  
      const [w, h] = size;
  
      this.input.onKey(key, () => {
        /* 1. стартовая позиция пули */
        const startX = this.go.x + this.go.width  / 2 - w / 2 + offset.x;
        const startY = this.go.y + this.go.height / 2 - h / 2 + offset.y;
  
        /* 2. создаём пулю как обычный Entity */
        const bullet = this.core.game.spawn(image, startX, startY, {
          size: [w, h],
          speed
        });
  
        /* 3. движение пули */
        bullet.onUpdate((b, dt) => {
          switch (dir) {
            case 'up':    b.y -= speed * dt; break;
            case 'down':  b.y += speed * dt; break;
            case 'left':  b.x -= speed * dt; break;
            case 'right': b.x += speed * dt; break;
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
  this.core.scene.addUpdateHook(dt => {
    // Сначала вызываем пользовательский хук, если есть
    fn(this.go, dt);

    // Затем обновляем движение
    let totalX = 0, totalY = 0;
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
  