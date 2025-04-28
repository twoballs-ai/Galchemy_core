export class Scene {
  constructor() {
    this.objects = [];
    this.updateHooks = []; // 👈 добавляем массив хуков
    this.activeCamera = null; 
  }

  add(gameObject) {
    this.objects.push(gameObject);
    if (gameObject.isCamera && !this.activeCamera) {
      this.setActiveCamera(gameObject);  // первая камера — по умолчанию
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

 update(deltaTime) {
   // обновляем только тех, у кого есть update()
   this.objects.forEach(obj => {
     if (typeof obj.update === 'function') {
       obj.update(deltaTime);
     }
   });
   // запускаем все хуки
   this.updateHooks.forEach(fn => fn(deltaTime));
 }
}
