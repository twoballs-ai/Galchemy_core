// src/core/primitives/3dPrimitives/createCameraIconGeometry.js
export function createCameraIconGeometry() {
    const positions = new Float32Array([
      0, 0, 0,   // Центр
      0, 0.2, -0.5,  // Вперёд-вверх
      0, -0.2, -0.5, // Вперёд-вниз
      0.2, 0, -0.5,  // Вперёд-вправо
      -0.2, 0, -0.5, // Вперёд-влево
    ]);
  
    const indices = new Uint16Array([
      0, 1, 2, 0, 1, 3, 0, 1, 4,
      0, 2, 3, 0, 2, 4,
      0, 3, 4
    ]);
  
    return { positions, indices };
  }
  