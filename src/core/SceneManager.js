// src/core/SceneManager.js
import { Scene } from './Scene.js';     // ваша реализация сцены

export class SceneManager {
  constructor(emitter) {
    this.emitter = emitter;            // EventEmitter из Core
    this.scenes  = new Map();          // Map<string, Scene>
    this.current = null;               // текущая сцена
  }

  /* ---------- создание / переключение ---------- */

  createScene(name) {
    const scene = new Scene(name);
    this.scenes.set(name, scene);
    if (!this.current) this.switchScene(name);   // первая созданная = активная
    return scene;
  }

  switchScene(name) {
    if (!this.scenes.has(name)) {
      console.warn(`Scene "${name}" not found`);
      return;
    }
    this.current = this.scenes.get(name);
    this.emitter?.emit?.('sceneChanged', { scene: name });
  }

  changeScene(name) { this.switchScene(name); }  // псевдоним для удобства
  getCurrentScene()  { return this.current; }

  /* ---------- операции с объектами ---------- */

  getGameObjectsFromCurrentScene() {
    return this.current ? this.current.objects : [];
  }

  addGameObjectToScene(sceneName, obj) {
    const scene = this.scenes.get(sceneName) ?? this.current;
    scene?.add(obj);                   // Scene.add уже проверит дубликаты
  }

  /* ---------- игровой цикл ---------- */

  update(dt)  { this.current?.update(dt);  }
  render(ctx) { this.current?.render(ctx); }
}
