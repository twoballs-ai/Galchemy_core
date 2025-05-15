import { createSphereGeometry }   from '../../GameObjects/primitives/3dPrimitives/createSphereGeometry.js';
import { createCubeGeometry }     from '../../GameObjects/primitives/3dPrimitives/createCubeGeometry.js';
import { createCylinderGeometry } from '../../GameObjects/primitives/3dPrimitives/createCylinderGeometry.js';
import type { Core }              from '../Core.ts';

/**
 * Лёгкий патч: меняем только поля (x/y/z/цвет и т. д.),
 * не трогая буферы WebGL. Быстро и дёшево.
 */
export function patchObject(core: Core, id: string, props: Partial<any>) {
  const obj = core.scene.objects.find(o => o.id === id);
  if (!obj) return;
  Object.assign(obj, props);
  core.renderer?.render(core.scene, core.debug);
}

/**
 * Полное обновление геометрии для примитивов, если изменился radius/size/height.
 * Заменяем VBO/IBO без пересоздания объекта.
 */
export function updateGeometry(core: Core, id: string, type: string, props: any) {
  const obj = core.scene.objects.find(o => o.id === id);
  if (!obj) return;

  const gl  = core.ctx;
  let mesh  = null;

  switch (type) {
    case 'sphere':
      if (props.radius !== undefined)
        mesh = createSphereGeometry(props.radius, props.segments ?? 24);
      break;

    case 'cube':
      if (props.size !== undefined)
        mesh = createCubeGeometry(props.size);
      break;

    case 'cylinder':
      if (props.radius !== undefined || props.height !== undefined)
        mesh = createCylinderGeometry(
          props.radius  ?? obj.radius,
          props.height  ?? obj.height
        );
      break;
  }

  if (!mesh) {               // ничего не меняем
    patchObject(core, id, props);
    return;
  }

  // ── заливаем новые данные в существующие буферы ────────────────────
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices,  gl.STATIC_DRAW);

  if (mesh.texCoords && obj.texCoordBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.texCoords, gl.STATIC_DRAW);
  }

  obj.mesh        = mesh;
  obj.vertexCount = mesh.indices.length;
  // применяем остальные свойства
  Object.assign(obj, props);

  core.renderer?.render(core.scene, core.debug);
}
