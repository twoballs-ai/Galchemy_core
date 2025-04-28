import { SceneManager }   from './SceneManager.js';
import { EventEmitter }   from '../utils/EventEmitter.js';
import { Physics }        from './Physics.js';
import { Input }          from './Input.js';
import { GraphicalContext } from '../core/GraphicalContext.js';

export class Core {
  constructor({ canvasId, width, height, backgroundColor = '#000' }) {
    /* ── графический контекст ─────────────────────────────────────────── */
    this.gc      = new GraphicalContext(canvasId, backgroundColor, width, height);
    this.canvas  = this.gc.getCanvas();
    this.ctx     = this.gc.getContext();
    this.renderer= this.gc.getRenderer();

    /* ── базовые подсистемы ────────────────────────────────────────────── */
    this.emitter      = new EventEmitter();
    this.sceneManager = new SceneManager(this.emitter);
    this.sceneManager.createScene('main');          // первая сцена

    this.physics       = null;
    this.input         = new Input();
    this.actionBindings= [];

    /* ── отладка / режимы ──────────────────────────────────────────────── */
      this.debugLogging = false;   // только текстовые логи в консоль
       this.showHelpers  = false;
    this.mode    = null;     // EditorMode | PreviewMode
    this.camera  = null;

    /* ── loop ──────────────────────────────────────────────────────────── */
    this.lastTime = 0;
    this.loop     = this.loop.bind(this);
  }
  getSceneManager() { return this.sceneManager; }
  /* ---------- публичные API ---------- */

    setDebugLogging(on) { this.debugLogging = !!on; }
    setShowHelpers(on)  { this.showHelpers  = !!on; }
  enablePhysics({ gravity=0 }){ this.physics = new Physics(gravity); }
  add(...objs)                { objs.forEach(o => this.scene.add(o)); }

  resize(w, h) {
    this.gc.resize(w, h);
    this.renderer.resize?.(w, h);
    this.camera?.resize?.(w, h);
  }

  setMode(modeInstance) {
    if (this.mode?.exit) this.mode.exit();
    this.mode = modeInstance;
    this.mode.enter(this);
  }
  setActiveCamera(camera) {
    this.camera = camera;
    camera.update();
    this.renderer.setCamera(camera); 
  }
  start() {
    if (this._running) return;
    this._running = true;
    requestAnimationFrame(this.loop);
  }
  stop()  { this._running = false; }

  /* ---------- приватный игровой цикл ---------- */

  get scene() { return this.sceneManager.getCurrentScene(); }

  loop(ts) {
    if (!this._running) return;
    const dt = (ts - this.lastTime) / 1000;
    this.lastTime = ts;

    this.mode?.update?.(dt);
    this.physics?.update?.(dt);

    this.scene.update(dt);
      this.renderer.render(this.scene, this.showHelpers);
    
      /* 2) текстовый вывод в консоль */
      if (this.debugLogging) {
          console.log(
            `[dt=${dt.toFixed(3)}] objs=${this.scene.objects.length}`
          );
      }

    requestAnimationFrame(this.loop);
  }
}
