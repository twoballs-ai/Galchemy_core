import { Renderer } from "./Renderer.js";
import { mat4, vec3 } from "../../vendor/gl-matrix/index.js";
import { SpriteRenderer } from "./SpriteRenderer.js";
import { drawGrid } from "./helpers/GridHelper.ts";
import { drawGizmo } from "./helpers/GizmoHelper.js";
import type { CameraInterface, DragState } from "../../types/RendererTypes.ts";
import type { Scene } from "../core/Scene.ts";
import { TransformGizmo } from "./helpers/TransformGizmo.js";

export class WebGLRenderer extends Renderer {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  transformGizmo = new TransformGizmo();
  // Сетка
  gridSize = 10;
  gridStep = 1;
  public selectedObject: SceneObject | null = null;
  // Шейдеры и их локации
  private shaderProgram!: WebGLProgram;
  private uModel!: WebGLUniformLocation;
  private uView!: WebGLUniformLocation;
  private uProj!: WebGLUniformLocation;
  private uColor!: WebGLUniformLocation;
  private uUseTexture!: WebGLUniformLocation;
  private uTexture!: WebGLUniformLocation;
  private aPos: number = -1;
  private aTexCoord: number = -1;

  private spriteRenderer: SpriteRenderer;

  constructor(graphicalContext: any, backgroundColor: string | [number, number, number]) {
    super(graphicalContext.getContext(), backgroundColor);
    this.canvas = graphicalContext.getCanvas();
    this.gl = graphicalContext.getContext();

    this._initWebGL(backgroundColor);
    this._initShaders();
    this._setupProjection();

    this.spriteRenderer = new SpriteRenderer(
      this.gl,
      this.canvas.width,
      this.canvas.height
    );
  }
  public core: Core | null = null; // Добавляем core

  // Метод для установки core в рендерер
  setCore(core: Core) {
    this.core = core;
  }

  /** Настройка базового состояния WebGL */
  private _initWebGL(bg: string | [number, number, number]): void {
    const [r, g, b] = typeof bg === "string" ? this._hexToRGB(bg) : bg;
    const gl = this.gl;
    gl.clearColor(r, g, b, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  /** Конвертация hex → [r, g, b] */
  private _hexToRGB(hex: string): [number, number, number] {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  /** Компиляция шейдера */
  private _loadShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    return shader;
  }

  /** Инициализация шейдерной программы */
  private _initShaders(): void {
    const gl = this.gl;

    const vsSource = `
      attribute vec3 aVertexPosition;
      attribute vec2 aTexCoord;
      uniform mat4 uModel, uView, uProjection;
      varying vec2 vTexCoord;
      void main() {
        gl_Position = uProjection * uView * uModel *
                      vec4(aVertexPosition, 1.0);
        vTexCoord = aTexCoord;
      }
    `;
    const fsSource = `
      precision mediump float;
      varying vec2 vTexCoord;
      uniform vec4 uColor;
      uniform bool uUseTexture;
      uniform sampler2D uTexture;
      void main() {
        gl_FragColor = uUseTexture
          ? texture2D(uTexture, vTexCoord)
          : uColor;
      }
    `;

    const vs = this._loadShader(gl.VERTEX_SHADER, vsSource);
    const fs = this._loadShader(gl.FRAGMENT_SHADER, fsSource);

    this.shaderProgram = gl.createProgram()!;
    gl.attachShader(this.shaderProgram, vs);
    gl.attachShader(this.shaderProgram, fs);
    gl.linkProgram(this.shaderProgram);
    gl.useProgram(this.shaderProgram);

    this.uModel      = gl.getUniformLocation(this.shaderProgram, "uModel")!;
    this.uView       = gl.getUniformLocation(this.shaderProgram, "uView")!;
    this.uProj       = gl.getUniformLocation(this.shaderProgram, "uProjection")!;
    this.uColor      = gl.getUniformLocation(this.shaderProgram, "uColor")!;
    this.uUseTexture = gl.getUniformLocation(this.shaderProgram, "uUseTexture")!;
    this.uTexture    = gl.getUniformLocation(this.shaderProgram, "uTexture")!;

    this.aPos      = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
    this.aTexCoord = gl.getAttribLocation(this.shaderProgram, "aTexCoord");

    gl.enableVertexAttribArray(this.aPos);
    gl.enableVertexAttribArray(this.aTexCoord);
  }

  /** Настройка матрицы проекции */
  private _setupProjection(): void {
    const gl = this.gl;
    const proj = mat4.create();
    const cam = (this as any).core?.camera as CameraInterface | undefined;

    if (cam?.isCamera) {
      mat4.perspective(
        proj,
        (cam.fov * Math.PI) / 180,
        this.canvas.width / this.canvas.height,
        cam.near,
        cam.far
      );
    } else {
      mat4.perspective(proj, Math.PI / 4, this.canvas.width / this.canvas.height, 0.1, 100);
    }

    gl.useProgram(this.shaderProgram);
    gl.uniformMatrix4fv(this.uProj, false, proj);
  }



  /** Отрисовка фрустума камеры как линий */
  private _drawCameraFrustum(cameraObject: any): void {
    const cam = cameraObject.camera as CameraInterface;
    const pos = cam.position;
    const tgt = cam.lookAt;

    // Вычисляем базовые вектора
    const forward = vec3.normalize([], vec3.subtract([], tgt, pos));
    const right   = vec3.normalize([], vec3.cross([], forward, cam.up));
    const upDir   = vec3.normalize([], vec3.cross([], right, forward));

    // Параметры фрустума
    const fovRad   = (cam.fov * Math.PI) / 180;
    const nearDist = cam.near;
    const farDist  = Math.min(cam.far, 20);

    const hNear = Math.tan(fovRad / 2) * nearDist;
    const wNear = hNear * (cam.width / cam.height);
    const hFar  = Math.tan(fovRad / 2) * farDist;
    const wFar  = hFar * (cam.width / cam.height);

    const nc = vec3.scaleAndAdd([], pos, forward, nearDist);
    const fc = vec3.scaleAndAdd([], pos, forward, farDist);

    const ntl = vec3.add([], vec3.add([], nc, vec3.scale([], upDir,  hNear)), vec3.scale([], right, -wNear));
    const ntr = vec3.add([], vec3.add([], nc, vec3.scale([], upDir,  hNear)), vec3.scale([], right,  wNear));
    const nbl = vec3.add([], vec3.add([], nc, vec3.scale([], upDir, -hNear)), vec3.scale([], right, -wNear));
    const nbr = vec3.add([], vec3.add([], nc, vec3.scale([], upDir, -hNear)), vec3.scale([], right,  wNear));

    const ftl = vec3.add([], vec3.add([], fc, vec3.scale([], upDir,  hFar)), vec3.scale([], right, -wFar));
    const ftr = vec3.add([], vec3.add([], fc, vec3.scale([], upDir,  hFar)), vec3.scale([], right,  wFar));
    const fbl = vec3.add([], vec3.add([], fc, vec3.scale([], upDir, -hFar)), vec3.scale([], right, -wFar));
    const fbr = vec3.add([], vec3.add([], fc, vec3.scale([], upDir, -hFar)), vec3.scale([], right,  wFar));

    const lines = new Float32Array([
      ...pos, ...ftl, ...pos, ...ftr, ...pos, ...fbr, ...pos, ...fbl,
      ...ftl, ...ftr, ...ftr, ...fbr, ...fbr, ...fbl, ...fbl, ...ftl
    ]);

    this._drawLines(lines, [1, 1, 0, 1]);
  }
  private _drawMeshOutline(obj: any) {
    const gl = this.gl;

    // переключаемся на одноцветный рендеринг
    gl.uniform1i(this.uUseTexture, false);
    gl.uniform4fv(this.uColor, [0, 0, 1, 1]); // синий

    // позиции вершин
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
    gl.vertexAttribPointer(this.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.aPos);
    gl.disableVertexAttribArray(this.aTexCoord);

    // если буфер линий ещё не создан — генерируем его один раз
    if (!obj._lineBuffer) {
      const tri = obj.mesh.indices as (Uint16Array | Uint32Array);
      const lines: number[] = [];
      for (let i = 0; i < tri.length; i += 3) {
        const a = tri[i], b = tri[i+1], c = tri[i+2];
        lines.push(a, b, b, c, c, a);
      }
      const lineIdx = tri.BYTES_PER_ELEMENT === 2
        ? new Uint16Array(lines)
        : new Uint32Array(lines);
      const buf = gl.createBuffer()!;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, lineIdx, gl.STATIC_DRAW);
      obj._lineBuffer = buf;
      obj._lineCount  = lineIdx.length;
      obj._lineType   = (tri.BYTES_PER_ELEMENT === 2
        ? gl.UNSIGNED_SHORT
        : gl.UNSIGNED_INT);
    } else {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj._lineBuffer);
    }

    gl.drawElements(gl.LINES, obj._lineCount, obj._lineType, 0);
  }

  /** Отрисовка массива линий одного цвета */
  private _drawLines(v: Float32Array, color: [number, number, number, number]): void {
    const gl = this.gl;
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);

    gl.disableVertexAttribArray(this.aTexCoord);
    gl.uniform1i(this.uUseTexture, false);
    gl.vertexAttribPointer(this.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.aPos);

    gl.uniform4fv(this.uColor, color);
    gl.drawArrays(gl.LINES, 0, v.length / 3);
    gl.deleteBuffer(buf);
  }

  setCamera(camera: any): void {
    this.activeCamera = camera;
    camera.update();
    this.gl.uniformMatrix4fv(this.uProj, false, camera.getProjection());
    this.gl.uniformMatrix4fv(this.uView, false, camera.getView());
  }

  clear(): void {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }
  render(scene: Scene, helpers = false): void {
    const gl = this.gl;

    // 1) Сначала чистим буферы
    this.clear();

    // 2) Подготавливаем шейдер
    gl.useProgram(this.shaderProgram);
    gl.disableVertexAttribArray(this.aTexCoord);

    this.activeCamera.update(); // обновит view внутри
    gl.uniformMatrix4fv(this.uView, false, this.activeCamera.getView());
    gl.uniformMatrix4fv(this.uProj, false, this.activeCamera.getProjection());
    
    // 3) Проекция уже была залита в _setupProjection(), она остается в шейдере

    // 4) Основные 3D-объекты
    for (const o of scene.objects) {
      if (typeof o.renderWebGL3D === "function") {
        // Отрисовываем сам объект
        o.renderWebGL3D(gl, this.shaderProgram, this.uModel, this.uColor, this.uUseTexture);
        
        // Проверяем, если объект выбран
        if (o === this.core?.scene.selectedObject) {
          this._drawMeshOutline(o);  // Рисуем контур выбранного объекта
        }
      }
    }

    // 5) Помощники (сетка, гизмо, фрустум камеры)
    if (helpers) {
      drawGrid(this);
      drawGizmo(this);

      for (const o of scene.objects) {
        if ((o as any).isCamera) {
          this._drawCameraFrustum(o);
        }
      }
    }

    // 6) 2D-спрайты
    for (const o of scene.objects) {
      if (typeof o.renderWebGL2D === "function") {
        o.renderWebGL2D(this.spriteRenderer);
      }
    }

    this.transformGizmo.draw(this);
    // 7) Выводим всё на экран
    this.spriteRenderer.flush();
  }
  
  resize(w: number, h: number): void {
    this.gl.viewport(0, 0, w, h);
    this._setupProjection();
    this.spriteRenderer.resize(w, h);
  }
}
