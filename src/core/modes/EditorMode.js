import { BaseMode } from './BaseMode.js';
import { EditorCamera } from '../cameras/EditorCamera.js';

export class EditorMode extends BaseMode {
  enter(core) {
    super.enter(core);
    core.setShowHelpers(true);
    core.setDebugLogging(true);

    const editorCamera = new EditorCamera(core.canvas.width, core.canvas.height);
    core.setActiveCamera(editorCamera);

    core.scene.objects.forEach(o => { o.isEditorMode = true; });
  }

  update(dt) { }
}