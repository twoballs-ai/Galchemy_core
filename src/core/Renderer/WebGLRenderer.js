/* ===================================================================== *
 *  src/Renderer/WebGLRenderer3D.js
 * ===================================================================== */

import { Renderer } from "./Renderer.js";
import { mat4 } from "../../vendor/gl-matrix/index.js";
import { SpriteRenderer } from "./SpriteRenderer.js";
import { drawGrid }            from "./helpers/GridHelper.js";
import { drawGizmo }           from "./helpers/GizmoHelper.js";
export class WebGLRenderer extends Renderer {
  constructor(graphicalContext, backgroundColor) {
    super(graphicalContext.getContext(), backgroundColor);

    this.canvas = graphicalContext.getCanvas();
    this.gl = graphicalContext.getContext();

    /* орбитальная камера */
    this.camYaw = 0;
    this.camPitch =  0.6; 
    this.camDist = 6;
    this.camTarget = [0, 0, 0];
    this._drag = null;

    /* сетка */
    this.gridSize = 10;
    this.gridStep = 1;

    this._initWebGL(backgroundColor);
    this._initShaders();
    this._setupProjection();
    this._attachControls();

    /* 2-D батчер спрайтов  ─────────────────────────────────────────── */
    this.spriteRenderer = new SpriteRenderer( // ← 2) создаём
      this.gl,
      this.canvas.width,
      this.canvas.height
    );
  }

  /* ---------- low-level -------------------------------------------------- */

  _initWebGL(bg) {
    const [r, g, b] = typeof bg === "string" ? this._hexToRGB(bg) : bg;
    const gl = this.gl;
    gl.clearColor(r, g, b, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }
  _hexToRGB(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  _loadShader(t, s) {
    const gl = this.gl,
      sh = gl.createShader(t);
    gl.shaderSource(sh, s);
    gl.compileShader(sh);
    return sh;
  }

  /* ---------- шейдер  ---------------------------------------------------- */

  _initShaders() {
    const v = `
      attribute vec3 aVertexPosition;
      uniform mat4 uModel,uView,uProjection;
      void main(){gl_Position=uProjection*uView*uModel*
                 vec4(aVertexPosition,1.0);} `;
    const f = `
      precision mediump float;
      uniform vec4 uColor;
      void main(){gl_FragColor=uColor;}`;
    const gl = this.gl;
    const vs = this._loadShader(gl.VERTEX_SHADER, v);
    const fs = this._loadShader(gl.FRAGMENT_SHADER, f);
    this.shaderProgram = gl.createProgram();
    gl.attachShader(this.shaderProgram, vs);
    gl.attachShader(this.shaderProgram, fs);
    gl.linkProgram(this.shaderProgram);
    gl.useProgram(this.shaderProgram);

    this.uModel = gl.getUniformLocation(this.shaderProgram, "uModel");
    this.uView = gl.getUniformLocation(this.shaderProgram, "uView");
    this.uProj = gl.getUniformLocation(this.shaderProgram, "uProjection");
    this.uColor = gl.getUniformLocation(this.shaderProgram, "uColor");
    this.aPos = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(this.aPos);
  }

  _setupProjection() {
    const proj = mat4.create();
    mat4.perspective(
      proj,
      Math.PI / 4,
      this.canvas.width / this.canvas.height,
      0.1,
      100
    );
    this.gl.useProgram(this.shaderProgram);
    this.gl.uniformMatrix4fv(this.uProj, false, proj);
  }

  /* ---------- input ------------------------------------------------------ */

  _attachControls() {
    this.canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0 && !e.shiftKey) {
        this._drag = { mode: "orbit", x: e.clientX, y: e.clientY };
      } else if (e.button === 2 || (e.button === 0 && e.shiftKey)) {
        this._drag = { mode: "pan", x: e.clientX, y: e.clientY };
      }
    });
    window.addEventListener("mousemove", (e) => {
      const d = this._drag;
      if (!d) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      // Обрабатываем по режиму
      if (d.mode === "orbit") {
        this.camYaw += dx * 0.005;
        this.camPitch += dy * 0.005;
        this.camPitch = Math.max(-1.55, Math.min(1.55, this.camPitch));
      } else {
        // pan
        const panSpeed = 0.01 * this.camDist;
        // вектор вправо и вперёд относительно yaw
        this.camTarget[0] -=
          (Math.cos(this.camYaw) * dx - Math.sin(this.camYaw) * dy) * panSpeed;
        this.camTarget[2] -=
          (Math.sin(this.camYaw) * dx + Math.cos(this.camYaw) * dy) * panSpeed;
      }
      d.x = e.clientX;
      d.y = e.clientY;
    });
    window.addEventListener("mouseup", () => (this._drag = null));
    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      this.camDist *= e.deltaY > 0 ? 1.1 : 0.9;
      this.camDist = Math.min(Math.max(this.camDist, 1), 50);
    });
    window.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      const speed = 0.1 * this.camDist;
      if (["arrowup", "w"].includes(k)) this.camTarget[2] -= speed;
      if (["arrowdown", "s"].includes(k)) this.camTarget[2] += speed;
      if (["arrowleft", "a"].includes(k)) this.camTarget[0] -= speed;
      if (["arrowright", "d"].includes(k)) this.camTarget[0] += speed;
    });
  }

  /* ---------- helpers ---------------------------------------------------- */

  _drawLines = (v, color) => {  
    const gl = this.gl,
      buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(this.uColor, color);
    gl.drawArrays(gl.LINES, 0, v.length / 3);
    gl.deleteBuffer(buf);
  }



  /* ---------- основной рендер-проход ------------------------------------ */

  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }
  render(scene, helpers = false) {
    this.clear();

    // ⬆️ Сначала активируем 3D-шейдерную программу!
    this.gl.useProgram(this.shaderProgram);

    // 3D camera view setup
    const eye = [
      this.camTarget[0] +
        Math.cos(this.camYaw) * Math.cos(this.camPitch) * this.camDist,
      this.camTarget[1] + Math.sin(this.camPitch) * this.camDist,
      this.camTarget[2] +
        Math.sin(this.camYaw) * Math.cos(this.camPitch) * this.camDist,
    ];
    const view = mat4.create();
    mat4.lookAt(view, eye, this.camTarget, [0, 1, 0]);
    this.gl.uniformMatrix4fv(this.uView, false, view);
    // Рендер 3D-объектов
    scene.objects.forEach((o) => {
      if (typeof o.renderWebGL3D === "function") {
        o.renderWebGL3D(this.gl, this.shaderProgram, this.uModel, this.uColor);
      }
    });

    if (helpers) {
      drawGrid(this);
      drawGizmo(this);
    
      this._setupProjection();                 // обратно к perspective
      this.gl.uniformMatrix4fv(this.uView, false, view);
    }

    // 👉 Рендер 2D-спрайтов через SpriteRenderer
    scene.objects.forEach((o) => {
      if (typeof o.renderWebGL2D === "function") {
        o.renderWebGL2D(this.spriteRenderer);
      }
    });

    // 👉 Флашим все спрайты
    this.spriteRenderer.flush();
  }

  resize(w, h) {
    this.gl.viewport(0, 0, w, h);
    this._setupProjection(); // пересчёт перспективы
    this.spriteRenderer.resize(w, h);
  }
}
