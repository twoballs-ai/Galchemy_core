export class Shader {
  private _uniforms = new Map<string, WebGLUniformLocation | null>();
  private _attribs  = new Map<string, number>();

  constructor(
    private gl: WebGL2RenderingContext,
    readonly program: WebGLProgram
  ) {}

  use() {
    this.gl.useProgram(this.program);
  }

  /** Кэшируем, чтобы не дёргать GL много раз */
  uniform(name: string) {
    if (!this._uniforms.has(name)) {
      this._uniforms.set(name, this.gl.getUniformLocation(this.program, name));
    }
    return this._uniforms.get(name);
  }

  attrib(name: string) {
    if (!this._attribs.has(name)) {
      this._attribs.set(name, this.gl.getAttribLocation(this.program, name));
    }
    return this._attribs.get(name);
  }

  /* ---------- factory helpers ---------- */

  /** Скомпилировать из двух строк GLSL */
  static fromSource(
    gl: WebGL2RenderingContext,
    vsSrc: string,
    fsSrc: string
  ) {
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, vsSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    return new Shader(gl, prog);
  }
}
