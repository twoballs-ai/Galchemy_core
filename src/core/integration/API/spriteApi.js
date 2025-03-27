// core/integration/apiFactory.js
export function spriteApi({ core }) {
    const sceneManager = core.getSceneManager();
    const currentScene = sceneManager.getCurrentScene();
  
    return {
      shape2d: {
        // Оставили sprite для создания НОВЫХ объектов (если это нужно)
        sprite: (params) => {
          const sprite = core.gameTypeInstance.shape2d.sprite(params);
          if (params.name) {
            sprite.name = params.name;
          }
          sceneManager.addGameObjectToScene(currentScene.name, sprite);
          return sprite;
        },
        // Можно добавить и spriteGrid, character, enemy, etc. 
        // shape2d.character: ...
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
  
      // --- Готовые объекты ---
  
      getByName: (name) => {
        const objects = sceneManager.getGameObjectsFromCurrentScene();
        return objects.find(obj => obj.name === name) || null;
      },
  
      getById: (id) => {
        const objects = sceneManager.getGameObjectsFromCurrentScene();
        return objects.find(obj => obj.id === id) || null;
      },
  
      getAll: () => {
        return sceneManager.getGameObjectsFromCurrentScene();
      },
  
      getAllByType: (type) => {
        return sceneManager.getGameObjectsFromCurrentScene().filter(obj => obj.type === type);
      },
  
      // Просто лог в консоль
      log: (...args) => console.log(...args),
    };
  }
  