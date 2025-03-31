export class BaseMode {
  constructor(core) {
    this.core = core; // Ссылка на ядро
    this.sceneManager = core.sceneManager;
    this.renderer = core.renderer;
  }

  start() {
    console.log(`${this.constructor.name} начат.`);
  }

  stop() {
    console.log(`${this.constructor.name} stopped.`);
  }

  update(deltaTime) {
    // Общая логика обновления, если требуется
    this.sceneManager.update(deltaTime);
  }

  render() {
    // console.log(`${this.constructor.name} rendered.`);
    // Общая логика рендеринга
    this.renderer.clear();
    this.sceneManager.render(this.renderer.context);
  }
}
