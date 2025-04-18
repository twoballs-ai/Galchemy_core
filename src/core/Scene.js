export class Scene {
  constructor() {
    this.objects = [];
    this.updateHooks = []; // 👈 добавляем массив хуков
  }

  add(gameObject) {
    this.objects.push(gameObject);
  }

  addUpdateHook(fn) {
    this.updateHooks.push(fn);
  }

  update(deltaTime) {
    // обновляем все объекты
    this.objects.forEach(obj => obj.update(deltaTime));
    // запускаем все хуки
    this.updateHooks.forEach(fn => fn(deltaTime));
  }
}
