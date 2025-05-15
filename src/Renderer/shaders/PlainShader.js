// vertex shader (PlainShader.js)
export const plainVertexShader = /* glsl */ `
attribute vec3 aVertexPosition;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

void main() {
  gl_Position = uProjection * uView * uModel * vec4(aVertexPosition, 1.0);
}
`;

// fragment shader (PlainShader.js)
export const plainFragmentShader = /* glsl */ `
precision mediump float;
uniform vec4 uColor;

void main() {
  gl_FragColor = uColor;
}
`;
