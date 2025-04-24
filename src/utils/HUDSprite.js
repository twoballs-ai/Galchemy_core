/** Мини-обёртка чтобы GUI-спрайт выглядел как обычный 2-D объект */
import { mat4 } from '../vendor/gl-matrix/index.js';
export default class HUDSprite {
  constructor(texObj, x, y, layer = 1000) {
    this.texture = texObj.texture;
    this.width   = texObj.width;
    this.height  = texObj.height;
    this.x = x;
    this.y = y;
    this.layer = layer;          // выводим поверх всего
  }
  get modelMatrix() {
    const m = mat4.create();
    mat4.translate(m, m, [
      this.x + this.width * 0.5,
      this.y + this.height * 0.5,
      0
    ]);
    mat4.scale(m, m, [this.width, this.height, 1]);
    return m;
  }
  /** нужен, чтобы WebGLRenderer понял «это 2-D-спрайт» */
  renderWebGL2D(spriteRenderer) { spriteRenderer.add(this); }
}
