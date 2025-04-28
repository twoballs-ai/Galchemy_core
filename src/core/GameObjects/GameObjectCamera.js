// src/core/GameObjects/GameObjectCamera.js
import { GameObject3D } from './primitives/GameObject3D.js';
import { createCameraIconGeometry } from './primitives/3dPrimitives/createCameraIconGeometry.js';

export class GameObjectCamera extends GameObject3D {
  constructor(gl, {
    position = [0, 0, -5],
    fov = 45,
    near = 0.1,
    far = 100,
    lookDirection = [0, 0, -1],
    color = '#ffd700', // Золотой цвет для значка камеры
  } = {}) {
    super(gl, {
      mesh: createCameraIconGeometry(),
      position,
      color,
    });

    this.fov  = fov;
    this.near = near;
    this.far  = far;
    this.lookDirection = lookDirection;
    this.isCamera = true;   // Специальный флаг
  }
}
