export function createCubeGeometry(size = 1) {
    const s = size / 2;
    const positions = new Float32Array([
      // front
      -s, -s,  s,   s, -s,  s,   s,  s,  s,  -s,  s,  s,
      // back
      -s, -s, -s,  -s,  s, -s,   s,  s, -s,   s, -s, -s,
      // top
      -s,  s, -s,  -s,  s,  s,   s,  s,  s,   s,  s, -s,
      // bottom
      -s, -s, -s,   s, -s, -s,   s, -s,  s,  -s, -s,  s,
      // right
       s, -s, -s,   s,  s, -s,   s,  s,  s,   s, -s,  s,
      // left
      -s, -s, -s,  -s, -s,  s,  -s,  s,  s,  -s,  s, -s
    ]);
    const idx = [];
    for (let f = 0; f < 6; ++f) {
      const o = f * 4;
      idx.push(o, o+1, o+2,  o, o+2, o+3);
    }
    return { positions, indices: new Uint16Array(idx) };
  }