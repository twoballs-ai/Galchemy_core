// Z‑up ориентация. Никаких импортов WebGL, только математика.
import { mat4 } from '../../vendor/gl-matrix/index.js';

export function buildGizmoMatrix(
  cam: { yaw?: number; pitch?: number },
  pre: mat4 | null = null,  // translate‑в‑угол и т.п.
  scale = 1,
  flipY = false             // Ortho‑Y‑up? → true только для HUD
): mat4 {
  const m = pre ? mat4.clone(pre) : mat4.create();

  const yaw   = -(cam.yaw   ?? 0);
  const pitch = -(cam.pitch ?? 0);

  mat4.rotateZ(m, m, yaw);    // yaw  → Z
  mat4.rotateY(m, m, pitch);  // pitch→ Y

  if (flipY) mat4.scale(m, m, [1, -1, 1]);
  if (scale !== 1) mat4.scale(m, m, [scale, scale, scale]);

  return m;
}
