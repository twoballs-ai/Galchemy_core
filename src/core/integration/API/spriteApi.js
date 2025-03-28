// core/integration/apiFactory.js

export function spriteApi({ core }) {
  const sceneManager = core.getSceneManager();
  const currentScene = sceneManager.getCurrentScene();

  // Вспомогательная функция: берём результат getGameObjectsFromCurrentScene()
  // и, если это Map, превращаем в массив
  function getObjectsAsArray() {
    const data = sceneManager.getGameObjectsFromCurrentScene() || [];
    if (data instanceof Map) {
      return Array.from(data.values());
    }
    // Если уже массив, просто возвращаем
    return data;
  }

  return {
    shape2d: {
      sprite: (params) => {
        const sprite = core.gameTypeInstance.shape2d.sprite(params);
        if (params.name) {
          sprite.name = params.name;
        }
        sceneManager.addGameObjectToScene(currentScene.name, sprite);
        return sprite;
      },
    },

    images: {
      load: (url) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = url;
          img.onload = () => resolve(img);
          img.onerror = () => reject(`Ошибка загрузки изображения: ${url}`);
        });
      },
    },

    // --- Готовые методы для поиска и получения объектов ---
    getByName: (name) => {
      const objects = getObjectsAsArray();
      return objects.find(obj => obj.name === name) || null;
    },

    getById: (id) => {
      const objects = getObjectsAsArray();
      return objects.find(obj => obj.id === id) || null;
    },

    getAll: () => {
      return getObjectsAsArray();
    },

    getAllByType: (type) => {
      const objects = getObjectsAsArray();
      return objects.filter(obj => obj.type === type);
    },

    // Просто лог в консоль
    log: (...args) => console.log(...args),
  };
}
