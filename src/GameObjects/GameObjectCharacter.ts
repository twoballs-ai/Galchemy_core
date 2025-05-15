import { GameObject3D } from './primitives/GameObject3D.js';

export class GameObjectCharacter extends GameObject3D {
  constructor(gl: WebGL2RenderingContext, opts: any = {}) {
    // Передаём либо mesh, либо пустой заглушечный объект
    const mesh = opts.mesh ?? {
      positions: new Float32Array(),
      indices: new Uint16Array(),
    };

    super(gl, {
      mesh,
      position: opts.position ?? [0, 0, 0],
      color: opts.color ?? '#ffffff',
      textureSrc: opts.textureSrc ?? null,
    });

    this.id = opts.id ?? crypto.randomUUID();
    this.sceneId = opts.sceneId ?? null;
    this.type = 'character';
    this.name = opts.name ?? 'Character';
    this.attachedCamera = null;
  }

  attachCamera(cameraObject) {
    this.attachedCamera = cameraObject;
    cameraObject.attachTo(this);
  }

  // В перспективе: действия, анимации, поведение
}
