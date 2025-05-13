// src/core/GameObjects/GameObjectCharacter.ts
import { GameObject3D } from './primitives/GameObject3D.ts';

export class GameObjectCharacter extends GameObject3D {
  constructor(gl: WebGL2RenderingContext, opts: any = {}) {
    super(gl, {
      mesh: opts.mesh ?? null, // можно передать mesh вручную или позже присвоить
      position: opts.position ?? [0, 0, 0],
      color: opts.color ?? '#ffffff',
      textureSrc: opts.textureSrc ?? null,
    });

    this.type = 'character';
    this.name = opts.name ?? 'Character';
    this.attachedCamera = null;
  }

  attachCamera(cameraObject) {
    this.attachedCamera = cameraObject;
    cameraObject.attachTo(this); // обратная связь
  }

  // В перспективе — движения, действия, навигация
  // moveForward(), jump(), playAnimation(), etc.
}
