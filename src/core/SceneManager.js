// src/SceneManager.js
class Scene {
    constructor(name) {
      this.name = name;
      this.objects = [];
      this.updateHooks = [];
    }
  
    add(object) {
      this.objects.push(object);
    }
  
    remove(object) {
      const i = this.objects.indexOf(object);
      if (i >= 0) this.objects.splice(i, 1);
    }
  
    addUpdateHook(fn) {
      this.updateHooks.push(fn);
    }
  
    update(dt) {
      for (const obj of this.objects) {
        if (typeof obj.update === 'function') obj.update(dt);
      }
      for (const hook of this.updateHooks) hook(dt);
    }
  
    render(ctx) {
      const sorted = [...this.objects].sort((a,b)=> (a.layer||0) - (b.layer||0));
      for (const obj of sorted) {
        if (typeof obj.render === 'function') obj.render(ctx);
      }
    }
  }
  
  export class SceneManager {
    constructor(emitter) {
      this.emitter = emitter;
      this.scenes  = new Map();
      this.current = null;
    }
  
    createScene(name) {
      const scene = new Scene(name);
      this.scenes.set(name, scene);
      if (!this.current) this.switchScene(name);
      return scene;
    }
  
    switchScene(name) {
      if (!this.scenes.has(name)) {
        console.warn(`Scene "${name}" not found`);
        return;
      }
      this.current = this.scenes.get(name);
      this.emitter.emit('sceneChanged', { scene: name });
    }
    changeScene(name) {          // 👈 новый «псевдоним»
      this.switchScene(name);
    }
    getCurrentScene() {
      return this.current;
    }
  
    getGameObjectsFromCurrentScene() {
      return this.current ? this.current.objects : [];
    }
  
    update(dt) {
      if (this.current) this.current.update(dt);
    }
  
    render(ctx) {
      if (this.current) this.current.render(ctx);
    }
  }
  