// core/PrimitiveFactory.js
import { GameObject3D }            from './primitives/GameObject3D.js';
import { createSphereGeometry }    from './primitives/3dPrimitives/createSphereGeometry.js';
import { createCubeGeometry }      from './primitives/3dPrimitives/createCubeGeometry.js';
import { createCylinderGeometry }  from './primitives/3dPrimitives/createCylinderGeometry.js';
import { GameObjectCamera } from './GameObjectCamera.js';
import { GameObjectLight } from './GameObjectLight.js';
import defaultTextureSrc           from '../../assets/Metal052C_1K-JPG/Metal052C_1K-JPG_Color.jpg';  // добавили!

const DEFAULT_PRIMITIVE_COLOR = '#7f7f7f'; // матово-серый

class PrimitiveFactory {
  registry = {};

  /** Регистрируем новый билд-коллбэк */
  register(type, builder) {
    this.registry[type] = builder;
  }

  /**
   * Создаём примитив
   * @param {string} type — ключ в registry
   * @param {WebGL2RenderingContext} gl
   * @param {object} opts — опции, могут включать color, position, radius и т.п.
   */
  create(type, gl, opts = {}) {
    const builder = this.registry[type];
    if (!builder) {
      throw new Error(`Unknown primitive type: ${type}`);
    }
    const merged = {
      color: DEFAULT_PRIMITIVE_COLOR,
      texture: defaultTextureSrc, // ← дефолтная текстура
      ...opts,
    };
    return builder(gl, merged);
  }
}

export const primitiveFactory = new PrimitiveFactory();

/* ---------- built-ins ---------- */

primitiveFactory.register(
  'sphere',
  (gl, { radius = 1, segments = 24, position = [0, 0, -5], color, texture }) =>
    new GameObject3D(gl, {
      mesh     : createSphereGeometry(radius, segments),
      position,
      color,
      textureSrc: texture,
    })
);

primitiveFactory.register(
  'cube',
  (gl, { size = 1, position = [0, 0, -5], color, texture }) =>
    new GameObject3D(gl, {
      mesh     : createCubeGeometry(size),
      position,
      color,
      textureSrc: texture,
    })
);

primitiveFactory.register(
  'cylinder',
  (gl, { radius = 1, height = 2, position = [0, 0, -5], color, texture }) =>
    new GameObject3D(gl, {
      mesh     : createCylinderGeometry(radius, height),
      position,
      color,
      textureSrc: texture,
    })
);
primitiveFactory.register(
  'camera',
  (gl, opts) => new GameObjectCamera(gl, opts)
);
primitiveFactory.register('light', (gl, opts) => new GameObjectLight(gl, opts));