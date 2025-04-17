// src/core/GameObjects/Character/Mob.js
import { GameObject } from '../GameObject.js';
import { Player }     from './Player.js';

export class Mob extends GameObject {
  constructor({
    imageSrc,
    x, y,
    width,  height = width,
    pattern = 'static',

    physics   = false,
    collision = true,
    layer     = 0
  }) {
    super({ imageSrc, x, y, width, height, physics, collision, layer });
    this.setMovementPattern(pattern);
    this.toDelete = false;
  }

  /* ---------- движение ---------- */
  setMovementPattern(p) {
    this.vx = 0;
    this.vy = 0;
    switch (p) {
      case 'fall':        this.vy = 100; break;
      case 'fallRandom':
        this.vy = 100 + Math.random() * 50;
        this.vx = (Math.random() < 0.5 ? 1 : -1) * Math.random() * 20;
        break;
      case 'horizontal':
        this.vx = (Math.random() < 0.5 ? 80 : -80);
        break;
      // static — скорости ноль
    }
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  /* ---------- столкновения ---------- */
  onCollision(other) {                // поведение по умолчанию
    // console.log("моб столкнулся")
    if (other instanceof Player) this.toDelete = true;
  }

  /* ---------- вспомогательные спавнеры ---------- */

  /** Создать одного моба и сразу добавить в игру */
  static spawnSingle({ game, ...cfg }) {
    const mob = new Mob(cfg);
    game.add(mob);
    return mob;
  }

  /**
   * Создать пачку мобов.
   * @param {number} interval  – если задан (мс), будет циклический спавн
   * @returns {object}         – { mobs: [...], cancel: ()=>void }
   */
  static spawnMultiple({
    game,
    images,
    count     = 5,
    pattern   = 'fallRandom',
    minSize   = 40,
    maxSize   = 100,
    interval  = null,      // ⬅️  новинка
    ...rest
  }) {
    const result = { mobs: [], cancel: null };

    const once = () => {
      for (let i = 0; i < count; i++) {
        const img  = images[Math.floor(Math.random() * images.length)];
        const size = minSize + Math.random() * (maxSize - minSize);

        result.mobs.push(
          Mob.spawnSingle({
            game,
            imageSrc: img,
            x: Math.random() * (game.canvas.width - size),
            y: -size,
            width: size,
            height: size,
            pattern,
            ...rest
          })
        );
      }
    };

    // первая партия
    once();

    // циклический спавн
    if (interval && interval > 0) {
      const id = setInterval(once, interval);
      result.cancel = () => clearInterval(id);
    }

    return result;
  }
  
}
