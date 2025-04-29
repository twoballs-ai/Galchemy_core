// src/core/GameObjects/GameObject3D.js
import { mat4 }     from '../../../vendor/gl-matrix/index.js';
import { hexToRGB } from '../../../utils/ColorMixin.js';

export class GameObject3D {
  /** публичные поля */
  parent   = null;         // GameObject3D | null
  children = new Set();    // обратные ссылки
  offset   = [0, 0, 0];    // локальный сдвиг
  get x() { return this.position[0]; }
  set x(v){ this.position[0] = v; }
  get y() { return this.position[1]; }
  set y(v){ this.position[1] = v; }
  get z() { return this.position[2]; }
  set z(v){ this.position[2] = v; }

  /**
   * @param {WebGLRenderingContext} gl
   * @param {{
   *   mesh: { positions: Float32Array, indices: Uint16Array|Uint32Array, texCoords?: Float32Array },
   *   position?: [number,number,number],
   *   color?: string|number[],
   *   textureSrc?: string
   * }} opts
   */
  constructor(gl, { mesh, position = [0,0,0], color='#ffffff', textureSrc=null }) {
    this.gl       = gl;
    this.mesh     = mesh;                          // сохраним меш для raycast’а
    this.position = position.slice();

    // цвет → vec4
    this.color = Array.isArray(color)
      ? (color.length===3 ? [...color,1] : color.slice(0,4))
      : hexToRGB(color);

    // текстура
    this.texture = null;
    this.textureLoaded = false;
    if (textureSrc) {
      this.texture = this._loadTexture(textureSrc);
    }

    // вычисляем радиус bounding-сферы в локальных coords
    this.boundingRadius = (() => {
      let max = 0;
      const p = mesh.positions;
      for (let i=0; i<p.length; i+=3) {
        const d = Math.hypot(p[i], p[i+1], p[i+2]);
        if (d > max) max = d;
      }
      return max;
    })();

    // VBO / IBO
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

    this.vertexCount = mesh.indices.length;
    this.indexType   = mesh.indices.BYTES_PER_ELEMENT===2
      ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;

    // texCoords (если есть)
    if (mesh.texCoords) {
      this.texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, mesh.texCoords, gl.STATIC_DRAW);
    } else {
      this.texCoordBuffer = null;
    }

    // cache атрибутов
    this.aPosLocMap = new WeakMap();
  }

  _loadTexture(src) {
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    const white = new Uint8Array([255,255,255,255]);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,white);
    const img = new Image();
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
      gl.generateMipmap(gl.TEXTURE_2D);
      this.textureLoaded = true;
    };
    img.src = src;
    return tex;
  }

  attachTo(parentGO, offset=[0,0,0]) {
    if (this.parent) this.parent.children.delete(this);
    this.parent = parentGO;
    this.offset = offset.slice();
    parentGO.children.add(this);
    return this;
  }
  detach() {
    if (this.parent) this.parent.children.delete(this);
    this.parent = null;
    return this;
  }

  get worldPosition() {
    if (!this.parent) return this.position;
    const p = this.parent.worldPosition;
    return [p[0]+this.offset[0], p[1]+this.offset[1], p[2]+this.offset[2]];
  }

  _getAttribLocation(shaderProgram) {
    if (!this.aPosLocMap.has(shaderProgram)) {
      const loc = this.gl.getAttribLocation(shaderProgram, 'aVertexPosition');
      this.aPosLocMap.set(shaderProgram, loc);
    }
    return this.aPosLocMap.get(shaderProgram);
  }

  /**
   * Вызывается из WebGLRenderer.render
   */
  renderWebGL3D(gl, shaderProgram, uModel, uColor, uUseTexture) {
    const posLoc = this._getAttribLocation(shaderProgram);

    // modelMatrix
    const model = mat4.create();
    const [wx,wy,wz] = this.worldPosition;
    mat4.translate(model, model, [wx,wy,wz]);
    gl.uniformMatrix4fv(uModel, false, model);

    // цвет/текстура
    if (this.texture && this.textureLoaded) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.uniform1i(uUseTexture, true);
    } else {
      gl.uniform4fv(uColor, this.color);
      gl.uniform1i(uUseTexture, false);
    }

    // позиции
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posLoc);

    // texCoords
    const texLoc = gl.getAttribLocation(shaderProgram, "aTexCoord");
    if (this.texCoordBuffer && texLoc !== -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
      gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(texLoc);
    } else {
      gl.disableVertexAttribArray(texLoc);
    }

    // индексы
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.vertexCount, this.indexType, 0);
  }
}
