import { mat4 } from '../../vendor/gl-matrix/index.js';

export class BaseCamera {
  constructor(w, h) {
    this.width  = w;
    this.height = h;
    this.projection = mat4.create();
    this.view = mat4.create();
    this.position = [0, 0, 10];
    this.lookAt = [0, 0, 0];
    this.up = [0, 1, 0];
  }

  update() {
    mat4.lookAt(this.view, this.position, this.lookAt, this.up);
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
    this.updateProjection();
  }

  getProjection() { return this.projection; }
  getView() { return this.view; }

  updateProjection() { /* переопределяется в подклассах */ }
}
