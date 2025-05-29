import { BaseMode }      from './BaseMode.ts';
import { EditorCamera }  from '../cameras/EditorCamera.ts';
import { EditorControls } from '../controls/EditorControls.ts';
import type { Core }     from '../../types/CoreTypes';

export class EditorMode extends BaseMode {
  private core!: Core;
  private camera!: EditorCamera;          // хранит ссылку на редакторскую
  private controls!: EditorControls;

  enter(core: Core) {
    super.enter(core);
    this.core = core;

    /* helpers / отладка */
    core.setShowHelpers(true);
    core.setDebugLogging(true);

    /* ───────────── ❶ создаём и регистрируем EditorCamera ───────────── */
    this.camera = new EditorCamera(core.canvas.width, core.canvas.height);

    // сообщаем Core, что это «неприкосновенная» камера редактора
    core._registerEditorCamera(this.camera);

    // устанавливаем её активной принудительно (force = true)
    core.setActiveCamera(this.camera, /* force */ true);

    /* ---------------------------------------------------------------- */

    /* пометки для объектов сцены */
    core.scene.objects.forEach(o => { o.isEditorMode = true; });

    /* Controls */
    this.controls = new EditorControls(core);
  }

  exit() {
    this.controls.dispose();
  }

  update(dt: number) {
    this.core.renderer.selectedObject = this.controls.selectedObject;
  }

  resize(w: number, h: number) {
    this.camera.resize(w, h);
  }
}
