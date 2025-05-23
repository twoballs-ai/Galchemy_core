import { BaseCamera } from './BaseCamera.ts';
import { mat4, vec3 } from '../../vendor/gl-matrix/index.js';
import { COORD } from "../../core/CoordinateSystem";
import { UP } from '../../constants/CoordSystem.js';
export class EditorCamera extends BaseCamera {
  yaw = 0;
  pitch = 0.6;
  distance = 10;
  target = [0, 0, 0];

  isOrthographic = false; // 🆕 Новый режим камеры
  orthoSize = 10;          // 🆕 Размер ортографической проекции

  constructor(w, h) {
    super(w, h);
    this.updateProjection();
  }

  updateProjection() {
    const aspect = this.width / this.height;
    mat4.perspective(this.projection, Math.PI / 4, aspect, 0.1, 1000);
  }

  update() {
    this.position = [
      this.target[0] + Math.cos(this.yaw) * Math.cos(this.pitch) * this.distance,
      this.target[1] + Math.sin(this.yaw) * Math.cos(this.pitch) * this.distance,
      this.target[2] + Math.sin(this.pitch) * this.distance
    ];
    const m = COORD.lookAt(this.position as vec3, this.target as vec3);
    this.view = m;
  }

  /** Переключение перспективной/ортографической камеры */
  toggleProjectionMode() {
    this.isOrthographic = !this.isOrthographic;
    this.updateProjection();
  }
}
