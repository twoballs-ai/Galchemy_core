import { SceneManager } from './SceneManager';
import { EventEmitter } from '../utils/EventEmitter';
import { GraphicalContext } from './GraphicalContext';
import { EditorMode } from './modes/EditorMode';
import { Skybox        } from "../GameObjects/SkyBox";
import type { CubemapPaths } from "../GameObjects/SkyBox";
interface CoreOptions {
  canvasId: string;
  width: number;
  height: number;
  backgroundColor?: string;
}

interface IMode {
  enter(core: Core): void;
  exit?(): void;
  update?(dt?: number): void;
}

interface ICamera {
  id: string;
  type: string;
  projection: Float32Array;
  update(): void;
  resize?(w: number, h: number): void;
}

interface IGameObject {
  id: string;
  type: string;
  isEditorMode?: boolean;
  isCamera?: boolean;
  // Новое:
  position?: [number, number, number];
  rotation?: [number, number, number] | [number, number, number, number]; // Эйлер или кватернион
  scale?: [number, number, number];
  worldMatrix?: Float32Array; // mat4
  parent?: IGameObject | null;
  children?: Set<IGameObject>;
  resize?(w: number, h: number): void;
}

export class Core {
  private gc: GraphicalContext;
  public canvas: HTMLCanvasElement;
  public ctx: WebGL2RenderingContext | CanvasRenderingContext2D;
  public renderer: any;
private resizeObs: ResizeObserver | null = null;  
  public sceneManager: SceneManager;
  public emitter: EventEmitter;

  public actionBindings: any[] = [];

  public debugLogging: boolean = false;
  public showHelpers: boolean = false;
  public mode: IMode | null = null;
  public camera: ICamera | null = null;
  private editorCamera!: ICamera;
  private lastTime: number = 0;
  private _running: boolean = false;

  // Добавлено: хранение skybox локально
  private skybox: Skybox | null = null;

  constructor({ canvasId, width, height, backgroundColor = '#000' }: CoreOptions) {
    this.gc = new GraphicalContext(canvasId, backgroundColor, width, height);
    this.canvas = this.gc.getCanvas();
    this.ctx = this.gc.getContext();

    this.renderer = this.gc.getRenderer();
    this.renderer.setCore(this);
    this.emitter = new EventEmitter();
    this.sceneManager = new SceneManager(this, this.emitter);
    this.sceneManager.createScene('main');

    this.loop = this.loop.bind(this);
  }

  getSceneManager(): SceneManager {
    return this.sceneManager;
  }

  setDebugLogging(on: boolean): void {
    this.debugLogging = !!on;
  }

  setShowHelpers(on: boolean): void {
    this.showHelpers = !!on;
  }

  add(...objs: IGameObject[]): void {
    objs.forEach(o => this.scene.add(o));
  }

 resize(w: number, h: number): void {
    this.gc.resize(w, h);          // GraphicalContext сам вызовет renderer.resize
    this.camera?.resize?.(w, h);   // если камерe нужно своё пересчитывание
  }
 /* ② Подключаем наблюдатель к parent-элементу canvas */
  attachResizeObserver(canvas: HTMLCanvasElement): void {
    // сбрасываем старый
    this.resizeObs?.disconnect();

    const handle = () => {
      const p = canvas.parentElement;
      if (p) this.resize(p.clientWidth, p.clientHeight);
    };

    this.resizeObs = new ResizeObserver(handle);

    const parent = canvas.parentElement;
    if (parent) this.resizeObs.observe(parent);

    handle();      // первичная инициализация
  }
  setMode(modeInstance: IMode): void {
    if (this.mode?.exit) this.mode.exit();
    this.mode = modeInstance;
    this.mode.enter(this);
  }

  addObjectsToScene(sceneName: string, objs: IGameObject[]): void {
    objs.forEach(obj => this.sceneManager.addGameObjectToScene(sceneName, obj));
  }

  clearScene(sceneName: string): void {
    this.sceneManager.clearScene(sceneName);
  }

  setActiveCamera(camera: ICamera, force = false): void {
    const inEditor = this.mode instanceof EditorMode;
    if (inEditor && !force && camera !== this.editorCamera) {
      // блокируем переключение, если не принудительно
      return;
    }
    this.camera = camera;
    this.renderer.setCamera(camera);
  }

  /** Вызывается EditorMode при создании редакторской камеры */
  _registerEditorCamera(cam: ICamera): void {
    this.editorCamera = cam;
  }

  setSelectedObject(obj: IGameObject | null): void {
    this.renderer.selectedObject = obj;
  }

  /* ───── Skybox API ───── */
  loadSkybox(paths: CubemapPaths): void {
    if (!(this.ctx instanceof WebGL2RenderingContext)) {
      console.warn("Skybox: WebGL2 not available");
      return;
    }
    this.skybox = new Skybox(this.ctx, paths);
    if (typeof this.renderer.setSkybox === "function") {
      this.renderer.setSkybox(this.skybox);
    }
  }

  start(): void {
    if (this._running) return;
    this._running = true;
    requestAnimationFrame(this.loop);
  }

  stop(): void {
    this._running = false;
    this.resizeObs?.disconnect();
  }

  addSceneObjects(sceneName: string, objs: any[], shapeFactory: Record<string, (options: any) => IGameObject>): void {
    const createdObjs = objs.map(obj => {
      const builder = shapeFactory[obj.type];
      if (!builder) {
        console.warn('Неизвестный тип объекта:', obj.type);
        return null;
      }
      const go = builder({
        ...obj,
        position: [obj.x, obj.y, obj.z],
      });
      go.id = obj.id;
      if (this.showHelpers) go.isEditorMode = true;

      if (go.isCamera && !this.showHelpers) {
        this.setActiveCamera(go as unknown as ICamera); // Приведение, потому что IGameObject не всегда ICamera
      }

      return go;
    }).filter(Boolean) as IGameObject[];

    this.clearScene(sceneName);
    this.addObjectsToScene(sceneName, createdObjs);
  }

  get scene() {
    return this.sceneManager.getCurrentScene();
  }

  private loop(ts: number): void {
    if (!this._running) return;
    const dt = (ts - this.lastTime) / 1000;
    this.lastTime = ts;

    this.mode?.update?.(dt);

    this.scene.update(dt);
    this.renderer.render(this.scene, this.showHelpers);

    if (this.debugLogging) {
      console.log(`[dt=${dt.toFixed(3)}] objs=${this.scene.objects.length}`);
    }

    requestAnimationFrame(this.loop);
  }
}
