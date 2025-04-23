// src/GameFacade.js
import { Core }        from './Core.js';
import { GameObject }  from './GameObjects/GameObject.js';
import { Input }       from './Input.js';
import Entity          from './GameObjects/EntityWrapper.js';
import { GUI }         from '../utils/GUI.js';
import { getSize }     from '../utils/getSize.js';
import { GameObject3D } from './GameObjects/GameObject3D.js';
import { loadGLB } from '../utils/GLTFLoader.js';
import { createSphereGeometry } from '../utils/createSphereGeometry.js';
class GameFacade {
  constructor() {
    this.core  = null;
    this.input = new Input();
  }

  init({ canvasId, w, h, bg = '#000', debug = false }) {
    this.core = new Core({
      canvasId,
      width: w,
      height: h,
      backgroundColor: bg,
      debug
    });
    this.core.input = this.input;
    this.core.game  = this;
    return this;
  }

  setDebug(on = true)         { this.core.setDebug(on); return this; }
  setGUI(cfg = {})            { const gui = new GUI(cfg); this.core.setGUI(gui); return gui; }
  physics({ gravity = 0 } = {}){ this.core.enablePhysics({ gravity }); return this; }

  spawn(img, x, y, opts = {}) {
    const { layer = 0 } = opts;
    const [w, h] = getSize(opts);

    const go = new GameObject({
      imageSrc : opts.image || img,
      x, y,
      width    : w,
      height   : h,
      physics  : false,
      collision: true,
      layer    : layer
    });

    go.speed = opts.speed ?? 200;
    this.core.add(go);
    return new Entity(go, this.core, this.input);
  }
  spawnSpherePlanet(radius = 1, segments = 24, position = [0, 0, -5]) {
    const gl = this.core.ctx;
    const geometry = createSphereGeometry(radius, segments);
    const go = new GameObject3D(gl, { mesh: geometry, position });
    this.core.add(go);
    return go;
  }
  spawnGroup({ images, pattern = 'fallRandom', every = 2000, score = 5, layer = 0, ...sizeOpts } = {}) {
    const makeOne = () => {
      const [w, h] = getSize(sizeOpts, true);
      const x = Math.random() * (this.core.canvas.width - w);
      const y = -h;

      const mob = this.spawn(
        images[(Math.random() * images.length) | 0],
        x, y,
        { size: [w, h], layer }
      );
      mob.go.scoreValue = score;

      if (pattern === 'fallRandom') {
        mob.onUpdate((self, dt) => {
          self.y += 100 * dt;
          if (self.y > this.core.canvas.height + h) self.toDelete = true;
        });
      }

      mob.go.onCollision = other => {
        if (other.isBullet) {
          mob.go.toDelete = true;
          other.toDelete  = true;
          this.core.gui?.addScore(mob.go.scoreValue);
        }
      };
    };

    makeOne();
    if (every > 0) setInterval(makeOne, every);
  }
  async spawn3DModel(path, position = [0, 0, 0]) {
    const { json, binary } = await loadGLB(path);
  
    const mesh = extractFirstMesh(json, binary, this.core.ctx);
    const go = new GameObject3D({ mesh, position });
    this.core.add(go);
    return go;
  }
  start() { this.core.start(); }
}

export default new GameFacade();
