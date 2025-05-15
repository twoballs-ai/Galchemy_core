import { mat4 } from '../../vendor/gl-matrix/index.js';
import { buildGizmoMatrix } from './GizmoMatrix.js';
import {
  AXIS_X_COLOR,
  AXIS_Y_COLOR,
  AXIS_Z_COLOR,
} from '../../constants/CoordSystem.js';

/**
 * Рисует HUD‑гизмо (XYZ‑оси) в правом‑нижнем углу экрана.
 * Требует plain‑шейдер, созданный в WebGLRenderer._initShaders().
 */
export function drawGizmoScreen(ctx): void {
  const {
    gl,
    plainShaderProgram, plain_aPos,
    plain_uModel, plain_uView, plain_uProj, plain_uColor,
    canvas, activeCamera
  } = ctx;
  if (!activeCamera) return;

  /* ---------- вершины ---------- */
  const vbo = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      0,0,0, 1,0,0,   // X
      0,0,0, 0,1,0,   // Y
      0,0,0, 0,0,1    // Z
    ]),
    gl.STATIC_DRAW
  );

  /* ---------- матрицы ---------- */
  const proj  = mat4.create();
  const view  = mat4.create();               // единичная
  const pre   = mat4.create();               // сначала перенос в угол

  const size = 100, pad = 20;
  mat4.ortho(proj, 0, canvas.width, 0, canvas.height, -10, 10);
  mat4.translate(pre, pre, [canvas.width - size/2 - pad, size/2 + pad, 0]);

  const model = buildGizmoMatrix(
    activeCamera,
    pre,
    size / 2,   // масштаб
    true        // flipY, потому что Ortho‑Y вверх
  );

  /* ---------- GPU‑state ---------- */
  gl.useProgram(plainShaderProgram);
  gl.uniformMatrix4fv(plain_uProj , false, proj );
  gl.uniformMatrix4fv(plain_uView , false, view );
  gl.uniformMatrix4fv(plain_uModel, false, model);

  gl.vertexAttribPointer(plain_aPos, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(plain_aPos);

  /* ---------- отрисовка осей ---------- */
  gl.uniform4fv(plain_uColor, AXIS_X_COLOR); gl.drawArrays(gl.LINES, 0, 2);
  gl.uniform4fv(plain_uColor, AXIS_Y_COLOR); gl.drawArrays(gl.LINES, 2, 2);
  gl.uniform4fv(plain_uColor, AXIS_Z_COLOR); gl.drawArrays(gl.LINES, 4, 2);

  gl.deleteBuffer(vbo);
}
