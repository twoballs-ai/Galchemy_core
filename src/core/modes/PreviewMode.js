import { BaseMode } from './BaseMode.js';

export class PreviewMode extends BaseMode {
  enter(core) {
    core.setShowHelpers(false);
    core.setDebugLogging(false);
    super.enter(core);

    // 🆕 Если есть активная камера на сцене — использовать её
    if (core.scene.activeCamera) {
      core.camera = core.scene.activeCamera;
    } else {
      console.warn('Нет активной камеры в сцене! Используется дефолтная');
    }
  }

  update(dt) {
    this.core.scene.update(dt);
  }
}
