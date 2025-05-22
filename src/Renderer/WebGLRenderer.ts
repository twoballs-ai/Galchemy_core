import { Renderer } from "./Renderer.js";
import { mat3, mat4, vec3 } from "../vendor/gl-matrix/index.js";
import { SpriteRenderer } from "./SpriteRenderer.js";
import { drawGrid } from "./helpers/GridHelper.js";
import { drawGizmo } from "./helpers/GizmoHelper.js";
import type { CameraInterface, DragState } from "../types/RendererTypes.js";
import type { Scene } from "../core/Scene.ts";
import { TransformGizmo } from "./helpers/TransformGizmo.js";
import { drawMeshOutline } from "./helpers/MeshOutlineHelper.js";
import { vertexShaderSrc, fragmentShaderSrc } from "./shaders/DefaultShader.js";
import { plainVertexShader, plainFragmentShader } from "./shaders/PlainShader.ts";
import { initShadowMap, initDepthProgram, calcLightVP } from "./internal/ShadowUtils.js";
import { drawCameraFrustum } from './helpers/FrustumHelper.js';
import { AXIS_X_COLOR, AXIS_Y_COLOR, AXIS_Z_COLOR } from "../constants/CoordSystem.js";
import { drawGizmoScreen } from "./helpers/GizmoScreen.js";
import { Shader } from "./internal/Shader";
import { skyboxVertex, skyboxFragment } from "./shaders/SkyboxShader.ts";
 import { loadTexture } from "../utils/TextureLoader.js";          // ваша helper-функция
import Daylight_uv     from "../assets/skyBoxes/Daylight_uv.png";
import { Skybox } from "../Renderer/SkyBox.ts";
export class WebGLRenderer extends Renderer {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  transformGizmo = new TransformGizmo();
  // Сетка
  gridSize = 10;
  gridStep = 1;
  public selectedObject: SceneObject | null = null;
      private skyboxShader!: Shader;
    private skyboxTex: WebGLTexture | null = null;
    private skyboxVBO!: WebGLBuffer;
    private skyboxVAO!: WebGLVertexArrayObject;
    private skyboxIBO!: WebGLBuffer;   //   ← новый index-buffer
private skyboxReady = false;       //   ← флаг «текстура загружена»
  // Шейдеры и их локации
  private uNormalMatrix!: WebGLUniformLocation;
  private uLightPos!: WebGLUniformLocation;
  private uViewPos!: WebGLUniformLocation;
  private uAmbientColor!: WebGLUniformLocation;
  private uSpecularColor!: WebGLUniformLocation;
  private uShininess!: WebGLUniformLocation;
 private defaultShader!: Shader;
 private plainShader!: Shader;
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
  private shaderProgram!: WebGLProgram;
  private uDepthModel!: WebGLUniformLocation;
  private uDepthLightVP!: WebGLUniformLocation;
  private aPos: number = -1;
  private aTexCoord: number = -1;

  private plain_uModel!: WebGLUniformLocation;
  private plain_uView!: WebGLUniformLocation;
  private plain_uProj!: WebGLUniformLocation;
  private plain_uColor!: WebGLUniformLocation;
  private spriteRenderer: SpriteRenderer;
  private plain_aPos: number = -1; 
 constructor(graphicalContext: any,
            backgroundColor: string | [number, number, number]) {

  super(graphicalContext.getContext(), backgroundColor);

  this.canvas = graphicalContext.getCanvas();
  this.gl     = graphicalContext.getContext() as WebGL2RenderingContext;

  this._initWebGL(backgroundColor);
  this._initShaders();

  /* ---------------- SKYBOX ---------------- */
  this._initSkyboxResources();            // ← БЕЗ аргументов
  loadTexture(this.gl, Daylight_uv)        // ← this.gl
     .then(tex => {
   this.skyboxTex   = tex;
   this.skyboxReady = true;   // текстура готова → можно рисовать
 });

  /* ------------- остальное --------------- */
  this._setupProjection();
  initShadowMap(this);
  initDepthProgram(this);

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

  /* ────────────────── 1. ОСНОВНОЙ ШЕЙДЕР ────────────────── */
  this.defaultShader = Shader.fromSource(
    gl,
    vertexShaderSrc,
    fragmentShaderSrc
  );
  this.shaderProgram = this.defaultShader.program;
  this.defaultShader.use();

  // uniform-ы
  this.uNormalMatrix  = this.defaultShader.uniform("uNormalMatrix")!;
  this.uLightPos      = this.defaultShader.uniform("uLightPos")!;
  this.uViewPos       = this.defaultShader.uniform("uViewPos")!;
  this.uAmbientColor  = this.defaultShader.uniform("uAmbientColor")!;
  this.uSpecularColor = this.defaultShader.uniform("uSpecularColor")!;
  this.uShininess     = this.defaultShader.uniform("uShininess")!;
  this.uModel         = this.defaultShader.uniform("uModel")!;
  this.uView          = this.defaultShader.uniform("uView")!;
  this.uProj          = this.defaultShader.uniform("uProjection")!;
  this.uColor         = this.defaultShader.uniform("uColor")!;
  this.uUseTexture    = this.defaultShader.uniform("uUseTexture")!;
  this.uTexture       = this.defaultShader.uniform("uTexture")!;

  // attrib-ы
  this.aPos      = this.defaultShader.attrib("aVertexPosition");
  this.aTexCoord = this.defaultShader.attrib("aTexCoord");
  gl.enableVertexAttribArray(this.aPos);
  gl.enableVertexAttribArray(this.aTexCoord);

  /* ────────────────── 2. PLAIN-ШЕЙДЕР (экранные гизмо/иконки) ────────────────── */
  this.plainShader = Shader.fromSource(
    gl,
    plainVertexShader,
    plainFragmentShader
  );
  this.plainShaderProgram = this.plainShader.program;

  this.plain_uModel = this.plainShader.uniform("uModel")!;
  this.plain_uView  = this.plainShader.uniform("uView")!;
  this.plain_uProj  = this.plainShader.uniform("uProjection")!;
  this.plain_uColor = this.plainShader.uniform("uColor")!;
  this.plain_aPos   = this.plainShader.attrib("aVertexPosition");
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

   this.defaultShader.use();
  gl.uniformMatrix4fv(this.uProj, false, proj);

  }
private _initSkyboxResources(): void {
  const gl = this.gl;

  /* ---------- шейдер ---------- */
  this.skyboxShader = Shader.fromSource(gl, skyboxVertex, skyboxFragment);

  /* ---------- геометрия куба ---------- */
  const SKY_VERTS = new Float32Array([
    -1,-1,-1,  1,-1,-1,  1, 1,-1,  -1, 1,-1,   // back
    -1,-1, 1,  1,-1, 1,  1, 1, 1,  -1, 1, 1    // front
  ]);
  const SKY_INDICES = new Uint16Array([
    0,1,2, 0,2,3,     // back
    4,6,5, 4,7,6,     // front
    3,2,6, 3,6,7,     // top
    0,5,1, 0,4,5,     // bottom
    1,5,6, 1,6,2,     // right
    0,3,7, 0,7,4      // left
  ]);

  this.skyboxVAO = gl.createVertexArray()!;
  this.skyboxVBO = gl.createBuffer()!;
  this.skyboxIBO = gl.createBuffer()!;

  gl.bindVertexArray(this.skyboxVAO);

  /* позиции */
  gl.bindBuffer(gl.ARRAY_BUFFER, this.skyboxVBO);
  gl.bufferData(gl.ARRAY_BUFFER, SKY_VERTS, gl.STATIC_DRAW);
  const aPos = this.skyboxShader.attrib("aPosition");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);   // <-- 3 компоненты!

  /* индексы */
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.skyboxIBO);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, SKY_INDICES, gl.STATIC_DRAW);

  gl.bindVertexArray(null);
}
  
setCamera(camera: any) {
  this.activeCamera = camera;
  camera.update();

  this.defaultShader.use();                     // <-- главное
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
if (this.skyboxReady) {
  gl.depthMask(false);
  gl.disable(gl.DEPTH_TEST);

  this.skyboxShader.use();

  /* view без переноса (камеру «ставим в центр куба») */
  const view = mat4.clone(this.activeCamera.getView());
  view[12] = view[13] = view[14] = 0;
  gl.uniformMatrix4fv(this.skyboxShader.uniform("uViewNoTrans")!, false, view);
  gl.uniformMatrix4fv(this.skyboxShader.uniform("uProj")!, false,
                      this.activeCamera.getProjection());

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this.skyboxTex!);
  gl.uniform1i(this.skyboxShader.uniform("uSkyTex")!, 0);

  gl.bindVertexArray(this.skyboxVAO);
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
  gl.bindVertexArray(null);

  gl.depthMask(true);
  gl.enable(gl.DEPTH_TEST);
}

    // 2) Подготовка шейдера
    this.defaultShader.use();
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
    this.defaultShader.use();
  
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
