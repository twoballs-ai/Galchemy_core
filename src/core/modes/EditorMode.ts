import { BaseMode } from './BaseMode.js';
import { EditorCamera } from '../cameras/EditorCamera.ts';
import { EditorControls } from '../controls/EditorControls.ts'; // подключаем
import type { Core } from '../../types/CoreTypes';

export class EditorMode extends BaseMode {
  private core!: Core;
  private controls!: EditorControls;

  enter(core: Core) {
    super.enter(core);
    this.core = core;

    core.setShowHelpers(true);
    core.setDebugLogging(true);

    const editorCamera = new EditorCamera(core.canvas.width, core.canvas.height);
    core.setActiveCamera(editorCamera);

    core.scene.objects.forEach(o => { o.isEditorMode = true; });

    // здесь вместо ручных событий:
    this.controls = new EditorControls(core);
  }

  exit() {
    this.controls.dispose(); // снимаем все обработчики
  }
  update(dt: number) {
    // чтобы WebGLRenderer знал, что рисовать outline
    this.core.renderer.selectedObject = this.controls.selectedObject;
  }
}
