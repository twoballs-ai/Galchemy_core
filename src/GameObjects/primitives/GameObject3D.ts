// src/core/GameObjects/GameObject3D.js
import { mat4, mat3 } from 'gl-matrix';
import { hexToRGB } from '../../utils/ColorMixin';

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
constructor(gl, {
  mesh = null,
  position = [0, 0, 0],
  color = '#ffffff',
  textureSrc = null,
  roughness = 0.8,
  metalness = 0.0
}) {
  this.gl = gl;
  this.mesh = mesh;
  this.position = position.slice();
  this.roughness = roughness;
  this.metalness = metalness;

  this.color = Array.isArray(color)
    ? (color.length === 3 ? [...color, 1] : color.slice(0, 4))
    : hexToRGB(color);

  this.texture = null;
  this.textureLoaded = false;
  if (textureSrc) {
    this.texture = this._loadTexture(textureSrc);
  }

  // ===== 🔐 mesh-safe логика ниже =====
  const hasValidMesh = mesh && mesh.positions && mesh.indices;
  if (hasValidMesh) {
    this.boundingRadius = (() => {
      let max = 0;
      const p = mesh.positions;
      for (let i = 0; i < p.length; i += 3) {
        const d = Math.hypot(p[i], p[i + 1], p[i + 2]);
        if (d > max) max = d;
      }
      return max;
    })();

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

    this.vertexCount = mesh.indices.length;
    this.indexType = mesh.indices.BYTES_PER_ELEMENT === 2
      ? gl.UNSIGNED_SHORT
      : gl.UNSIGNED_INT;

    if (mesh.texCoords) {
      this.texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, mesh.texCoords, gl.STATIC_DRAW);
    } else {
      this.texCoordBuffer = null;
    }

    if (mesh.normals) {
      this.normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, mesh.normals, gl.STATIC_DRAW);
    } else {
      this.normalBuffer = null;
    }

  } else {
    // Объект без геометрии — всё null / 0
    this.boundingRadius = 0;
    this.vertexBuffer = null;
    this.indexBuffer = null;
    this.texCoordBuffer = null;
    this.normalBuffer = null;
    this.vertexCount = 0;
    this.indexType = gl.UNSIGNED_SHORT;
  }

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
    /* uAmbientColor = vec3, uNormalMatrix = mat3 */
    renderWebGL3D(gl, shaderProgram, uModel, uAmbientColor, uUseTexture, uNormalMatrix) {
      if (!this.vertexBuffer || !this.indexBuffer || this.vertexCount === 0) return;
    
      const posLoc = this._getAttribLocation(shaderProgram);
    
      const model = mat4.create();
      mat4.translate(model, model, this.worldPosition);
      gl.uniformMatrix4fv(uModel, false, model);
    
      const nrm = mat3.create();
      mat3.normalFromMat4(nrm, model);
      gl.uniformMatrix3fv(uNormalMatrix, false, nrm);
    
      if (this.texture && this.textureLoaded) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(uUseTexture, true);
      } else {
        gl.uniform3fv(uAmbientColor, this.color.slice(0, 3));
        gl.uniform1i(uUseTexture, false);
      }
    
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(posLoc);

// texCoords
const texLoc = gl.getAttribLocation(shaderProgram, "aTexCoord");
if (this.texCoordBuffer && texLoc !== -1) {
  gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
  gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(texLoc);
} else if (texLoc >= 0) {
  gl.disableVertexAttribArray(texLoc);
}

// normals
const normLoc = gl.getAttribLocation(shaderProgram, 'aVertexNormal');
if (this.normalBuffer && normLoc !== -1) {
  gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
  gl.vertexAttribPointer(normLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(normLoc);
} else if (normLoc >= 0) {
  gl.disableVertexAttribArray(normLoc);
}
        // 2) normalMatrix  (нужно для блика / света)
    const normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix, model);
    gl.uniformMatrix3fv(uNormalMatrix, false, normalMatrix);

    // индексы
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.vertexCount, this.indexType, 0);
  }
}
