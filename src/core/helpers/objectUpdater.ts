import { createSphereGeometry }   from '../../GameObjects/primitives/3dPrimitives/createSphereGeometry.js';
import { createCubeGeometry }     from '../../GameObjects/primitives/3dPrimitives/createCubeGeometry.js';
import { createCylinderGeometry } from '../../GameObjects/primitives/3dPrimitives/createCylinderGeometry.js';
import type { Core }              from '../Core.ts';

/**
 * Применяет свойства к вложенной камере (если есть).
 */
function applyCameraProps(camera: any, props: Partial<any>) {
  if (!camera) return;

  if (props.fov !== undefined) camera.fov = props.fov;
  if (props.near !== undefined) camera.near = props.near;
  if (props.far !== undefined) camera.far = props.far;
  if (props.orthoSize !== undefined) camera.orthoSize = props.orthoSize;
  if (props.isOrthographic !== undefined) camera.isOrthographic = props.isOrthographic;
  if (props.lookAt !== undefined) camera.lookAt = props.lookAt;

  camera.updateProjection?.();
  camera.update?.();
}

/**
 * Лёгкий патч: обновляет свойства объекта (x/y/z, цвет и т. д.) без пересоздания геометрии.
 */
export function patchObject(core: Core, id: string, props: Partial<any>) {
  const obj = core.scene.objects.find(o => o.id === id);
  if (!obj) return;

  Object.assign(obj, props);

  if (obj.isCamera && obj.camera) {
    applyCameraProps(obj.camera, props);
  }

  core.renderer?.render(core.scene, core.debug);
}

/**
 * Обновление геометрии примитива при изменении ключевых параметров (например, радиус/размер).
 * Если не требуется пересоздание геометрии — делегирует в patchObject.
 */
export function updateGeometry(core: Core, id: string, type: string, props: Partial<any>) {
  const obj = core.scene.objects.find(o => o.id === id);
  if (!obj) return;

  const gl = core.ctx;
  let mesh = null;

  switch (type) {
    case 'sphere':
      if (props.radius !== undefined || props.segments !== undefined) {
        const r = props.radius ?? obj.radius;
        const s = props.segments ?? obj.segments ?? 24;
        mesh = createSphereGeometry(r, s);
      }
      break;

    case 'cube':
      if (
        props.width !== undefined ||
        props.height !== undefined ||
        props.depth !== undefined
      ) {
        const w = props.width  ?? obj.width;
        const h = props.height ?? obj.height;
        const d = props.depth  ?? obj.depth;
        mesh = createCubeGeometry(w, h, d);
      }
      break;

    case 'cylinder':
      if (props.radius !== undefined || props.height !== undefined) {
        const r = props.radius ?? obj.radius;
        const h = props.height ?? obj.height;
        mesh = createCylinderGeometry(r, h);
      }
      break;
  }

  if (!mesh) {
    patchObject(core, id, props);
    return;
  }

  // обновляем буферы геометрии
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

  if (mesh.texCoords && obj.texCoordBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.texCoords, gl.STATIC_DRAW);
  }

  if (mesh.normals && obj.normalBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.normals, gl.STATIC_DRAW);
  }

  obj.mesh = mesh;
  obj.vertexCount = mesh.indices.length;
  Object.assign(obj, props);

  if (obj.isCamera && obj.camera) {
    applyCameraProps(obj.camera, props);
  }

  core.renderer?.render(core.scene, core.debug);
}
