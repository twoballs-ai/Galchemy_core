import { BaseCamera } from './BaseCamera.ts';
import { mat4, vec3 } from '../../vendor/gl-matrix/index.js';
import { COORD } from "../../core/CoordinateSystem";

export class EditorCamera extends BaseCamera {
  yaw = 0;
  pitch = 0.6;
  distance = 10;
  target: vec3 = [0, 0, 0];

  isOrthographic = false;
  orthoSize = 10;

  constructor(w: number, h: number) {
    super(w, h);
    this.updateProjection();
  }

  updateProjection() {
    const aspect = this.width / this.height;
    if (this.isOrthographic) {
      const size = this.orthoSize;
      mat4.ortho(this.projection, -size * aspect, size * aspect, -size, size, 0.1, 1000);
    } else {
      mat4.perspective(this.projection, Math.PI / 4, aspect, 0.1, 1000);
    }
  }

  update() {
    const cx = Math.cos(this.yaw) * Math.cos(this.pitch);
    const cy = Math.sin(this.pitch);
    const cz = Math.sin(this.yaw) * Math.cos(this.pitch);

    // В Y-up системе камера "вверх-вниз" по Y, "вперёд" — по Z
    this.position = [
      this.target[0] + cx * this.distance,
      this.target[1] + cy * this.distance,
      this.target[2] + cz * this.distance,
    ];

    this.view = COORD.lookAt(this.position, this.target, this.up);
  }

  toggleProjectionMode() {
    this.isOrthographic = !this.isOrthographic;
    this.updateProjection();
  }
}
