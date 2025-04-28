import { BaseCamera } from './BaseCamera.js';
import { mat4 } from '../../vendor/gl-matrix/index.js';

export class EditorCamera extends BaseCamera {
  constructor(w, h) {
    super(w, h);
    this.position = [0, 10, 10];  // Камера сверху и сбоку
    this.lookAt = [0, 0, 0];
    this.updateProjection();
  }

  updateProjection() {
    const aspect = this.width / this.height;
    const scale = 10;
    mat4.ortho(this.projection, -aspect * scale, aspect * scale, -scale, scale, 0.1, 1000);
  }

  update() {
    super.update();
    this.updateProjection();
  }
}
