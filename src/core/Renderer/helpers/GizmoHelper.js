// src/Renderer/helpers/GizmoHelper.js
import { mat4 } from '../../../vendor/gl-matrix/index.js';

/**
 * Рисует фиксированный XYZ-гизмоуказатель в правом-нижнем углу.
 * @param {WebGLRenderer} ctx – экземпляр рендера (this из render()).
 */
export function drawGizmo(ctx) {
  const { gl, aPos, uModel, uView, uProj, uColor, camYaw, camPitch } = ctx;

  /* ── геометрия ───────────────────────────────────────────────── */
  const len = 2.5;                 // длина штанги
  const shaft = new Float32Array([
    0,0,0,  len,0,0,     // X
    0,0,0,  0,len,0,     // Y
    0,0,0,  0,0,len      // Z
  ]);

  const h = 0.35, w = 0.25;        // размер стрелочной головки
  const heads = new Float32Array([
    len,0,0,      len-h, w,0,     len-h,-w,0,          // X
    0,len,0,     -w,len-h,0,       w,len-h,0,          // Y
    0,0,len,      w,0,len-h,      -w,0,len-h           // Z
  ]);

  /* ── мини-вьюпорт: ортографическая проекция 50×50 ───────────── */
  const proj  = mat4.create();
  mat4.ortho(proj, 0, 50, 0, 50, -10, 10);   // всегда один и тот же прямоугольник

  const view  = mat4.create();               // единичная: без сдвига/вращения

  const model = mat4.create();
  mat4.translate(model, model, [42, 14, 0]); // «прибиваем» в угол
  mat4.rotateY(model, model,  camYaw);       // ориентация по камере
  mat4.rotateX(model, model, -camPitch);

  /* ── шлем матрицы в шейдер ───────────────────────────────────── */
  gl.uniformMatrix4fv(uProj , false, proj );
  gl.uniformMatrix4fv(uView , false, view );
  gl.uniformMatrix4fv(uModel, false, model);

  /* ── рендерим поверх всех объектов ───────────────────────────── */
  gl.depthFunc?.(gl.ALWAYS);

  const drawLines = (v, color) => {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(uColor, color);
    gl.drawArrays(gl.LINES, 0, v.length / 3);
    gl.deleteBuffer(buf);
  };

  // оси
  drawLines(shaft.subarray(0 ,  6), [1, 0, 0, 1]); // X – красная
  drawLines(shaft.subarray(6 , 12), [0, 1, 0, 1]); // Y – зелёная
  drawLines(shaft.subarray(12    ), [0, 0, 1, 1]); // Z – синяя

  // стрелочные головки
  const drawHead = (off, color) => {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, heads.subarray(off, off + 9), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(uColor, color);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.deleteBuffer(buf);
  };

  drawHead(0 ,  [1, 0, 0, 1]);
  drawHead(9 ,  [0, 1, 0, 1]);
  drawHead(18,  [0, 0, 1, 1]);

  /* ── возвращаем глубину к обычному режиму ───────────────────── */
  gl.depthFunc?.(gl.LESS);
}
