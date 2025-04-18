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

    this.ctx      = this.canvas.getContext('2d');
    this.renderer = new Renderer(this.ctx, backgroundColor);
    this.scene    = new Scene();
    this.physics  = null;
    this.input    = new Input();
    this.actionBindings = [];

    this.lastTime = 0;
    this.loop     = this.loop.bind(this);
    this.gui      = null;
  }

  setActions(gameObject, map) {
    this.actionBindings.push({ gameObject, map });
  }

  enablePhysics({ gravity = 0 }) {
    this.physics = new Physics(gravity);
  }

  setGUI(guiInstance) {
    this.gui = guiInstance; // можно передать null, чтобы скрыть GUI
  }

  add(...objects) {
    objects.forEach(o => {
      this.scene.add(o);
      if (this.physics) {
        this.physics.addGameObject(o);
      }
    });
  }

  start() {
    requestAnimationFrame(this.loop);
  }

  loop(ts) {
    const dt = (ts - this.lastTime) / 1000;
    this.lastTime = ts;

    // обработка действий (например, стрельбы)
    for (const b of this.actionBindings) {
      this.input.bindActions(b.gameObject, b.map, this);
    }

    // обновление физики
    if (this.physics) {
      this.physics.update(dt);
    }

    // обновление логики объектов
    this.scene.update(dt);

    // рендер сцены
    this.renderer.render(this.scene);

    // рендер GUI, если есть
    if (this.gui) {
      this.gui.render(this.ctx);
    }

    // удаление мёртвых объектов
    this.scene.objects = this.scene.objects.filter(o => !o.toDelete && !o.dead);

    requestAnimationFrame(this.loop);
  }
}
