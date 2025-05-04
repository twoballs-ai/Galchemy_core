import { mat4 } from '../../../vendor/gl-matrix/index.js';
import { drawLines } from '../internal/drawLines.js';
import { AXIS_X_COLOR, AXIS_Y_COLOR, AXIS_Z_COLOR } from '../../../constants/CoordSystem.js';

export function drawGrid(ctx) {
  const { gl, gridStep } = ctx;
  const cam = ctx.activeCamera;
  if (!cam) return;

  const size = 500;
  const z = 0; // Плоскость XY, Z-вверх

  const gridLines: number[] = [];
  const xAxis: number[] = [];
  const yAxis: number[] = [];

  for (let i = -size; i <= size; i += gridStep) {
    if (i === 0) {
      xAxis.push(-size, 0, z, size, 0, z); // X
      yAxis.push(0, -size, z, 0, size, z); // Y
    } else {
      gridLines.push(-size, i, z, size, i, z); // параллель X
      gridLines.push(i, -size, z, i, size, z); // параллель Y
    }
  }

  drawLines(gl, -1, null!, new Float32Array(gridLines), [0.4, 0.4, 0.4, 1], ctx);
  drawLines(gl, -1, null!, new Float32Array(xAxis),     AXIS_X_COLOR, ctx); // X — красный
  drawLines(gl, -1, null!, new Float32Array(yAxis),     AXIS_Y_COLOR, ctx); // Y — зелёный
}
