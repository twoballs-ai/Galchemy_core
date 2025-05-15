import { GameObject3D } from './primitives/GameObject3D.ts';
import { createCharacterIconGeometry } from './primitives/3dPrimitives/createCharacterIconGeometry.js';

export class EditorCharacterView extends GameObject3D {
  constructor(gl, targetCharacter: GameObjectCharacter) {
    super(gl, {
      mesh: createCharacterIconGeometry(),
      position: targetCharacter.position,
      color: '#ff69b4',
    });

    this.characterRef = targetCharacter;
    this.type = 'editorCharacterView';
    this.isEditorOnly = true;

    this.attachTo(targetCharacter); // позиция следит за персонажем
  }
}
