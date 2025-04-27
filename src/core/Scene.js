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
