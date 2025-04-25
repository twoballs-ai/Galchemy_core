import { BaseMode }     from '../BaseMode.js';
import { EditorCamera } from '../cameras/EditorCamera.js';

export class EditorMode extends BaseMode {
  enter(core) {
    super.enter(core);
    core.camera = new EditorCamera(core.canvas.width, core.canvas.height);
    core.setDebug(true);
  }

  update(dt) {
    // логика редактора (если нужна)
  }
}
