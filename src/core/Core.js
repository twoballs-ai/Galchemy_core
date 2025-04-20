// src/Core.js
import { SceneManager } from './SceneManager.js';
import { EventEmitter } from '../utils/EventEmitter.js'; // если нужно
import { Physics }  from './Physics.js';
import { Input }    from './Input.js';
import { GraphicalContext } from '../core/GraphicalContext.js';

export class Core {
  constructor({ canvasId, width, height, backgroundColor = '#000', renderType = '2d', debug = false }) {
    this.canvas = document.getElementById(canvasId);
    this.canvas.width  = width;
    this.canvas.height = height;
    this.graphicalContext = new GraphicalContext(canvasId, renderType, backgroundColor, width, height);
    this.ctx = this.graphicalContext.getContext()
    this.renderer = this.graphicalContext.getRenderer(); 
    this.canvas = this.graphicalContext.getCanvas();

    this.emitter = new EventEmitter();
    this.sceneManager = new SceneManager(this.emitter);
    this.scene = this.sceneManager.createScene("main"); // 👈 текущая сцена
    this.physics        = null;
    this.input          = new Input();
    this.actionBindings = [];
    this.debug          = debug;
    
    this.lastTime       = 0;
    this.loop           = this.loop.bind(this);
    this.gui            = null;
  }

  setDebug(on = true) {
    this.debug = on;
  }

  setActions(gameObject, map) {
    this.actionBindings.push({ gameObject, map });
  }

  enablePhysics({ gravity = 0 }) {
    this.physics = new Physics(gravity);
  }

  setGUI(guiInstance) {
    this.gui = guiInstance;
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

    // 1) действия (стрельба и др.)
    for (const b of this.actionBindings) {
      this.input.bindActions(b.gameObject, b.map, this);
    }

    // 2) физика + коллизии внутри Physics
    if (this.physics) {
      this.physics.update(dt);
    }

    // 3) логика объектов
    this.scene.update(dt);

    // 4) debug‑лог параметров


    // 5) рендер сцены (с debug‑рамками внутри)
    this.renderer.render(this.scene, this.debug);
    if (this.debug) {
      this._drawDebugOverlay();
    }
    // 6) GUI
    if (this.gui) {
      this.gui.render(this.ctx);
    }

    // 7) удаление «мёртвых»
    this.scene.objects = this.scene.objects.filter(o => !o.toDelete && !o.dead);

    requestAnimationFrame(this.loop);
  }
  _drawDebugOverlay() {
    const ctx = this.ctx;
    ctx.save();
    ctx.font      = '12px monospace';
    ctx.fillStyle = 'white';
    ctx.textBaseline = 'top';
  
    this.scene.objects.forEach((o, idx) => {
      const img  = o.image.src.split('/').pop();
      const x    = o.x.toFixed(1);
      const y    = o.y.toFixed(1);
      const vx   = (o.physicsBody?.velocity.x ?? 0).toFixed(1);
      const vy   = (o.physicsBody?.velocity.y ?? 0).toFixed(1);
      const text = `${img}  x:${x}  y:${y}  vx:${vx}  vy:${vy}`;
  
      // рисуем текст рядом с объектом
      ctx.fillText(text, o.x, o.y - 14);
    });
  
    ctx.restore();
  }
}
