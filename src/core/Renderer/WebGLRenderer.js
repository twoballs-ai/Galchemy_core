/* ===================================================================== *
 *  src/Renderer/WebGLRenderer3D.js
 * ===================================================================== */

import { Renderer } from "./Renderer.js";
import { mat4 } from "../../vendor/gl-matrix/index.js";
import { SpriteRenderer } from "./SpriteRenderer.js";
import { drawGrid } from "./helpers/GridHelper.js";
import { drawGizmo } from "./helpers/GizmoHelper.js";
import { vec3 } from "../../vendor/gl-matrix/index.js";
export class WebGLRenderer extends Renderer {
  constructor(graphicalContext, backgroundColor) {
    super(graphicalContext.getContext(), backgroundColor);

    this.canvas = graphicalContext.getCanvas();
    this.gl = graphicalContext.getContext();

    /* орбитальная камера */
    this.camYaw = 0;
    this.camPitch = 0.6;
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

    /* 2D батчер спрайтов */
    this.spriteRenderer = new SpriteRenderer(
      this.gl,
      this.canvas.width,
      this.canvas.height
    );
  }

  /* ---------- WebGL базовая настройка ---------- */

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

  _loadShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  /* ---------- Инициализация шейдера с поддержкой текстур ---------- */

  _initShaders() {
    const vertexShaderSource = `
      attribute vec3 aVertexPosition;
      attribute vec2 aTexCoord;

      uniform mat4 uModel, uView, uProjection;

      varying vec2 vTexCoord;

      void main() {
        gl_Position = uProjection * uView * uModel * vec4(aVertexPosition, 1.0);
        vTexCoord = aTexCoord;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;

      varying vec2 vTexCoord;

      uniform vec4 uColor;
      uniform bool uUseTexture;
      uniform sampler2D uTexture;

      void main() {
        if (uUseTexture) {
          gl_FragColor = texture2D(uTexture, vTexCoord);
        } else {
          gl_FragColor = uColor;
        }
      }
    `;

    const gl = this.gl;
    const vs = this._loadShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fs = this._loadShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    this.shaderProgram = gl.createProgram();
    gl.attachShader(this.shaderProgram, vs);
    gl.attachShader(this.shaderProgram, fs);
    gl.linkProgram(this.shaderProgram);
    gl.useProgram(this.shaderProgram);

    this.uModel = gl.getUniformLocation(this.shaderProgram, "uModel");
    this.uView = gl.getUniformLocation(this.shaderProgram, "uView");
    this.uProj = gl.getUniformLocation(this.shaderProgram, "uProjection");
    this.uColor = gl.getUniformLocation(this.shaderProgram, "uColor");
    this.uUseTexture = gl.getUniformLocation(this.shaderProgram, "uUseTexture");
    this.uTexture = gl.getUniformLocation(this.shaderProgram, "uTexture");

    this.aPos = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
    this.aTexCoord = gl.getAttribLocation(this.shaderProgram, "aTexCoord");

    gl.enableVertexAttribArray(this.aPos);
    gl.enableVertexAttribArray(this.aTexCoord);
  }

  _setupProjection() {
    const camera = this.core?.camera;
    const proj = mat4.create();
    if (camera?.isCamera) {
      mat4.perspective(
        proj,
        (camera.fov * Math.PI) / 180,
        this.canvas.width / this.canvas.height,
        camera.near,
        camera.far
      );
    } else {
      mat4.perspective(proj, Math.PI / 4, this.canvas.width / this.canvas.height, 0.1, 100);
    }
    this.gl.useProgram(this.shaderProgram);
    this.gl.uniformMatrix4fv(this.uProj, false, proj);
  }

  /* ---------- Управление камерой ---------- */

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
      if (d.mode === "orbit") {
        this.camYaw += dx * 0.005;
        this.camPitch += dy * 0.005;
        this.camPitch = Math.max(-1.55, Math.min(1.55, this.camPitch));
      } else {
        const panSpeed = 0.01 * this.camDist;
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
  _drawCameraFrustum(cameraObject) {
    const gl = this.gl;
    const cam = cameraObject.camera;
    const pos = cam.position;
    const tgt = cam.lookAt;
  
    // базовые вектора
    const forward = vec3.normalize([], vec3.subtract([], tgt, pos));
    const right   = vec3.normalize([], vec3.cross([], forward, cam.up));
    const upDir   = vec3.normalize([], vec3.cross([], right, forward));
  
    // параметры фрустума
    const fovRad = (cam.fov * Math.PI) / 180;
    const nearDist = cam.near;
    const farDist  = Math.min(cam.far, 20); // ограничим дальнюю плоскость ради наглядности
  
    const hNear = Math.tan(fovRad / 2) * nearDist;
    const wNear = hNear * (cam.width / cam.height);
    const hFar  = Math.tan(fovRad / 2) * farDist;
    const wFar  = hFar * (cam.width / cam.height);
  
    // центры плоскостей
    const nc = vec3.scaleAndAdd([], pos, forward, nearDist);
    const fc = vec3.scaleAndAdd([], pos, forward, farDist);
  
    // 4 угла near-плоскости
    const ntl = vec3.add([], vec3.add([], nc, vec3.scale([], upDir,  hNear)), vec3.scale([], right, -wNear));
    const ntr = vec3.add([], vec3.add([], nc, vec3.scale([], upDir,  hNear)), vec3.scale([], right,  wNear));
    const nbl = vec3.add([], vec3.add([], nc, vec3.scale([], upDir, -hNear)), vec3.scale([], right, -wNear));
    const nbr = vec3.add([], vec3.add([], nc, vec3.scale([], upDir, -hNear)), vec3.scale([], right,  wNear));
  
    // 4 угла far-плоскости
    const ftl = vec3.add([], vec3.add([], fc, vec3.scale([], upDir,  hFar)), vec3.scale([], right, -wFar));
    const ftr = vec3.add([], vec3.add([], fc, vec3.scale([], upDir,  hFar)), vec3.scale([], right,  wFar));
    const fbl = vec3.add([], vec3.add([], fc, vec3.scale([], upDir, -hFar)), vec3.scale([], right, -wFar));
    const fbr = vec3.add([], vec3.add([], fc, vec3.scale([], upDir, -hFar)), vec3.scale([], right,  wFar));
  
    // соберём линии: от камеры к дальним углам + рамка фрустума
    const lines = new Float32Array([
      // линии от глаза
      ...pos, ...ftl,
      ...pos, ...ftr,
      ...pos, ...fbr,
      ...pos, ...fbl,
      // рамка far-плоскости
      ...ftl, ...ftr,
      ...ftr, ...fbr,
      ...fbr, ...fbl,
      ...fbl, ...ftl,
      // (можно добавить near-плоскость аналогично)
    ]);
  
    // жёлтый цвет: [r, g, b, a]
    this._drawLines(lines, [1, 1, 0, 1]);
  }
  /* ---------- Помощники ---------- */
  _drawLines(v, color) {
    const gl = this.gl;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);
  
    gl.disableVertexAttribArray(this.aTexCoord); // ← отключаем UV-атрибут
    gl.uniform1i(this.uUseTexture, false);       // ← отключаем текстуру
    gl.vertexAttribPointer(this.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.aPos);
  
    gl.uniform4fv(this.uColor, color);
    gl.drawArrays(gl.LINES, 0, v.length / 3);
    gl.deleteBuffer(buf);
  }
  setCamera(camera) {
    this.activeCamera = camera;
    camera.update();
    this.gl.uniformMatrix4fv(this.uProj, false, camera.getProjection());
    this.gl.uniformMatrix4fv(this.uView, false, camera.getView());
  }
  /* ---------- Основной проход рендера ---------- */

  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  render(scene, helpers = false) {
    // console.log('[WebGLRenderer.render]', {
    //   helpers,
    //   objects: scene.objects.map(o => ({
    //     id: o.id,
    //     ctor: o.constructor.name,
    //     isCamera: !!o.isCamera,
    //     isEditorMode: !!o.isEditorMode
    //   }))
    // });
    const gl = this.gl;
    this.clear();
  
    gl.useProgram(this.shaderProgram);
  
    gl.disableVertexAttribArray(this.aTexCoord);
  
    const eye = [
      this.camTarget[0] +
        Math.cos(this.camYaw) * Math.cos(this.camPitch) * this.camDist,
      this.camTarget[1] + Math.sin(this.camPitch) * this.camDist,
      this.camTarget[2] +
        Math.sin(this.camYaw) * Math.cos(this.camPitch) * this.camDist,
    ];
    const view = mat4.create();
    mat4.lookAt(view, eye, this.camTarget, [0, 1, 0]);
    gl.uniformMatrix4fv(this.uView, false, view);
  
    /* 🔥 1. Рендер обычных игровых объектов */
    scene.objects.forEach((o) => {
      if (!o.isEditorMode && typeof o.renderWebGL3D === "function") {
        o.renderWebGL3D(gl, this.shaderProgram, this.uModel, this.uColor, this.uUseTexture);
      }
    });
  
    /* 🔥 2. Только если helpers включены, рендерим вспомогательные (камеры и т.п.) */
    if (helpers) {
      scene.objects.forEach((o) => {
        if (o.isEditorMode && typeof o.renderWebGL3D === "function") {
          o.renderWebGL3D(gl, this.shaderProgram, this.uModel, this.uColor, this.uUseTexture);
        }
      });
  
      drawGrid(this);
      drawGizmo(this);
         // фрустум для каждой камеры-объекта
    scene.objects.forEach(o => {
      if (o.isCamera) {
        this._drawCameraFrustum(o);
      }
    });
      this._setupProjection();
      gl.uniformMatrix4fv(this.uView, false, view);
    }
  
    /* 🔥 3. 2D спрайты */
    scene.objects.forEach((o) => {
      if (typeof o.renderWebGL2D === "function") {
        o.renderWebGL2D(this.spriteRenderer);
      }
    });
  
    this.spriteRenderer.flush();
  }
  resize(w, h) {
    this.gl.viewport(0, 0, w, h);
    this._setupProjection();
    this.spriteRenderer.resize(w, h);
  }
}
