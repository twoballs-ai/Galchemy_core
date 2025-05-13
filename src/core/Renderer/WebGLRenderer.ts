import { Renderer } from "./Renderer.js";
import { mat3, mat4, vec3 } from "../../vendor/gl-matrix/index.js";
import { SpriteRenderer } from "./SpriteRenderer.js";
import { drawGrid } from "./helpers/GridHelper.js";
import { drawGizmo } from "./helpers/GizmoHelper.js";
import type { CameraInterface, DragState } from "../../types/RendererTypes.js";
import type { Scene } from "../core/Scene.ts";
import { TransformGizmo } from "./helpers/TransformGizmo.js";
import { drawMeshOutline } from "./helpers/MeshOutlineHelper.js";
import { vertexShaderSrc, fragmentShaderSrc } from "./shaders/DefaultShader.js";
import { plainVertexShader, plainFragmentShader } from "./shaders/PlainShader.js";
import { initShadowMap, initDepthProgram, calcLightVP } from "./internal/ShadowUtils.js";
import { drawCameraFrustum } from './helpers/FrustumHelper.js';
import { AXIS_X_COLOR, AXIS_Y_COLOR, AXIS_Z_COLOR } from "../../constants/CoordSystem";
import { drawGizmoScreen } from "./helpers/GizmoScreen.js";
export class WebGLRenderer extends Renderer {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  transformGizmo = new TransformGizmo();
  // Сетка
  gridSize = 10;
  gridStep = 1;
  public selectedObject: SceneObject | null = null;
  // Шейдеры и их локации
  private uNormalMatrix!: WebGLUniformLocation;
  private uLightPos!: WebGLUniformLocation;
  private uViewPos!: WebGLUniformLocation;
  private uAmbientColor!: WebGLUniformLocation;
  private uSpecularColor!: WebGLUniformLocation;
  private uShininess!: WebGLUniformLocation;
  private shaderProgram!: WebGLProgram;
  private uModel!: WebGLUniformLocation;
  private uView!: WebGLUniformLocation;
  private uProj!: WebGLUniformLocation;
  private uColor!: WebGLUniformLocation;
  private uUseTexture!: WebGLUniformLocation;
  private uTexture!: WebGLUniformLocation;
  // --- shadows ---
  private shadowFBO!: WebGLFramebuffer;
  private shadowTex!: WebGLTexture;
  private depthProgram!: WebGLProgram;
  private uDepthModel!: WebGLUniformLocation;
  private uDepthLightVP!: WebGLUniformLocation;
  private aPos: number = -1;
  private aTexCoord: number = -1;
  private plainShaderProgram!: WebGLProgram;
  private plain_uModel!: WebGLUniformLocation;
  private plain_uView!: WebGLUniformLocation;
  private plain_uProj!: WebGLUniformLocation;
  private plain_uColor!: WebGLUniformLocation;
  private spriteRenderer: SpriteRenderer;
  private plain_aPos: number = -1; 
  constructor(graphicalContext: any, backgroundColor: string | [number, number, number]) {
    super(graphicalContext.getContext(), backgroundColor);
    this.canvas = graphicalContext.getCanvas();
    this.gl = graphicalContext.getContext() as WebGL2RenderingContext;

    this._initWebGL(backgroundColor);
    this._initShaders();
    this._setupProjection();
    initShadowMap(this);          // вынесено
    initDepthProgram(this);       // вынесено
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

  private _initShaders(): void {
  const gl = this.gl;

  /* ---------- 1.  ОСНОВНОЙ ШЕЙДЕР (с освещением, тенями, текстурами) ---------- */
  const vs = this._loadShader(gl.VERTEX_SHADER, vertexShaderSrc);
  const fs = this._loadShader(gl.FRAGMENT_SHADER, fragmentShaderSrc);

  this.shaderProgram = gl.createProgram()!;
  gl.attachShader(this.shaderProgram, vs);
  gl.attachShader(this.shaderProgram, fs);
  gl.linkProgram(this.shaderProgram);

  gl.useProgram(this.shaderProgram);

  this.uNormalMatrix = gl.getUniformLocation(this.shaderProgram, "uNormalMatrix")!;
  this.uLightPos     = gl.getUniformLocation(this.shaderProgram, "uLightPos")!;
  this.uViewPos      = gl.getUniformLocation(this.shaderProgram, "uViewPos")!;
  this.uAmbientColor = gl.getUniformLocation(this.shaderProgram, "uAmbientColor")!;
  this.uSpecularColor= gl.getUniformLocation(this.shaderProgram, "uSpecularColor")!;
  this.uShininess    = gl.getUniformLocation(this.shaderProgram, "uShininess")!;
  this.uModel        = gl.getUniformLocation(this.shaderProgram, "uModel")!;
  this.uView         = gl.getUniformLocation(this.shaderProgram, "uView")!;
  this.uProj         = gl.getUniformLocation(this.shaderProgram, "uProjection")!;
  this.uColor        = gl.getUniformLocation(this.shaderProgram, "uColor")!;
  this.uUseTexture   = gl.getUniformLocation(this.shaderProgram, "uUseTexture")!;
  this.uTexture      = gl.getUniformLocation(this.shaderProgram, "uTexture")!;

  this.aPos      = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
  this.aTexCoord = gl.getAttribLocation(this.shaderProgram, "aTexCoord");
  gl.enableVertexAttribArray(this.aPos);
  gl.enableVertexAttribArray(this.aTexCoord);

  /* ---------- 2.  PLAIN‑ШЕЙДЕР (для экранного гизмо) ---------- */
  const vsPlain = this._loadShader(gl.VERTEX_SHADER, plainVertexShader);
  const fsPlain = this._loadShader(gl.FRAGMENT_SHADER, plainFragmentShader);

  this.plainShaderProgram = gl.createProgram()!;
  gl.attachShader(this.plainShaderProgram, vsPlain);
  gl.attachShader(this.plainShaderProgram, fsPlain);
  gl.linkProgram(this.plainShaderProgram);
  //  (не активируем — остаётся основной)

  this.plain_uModel = gl.getUniformLocation(this.plainShaderProgram, "uModel")!;
  this.plain_uView  = gl.getUniformLocation(this.plainShaderProgram, "uView")!;
  this.plain_uProj  = gl.getUniformLocation(this.plainShaderProgram, "uProjection")!;
  this.plain_uColor = gl.getUniformLocation(this.plainShaderProgram, "uColor")!;
  this.plain_aPos   = gl.getAttribLocation(this.plainShaderProgram, "aVertexPosition"); // ← добавлено
}
  /** Настройка матрицы проекции */
  private _setupProjection(): void {
    const gl = this.gl;
    const proj = mat4.create();
    const cam = this.activeCamera;

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
  
    // 1) Очистка буфера
    this.clear();
  
    // 2) Подготовка шейдера
    gl.useProgram(this.shaderProgram);
    const eye = this.activeCamera.position;
    gl.uniform3fv(this.uViewPos, eye);
  
    // 3) Собираем все источники света (ограничим до 16)
    const lights = scene.objects.filter(o => o.isLight).slice(0, 16);
  
    // 4) Shadow map — только от первого света (если есть)
    let lightVP: mat4 | null = null;
    if (lights.length > 0) {
      const mainLight = lights[0];
      lightVP = calcLightVP(mainLight);
  
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowFBO);
      gl.viewport(0, 0, 2048, 2048);
      gl.clear(gl.DEPTH_BUFFER_BIT);
  
      gl.useProgram(this.depthProgram);
      gl.uniformMatrix4fv(this.uDepthLightVP, false, lightVP);
  
      for (const o of scene.objects) {
        if (typeof o.renderWebGL3D === 'function') {
          o.renderWebGL3D(gl, this.depthProgram, this.uDepthModel, null, null, null);
        }
      }
  
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
  
    // 5) Основной рендеринг
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.shaderProgram);
  
    if (lightVP) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.shadowTex);
      gl.uniform1i(gl.getUniformLocation(this.shaderProgram, 'uShadowTex'), 1);
      gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram, 'uLightVP'), false, lightVP);
    }
  
    // Передаём массив источников в шейдер
    const MAX_LIGHTS = 16;
    const lightPositions = new Float32Array(3 * MAX_LIGHTS);
    const lightColors    = new Float32Array(3 * MAX_LIGHTS);
    
    lights.forEach((l, i) => {
      const [x, y, z] = l.worldPosition;
      const [r, g, b] = l.color.slice(0, 3);
      const intensity = typeof l.intensity === "number" ? l.intensity : 1.0;
      lightPositions.set([x, y, z], i * 3);
      lightColors.set([r * intensity, g * intensity, b * intensity], i * 3);
    });
      if (lights.length > 0) {
        const uLightPositionsLoc = gl.getUniformLocation(this.shaderProgram, 'uLightPositions');
        if (uLightPositionsLoc !== null) {
          gl.uniform3fv(uLightPositionsLoc, lightPositions);
        }
        const uLightColorsLoc = gl.getUniformLocation(this.shaderProgram, 'uLightColors');
      
        if (uLightPositionsLoc && uLightColorsLoc) {
          gl.uniform1i(gl.getUniformLocation(this.shaderProgram, 'uLightCount'), lights.length);
          gl.uniform3fv(uLightPositionsLoc, lightPositions);
          gl.uniform3fv(uLightColorsLoc, lightColors);
        }
      }
  
    // Материальные свойства
    gl.uniform3fv(this.uSpecularColor, [1, 1, 1]);
    gl.uniform1f(this.uShininess, 32.0);
    gl.disableVertexAttribArray(this.aTexCoord);
  
    this.activeCamera.update();
    gl.uniformMatrix4fv(this.uView, false, this.activeCamera.getView());
    gl.uniformMatrix4fv(this.uProj, false, this.activeCamera.getProjection());
  
    // 6) Основные 3D-объекты
    for (const o of scene.objects) {
      if (typeof o.renderWebGL3D === "function") {
        o.renderWebGL3D(
          gl,
          this.shaderProgram,
          this.uModel,
          this.uAmbientColor,
          this.uUseTexture,
          this.uNormalMatrix
        );
  
        if (o === this.core?.scene.selectedObject) {
          drawMeshOutline({
            gl,
            mesh: o.mesh,
            vertexBuffer: o.vertexBuffer,
            uniforms: {
              uUseTexture: this.uUseTexture,
              uColor: this.uColor
            },
            attribs: {
              aPos: this.aPos,
              aTexCoord: this.aTexCoord
            },
            state: o
          });
        }
      }
    }
  
    // 7) Помощники (сетка, гизмо, фрустум)
    if (helpers) {
      drawGrid(this);
      drawGizmo(this);        // центральное
      drawGizmoScreen(this)
      for (const o of scene.objects) {
        if ((o as any).isCamera && o.camera) {
          drawCameraFrustum(gl, this._drawLines.bind(this), o.camera);
        }
      }
    }
  
    // 8) Спрайты
    for (const o of scene.objects) {
      if (typeof o.renderWebGL2D === "function") {
        o.renderWebGL2D(this.spriteRenderer);
      }
    }
  
    this.transformGizmo.draw(this);
    this.spriteRenderer.flush();
  }

  resize(w: number, h: number): void {
    this.gl.viewport(0, 0, w, h);
    this._setupProjection();
    this.spriteRenderer.resize(w, h);
  }
}
