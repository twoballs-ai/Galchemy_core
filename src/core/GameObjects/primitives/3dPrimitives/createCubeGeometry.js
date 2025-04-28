export function createCubeGeometry(size = 1) {
  const s = size / 2;
  const positions = [
    // front
    -s, -s,  s,  s, -s,  s,  s,  s,  s, -s,  s,  s,
    // back
    -s, -s, -s, -s,  s, -s,  s,  s, -s,  s, -s, -s,
    // top
    -s,  s, -s, -s,  s,  s,  s,  s,  s,  s,  s, -s,
    // bottom
    -s, -s, -s,  s, -s, -s,  s, -s,  s, -s, -s,  s,
    // right
     s, -s, -s,  s,  s, -s,  s,  s,  s,  s, -s,  s,
    // left
    -s, -s, -s, -s, -s,  s, -s,  s,  s, -s,  s, -s,
  ];
  const texCoords = [
    // front
    0,0, 1,0, 1,1, 0,1,
    // back
    0,0, 0,1, 1,1, 1,0,
    // top
    0,0, 0,1, 1,1, 1,0,
    // bottom
    0,0, 1,0, 1,1, 0,1,
    // right
    0,0, 0,1, 1,1, 1,0,
    // left
    0,0, 1,0, 1,1, 0,1,
  ];
  const indices = [];
  for (let f = 0; f < 6; ++f) {
    const o = f * 4;
    indices.push(o, o+1, o+2,  o, o+2, o+3);
  }
  return {
    positions: new Float32Array(positions),
    indices: new Uint16Array(indices),
    texCoords: new Float32Array(texCoords),
  };
}
