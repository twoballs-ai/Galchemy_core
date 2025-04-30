import { mat4 } from '../../../vendor/gl-matrix/index.js';
import type { WebGLRenderer } from '../renderers/WebGLRenderer';

/**
 * Рисует XYZ-гизмо в правом нижнем углу в координатах экрана.
 * @param ctx – экземпляр WebGLRenderer
 */
export function drawGizmo(ctx: WebGLRenderer): void {
  const { gl, aPos, uModel, uView, uProj, uColor, activeCamera } = ctx;
  if (!activeCamera) return;

  const yaw = (activeCamera as any).yaw ?? 0;
  const pitch = (activeCamera as any).pitch ?? 0;

  const len = 2.5;
  const shaft = new Float32Array([
    0, 0, 0, len, 0, 0,
    0, 0, 0, 0, len, 0,
    0, 0, 0, 0, 0, len
  ]);

  const h = 0.35, w = 0.25;
  const heads = new Float32Array([
    len, 0, 0, len - h, w, 0, len - h, -w, 0,
    0, len, 0, -w, len - h, 0, w, len - h, 0,
    0, 0, len, w, 0, len - h, -w, 0, len - h
  ]);

  const proj = mat4.create();
  mat4.ortho(proj, 0, 50, 0, 50, -10, 10);

  const view = mat4.create();

  const model = mat4.create();
  mat4.translate(model, model, [42, 14, 0]);
  mat4.rotateY(model, model, yaw);
  mat4.rotateX(model, model, -pitch);

  gl.useProgram(ctx.shaderProgram);
  gl.uniformMatrix4fv(uProj, false, proj);
  gl.uniformMatrix4fv(uView, false, view);
  gl.uniformMatrix4fv(uModel, false, model);

  gl.depthFunc(gl.ALWAYS);

  const drawLines = (v: Float32Array, color: [number, number, number, number]) => {
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPos);
    gl.uniform4fv(uColor, color);
    gl.drawArrays(gl.LINES, 0, v.length / 3);
    gl.deleteBuffer(buf);
  };

  drawLines(shaft.subarray(0, 6), [1, 0, 0, 1]);
  drawLines(shaft.subarray(6, 12), [0, 1, 0, 1]);
  drawLines(shaft.subarray(12), [0, 0, 1, 1]);

  const drawHead = (off: number, color: [number, number, number, number]) => {
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, heads.subarray(off, off + 9), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPos);
    gl.uniform4fv(uColor, color);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.deleteBuffer(buf);
  };

  drawHead(0, [1, 0, 0, 1]);
  drawHead(9, [0, 1, 0, 1]);
  drawHead(18, [0, 0, 1, 1]);

  gl.depthFunc(gl.LESS);
}
