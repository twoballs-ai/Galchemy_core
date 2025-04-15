import * as shapesCanvas2D from '../../gameObjects/canvas2d/shape.js';
import * as shapeswebgl from '../../gameObjects/webgl/shapes/shape.js';
// import * as shapesWebGL3D from '../../gameObjects/shapes/webgl/3d/shape.js';
// import * as shapesWebGPU2D from '../../gameObjects/shapes/webgpu/2d/shape.js';
// import * as shapesWebGPU3D from '../../gameObjects/shapes/webgpu/3d/shape.js';

export function getShapeFactory(renderType) {
  console.log()
  switch (renderType) {
    case '2d':
      return shapesCanvas2D.getShapes(renderType);
    case 'webgl':
      return shapeswebgl.getShapes(renderType);
    // case 'webgl3d':
    //   return shapesWebGL3D.getShapes();
    // case 'webgpu2d':
    //   return shapesWebGPU2D.getShapes();
    // case 'webgpu3d':
    //   return shapesWebGPU3D.getShapes();
    default:
      throw new Error('Unsupported render type: ' + renderType);
  }
}