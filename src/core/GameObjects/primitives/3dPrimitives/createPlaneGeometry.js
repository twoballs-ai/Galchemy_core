export function createPlaneGeometry({
    width = 1, depth = 1, widthSeg = 1, depthSeg = 1
  } = {}) {
    const cols = widthSeg + 1, rows = depthSeg + 1,
          dx = width / widthSeg, dz = depth / depthSeg,
          sx = -width/2, sz = -depth/2;
    const v = [], n = [], uv = [], idx = [];
  
    for (let z=0; z<rows; z++)
      for (let x=0; x<cols; x++) {
        v.push(sx + x*dx, 0, sz + z*dz);
        n.push(0,1,0);
        uv.push(x/widthSeg, z/depthSeg);
      }
  
    for (let z=0; z<depthSeg; z++)
      for (let x=0; x<widthSeg; x++) {
        const a =  z   *cols + x,
              b =  a+1,
              c = (z+1)*cols + x+1,
              d =  c-1;
        idx.push(a,b,c,  a,c,d);
      }
    return {
      vertices: new Float32Array(v),
      normals:  new Float32Array(n),
      uvs:      new Float32Array(uv),
      indices:  new Uint32Array(idx)
    };
  }
  