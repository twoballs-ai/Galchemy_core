import { mat4 } from '../../../vendor/gl-matrix/index.js';

/**
 * Рисует бесконечную сетку в плоскости XZ и оси X/Z с выделением центральных линий.
 */
export function drawGrid(ctx) {
  const { gl, uModel, gridStep } = ctx;
  const cam = ctx.activeCamera;
  if (!cam) return;

  // const size = Math.ceil(cam.distance * 2 / gridStep) * gridStep;
  const size = 500;
  const y = 0;

  const gridLines: number[] = [];
  const xAxis: number[] = [];
  const zAxis: number[] = [];

  for (let i = -size; i <= size; i += gridStep) {
    // Горизонтальные линии (параллельны оси X)
    if (i === 0) {
      zAxis.push(-size, y, 0, size, y, 0); // ось Z (вдоль X)
      xAxis.push(0, y, -size, 0, y, size); // ось X (вдоль Z)
    } else {
      gridLines.push(-size, y, i, size, y, i); // параллель Z
      gridLines.push(i, y, -size, i, y, size); // параллель X
    }
  }

  gl.uniformMatrix4fv(uModel, false, mat4.create());

  // Сначала рисуем обычную серую сетку
  ctx._drawLines(new Float32Array(gridLines), [0.45, 0.45, 0.45, 1]);

  // Затем выделенные оси
  ctx._drawLines(new Float32Array(xAxis), [1, 0, 0, 1]);   // X – красная
  ctx._drawLines(new Float32Array(zAxis), [0, 0, 1, 1]);   // Z – синяя
}
