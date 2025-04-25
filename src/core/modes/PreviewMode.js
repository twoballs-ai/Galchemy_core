import { BaseMode }   from '../BaseMode.js';
import { GameCamera } from '../cameras/GameCamera.js';

export class PreviewMode extends BaseMode {
  enter(core) {
    super.enter(core);
    core.camera = new GameCamera(core.canvas.width, core.canvas.height);
    core.setDebug(false);
  }

  update(dt) {
    // игровая логика сцены
    this.core.scene.update(dt);
  }
}
