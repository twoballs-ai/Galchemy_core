// src/Core.js
import { Scene }    from './Scene.js';
import { Renderer } from './Renderer.js';
import { Physics }  from './Physics.js';
import { Input }    from './Input.js';

export class Core {
  constructor({ canvasId, width, height, backgroundColor = '#000' }) {
    this.canvas = document.getElementById(canvasId);
    this.canvas.width  = width;
    this.canvas.height = height;

    this.ctx       = this.canvas.getContext('2d');
    this.renderer  = new Renderer(this.ctx, backgroundColor);
    this.scene     = new Scene();
    this.physics   = null;
    this.input     = new Input();
    this.movementBindings = [];
    this.actionBindings   = [];

    this.lastTime = 0;
    this.loop     = this.loop.bind(this);
    this.gui = null;    
  }
  setActions(gameObject, map) {
    this.actionBindings.push({ gameObject, map });
  }

  enablePhysics({ gravity = 0 }) {
    this.physics = new Physics(gravity);
  }
  setGUI(guiInstance) {
    this.gui = guiInstance;         // можно передать null, чтобы скрыть GUI
  }
  add(...objects) {
    objects.forEach(o => {
      this.scene.add(o);
      if (this.physics) this.physics.addGameObject(o);
    });
  }

  setMovement(gameObject, speed = 200, opts = { horizontal: true, vertical: true }) {
    this.movementBindings.push({ gameObject, speed, opts });
  }

  start() { requestAnimationFrame(this.loop); }

  loop(ts) {
    const dt = (ts - this.lastTime) / 1000;
    this.lastTime = ts;

    /* ввод */
    for (const b of this.movementBindings) {
      this.input.bindMovement(b.gameObject, b.speed, b.opts);
    }
    for (const b of this.actionBindings) {
      this.input.bindActions(b.gameObject, b.map, this); // передаём this ‑ это Core
    }
    /* физика */
    if (this.physics) this.physics.update(dt);

    /* логика объектов */
    this.scene.update(dt);

    /* отрисовка */
    this.renderer.render(this.scene);
    if (this.gui) this.gui.render(this.ctx); 
    /* удаляем мёртвых */
    this.scene.objects = this.scene.objects.filter(o => !o.toDelete && !o.dead);

    requestAnimationFrame(this.loop);
  }
}
