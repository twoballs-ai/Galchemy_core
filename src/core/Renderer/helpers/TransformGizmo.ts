// src/Renderer/helpers/TransformGizmo.ts
import { mat4, vec3 } from "../../../vendor/gl-matrix/index.js";
import { AXIS_X_COLOR, AXIS_Y_COLOR, AXIS_Z_COLOR } from "../../../constants/CoordSystem";

export enum GizmoMode {
  TRANSLATE = 'translate',
  ROTATE = 'rotate',
  SCALE = 'scale',
}

export class TransformGizmo {
  mode: GizmoMode = GizmoMode.TRANSLATE;
  activeAxis: 'x' | 'y' | 'z' | null = null;
  isDragging = false;
  dragStart: vec3 = vec3.create();
  initialPosition: vec3 = vec3.create();

  setMode(mode: GizmoMode) {
    this.mode = mode;
  }

  draw(renderer: any) {
    const gl = renderer.gl;
    const obj = renderer.selectedObject;
    if (!obj || !obj.position) return;

    const pos = obj.position;
    const drawLine = (axis: 'x' | 'y' | 'z', color: number[]) => {
      const dir = {
        x: [1, 0, 0],
        y: [0, 1, 0],
        z: [0, 0, 1],
      }[axis] as vec3;

      const vertices = new Float32Array([
        pos[0], pos[1], pos[2],
        pos[0] + dir[0], pos[1] + dir[1], pos[2] + dir[2],
      ]);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      gl.useProgram(renderer.plainShaderProgram);
      gl.uniformMatrix4fv(renderer.plain_uModel, false, mat4.create());
      gl.uniformMatrix4fv(renderer.plain_uView, false, renderer.activeCamera.getView());
      gl.uniformMatrix4fv(renderer.plain_uProj, false, renderer.activeCamera.getProjection());
      gl.uniform4fv(renderer.plain_uColor, [...color, 1]);

      gl.vertexAttribPointer(renderer.plain_aPos, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(renderer.plain_aPos);

      gl.drawArrays(gl.LINES, 0, 2);
      gl.deleteBuffer(buf);
    };

    drawLine('x', AXIS_X_COLOR);
    drawLine('y', AXIS_Y_COLOR);
    drawLine('z', AXIS_Z_COLOR);
  }

  onMouseDown(ray: any, object: any) {
    // TODO: intersect ray with gizmo axis
    this.isDragging = true;
    vec3.copy(this.initialPosition, object.position);
    vec3.copy(this.dragStart, ray.origin); // Simplified
  }

  onMouseMove(ray: any, object: any) {
    if (!this.isDragging || !this.activeAxis) return;
    const delta = vec3.create();
    vec3.subtract(delta, ray.origin, this.dragStart);

    // Move object along selected axis
    const axisVec = {
      x: [1, 0, 0],
      y: [0, 1, 0],
      z: [0, 0, 1],
    }[this.activeAxis] as vec3;

    const movement = vec3.dot(delta, axisVec);
    const updated = vec3.scaleAndAdd(vec3.create(), this.initialPosition, axisVec, movement);
    object.position = updated;
  }

  onMouseUp() {
    this.isDragging = false;
    this.activeAxis = null;
  }
}
