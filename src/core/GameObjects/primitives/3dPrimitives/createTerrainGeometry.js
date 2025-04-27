// src/core/GameObjects/primitives/3dPrimitives/createTerrainGeometry.js
import { createPlaneGeometry } from './createPlaneGeometry.js';

export function createTerrainGeometry({
  width = 10, depth = 10, seg = 64, heightFn = (_) => 0
} = {}) {
  // 1. создаём сетку
  const g = createPlaneGeometry({ width, depth, widthSeg: seg, depthSeg: seg });

  // 2. поднимаем по heightFn(x,z)
  const v = g.vertices;
  for (let i = 0; i < v.length; i += 3) {
    const x = v[i], z = v[i+2];
    v[i+1] = heightFn(x,z);
  }

  // 3. пересчитываем нормали (центр. разности)
  const cols = seg + 1;
  for (let z=0; z<=seg; z++)
    for (let x=0; x<=seg; x++) {
      const i = (z*cols + x)*3;
      const iL = ((z   )*cols + Math.max(x-1,0))*3,
            iR = ((z   )*cols + Math.min(x+1,seg))*3,
            iD = (Math.max(z-1,0)*cols + x)*3,
            iU = (Math.min(z+1,seg)*cols + x)*3;
      const dx = v[iR+1] - v[iL+1],
            dz = v[iU+1] - v[iD+1];
      // нормаль ~ (-dx,1,-dz)
      const nx = -dx, ny = 2, nz = -dz,
            l = Math.hypot(nx,ny,nz);
      g.normals.set([nx/l, ny/l, nz/l], i);
    }
  return g;
}
