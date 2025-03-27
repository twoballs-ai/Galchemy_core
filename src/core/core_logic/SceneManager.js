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
    if (this.scenes[name]) {
      this.currentScene = this.scenes[name];
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

    const sortedGameObjects = this.currentScene.gameObjects.sort((a, b) => a.layer - b.layer);
    console.log(`Рендеринг сцены "${this.currentScene.name}" с объектами:`, sortedGameObjects);

    sortedGameObjects.forEach((object) => {
      if (typeof object.render === "function") {
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
    return this.currentScene.gameObjects.filter((obj) => obj instanceof type);
  }

getGameObjectById(sceneName, id) {
  return this.scenes.get(sceneName)?.gameObjects.get(id) || null;
}
  clearScene(sceneName) {
    if (!this.scenes[sceneName]) {
      console.error(`Сцена "${sceneName}" не существует.`);
      return;
    }
    this.scenes[sceneName].gameObjects = [];
    console.log(`Сцена "${sceneName}" очищена.`);
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
