import { BaseMode } from './BaseMode.ts';

export class PreviewMode extends BaseMode {
  enter(core) {
    super.enter(core);
    core.setShowHelpers(false);
    core.setDebugLogging(false);

    const cameraObject = core.scene.objects.find(o => o.isCamera);
    if (cameraObject) {
      console.warn('камеры в сцене! Используется ');
      cameraObject.update();
      core.setActiveCamera(cameraObject.camera);
    } else {
      console.warn('Нет активной камеры в сцене! Используется дефолтная');
      const defaultCam = new GameCamera(core.canvas.width, core.canvas.height);
      core.setActiveCamera(defaultCam);
    }

    core.scene.objects.forEach(o => { o.isEditorMode = false; });
  }

  update(dt) {
    this.core.scene.update(dt);
  }
}