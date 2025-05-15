export function createCharacterIconGeometry() {
    const positions = new Float32Array([
      0, 0, 0,
      0, 1, 0,
      -0.3, 0.6, 0,
      0.3, 0.6, 0,
    ]);
    const indices = new Uint16Array([
      0, 2, 3,
      2, 1, 3
    ]);
    return { positions, indices };
  }
  