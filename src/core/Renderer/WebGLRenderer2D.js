import { Renderer } from './Renderer.js';
import { mat4 } from '../../vendor/gl-matrix/index.js';

export class WebGLRenderer2D extends Renderer {
  constructor(graphicalContext, backgroundColor) {
    super(graphicalContext.getContext(), backgroundColor);
    this.canvas = graphicalContext.getCanvas();
    this.context = graphicalContext.getContext();

    this._initWebGL(backgroundColor);
    this._initShaders();
    this._createProjectionMatrix();
  }

  _initWebGL(bgColor) {
    const [r, g, b] = typeof bgColor === 'string' ? this._hexToRGB(bgColor) : bgColor;
    this.context.clearColor(r, g, b, 1.0);
    this.context.enable(this.context.DEPTH_TEST);
    this.context.viewport(0, 0, this.canvas.width, this.canvas.height);
  }
  _drawDebugGrid(size = 500, step = 50) {
    const lines = [];
  
    for (let i = -size; i <= size; i += step) {
      // горизонтальные линии
      lines.push(-size, i, size, i);
  
      // вертикальные линии
      lines.push(i, -size, i, size);
    }
  
    const vertices = new Float32Array(lines);
  
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
  
    const aPosition = this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition');
    this.gl.enableVertexAttribArray(aPosition);
    this.gl.vertexAttribPointer(aPosition, 2, this.gl.FLOAT, false, 0, 0);
  
    const uColor = this.gl.getUniformLocation(this.shaderProgram, 'uColor');
    this.gl.uniform4fv(uColor, [0.3, 0.3, 0.3, 1]); // серый цвет
  
    this.gl.drawArrays(this.gl.LINES, 0, vertices.length / 2);
  
    this.gl.disableVertexAttribArray(aPosition);
    this.gl.deleteBuffer(buffer);
  }
  _initShaders() {
    const vertexSrc = `
      attribute vec2 aVertexPosition;
      attribute vec4 aVertexColor;
      uniform mat4 uProjection;
      uniform mat4 uTransform;
      varying lowp vec4 vColor;
      void main(void) {
        gl_Position = uProjection * uTransform * vec4(aVertexPosition, 0.0, 1.0);
        vColor = aVertexColor;
      }
    `;

    const fragmentSrc = `
      varying lowp vec4 vColor;
      void main(void) {
        gl_FragColor = vColor;
      }
    `;

    const gl = this.context;
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

    this.uProjection = gl.getUniformLocation(this.shaderProgram, 'uProjection');
    this.vertexPositionAttribute = gl.getAttribLocation(this.shaderProgram, 'aVertexPosition');
    gl.enableVertexAttribArray(this.vertexPositionAttribute);

    this.vertexColorAttribute = gl.getAttribLocation(this.shaderProgram, 'aVertexColor');
    gl.enableVertexAttribArray(this.vertexColorAttribute);
  }

  _createProjectionMatrix() {
    const mat = mat4.create();
    mat4.ortho(mat, 0, this.canvas.width, this.canvas.height, 0, -1, 1);
    this.context.uniformMatrix4fv(this.uProjection, false, mat);
  }

  _loadShader(type, src) {
    const shader = this.context.createShader(type);
    this.context.shaderSource(shader, src);
    this.context.compileShader(shader);
    if (!this.context.getShaderParameter(shader, this.context.COMPILE_STATUS)) {
      console.error('Shader compile error:', this.context.getShaderInfoLog(shader));
      this.context.deleteShader(shader);
      return null;
    }
    return shader;
  }

  _hexToRGB(hex) {
    const bigint = parseInt(hex.replace('#', ''), 16);
    return [(bigint >> 16) / 255, ((bigint >> 8) & 255) / 255, (bigint & 255) / 255];
  }

  clear() {
    this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
  }
  drawEntity(entity) {
    if (entity && typeof entity.renderWebGL === 'function') {
      entity.renderWebGL(this.context, this.shaderProgram);
    } else if (entity && typeof entity.renderWebGL3D === 'function') {
      entity.renderWebGL3D(this.context, this.shaderProgram);
    } else {
      console.warn("Entity has no known render method");
    }
  }
  render(scene, debug = false) {
    this.clear();
    
    if (debug) {
      this._drawDebugGrid();
    }
  
    scene.objects.forEach(obj => {
      if (typeof obj.renderWebGL2D === 'function') {
        obj.renderWebGL2D(this.gl, this.shaderProgram, this.uModel);
      }
    });
  }
}
