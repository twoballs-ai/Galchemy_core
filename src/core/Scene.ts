export class Scene {
  constructor(emitter) {
    this.objects = [];
    this.updateHooks = [];
    this.activeCamera = null;
    this.selectedObject = null;
    this.emitter = emitter; // 🔧 получаем emitter извне
  }

  add(gameObject) {
    this.objects.push(gameObject);
    if (gameObject.isCamera && !this.activeCamera) {
      this.setActiveCamera(gameObject);
    }
  }

  addUpdateHook(fn) {
    this.updateHooks.push(fn);
  }

  setActiveCamera(cameraObject) {
    if (cameraObject?.isCamera) {
      this.activeCamera = cameraObject;
    } else {
      console.warn('Попытка установить активной не-камеру');
    }
  }

  // 🔧 Выделение объекта по ID
  setSelectedById(id) {
    const object = this.objects.find(obj => obj.id === id); // Ищем объект по ID
    if (object) {
      this.selectedObject = object; // Устанавливаем объект как выбранный
      this.emitter.emit("objectSelected", { id: object.id }); // Эмитируем событие с ID
    } else {
      this.selectedObject = null; // Если объект не найден
      this.emitter.emit("objectSelected", null); // Эмитируем событие с null
    }
  }

  update(deltaTime) {
    this.objects.forEach(obj => {
      if (typeof obj.update === 'function') {
        obj.update(deltaTime);
      }
    });
    this.updateHooks.forEach(fn => fn(deltaTime));
  }
}
