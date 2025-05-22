// GameObjects/Skybox.ts
import { Shader } from "../Renderer/internal/Shader";
import { skyboxVertex }        from "../Renderer/shaders/SkyboxVertex.ts";
import { skyboxFragmentCube }  from "../Renderer/shaders/SkyboxFragmentCube.ts";
import { loadCubemap }         from "../utils/loadCubemap.ts";

export interface CubemapPaths {
  posx: string; negx: string;
  posy: string; negy: string;
  posz: string; negz: string;
}

export class Skybox {
  private gl: WebGL2RenderingContext;
  private shader!: Shader;
  private vao!: WebGLVertexArrayObject;
  private ibo!: WebGLBuffer;
  private cubeTex!: WebGLTexture;
  private ready = false;

  constructor(gl: WebGL2RenderingContext, paths: CubemapPaths) {
    this.gl = gl;
    this._initCubeGeometry();
    this._initShader();
    this._loadCubemap(paths);
  }

  /* ───────── public API ───────── */
  render(viewMat: mat4, projMat: mat4) {
    if (!this.ready) return;

    const gl = this.gl;
    gl.depthMask(false);
    gl.disable(gl.DEPTH_TEST);

    // убираем перенос
    const view = mat4.clone(viewMat);
    view[12] = view[13] = view[14] = 0;

    this.shader.use();
    gl.uniformMatrix4fv(this.shader.uniform("uViewNoTrans")!, false, view);
    gl.uniformMatrix4fv(this.shader.uniform("uProj")!,        false, projMat);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubeTex);
    gl.uniform1i(this.shader.uniform("uSkyCube")!, 0);

    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);

    gl.depthMask(true);
    gl.enable(gl.DEPTH_TEST);
  }

  /* ───────── private ───────── */
  async _loadCubemap(p: CubemapPaths) {
    this.cubeTex = await loadCubemap(this.gl, {
      [this.gl.TEXTURE_CUBE_MAP_POSITIVE_X]: p.posx,
      [this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X]: p.negx,
      [this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y]: p.posy,
      [this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y]: p.negy,
      [this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z]: p.posz,
      [this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]: p.negz,
    });
    this.ready = true;
  }

  _initShader() {
    this.shader = Shader.fromSource(
      this.gl,
      skyboxVertex,
      skyboxFragmentCube
    );
  }

  _initCubeGeometry() {
    const gl = this.gl;
    const V = new Float32Array([
      -1,-1,-1,  1,-1,-1,  1, 1,-1, -1, 1,-1,
      -1,-1, 1,  1,-1, 1,  1, 1, 1, -1, 1, 1
    ]);
    const I = new Uint16Array([
      0,1,2,0,2,3,  4,6,5,4,7,6,
      3,2,6,3,6,7,  0,5,1,0,4,5,
      1,5,6,1,6,2,  0,3,7,0,7,4
    ]);

    this.vao = gl.createVertexArray()!;
    const vbo = gl.createBuffer()!;
    this.ibo = gl.createBuffer()!;

    gl.bindVertexArray(this.vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, V, gl.STATIC_DRAW);
    const aPos = 0;            // зашьём location 0
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, I, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
  }
}
