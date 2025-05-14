// cameras/FollowCamera.ts
import { mat4, vec3 } from "../../vendor/gl-matrix/index.js";
import { BaseCamera }  from "./BaseCamera.ts";
import type { GameObject3D } from "../core/GameObjects/GameObject3D.ts";

export class FollowCamera extends BaseCamera {
  target: GameObject3D;
  offset: vec3 = vec3.fromValues(0, 0, 0);
  keepLookAt = true;        // если false — можно крутить вручную

  constructor(w: number, h: number, target: GameObject3D, offset: vec3 = [0,0,0]) {
    super(w, h);
    this.target = target;
    this.offset = vec3.clone(offset);
  }

  /**-- Позиция = target + offset --*/
  update(): void {
    vec3.add(this.position, this.target.worldPosition, this.offset);
    if (this.keepLookAt) {
      vec3.copy(this.lookAt, this.target.worldPosition);
    }
    super.update(); // формирует view-матрицу
  }
}
