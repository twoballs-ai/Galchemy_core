// src/Core.js
import { GraphicalContext } from './GraphicalContext.js';
import { Input } from './Input.js';
import { SceneManager } from './SceneManager.js';
import { EventEmitter } from './utils/EventEmitter.js';
import { Highlighter } from './utils/Highlighter.js';

export class Core {
  constructor({
    canvasId,
    renderType = "2d",
    backgroundColor = "#000",
    width = 900,
    height = 600,
    debug = false,
  }) {
    this.graphicalContext = new GraphicalContext(canvasId, renderType, backgroundColor, width, height);
    this.canvas = this.graphicalContext.getCanvas();
    this.ctx = this.graphicalContext.getContext();
    this.renderer = this.graphicalContext.getRenderer();
    this.renderType = renderType;

    this.debug = debug;
    this.input = new Input();
    this.emitter = new EventEmitter();
    this.sceneManager = new SceneManager(this.emitter);
    this.actionBindings = [];
    this.plugins = [];

    this.gui = null;
    this.physics = null;
    this.selectedObject = null;
    this.currentMode = null;
    this.lastTime = 0;
    this.animationFrameId = null;
    this.userLogic = null;

    this.loop = this.loop.bind(this);
  }

  setDebug(on = true) {
    this.debug = on;
  }

  async enablePhysics({ gravity = 0 } = {}) {
    const { Physics } = await import('./Physics.js');
    this.physics = new Physics(gravity);
  }

  setActions(gameObject, map) {
    this.actionBindings.push({ gameObject, map });
  }

  setGUI(guiInstance) {
    this.gui = guiInstance;
  }

  registerPlugin(plugin) {
    if (plugin && typeof plugin.install === "function") {
      plugin.install(this);
      this.plugins.push(plugin);
    }
  }

  setSelectedObject(object) {
    this.selectedObject = object;
    this.requestRender();
    this.emitter.emit("objectSelected", { object });
  }

  getSceneManager() {
    return this.sceneManager;
  }

  requestRender() {
    this.render();
  }

  async start() {
    if (typeof this.renderer.init === "function") {
      await this.renderer.init();
    }
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      console.log("Game loop stopped.");
    }
  }

  loop(timestamp) {
    const dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    for (const b of this.actionBindings) {
      this.input.bindActions(b.gameObject, b.map, this);
    }

    if (this.physics) {
      this.physics.update(dt);
    }

    this.sceneManager.update(dt);

    if (this.userLogic) {
      try {
        const objects = this.sceneManager.getGameObjectsFromCurrentScene();
        this.userLogic(objects, this, dt);
      } catch (e) {
        console.error("User logic error:", e);
      }
    }

    this.render();
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  render() {
    this.renderer.clear();
    this.sceneManager.render(this.renderer.context);

    for (const plugin of this.plugins) {
      if (typeof plugin.render === "function") {
        plugin.render(this.renderer.context, this.canvas);
      }
    }

    if (this.selectedObject) {
      Highlighter.highlightObject(
        this.renderer.context,
        this.selectedObject,
        'purple',
        'rgba(200, 100, 255, 0.2)'
      );
    }

    if (this.debug) {
      this._drawDebugOverlay();
    }

    if (this.gui) {
      this.gui.render(this.ctx);
    }
  }

  _drawDebugOverlay() {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = "12px monospace";
    ctx.fillStyle = "white";
    ctx.textBaseline = "top";

    const scene = this.sceneManager.getCurrentScene();
    if (!scene) return;

    scene.gameObjects.forEach((o) => {
      const img = o.image?.src?.split("/").pop() ?? "(no img)";
      const x = o.x.toFixed(1);
      const y = o.y.toFixed(1);
      const vx = (o.physicsBody?.velocity?.x ?? 0).toFixed(1);
      const vy = (o.physicsBody?.velocity?.y ?? 0).toFixed(1);
      const text = `${img} x:${x} y:${y} vx:${vx} vy:${vy}`;
      ctx.fillText(text, o.x, o.y - 14);
    });

    ctx.restore();
  }

  resize(width, height) {
    if (this.graphicalContext) {
      this.graphicalContext.resize(width, height);
      this.renderer.clear();
      this.sceneManager.render(this.renderer.context);
      this.emitter.emit("resize", { width, height });
    }
  }
}
