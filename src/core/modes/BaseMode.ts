// Базовый интерфейс режима — хранит ссылку на Core
export class BaseMode {
    enter(core) {                 // вызывается Core.setMode()
      this.core = core;
    }
    exit() { }
    update(/* dt */) { }
  }
  