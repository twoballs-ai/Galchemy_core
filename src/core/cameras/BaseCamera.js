export class BaseCamera {
  constructor(w, h) {
    this.width  = w;
    this.height = h;
    this.projection = null;
  }
  update() { }
  getProjection() { return this.projection; }
}
