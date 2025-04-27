import { mat4 } from '../../../vendor/gl-matrix/index.js';

/**
 * Рисует бесконечную сетку.
 * @param {object} ctx      – объект WebGLRenderer3D (this из рендера)
 */
export function drawGrid(ctx) {
const { gl, uModel, gridStep, camTarget, camDist } = ctx;

  const size   = Math.ceil(camDist * 2);
  const startX = Math.floor((camTarget[0] - size) / gridStep) * gridStep;
  const endX   = Math.ceil ((camTarget[0] + size) / gridStep) * gridStep;
  const startZ = Math.floor((camTarget[2] - size) / gridStep) * gridStep;
  const endZ   = Math.ceil ((camTarget[2] + size) / gridStep) * gridStep;

  const lines = [], axes = [];

  for (let x = startX; x <= endX; x += gridStep)
    (x === 0 ? axes : lines).push(x,0,startZ, x,0,endZ);

  for (let z = startZ; z <= endZ; z += gridStep)
    (z === 0 ? axes : lines).push(startX,0,z, endX,0,z);

  gl.uniformMatrix4fv(uModel, false, mat4.create());
    ctx._drawLines(new Float32Array(lines), [0.45,0.45,0.45,1]);
    ctx._drawLines(new Float32Array(axes) , [0.9 ,0.2 ,0.2 ,1]);
}
