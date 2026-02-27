import { WebGLRenderer } from './WebGLRenderer';

/**
 * Временная реализация WebGPU-рендерера на базе проверенного WebGL-пайплайна.
 *
 * Цель: чтобы режим `webgpu` работал идентично `webgl` до полного WGSL/WebGPU-порта.
 */
export class WebGPURenderer extends WebGLRenderer {
  public readonly backend = 'webgpu';

  constructor(graphicalContext: any, backgroundColor: any) {
    super(graphicalContext, backgroundColor);
  }
}

