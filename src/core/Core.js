// Core.js
import { Scene } from './Scene.js';
import { Renderer } from './Renderer.js';
import { Physics } from './Physics.js';
import { Input } from './Input.js';

export class Core {
  constructor({ canvasId, width, height, backgroundColor = '#000' }) {
    this.canvas = document.getElementById(canvasId);
    this.canvas.width = width;
    this.canvas.height = height;

    this.ctx = this.canvas.getContext('2d');
    this.renderer = new Renderer(this.ctx, backgroundColor);

    this.scene = new Scene();
    this.physics = null;
    this.input = new Input();
    this.movementBindings = []; // Здесь будут храниться привязки управления

    this.lastTime = 0;
    this.loop = this.loop.bind(this);
  }

  enablePhysics({ gravity = 0.98 }) {
    this.physics = new Physics(gravity);
  }

  add(...gameObjects) {
    gameObjects.forEach(obj => {
      this.scene.add(obj);
      if (this.physics && obj.physicsBody) {
        this.physics.addBody(obj.physicsBody);
      }
    });
  }

  /**
   * Привязывает управление к объекту.
   * @param {GameObject} gameObject – объект, которым управляем
   * @param {number} speed – скорость движения (в пикселях/сек.)
   * @param {object} options – { horizontal: true/false, vertical: true/false }
   */
  setMovement(gameObject, speed = 200, options = { horizontal: true, vertical: true }) {
    this.movementBindings.push({ gameObject, speed, options });
  }

  start() {
    requestAnimationFrame(this.loop);
  }

  loop(timestamp) {
    const deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    // Обрабатываем привязки управления
    for (const binding of this.movementBindings) {
      this.input.bindMovement(binding.gameObject, binding.speed, binding.options);
    }

    if (this.physics) {
      this.physics.update(deltaTime);
    }
    this.scene.update(deltaTime);
    this.renderer.render(this.scene);

    requestAnimationFrame(this.loop);
  }
}
