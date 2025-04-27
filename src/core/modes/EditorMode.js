import { BaseMode }     from './BaseMode.js';
import { EditorCamera } from '../cameras/EditorCamera.js';

export class EditorMode extends BaseMode {
  enter(core) {
      core.setShowHelpers(true);      // сетка + gizmo
      core.setDebugLogging(true);    // без логов
    super.enter(core);
    core.camera = new EditorCamera(core.canvas.width, core.canvas.height);
  
      if (core.renderer?.camPitch !== undefined) {
         core.renderer.camPitch = 0.6;   // ≈ 34° над плоскостью
       }
  }

  update(dt) {
    // логика редактора (если нужна)
  }
}
