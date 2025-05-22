export const skyboxVertex = `#version 300 es
precision mediump float;

in  vec3 aPosition;      // куб [-1..1]
uniform mat4 uProj;
uniform mat4 uViewNoTrans;   // view без переноса
out vec3 vDir;

void main() {
  vDir = (uViewNoTrans * vec4(aPosition, 0.0)).xyz; // только вращение
  gl_Position = uProj * vec4(aPosition * 1000.0, 1.0); // «далёкий» куб
}
`;

export const skyboxFragment = `#version 300 es
precision mediump float;

in  vec3 vDir;
uniform sampler2D uSkyTex;   // equirectangular
out vec4 fragColor;

void main() {
  vec3 dir = normalize(vDir);
  float u  = atan(dir.z, dir.x) / (2.0 * 3.14159265) + 0.5;
  float v  = asin(dir.y) / 3.14159265 + 0.5;
  fragColor = texture(uSkyTex, vec2(u, 1.0 - v));
}
`;
