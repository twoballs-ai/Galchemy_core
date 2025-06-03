import { BaseCamera } from './BaseCamera';
import { mat4 } from '../../vendor/gl-matrix/index.js';

export class GameCamera extends BaseCamera {
  constructor(w, h, opts = {}) {
    super(w, h);
    this.fov = opts.fov || 60;
    this.near = opts.near || 0.1;
    this.far = opts.far || 1000;
    this.position = opts.position || [0, 5, 10];
    this.lookAt = opts.lookAt || [0, 0, 0];
    this.updateProjection();
  }

  updateProjection() {
    mat4.perspective(
      this.projection,
      (this.fov * Math.PI) / 180,
      this.width / this.height,
      this.near,
      this.far
    );
  }

  update() {
    super.update();
    this.updateProjection();
  }
}
