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
    color    = '#ffffff',
    textureSrc = null,
  }) {
    this.gl       = gl;
    this.position = position.slice();                // база (для корней)

    /* цвет → vec4 */
    this.color    = Array.isArray(color)
      ? (color.length === 3 ? [...color, 1] : color.slice(0, 4))
      : hexToRGB(color);

    this.texture = null;
    this.textureLoaded = false;
    console.log(textureSrc)
    if (textureSrc) {
      this.texture = this._loadTexture(textureSrc);
    }
    if (mesh.texCoords) {
      this.texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, mesh.texCoords, gl.STATIC_DRAW);
    } else {
      this.texCoordBuffer = null;
    }
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
  _loadTexture(src) {
    const gl = this.gl;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Пустая текстура пока картинка не загрузится
    const pixel = new Uint8Array([255, 255, 255, 255]);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, pixel
    );

    const image = new Image();
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA,
        gl.RGBA, gl.UNSIGNED_BYTE, image
      );
      gl.generateMipmap(gl.TEXTURE_2D);
      this.textureLoaded = true; 
    };
    image.src = src;

    return texture;
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
  /*──────────────────── Рендер ───────────────────*/
renderWebGL3D(gl, shaderProgram, uModel, uColor, uUseTexture) {
  const posLoc = this._getAttribLocation(shaderProgram);

  /* позиция */
  const modelMatrix = mat4.create();
  const [wx, wy, wz] = this.worldPosition;
  mat4.translate(modelMatrix, modelMatrix, [wx, wy, wz]);
  gl.uniformMatrix4fv(uModel, false, modelMatrix);

  /* цвет или текстура */
  if (this.texture && this.textureLoaded) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(uUseTexture, true); // ← используем сохранённую локацию
  } else {
    gl.uniform4fv(uColor, this.color);
    gl.uniform1i(uUseTexture, false); // ← используем сохранённую локацию
  }

  /* атрибут позиции */
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(posLoc);

  /* атрибут текстурных координат */
  const texCoordLoc = gl.getAttribLocation(shaderProgram, "aTexCoord");
  if (this.texCoordBuffer && texCoordLoc !== -1) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);
  } else {
    gl.disableVertexAttribArray(texCoordLoc);
  }

  /* индексный буфер */
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.drawElements(gl.TRIANGLES, this.vertexCount, this.indexType, 0);
}
}
