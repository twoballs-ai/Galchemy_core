// SceneManager.js
export class SceneManager {
  constructor(emitter) { // <-- принимает emitter
    this.scenes = new Map();

    this.currentScene = null;
    this.emitter = emitter; // <-- сохранили emitter
  }

  createScene(name) {
    if (!this.scenes.has(name)) {
      this.scenes.set(name, { name, gameObjects: new Map() });
    }
  }

  changeScene(name) {
    if (this.scenes.has(name)) {
     this.currentScene = this.scenes.get(name);
      console.log(`Переключено на сцену "${name}".`);
    } else {
      console.error(`Сцена "${name}" не существует.`);
    }
  }

  addGameObjectToScene(sceneName, gameObject) {
    const scene = this.scenes.get(sceneName);
    if (scene && !scene.gameObjects.has(gameObject.id)) {
      scene.gameObjects.set(gameObject.id, gameObject);
    }
  }

  update(deltaTime) {
    if (this.currentScene) {
      this.currentScene.gameObjects.forEach((object) => {
        if (typeof object.update === "function") {
          const oldX = object.x, oldY = object.y;
          object.update(deltaTime);
          if (object.x !== oldX || object.y !== oldY) {
            this.emitter.emit('gameObjectUpdated', {
              id: object.id,
              x: object.x,
              y: object.y
            });
          }
        }
      });
    }
  }

  render(context) {
    if (!this.currentScene) return;

    const gameObjectsArray = Array.from(this.currentScene.gameObjects.values());
    const sortedGameObjects = gameObjectsArray.sort((a, b) => a.layer - b.layer);

    sortedGameObjects.forEach((object) => {
      if (typeof object.render === 'function') {
        object.render(context);
      }
    });
  }

  getCurrentScene() {
    return this.currentScene;
  }

  getGameObjectsFromCurrentScene() {
    return this.currentScene ? this.currentScene.gameObjects : [];
  }

  getGameObjectsByType(type) {
    if (!this.currentScene) return [];
    return Array.from(this.currentScene.gameObjects.values()).filter((obj) => obj instanceof type);
  }

getGameObjectById(sceneName, id) {
  return this.scenes.get(sceneName)?.gameObjects.get(id) || null;
}
  clearScene(sceneName) {
    if (!this.scenes.has(sceneName)) {
      console.error(`Сцена "${sceneName}" не существует.`);
      return;
    }
    this.scenes.get(sceneName).gameObjects = new Map();
    console.log(`Сцена "${sceneName}" очищена.`);
  }
  changeToFirstScene() {
    const sceneNames = Array.from(this.scenes.keys());
    if (sceneNames.length > 0) {
      this.changeScene(sceneNames[0]);
    } else {
      console.warn("Нет доступных сцен для переключения.");
    }
  }
  setSceneCanComplete(sceneName, canComplete = true) {
    const scene = this.scenes.get(sceneName);
    if (scene) {
      scene.canComplete = canComplete;
      console.log(`Завершение сцены "${sceneName}" разрешено: ${canComplete}`);
    } else {
      console.error(`Сцена "${sceneName}" не найдена.`);
    }
  }

  // Проверить можно ли завершать сцену:
  canSceneComplete(sceneName) {
    const scene = this.scenes.get(sceneName);
    return scene?.canComplete === true;
  }

  changeToNextScene() {
    const sceneNames = Object.keys(this.scenes);
    const currentIndex = sceneNames.indexOf(this.currentScene?.name);
    if (currentIndex !== -1 && currentIndex < sceneNames.length - 1) {
      this.changeScene(sceneNames[currentIndex + 1]);
    } else {
      console.warn("Следующая сцена не найдена или вы находитесь в последней сцене.");
    }
  }
}
