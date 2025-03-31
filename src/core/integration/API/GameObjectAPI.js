// integration/API/GameObjectAPI.js

export class GameObjectAPI {
    constructor({ core }) {
      this.core = core;
      this.sceneManager = core.getSceneManager();
      this.currentScene = this.sceneManager.getCurrentScene();
    }
  
    getById(id) {
      return this.currentScene.gameObjects.get(id) || null;
    }
  
    getByName(name) {
      const objects = Array.from(this.currentScene.gameObjects.values());
      return objects.find(obj => obj.name === name) || null;
    }
  
    getAll() {
      return Array.from(this.currentScene.gameObjects.values());
    }
  
    log(...args) {
      console.log(...args);
    }
  }
  