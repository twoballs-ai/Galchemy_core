import { BaseMode } from './BaseMode.ts';

export class PreviewMode extends BaseMode {
  enter(core: Core) {
    super.enter(core);
    core.setShowHelpers(false);
    core.setDebugLogging(false);
  
    // --- выбираем камеру из объектов сцены ---
    const cameras = core.scene.objects.filter(o => o.isCamera);
    let cameraObject = cameras[0];
  
    if (cameraObject) {
      core.setActiveCamera(cameraObject.camera || cameraObject);
    } else {
      // Если ни одной камеры нет — создать дефолтную
      const defaultCam = new GameCamera(core.canvas.width, core.canvas.height);
      core.setActiveCamera(defaultCam);
    }
    core.scene.objects.forEach(o => { o.isEditorMode = false; });
  }

  update(dt) {
    this.core.scene.update(dt);
  }
}