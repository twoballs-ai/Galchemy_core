export class Scene {
  constructor(core, emitter) {
    this.objects = [];
    this.updateHooks = [];
    this.activeCamera = null;
    this.selectedObject = null;
    this.emitter = emitter; // 🔧 получаем emitter извне
    this.core = core;

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
    const object = this.objects.find(obj => obj.id === id) ?? null;
    this.selectedObject = object;
  
    // Обновляем в ядре
    this.core?.setSelectedObject?.(object);
  
    // Эмитим событие для остальных слушателей (например, панели объектов)
    this.emitter?.emit?.("objectSelected", object ? { id: object.id } : null);
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
