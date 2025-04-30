import { BaseMode } from './BaseMode.js';
import { EditorCamera } from '../cameras/EditorCamera.ts';
import { EditorControls } from '../controls/EditorControls.ts';
// import { SelectionOutline2D } from '../Renderer/helpers/SelectionOutline2D.js'; // 🔧 путь и имя
import type { Core } from '../../types/CoreTypes';

export class EditorMode extends BaseMode {
  private core!: Core;
  private controls!: EditorControls;
  // private selectionOutline!: SelectionOutline2D;

  enter(core: Core) {
    super.enter(core);
    this.core = core;

    core.setShowHelpers(true);
    core.setDebugLogging(true);

    const editorCamera = new EditorCamera(core.canvas.width, core.canvas.height);
    core.setActiveCamera(editorCamera);

    core.scene.objects.forEach(o => { o.isEditorMode = true; });

    this.controls = new EditorControls(core);
    // this.selectionOutline = new SelectionOutline2D(core.canvas);
  }

  exit() {
    this.controls.dispose();
  }

  update(dt: number) {
    this.core.renderer.selectedObject = this.controls.selectedObject;

    // this.selectionOutline.draw(
    //   this.core.camera,
    //   this.controls.selectedObject
    // );
  }

  resize(width: number, height: number) {
    // this.selectionOutline.resize(width, height);
  }
}
