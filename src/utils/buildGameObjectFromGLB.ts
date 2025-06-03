import { mat4 } from "gl-matrix";

// Типы для GLTF структуры
interface GLTFBufferView {
  buffer: number;
  byteOffset?: number;
  byteLength: number;
  byteStride?: number;
  target?: number;
}

interface GLTFAccessor {
  bufferView: number;
  byteOffset?: number;
  componentType: number;
  count: number;
  type: string;
  max?: number[];
  min?: number[];
}

interface GLTFMeshPrimitive {
  attributes: {
    POSITION: number;
    NORMAL?: number;
    TEXCOORD_0?: number;
  };
  indices: number;
}

interface GLTFMesh {
  primitives: GLTFMeshPrimitive[];
  name?: string;
}

interface GLTF {
  accessors: GLTFAccessor[];
  bufferViews: GLTFBufferView[];
  meshes: GLTFMesh[];
}

export function buildGameObjectFromGLB(
  gl: WebGL2RenderingContext,
  json: GLTF, // ✅ типизированный JSON
  binary: ArrayBuffer
) {
  const meshDef = json.meshes[0];
  const prim = meshDef.primitives[0];

  const positionAccessorIndex = prim.attributes.POSITION;
  const normalAccessorIndex = prim.attributes.NORMAL;
  const texcoordAccessorIndex = prim.attributes.TEXCOORD_0;
  const indicesAccessorIndex = prim.indices;

  function readAccessor(accessorIndex: number | undefined): Float32Array | Uint16Array | null {
    if (accessorIndex === undefined) return null;

    const accessor = json.accessors[accessorIndex];
    const bufferView = json.bufferViews[accessor.bufferView];
    const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
    const byteLength = accessor.count * getNumComponents(accessor.type) * getComponentSize(accessor.componentType);
    const slice = binary.slice(byteOffset, byteOffset + byteLength);

    switch (accessor.componentType) {
      case 5123: return new Uint16Array(slice); // UNSIGNED_SHORT
      case 5126: return new Float32Array(slice); // FLOAT
      default: throw new Error('Unsupported accessor type');
    }
  }

  function getNumComponents(type: string): number {
    return {
      SCALAR: 1,
      VEC2: 2,
      VEC3: 3,
      VEC4: 4,
      MAT4: 16,
    }[type] ?? (() => { throw new Error(`Unknown accessor type: ${type}`); })();
  }

  function getComponentSize(componentType: number): number {
    return {
      5123: 2, // UNSIGNED_SHORT
      5126: 4, // FLOAT
    }[componentType] ?? (() => { throw new Error(`Unknown component type: ${componentType}`); })();
  }

  const positions = readAccessor(positionAccessorIndex) as Float32Array;
  const normals = readAccessor(normalAccessorIndex) as Float32Array | null;
  const texCoords = readAccessor(texcoordAccessorIndex) as Float32Array | null;
  const indices = readAccessor(indicesAccessorIndex) as Uint16Array;

  // Создание VBO/IBO
  const positionBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  let texCoordBuffer: WebGLBuffer | null = null;
  if (texCoords) {
    texCoordBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
  }

  return {
    id: crypto.randomUUID(),
    type: 'mesh',
    name: meshDef.name || 'GLTFObject',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    vertexBuffer: positionBuffer,
    indexBuffer: indexBuffer,
    texCoordBuffer: texCoordBuffer,
    vertexCount: indices.length,
    mesh: {
      positions,
      indices,
      normals,
      texCoords,
    },
    renderWebGL3D(
      gl: WebGL2RenderingContext,
      shaderProgram: WebGLProgram,
      uModel: WebGLUniformLocation,
      uAmbient: WebGLUniformLocation | null,
      uUseTexture: WebGLUniformLocation | null,
      uNormalMatrix: WebGLUniformLocation | null
    ) {
      const modelMatrix = mat4.create(); // можно добавить transform
      gl.uniformMatrix4fv(uModel, false, modelMatrix);
      if (uAmbient) gl.uniform3fv(uAmbient, [0.6, 0.6, 0.6]);
      if (uUseTexture) gl.uniform1i(uUseTexture, 0); // без текстур

      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      const aPos = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
      gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(aPos);

      if (this.texCoordBuffer) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        const aUV = gl.getAttribLocation(shaderProgram, 'aTexCoord');
        gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aUV);
      }

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0);
    }
  };
}
