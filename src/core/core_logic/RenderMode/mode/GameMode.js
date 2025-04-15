import { BaseMode } from '../BaseMode.js';

export class GameMode extends BaseMode {
  constructor(core) {
    super(core);
  }

  start() {
    super.start();
    this.sceneManager.changeToFirstScene(); // Переключаемся на первую сцену
    console.log('Game started.');
  }

  update(deltaTime) {
    // Обновляем физику для текущей сцены
    const currentScene = this.sceneManager.getCurrentScene();
    if (
      currentScene &&
      this.core.gameTypeInstance &&
      typeof this.core.gameTypeInstance.physicsEngine.updatePhysics === 'function'
    ) {
      // Преобразуем Map gameObjects в массив
      const gameObjects = Array.from(currentScene.gameObjects.values());
      this.core.gameTypeInstance.physicsEngine.updatePhysics(gameObjects, deltaTime);
    }

    // Обновляем объекты сцены (например, чтобы синхронизировать позицию персонажа)
    super.update(deltaTime);

    // Проверяем, завершен ли уровень
    if (this.isLevelComplete()) {
      this.sceneManager.changeToNextScene();
    }
  }
  
  isLevelComplete() {
    const currentScene = this.sceneManager.getCurrentScene();
    // Уровень завершается ТОЛЬКО если явно установлен параметр canComplete в true
    return currentScene && this.sceneManager.canSceneComplete(currentScene.name);
  }

  render() {
    super.render();
    // Здесь можно добавить рендеринг дополнительных элементов (например, UI)
  }
}
