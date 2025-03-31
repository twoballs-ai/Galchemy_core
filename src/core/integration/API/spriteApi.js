export function spriteApi({ core }) {
  const sceneManager = core.getSceneManager();
  const currentScene = sceneManager.getCurrentScene();

  return {
    create: (params) => {
      const sprite = core.gameTypeInstance.shape2d.sprite(params);
      if (params.name) {
        sprite.name = params.name;
      }
      sceneManager.addGameObjectToScene(currentScene.name, sprite);
      return sprite;
    },
    // Здесь можно добавить специфичные методы для спрайтов
  };
}