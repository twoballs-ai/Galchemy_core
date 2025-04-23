import { mat4 } from '../../vendor/gl-matrix/index.js';

export class GameObject3D {
  constructor(gl, { mesh, position = [0, 0, 0] }) {
    this.gl = gl;
    this.position = position;

    // Vertex buffer
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);

    // Index buffer
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

    this.vertexCount = mesh.indices.length;
    this.indexType = mesh.indices.BYTES_PER_ELEMENT === 2 
      ? gl.UNSIGNED_SHORT 
      : gl.UNSIGNED_INT;  // Requires OES_element_index_uint in WebGL1

    // Cache attribute location per shader program
    this.aPosLocMap = new WeakMap();
  }

  _getAttribLocation(shaderProgram) {
    if (!this.aPosLocMap.has(shaderProgram)) {
      const loc = this.gl.getAttribLocation(shaderProgram, 'aVertexPosition');
      this.aPosLocMap.set(shaderProgram, loc);
    }
    return this.aPosLocMap.get(shaderProgram);
  }

  renderWebGL3D(gl, shaderProgram, uModel) {
    const posLoc = this._getAttribLocation(shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posLoc);

    const modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, this.position);
    gl.uniformMatrix4fv(uModel, false, modelMatrix);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.vertexCount, this.indexType, 0);
  }
}