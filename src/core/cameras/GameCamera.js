import { BaseCamera } from './BaseCamera.js';
import { mat4 }       from '../../../vendor/gl-matrix/index.js';

export class GameCamera extends BaseCamera {
  constructor(w, h) {
    super(w, h);
    this.projection = mat4.create();
    mat4.ortho(this.projection, 0, w, h, 0, -1, 1);
  }
}
