export class Scene {
    constructor() {
      this.objects = [];
    }
  
    add(gameObject) {
      this.objects.push(gameObject);
    }
  
    update(deltaTime) {
      this.objects.forEach(obj => obj.update(deltaTime));
    }
  }
  