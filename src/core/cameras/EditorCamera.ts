import { BaseCamera } from './BaseCamera.ts';
import { mat4, vec3 } from '../../vendor/gl-matrix/index.js';

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
    const x = this.target[0] + Math.cos(this.yaw) * Math.cos(this.pitch) * this.distance;
    const y = this.target[1] + Math.sin(this.pitch) * this.distance;
    const z = this.target[2] + Math.sin(this.yaw) * Math.cos(this.pitch) * this.distance;
    this.position = [x, y, z];
  
    mat4.lookAt(this.view, this.position, this.target, [0, 1, 0]);
  }

  /** Переключение перспективной/ортографической камеры */
  toggleProjectionMode() {
    this.isOrthographic = !this.isOrthographic;
    this.updateProjection();
  }
}
