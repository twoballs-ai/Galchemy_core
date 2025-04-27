// src/core/GameObjects/GameObject3D.js
import { mat4 }      from '../../../vendor/gl-matrix/index.js';
import { hexToRGB }  from '../../../utils/ColorMixin.js';

export class GameObject3D {
  /** ——— Public fields, доступные снаружи ——— */
  parent   = null;          // GameObject3D | null
  children = new Set();     // обратные ссылки
  offset   = [0, 0, 0];     // локальный сдвиг в КООРДИНАТАХ родителя
  get x() { return this.position[0]; }
  set x(v){ this.position[0] = v; }

  get y() { return this.position[1]; }
  set y(v){ this.position[1] = v; }

  get z() { return this.position[2]; }
  set z(v){ this.position[2] = v; }
  constructor(gl, {
    mesh,
    position = [0, 0, 0],
    color    = '#ffffff'
  }) {
    this.gl       = gl;
    this.position = position.slice();                // база (для корней)

    /* цвет → vec4 */
    this.color = Array.isArray(color)
      ? (color.length === 3 ? [ ...color, 1 ] : color.slice(0, 4))
      : hexToRGB(color);           // hexToRGB уже возвращает 4-комп. массив

    /* ------------ VBO / IBO ------------ */
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

    this.vertexCount = mesh.indices.length;
    this.indexType   = mesh.indices.BYTES_PER_ELEMENT === 2
      ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;

    this.aPosLocMap = new WeakMap();   // кеш location’ов
  }

  /*──────────────────── 1. Иерархия ────────────────────*/
  attachTo(parentGO, offset = [0,0,0]) {
    if (this.parent) this.parent.children.delete(this);
    this.parent  = parentGO;
    this.offset  = offset.slice();
    parentGO.children.add(this);
    return this;
  }
  detach() {
    if (this.parent) this.parent.children.delete(this);
    this.parent = null;
    return this;
  }

  /** world-position с учётом цепочки родителей */
  get worldPosition() {
    if (!this.parent) return this.position;
    const p = this.parent.worldPosition;
    return [
      p[0] + this.offset[0],
      p[1] + this.offset[1],
      p[2] + this.offset[2]
    ];
  }

  /*──────────────────── 2. Отрисовка ───────────────────*/
  _getAttribLocation(shaderProgram) {
    if (!this.aPosLocMap.has(shaderProgram)) {
      const loc = this.gl.getAttribLocation(shaderProgram, 'aVertexPosition');
      this.aPosLocMap.set(shaderProgram, loc);
    }
    return this.aPosLocMap.get(shaderProgram);
  }

  /**
   * Вызывается WebGLRenderer
   * @param {WebGLRenderingContext} gl
   * @param {WebGLProgram}          shaderProgram
   * @param {WebGLUniformLocation}  uModel
   * @param {WebGLUniformLocation}  uColor
   */
  renderWebGL3D(gl, shaderProgram, uModel, uColor) {
    const posLoc = this._getAttribLocation(shaderProgram);

    /* цвет */
    gl.uniform4fv(uColor, this.color);

    /* позиция */
    const modelMatrix = mat4.create();
    const [wx, wy, wz] = this.worldPosition;   // ← учёт родителей
    mat4.translate(modelMatrix, modelMatrix, [wx, wy, wz]);
    gl.uniformMatrix4fv(uModel, false, modelMatrix);

    /* геометрия */
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posLoc);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.vertexCount,
                    this.indexType, 0);
  }
}
