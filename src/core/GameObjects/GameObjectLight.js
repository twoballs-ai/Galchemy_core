// src/core/GameObjects/GameObjectLight.js
import { GameObject3D } from './primitives/GameObject3D.js';
import { mat4 }         from '../../vendor/gl-matrix/index.js';
import { hexToRGB }     from '../../utils/ColorMixin.js';

export class GameObjectLight extends GameObject3D {
  /**
   * opts.subtype: 'point'|'directional'|'ambient'
   * opts.position, opts.direction, opts.color
   */
  constructor(gl, { subtype='point', position=[0,0,0], direction=[0,-1,0], color='#ffff00' }) {
    // мэш не нужен, будем рисовать «на лету»
    super(gl, { mesh: { positions: new Float32Array([]), indices: new Uint16Array([]) }, position, color });
    this.subtype  = subtype;
    this.direction = direction;
    this.isLight = true;
  }

  renderWebGL3D(gl, shaderProgram, uModel, uColor, uUseTexture) {
    if (!this.isEditorMode) return;

    // подготовим модельку (только translate)
    const modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, this.position);
    gl.uniformMatrix4fv(uModel, false, modelMatrix);

    // отключаем текстуру
    gl.uniform1i(uUseTexture, false);
    // цвет
    const rgba = hexToRGB(this.color);
    gl.uniform4fv(uColor, rgba);

    // атрибут позиции
    gl.disableVertexAttribArray(this.aTexCoordLoc);
    gl.vertexAttribPointer(this.aPosLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.aPosLoc);

    // в зависимости от subtype рисуем простые линии
    let verts;
    switch (this.subtype) {
      case 'point':
        // точечный свет: вертикальная линия
        verts = new Float32Array([
          0, 0, 0,
          0, 0.5, 0
        ]);
        break;
      case 'directional':
        // направленный: линия в направлении direction
        verts = new Float32Array([
          0, 0, 0,
          this.direction[0], this.direction[1], this.direction[2]
        ]);
        break;
        case 'ambient':
            // фоновой: круг радиуса 0.3
            const segs = 16;
            const r    = 0.3;
            verts = new Float32Array(segs * 2 * 3);
          
            for (let i = 0; i < segs; i++) {
              // расчёт углов без скрытых символов
              const a1 = (i     / segs) * 2 * Math.PI;
              const a2 = ((i+1) / segs) * 2 * Math.PI;
          
              verts[i*6 + 0] = Math.cos(a1) * r;
              verts[i*6 + 1] = Math.sin(a1) * r;
              verts[i*6 + 2] = 0;
              verts[i*6 + 3] = Math.cos(a2) * r;
              verts[i*6 + 4] = Math.sin(a2) * r;
              verts[i*6 + 5] = 0;
            }
            break;
      default:
        return;
    }

    // заливаем и рисуем
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.drawArrays(gl.LINES, 0, verts.length/3);
    gl.deleteBuffer(buf);
  }
}
