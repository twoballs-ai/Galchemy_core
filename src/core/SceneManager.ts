// src/core/SceneManager.js
import { Scene } from './Scene.ts';     // ваша реализация сцены

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


  changeScene(name) { this.switchScene(name); }  // псевдоним для удобства
  getCurrentScene()  { return this.current; }

  /* ---------- операции с объектами ---------- */

  getGameObjectsFromCurrentScene() {
    return this.current ? this.current.objects : [];
  }

  switchScene(name) {
    if (!this.scenes.has(name)) {
      console.warn(`Scene "${name}" not found`);
      return;
    }
    this.current = this.scenes.get(name);
    this.emitter.emit('sceneChanged', { scene: name });
  }

  addGameObjectToScene(sceneName, obj) {
    const scene = this.scenes.get(sceneName) ?? this.current;
    if (!scene) return;
    scene.add(obj);
    // сразу же нотифицируем редактор, передаём минимальный «сериализуемый» профиль
    this.emitter.emit('objectAdded', {
      scene: sceneName,
      object: {
        id:      obj.id,
        type:    obj.type,
        position: obj.position.slice(),
        // … любые свойства, которые вам важны
      }
    });
  }
  removeGameObjectFromScene(sceneName, obj) {
    const scene = this.scenes.get(sceneName) ?? this.current;
    if (!scene) return;
    scene.remove(obj);
    this.emitter.emit('objectRemoved', {
      scene:  sceneName,
      object: { id: obj.id }
    });
  }
  /* ---------- игровой цикл ---------- */

  update(dt)  { this.current?.update(dt);  }
  render(ctx) { this.current?.render(ctx); }
}
