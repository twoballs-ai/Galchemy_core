import { SceneManager } from './SceneManager';
import { EventEmitter } from '../utils/EventEmitter';
import { Physics } from './Physics';
import { GraphicalContext } from './GraphicalContext';

import { CoreOptions, IMode, ICamera, IGameObject } from '../types/CoreTypes';

export class Core {
  private gc: GraphicalContext;
  public canvas: HTMLCanvasElement;
  public ctx: WebGL2RenderingContext | CanvasRenderingContext2D;
  public renderer: any;

  public emitter: EventEmitter;
  public sceneManager: SceneManager;
  public physics: Physics | null = null;
  public actionBindings: any[] = [];

  public debugLogging: boolean = false;
  public showHelpers: boolean = false;
  public mode: IMode | null = null;
  public camera: ICamera | null = null;
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

  setActiveCamera(camera: ICamera) {
    this.camera = camera;
    camera.update();
    this.renderer.setCamera(camera);
  }

  start() {
    if (this._running) return;
    this._running = true;
    requestAnimationFrame(this.loop);
  }
  setSelectedObject(obj: SceneObject | null) {
    this.renderer.selectedObject = obj; // для обводки
  }
  
  stop() {
    this._running = false;
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
