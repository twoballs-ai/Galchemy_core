export function createSphereGeometry(radius = 1, segments = 16) {
    const positions = [];
    const indices = [];
  
    for (let y = 0; y <= segments; y++) {
      const theta = y * Math.PI / segments;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
  
      for (let x = 0; x <= segments; x++) {
        const phi = x * 2 * Math.PI / segments;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
  
        const px = radius * cosPhi * sinTheta;
        const py = radius * cosTheta;
        const pz = radius * sinPhi * sinTheta;
  
        positions.push(px, py, pz);
      }
    }
  
    for (let y = 0; y < segments; y++) {
      for (let x = 0; x < segments; x++) {
        const first = (y * (segments + 1)) + x;
        const second = first + segments + 1;
  
        indices.push(first, second, first + 1);
        indices.push(second, second + 1, first + 1);
      }
    }
  
    return {
      positions: new Float32Array(positions),
      indices: new Uint16Array(indices)
    };
  }
  