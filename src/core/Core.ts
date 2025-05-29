import { SceneManager } from './SceneManager';
import { EventEmitter } from '../utils/EventEmitter';
import { Physics } from './Physics';
import { GraphicalContext } from './GraphicalContext';
import { EditorMode } from './modes/EditorMode'; 
import { CoreOptions, IMode, ICamera, IGameObject } from '../types/CoreTypes';

export class Core {
  private gc: GraphicalContext;
  public canvas: HTMLCanvasElement;
  public ctx: WebGL2RenderingContext | CanvasRenderingContext2D;
  public renderer: any;

  public sceneManager: SceneManager;
  public emitter: EventEmitter;
  public physics: Physics | null = null;
  public actionBindings: any[] = [];

  public debugLogging: boolean = false;
  public showHelpers: boolean = false;
  public mode: IMode | null = null;
  public camera: ICamera | null = null;
  private editorCamera!: ICamera; 
  private lastTime: number = 0;
  private _running: boolean = false;

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

  getSceneManager() {
    return this.sceneManager;
  }

  setDebugLogging(on: boolean) {
    this.debugLogging = !!on;
  }

  setShowHelpers(on: boolean) {
    this.showHelpers = !!on;
  }

  enablePhysics({ gravity = 0 }: { gravity?: number }) {
    this.physics = new Physics(gravity);
  }

  add(...objs: IGameObject[]) {
    objs.forEach(o => this.scene.add(o));
  }

  resize(w: number, h: number) {
    this.gc.resize(w, h);
    this.renderer.resize?.(w, h);
    this.camera?.resize?.(w, h);
  }

  setMode(modeInstance: IMode) {
    if (this.mode?.exit) this.mode.exit();
    this.mode = modeInstance;
    this.mode.enter(this);
  }

  addObjectsToScene(sceneName: string, objs: IGameObject[]) {
    objs.forEach(obj => this.sceneManager.addGameObjectToScene(sceneName, obj));
  }

  clearScene(sceneName: string) {
    this.sceneManager.clearScene(sceneName);
  }

  setActiveCamera(camera: ICamera, force = false) {
    const inEditor = this.mode instanceof EditorMode;
    if (inEditor && !force && camera !== this.editorCamera) {
      // блокируем переключение, если не принудительно
      return;
    }
    this.camera = camera;
    this.renderer.setCamera(camera);
  }

  /** Вызывается EditorMode при создании редакторской камеры */
  _registerEditorCamera(cam: ICamera) {
    this.editorCamera = cam;
  }

  setSelectedObject(obj: IGameObject | null) {
    this.renderer.selectedObject = obj;
  }
  start() {
    if (this._running) return;
    this._running = true;
    requestAnimationFrame(this.loop);
  }

  stop() {
    this._running = false;
  }
addSceneObjects(sceneName: string, objs: any[], shapeFactory: any) {
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

    if (go.isCamera && !this.showHelpers) {   // только если НЕ редактор
      this.setActiveCamera(go);
    }

    return go;
  }).filter(Boolean);

  this.clearScene(sceneName);
  this.addObjectsToScene(sceneName, createdObjs);
}
  get scene() {
    return this.sceneManager.getCurrentScene();
  }

  private loop(ts: number) {
    if (!this._running) return;
    const dt = (ts - this.lastTime) / 1000;
    this.lastTime = ts;

    this.mode?.update?.(dt);
    this.physics?.update?.(dt);

    this.scene.update(dt);
    this.renderer.render(this.scene, this.showHelpers);

    if (this.debugLogging) {
      console.log(`[dt=${dt.toFixed(3)}] objs=${this.scene.objects.length}`);
    }

    requestAnimationFrame(this.loop);
  }
}
