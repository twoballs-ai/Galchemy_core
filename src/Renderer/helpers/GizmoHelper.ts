import { mat4 } from '../../vendor/gl-matrix/index.js';
import type { WebGLRenderer } from '../renderers/WebGLRenderer.js';
import { drawLines } from '../internal/drawLines.js';
import {
  AXIS_X_COLOR,
  AXIS_Y_COLOR,
  AXIS_Z_COLOR,
} from '../../constants/CoordSystem.js';
import { buildGizmoMatrix } from './GizmoMatrix.js';

/**
 * Рисует XYZ‑гизмо в центре сцены (Z‑up).
 * X — красный (вправо), Y — зелёный (вперёд), Z — синий (вверх).
 */
export function drawGizmo(ctx: WebGLRenderer): void {
  const { gl, aPos, uModel, uView, uProj, uColor, activeCamera } = ctx;
  if (!activeCamera) return;

  /* ---------- геометрия ---------- */
  const len = 2.5, h = 0.35, w = 0.25;

  const shaft = new Float32Array([
    // X
     0, 0, 0,  len, 0, 0,
    // Y
     0, 0, 0,  0, len, 0,
    // Z
     0, 0, 0,  0, 0, len,
  ]);

  const heads = new Float32Array([
    // X‑стрелка
     len, 0, 0,  len - h,  w, 0,  len - h, -w, 0,
    // Y‑стрелка
     0, len, 0,  w, len - h, 0,  -w, len - h, 0,
    // Z‑стрелка
     0, 0, len,  -w, 0, len - h,  w, 0, len - h,
  ]);

  /* ---------- матрицы ---------- */
  const proj  = mat4.create();
  mat4.ortho(proj, -5, 5, -5, 5, -10, 10);   // маленький «квадратик» 10×10
  const view  = mat4.create();
  const model = buildGizmoMatrix(activeCamera);

  /* ---------- GPU‑state ---------- */
  gl.useProgram(ctx.shaderProgram);
  gl.uniformMatrix4fv(uProj , false, proj );
  gl.uniformMatrix4fv(uView , false, view );
  gl.uniformMatrix4fv(uModel, false, model );

  gl.depthFunc(gl.ALWAYS); // рисуем поверх всего

  /* ---------- оси ---------- */
  drawLines(gl, aPos, uColor, shaft.subarray(0,  6), AXIS_X_COLOR, ctx);
  drawLines(gl, aPos, uColor, shaft.subarray(6, 12), AXIS_Y_COLOR, ctx);
  drawLines(gl, aPos, uColor, shaft.subarray(12),    AXIS_Z_COLOR, ctx);

  /* ---------- наконечники ---------- */
  const drawHead = (off: number, col: [number,number,number,number]) => {
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, heads.subarray(off, off + 9), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPos);
    gl.uniform4fv(uColor, col);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.deleteBuffer(buf);
  };
  drawHead( 0, AXIS_X_COLOR);
  drawHead( 9, AXIS_Y_COLOR);
  drawHead(18, AXIS_Z_COLOR);

  gl.depthFunc(gl.LESS); // вернуть обычный тест глубины
}
