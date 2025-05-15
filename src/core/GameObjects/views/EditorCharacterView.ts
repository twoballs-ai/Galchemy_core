import { GameObject3D } from '../primitives/GameObject3D.ts';
import { createCharacterIconGeometry } from '../primitives/3dPrimitives/objectIcons/createCharacterIconGeometry.js';
import { mat4 } from '../../../vendor/gl-matrix/index.js';

export class EditorCharacterView extends GameObject3D {
  constructor(gl: WebGL2RenderingContext, targetCharacter: GameObject3D) {
    super(gl, {
      mesh: createCharacterIconGeometry(),
      position: targetCharacter.position,
      color: '#ff69b4',
    });

    this.characterRef = targetCharacter;
    this.type = 'editorCharacterView';
    this.isEditorOnly = true;

    this.attachTo(targetCharacter); // ← следит за позицией персонажа
  }

  renderWebGL3D(gl, shaderProgram, uModel, uColor, uUseTexture) {
    const modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, this.worldPosition);
    gl.uniformMatrix4fv(uModel, false, modelMatrix);
    gl.uniform4fv(uColor, this.color);
    gl.uniform1i(uUseTexture, false);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.LINES, this.vertexCount, this.indexType, 0);
  }
}
