import type { Core } from "../core/Core";
import type { SceneObject } from "../types/SceneObjectTypes";
import type { DragState } from "../types/RendererTypes";
import { vec3, mat4 } from "../../vendor/gl-matrix/index.js";
import { intersectTriangle } from "../../utils/rayTriangle.js";

type DragObjectInfo = {
  obj: SceneObject;
  offset: [number, number, number];
} | null;

export class EditorControls {
  private core: Core;
  private dragObjectInfo: DragObjectInfo = null;
  private dragCameraInfo: DragState | null = null;
  public selectedObject: SceneObject | null = null;

  constructor(core: Core) {
    this.core = core;
    this.attach();
  }

  attach() {
    const canvas = this.core.canvas;
    canvas.addEventListener("contextmenu", e => e.preventDefault());
    canvas.addEventListener("mousedown", this._onMouseDown);
    window.addEventListener("mousemove", this._onMouseMove);
    window.addEventListener("mouseup", this._onMouseUp);
    canvas.addEventListener("wheel", this._onWheel, { passive: false });
    window.addEventListener("keydown", this._onKeyDown);
  }

  dispose() {
    const canvas = this.core.canvas;
    canvas.removeEventListener("contextmenu", e => e.preventDefault());
    canvas.removeEventListener("mousedown", this._onMouseDown);
    window.removeEventListener("mousemove", this._onMouseMove);
    window.removeEventListener("mouseup", this._onMouseUp);
    canvas.removeEventListener("wheel", this._onWheel);
    window.removeEventListener("keydown", this._onKeyDown);
  }

  private _onMouseDown = (e: MouseEvent) => {
  const { canvas } = this.core;

  if (e.button === 0 && !e.shiftKey) {
    const pick = this._pickObject(e);
    if (pick) {
      this.selectedObject = pick.obj;
       this.core.scene.selectedObject = pick.obj;     // для доступа из Scene
 this.core.setSelectedObject?.(pick.obj);  
      const off: [number, number, number] = [
        pick.pickPoint[0] - pick.obj.position[0],
        pick.pickPoint[1] - pick.obj.position[1],
        pick.pickPoint[2] - pick.obj.position[2]
      ];
      this.dragObjectInfo = { obj: pick.obj, offset: off };

      // Эмитим событие выбора объекта
      this.core.emitter.emit("objectSelected", {
        id: pick.obj.id,
        name: pick.obj.name ?? '',
        type: pick.obj.type,
        position: pick.obj.position.slice(),
      });

      return;
    }

    // Если объект не выбран, сбрасываем выбор
    this.selectedObject           = null; 
    this.core.scene.selectedObject = null; 
    this.core.setSelectedObject?.(null);
    this.core.emitter.emit("objectSelected", null);
    this.dragCameraInfo = { mode: "orbit", x: e.clientX, y: e.clientY };
    return;
  }

  if ((e.button === 0 && e.shiftKey) || e.button === 2) {
    this.dragCameraInfo = { mode: "pan", x: e.clientX, y: e.clientY };
  }
};

  private _onMouseMove = (e: MouseEvent) => {
    const camera = this.core.camera as any;

    if (this.dragObjectInfo) {
      const pick = this._pickObject(e);
      if (!pick) return;
      const { obj, offset } = this.dragObjectInfo;
      obj.position = [
        pick.pickPoint[0] - offset[0],
        pick.pickPoint[1] - offset[1],
        pick.pickPoint[2] - offset[2]
      ];
      this.core.emitter.emit("objectUpdated", {
        scene: this.core.scene.name,
        object: { id: obj.id, position: obj.position.slice() }
      });
      return;
    }

    if (this.dragCameraInfo) {
      const dx = e.clientX - this.dragCameraInfo.x;
      const dy = e.clientY - this.dragCameraInfo.y;

      if (this.dragCameraInfo.mode === "orbit") {
        camera.yaw -= dx * 0.005;
        camera.pitch += dy * 0.005;
        camera.pitch = Math.max(-1.55, Math.min(1.55, camera.pitch));
      } else if (this.dragCameraInfo.mode === "pan") {
        const panSpeed = 0.01 * camera.distance;
        camera.target[0] -= (Math.cos(camera.yaw) * dx - Math.sin(camera.yaw) * dy) * panSpeed;
        camera.target[2] -= (Math.sin(camera.yaw) * dx + Math.cos(camera.yaw) * dy) * panSpeed;
      }

      this.dragCameraInfo.x = e.clientX;
      this.dragCameraInfo.y = e.clientY;
    }
  };

  private _onMouseUp = () => {
    this.dragObjectInfo = null;
    this.dragCameraInfo = null;
  };

  private _onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const camera = this.core.camera as any;
    camera.distance *= e.deltaY > 0 ? 1.1 : 0.9;
    camera.distance = Math.min(Math.max(camera.distance, 1), 100);
  };

  private _onKeyDown = (e: KeyboardEvent) => {
    const camera = this.core.camera as any;
    const speed = 0.1 * camera.distance;
    switch (e.key.toLowerCase()) {
      case "w": case "arrowup":    camera.target[2] -= speed; break;
      case "s": case "arrowdown":  camera.target[2] += speed; break;
      case "a": case "arrowleft":  camera.target[0] -= speed; break;
      case "d": case "arrowright": camera.target[0] += speed; break;
    }
  };

  private _pickObject(e: MouseEvent): { obj: SceneObject, pickPoint: [number, number, number] } | null {
    const { canvas, camera, scene } = this.core;
    const rect = canvas.getBoundingClientRect();
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    const viewProj = mat4.create();
    mat4.multiply(viewProj, camera.getProjection(), camera.getView());
    const invVP = mat4.invert(mat4.create(), viewProj);
    if (!invVP) return null;

    const origin = vec3.transformMat4(vec3.create(), [ndcX, ndcY, -1], invVP);
    const farPt = vec3.transformMat4(vec3.create(), [ndcX, ndcY, 1], invVP);
    const dir = vec3.normalize(vec3.create(), vec3.sub(vec3.create(), farPt, origin));

    let closest: { obj: SceneObject, t: number } | null = null;

    for (const obj of scene.objects) {
      if (!obj.mesh) continue;
      const center = obj.worldPosition;
      const L = vec3.sub(vec3.create(), origin, center);
      const b = 2 * vec3.dot(dir, L);
      const c = vec3.dot(L, L) - obj.boundingRadius * obj.boundingRadius;
      if (b * b - 4 * c < 0) continue;

      const { positions, indices } = obj.mesh;
      for (let i = 0; i < indices.length; i += 3) {
        const i0 = indices[i + 0] * 3;
        const i1 = indices[i + 1] * 3;
        const i2 = indices[i + 2] * 3;
        const v0 = vec3.add(vec3.create(), center, [positions[i0 + 0], positions[i0 + 1], positions[i0 + 2]]);
        const v1 = vec3.add(vec3.create(), center, [positions[i1 + 0], positions[i1 + 1], positions[i1 + 2]]);
        const v2 = vec3.add(vec3.create(), center, [positions[i2 + 0], positions[i2 + 1], positions[i2 + 2]]);
        const hit = intersectTriangle(origin, dir, v0, v1, v2);
        if (hit && hit.t > 0 && (!closest || hit.t < closest.t)) {
          closest = { obj, t: hit.t };
        }
      }
    }

    if (!closest) return null;

    const pickPoint = vec3.scaleAndAdd(vec3.create(), origin, dir, closest.t) as [number, number, number];
    return { obj: closest.obj, pickPoint };
  }
}
