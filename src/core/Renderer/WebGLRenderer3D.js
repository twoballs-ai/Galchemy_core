import { Renderer } from './Renderer.js';
// import { mat4 } from 'gl-matrix';
import { mat4 } from '../../gl-matrix/src/index.js';

export class WebGLRenderer3D extends Renderer {
  constructor(graphicalContext, backgroundColor) {
    super(graphicalContext.getContext(), backgroundColor);
    this.canvas = graphicalContext.getCanvas();
    this.gl = graphicalContext.getContext();

    this._initWebGL(backgroundColor);
    this._initShaders();
    this._setupProjection();
  }

  _initWebGL(bgColor) {
    const [r, g, b] = typeof bgColor === 'string' ? this._hexToRGB(bgColor) : bgColor;
    this.gl.clearColor(r, g, b, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  _initShaders() {
    const vertexSrc = `
      attribute vec3 aVertexPosition;
      uniform mat4 uModel;
      uniform mat4 uView;
      uniform mat4 uProjection;

      void main(void) {
        gl_Position = uProjection * uView * uModel * vec4(aVertexPosition, 1.0);
      }
    `;

    const fragmentSrc = `
      void main(void) {
        gl_FragColor = vec4(0.5, 0.8, 1.0, 1.0); // голубой цвет
      }
    `;

    const gl = this.gl;
    const vertexShader = this._loadShader(gl.VERTEX_SHADER, vertexSrc);
    const fragmentShader = this._loadShader(gl.FRAGMENT_SHADER, fragmentSrc);

    this.shaderProgram = gl.createProgram();
    gl.attachShader(this.shaderProgram, vertexShader);
    gl.attachShader(this.shaderProgram, fragmentShader);
    gl.linkProgram(this.shaderProgram);

    if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
      console.error('Shader program error:', gl.getProgramInfoLog(this.shaderProgram));
    }

    gl.useProgram(this.shaderProgram);

    this.aVertexPosition = gl.getAttribLocation(this.shaderProgram, 'aVertexPosition');
    gl.enableVertexAttribArray(this.aVertexPosition);

    this.uModel      = gl.getUniformLocation(this.shaderProgram, 'uModel');
    this.uView       = gl.getUniformLocation(this.shaderProgram, 'uView');
    this.uProjection = gl.getUniformLocation(this.shaderProgram, 'uProjection');
  }

  _setupProjection() {
    const aspect = this.canvas.width / this.canvas.height;
    const fov = Math.PI / 4;
    const near = 0.1;
    const far = 100.0;

    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fov, aspect, near, far);

    const viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, [0, 0, 5], [0, 0, 0], [0, 1, 0]);

    this.gl.uniformMatrix4fv(this.uProjection, false, projectionMatrix);
    this.gl.uniformMatrix4fv(this.uView, false, viewMatrix);
  }

  _loadShader(type, src) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, src);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  _hexToRGB(hex) {
    const bigint = parseInt(hex.replace('#', ''), 16);
    return [(bigint >> 16) / 255, ((bigint >> 8) & 255) / 255, (bigint & 255) / 255];
  }

  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  render(scene) {
    this.clear();
    scene.objects.forEach(obj => {
      if (typeof obj.renderWebGL3D === 'function') {
        obj.renderWebGL3D(this.gl, this.shaderProgram, this.uModel);
      }
    });
  }
}
