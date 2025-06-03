import { BaseMode } from './BaseMode';
import { EditorCamera } from '../cameras/EditorCamera';
import { EditorControls } from '../controls/EditorControls';
import { GameObjectCharacter } from '../../GameObjects/GameObjectCharacter';
import { EditorCharacterView } from '../../GameObjects/views/EditorCharacterView';

interface Core {
  canvas: HTMLCanvasElement;
  ctx: WebGLRenderingContext | WebGL2RenderingContext;
  scene: {
    objects: IGameObject[];
    add(obj: IGameObject): void;
  };
  emitter: {
    on(event: string, callback: (payload: any) => void): void;
    off(event: string, callback: (payload: any) => void): void;
  };
  renderer: {
    selectedObject: any;
  };
  setShowHelpers(show: boolean): void;
  setDebugLogging(show: boolean): void;
  setActiveCamera(camera: any, force?: boolean): void;
  _registerEditorCamera(camera: any): void;
}

interface IGameObject {
  id: string;
  type: string;
  isEditorMode?: boolean;
}

export class EditorMode extends BaseMode {
  private core!: Core;
  private camera!: EditorCamera;
  private controls!: EditorControls;
  private onObjectAddedHandler!: (payload: { scene: string; object: IGameObject }) => void;

  enter(core: Core): void {
    super.enter(core);
    this.core = core;

    core.setShowHelpers(true);
    core.setDebugLogging(true);

    this.camera = new EditorCamera(core.canvas.width, core.canvas.height);
    core._registerEditorCamera(this.camera);
    core.setActiveCamera(this.camera, true);

    core.scene.objects.forEach((o: IGameObject) => {
      o.isEditorMode = true;
    });

    this.onObjectAddedHandler = ({ object }) => {
      if (object instanceof GameObjectCharacter) {
        const helper = new EditorCharacterView(
          core.ctx as WebGL2RenderingContext,
          object
        );
        helper.isEditorOnly = true; // <-- если добавишь в класс свойство
        core.scene.add(helper);
      }
    };
    core.emitter.on('objectAdded', this.onObjectAddedHandler);

    this.controls = new EditorControls(core);
  }

  exit(): void {
    this.controls.dispose();
    this.core.emitter.off('objectAdded', this.onObjectAddedHandler);
  }

  override update(): void {
    this.core.renderer.selectedObject = this.controls.selectedObject;
  }

  resize(w: number, h: number): void {
    this.camera.resize(w, h);
  }
}
