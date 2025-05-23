import { mat4, vec3 } from "../../vendor/gl-matrix/index.js";
import type { WebGLRenderer } from "../renderers/WebGLRenderer.js";
import { drawLines } from "../internal/drawLines.ts";
import { COORD } from "../../core/CoordinateSystem"; // фасад системы осей
import { buildGizmoMatrix } from "./GizmoMatrix.ts";

export function drawGizmo(ctx: WebGLRenderer): void {
  const { gl, aPos, uModel, uView, uProj, uColor, activeCamera } = ctx;
  if (!activeCamera) return;

  const LEN = 2.5;
  const H = 0.35;
  const W = 0.25;

  const shaftArr: number[] = [];
  const addAxis = (dir: vec3) => {
    shaftArr.push(0, 0, 0, dir[0] * LEN, dir[1] * LEN, dir[2] * LEN);
  };
  addAxis(COORD.RIGHT  as vec3);
  addAxis(COORD.FORWARD as vec3);
  addAxis(COORD.UP     as vec3);
  const shaft = new Float32Array(shaftArr);

  const headsArr: number[] = [];
  const addHead = (dir: vec3, ortho: vec3) => {
    const tip = vec3.scale(vec3.create(), dir, LEN);
    const base = vec3.scale(vec3.create(), dir, LEN - H);
    const left = vec3.scaleAndAdd(vec3.create(), base, ortho,  W);
    const right = vec3.scaleAndAdd(vec3.create(), base, ortho, -W);
    headsArr.push(...tip, ...left, ...right);
  };
  addHead(COORD.RIGHT  as vec3, COORD.UP);
  addHead(COORD.FORWARD as vec3, COORD.UP);
  addHead(COORD.UP     as vec3, COORD.RIGHT);
  const heads = new Float32Array(headsArr);

  const proj = mat4.create();
  mat4.ortho(proj, -5, 5, -5, 5, -10, 10);
  const view = mat4.create();
  const model = buildGizmoMatrix(activeCamera);

  gl.useProgram(ctx.shaderProgram);
  gl.uniformMatrix4fv(uProj , false, proj);
  gl.uniformMatrix4fv(uView , false, view);
  gl.uniformMatrix4fv(uModel, false, model);
  gl.depthFunc(gl.ALWAYS);

  drawLines(gl, aPos, uColor, shaft.subarray(0, 6),  COORD.AXIS_X_COLOR, ctx);
  drawLines(gl, aPos, uColor, shaft.subarray(6, 12), COORD.AXIS_Y_COLOR, ctx);
  drawLines(gl, aPos, uColor, shaft.subarray(12),    COORD.AXIS_Z_COLOR, ctx);

  const drawHead = (offset: number, color: number[]) => {
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, heads.subarray(offset, offset + 9), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPos);
    gl.uniform4fv(uColor, color);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.deleteBuffer(buf);
  };
  drawHead(0,  COORD.AXIS_X_COLOR);
  drawHead(9,  COORD.AXIS_Y_COLOR);
  drawHead(18, COORD.AXIS_Z_COLOR);

  gl.depthFunc(gl.LESS);
}
