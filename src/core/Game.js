// ---------- ФАСАД: видит лишь пользователь ----------
import { Core }          from './Core.js';
import { GameObject }    from './GameObjects/GameObject.js';
import { Input }         from './Input.js';
import { Physics }       from './Physics.js';
import Entity            from './EntityWrapper.js';

class GameFacade {
  constructor () {
    this.core   = null;
    this.input  = new Input();
  }

  /* init(...)  →  возвращает this, чтобы можно было chain‑ить .physics() */
  init ({ canvasId, w, h, bg = '#000' }) {
    this.core = new Core({ canvasId, width: w, height: h, backgroundColor: bg });
    this.core.input = this.input;                 // подменяем ввод
    return this;                                  // для цепочки .physics()
  }

  physics ({ gravity = 0 } = {}) {
    this.core.enablePhysics({ gravity });         // твой старый метод
    return this;
  }

  /* spawn(...)  →  Entity (обёртка над GameObject) */
  spawn (img, x, y, { size = 32, speed = 200 } = {}) {
    const go = new GameObject({ imageSrc: img, x, y, width: size, height: size,
                                physics: false, collision: true, layer: 0 });
    go.speed = speed;
    this.core.add(go);
    return new Entity(go, this.core, this.input);
  }

  /* пачка астероидов / врагов / чего угодно */
  spawnGroup ({ images, pattern = 'fallRandom', size:[min,max]=[32,32], every = 2000 }) {
    const makeOne = () => {
      const img  = images[Math.random()*images.length|0];
      const sz   = min + Math.random() * (max - min);
      const mob  = this.spawn(img,
                              Math.random()*(this.core.canvas.width-sz),
                              -sz,
                              { size: sz });
      // простейший "fallRandom"
      if (pattern === 'fallRandom')
        mob.onUpdate((self,dt)=> self.y += 100*dt);
    };
    makeOne();                                      // первая партия
    if (every>0) setInterval(makeOne, every);
  }

  start () { this.core.start(); }
}

export default new GameFacade();
