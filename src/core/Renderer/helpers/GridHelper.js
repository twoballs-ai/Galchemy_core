import { mat4, vec3 } from '../../../vendor/gl-matrix/index.js';

/**
 * Рисует бесконечную сетку в зависимости от положения камеры.
 * @param {object} ctx – объект WebGLRenderer (this из рендера)
 */
export function drawGrid(ctx) {
  const { gl, uModel, gridStep } = ctx;
  const cam = ctx.activeCamera;
  if (!cam) return;

  const target = cam.target;
  const pos = cam.position;
  const dist = vec3.distance(pos, target);

  // Вычисляем доминирующее направление взгляда
  const forward = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), target, pos));
  const absForward = vec3.fromValues(Math.abs(forward[0]), Math.abs(forward[1]), Math.abs(forward[2]));

  // Выбираем, в какой плоскости рисовать сетку
  let axisU: [number, number, number];
  let axisV: [number, number, number];
  let center: [number, number, number] = [target[0], target[1], target[2]];

  if (absForward[1] > absForward[0] && absForward[1] > absForward[2]) {
    // Камера смотрит почти вертикально (ось Y доминирует) → рисуем сетку по XZ
    axisU = [1, 0, 0];
    axisV = [0, 0, 1];
  } else if (absForward[0] > absForward[2]) {
    // Камера смотрит больше вдоль оси X → сетка по YZ
    axisU = [0, 1, 0];
    axisV = [0, 0, 1];
  } else {
    // Камера смотрит больше вдоль оси Z → сетка по XY
    axisU = [1, 0, 0];
    axisV = [0, 1, 0];
  }

  const size = Math.ceil(dist * 2);

  const startU = Math.floor(-size / gridStep) * gridStep;
  const endU = Math.ceil(size / gridStep) * gridStep;
  const startV = Math.floor(-size / gridStep) * gridStep;
  const endV = Math.ceil(size / gridStep) * gridStep;

  const lines = [];
  const axes = [];

  for (let u = startU; u <= endU; u += gridStep) {
    const start = [
      center[0] + axisU[0] * u + axisV[0] * startV,
      center[1] + axisU[1] * u + axisV[1] * startV,
      center[2] + axisU[2] * u + axisV[2] * startV
    ];
    const end = [
      center[0] + axisU[0] * u + axisV[0] * endV,
      center[1] + axisU[1] * u + axisV[1] * endV,
      center[2] + axisU[2] * u + axisV[2] * endV
    ];
    (u === 0 ? axes : lines).push(...start, ...end);
  }

  for (let v = startV; v <= endV; v += gridStep) {
    const start = [
      center[0] + axisV[0] * v + axisU[0] * startU,
      center[1] + axisV[1] * v + axisU[1] * startU,
      center[2] + axisV[2] * v + axisU[2] * startU
    ];
    const end = [
      center[0] + axisV[0] * v + axisU[0] * endU,
      center[1] + axisV[1] * v + axisU[1] * endU,
      center[2] + axisV[2] * v + axisU[2] * endU
    ];
    (v === 0 ? axes : lines).push(...start, ...end);
  }

  gl.uniformMatrix4fv(uModel, false, mat4.create());
  ctx._drawLines(new Float32Array(lines), [0.45, 0.45, 0.45, 1]);
  ctx._drawLines(new Float32Array(axes), [0.9, 0.2, 0.2, 1]);
}
