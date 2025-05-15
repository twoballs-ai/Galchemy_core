export function createTerrainGeometry({
  width = 10,
  depth = 10,
  seg = 64,
  heightFn = (_) => 0,
} = {}) {
  const positions = [];
  const normals = [];
  const texCoords = [];
  const indices = [];

  const cols = seg + 1;
  const rows = seg + 1;

  for (let y = 0; y < rows; y++) {
    const ty = y / seg;
    const py = ty * depth - depth / 2;
    for (let x = 0; x < cols; x++) {
      const tx = x / seg;
      const px = tx * width - width / 2;
      const pz = heightFn(px, py); // теперь pz — высота (Z‑up)
      positions.push(px, py, pz); // X, Y, Z
      texCoords.push(tx, 1 - ty);
      normals.push(0, 0, 1); // временно вверх по Z
    }
  }

  for (let y = 0; y < seg; y++) {
    for (let x = 0; x < seg; x++) {
      const i = y * cols + x;
      indices.push(i, i + 1, i + cols);
      indices.push(i + 1, i + cols + 1, i + cols);
    }
  }

  // Пересчёт нормалей
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 3;

      const getZ = (xi, yi) => {
        xi = Math.max(0, Math.min(cols - 1, xi));
        yi = Math.max(0, Math.min(rows - 1, yi));
        return positions[(yi * cols + xi) * 3 + 2];
      };

      const zL = getZ(x - 1, y);
      const zR = getZ(x + 1, y);
      const zD = getZ(x, y - 1);
      const zU = getZ(x, y + 1);

      const dx = zR - zL;
      const dy = zU - zD;

      const nx = -dx;
      const ny = -dy;
      const nz = 2;
      const len = Math.hypot(nx, ny, nz);

      normals[i + 0] = nx / len;
      normals[i + 1] = ny / len;
      normals[i + 2] = nz / len;
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
    texCoords: new Float32Array(texCoords),
  };
}
