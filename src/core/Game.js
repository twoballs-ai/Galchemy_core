// src/GameFacade.js
import { Core }        from './Core.js';
import { GameObject2D }  from './GameObjects/GameObject2D.js';
import { Input }       from './Input.js';
import Entity          from './GameObjects/EntityWrapper.js';
import { GUI }         from '../utils/GUI.js';
import { getSize }     from '../utils/getSize.js';
import { GameObject3D } from './GameObjects/GameObject3D.js';
import { loadGLB } from '../utils/GLTFLoader.js';
import { createSphereGeometry } from './GameObjects/primitives/3dPrimitives/createSphereGeometry.js';

import { createCubeGeometry }    from './GameObjects/primitives/3dPrimitives/createCubeGeometry.js';
import { createCylinderGeometry }from './GameObjects/primitives/3dPrimitives/createCylinderGeometry.js';
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
   const go = new GameObject2D(this.core.ctx, {
         imageSrc : opts.image || img,
        x, y,
        width : w,
        height: h,
        layer,
        physics : false,
       collision: true,
        speed   : opts.speed ?? 200
     });

    go.speed = opts.speed ?? 200;
    this.core.add(go);
    return new Entity(go, this.core, this.input);
  }
  spawnSphere(r=1,seg=24,pos=[0,0,-5],color='#ffffff'){
    const gl=this.core.ctx;
    const mesh=createSphereGeometry(r,seg);
    const go = new GameObject3D(gl,{mesh,position:pos,color});
    this.core.add(go); return new Entity(go, this.core, this.input);
  }
  spawnCube(size=1,pos=[0,0,-5],color='#e74c3c'){
    const gl=this.core.ctx;
    const mesh=createCubeGeometry(size);
    const go=new GameObject3D(gl,{mesh,position:pos,color});
    this.core.add(go); return new Entity(go, this.core, this.input);
  }
  spawnCylinder(r=1,h=2,pos=[0,0,-5],color='#2ecc71'){
    const gl=this.core.ctx;
    const mesh=createCylinderGeometry(r,h);
    const go=new GameObject3D(gl,{mesh,position:pos,color});
    this.core.add(go); return new Entity(go, this.core, this.input);
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
