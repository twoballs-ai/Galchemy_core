// integration/API/CharacterAPI.js
import { GameObjectAPI } from './GameObjectAPI.js';

export class CharacterAPI extends GameObjectAPI {
  constructor({ core }) {
    super({ core });
    this.keyState = {};
    this.controlledCharacter = null;
    this.speed = 3;
    this.jumpForce = -10;

    this.setupKeyboard();
  }

  control(characterId) {
    this.controlledCharacter = this.getById(characterId);
    if (!this.controlledCharacter) {
      this.log("Character for control not found:", characterId);
    }
  }

  setupKeyboard() {
    window.addEventListener('keydown', (e) => this.keyState[e.key] = true);
    window.addEventListener('keyup', (e) => this.keyState[e.key] = false);
  }

  update() {
    const char = this.controlledCharacter;
    if (!char || !char.rigidBody) return;

    const { rigidBody } = char;

    // Движение влево-вправо
    if (this.keyState['a'] || this.keyState['A']) rigidBody.velocityX = -this.speed;
    else if (this.keyState['d'] || this.keyState['D']) rigidBody.velocityX = this.speed;
    else rigidBody.velocityX = 0;

    // Движение вверх-вниз (если нужно)
    if (this.keyState['w'] || this.keyState['W']) rigidBody.velocityY = -this.speed;
    else if (this.keyState['s'] || this.keyState['S']) rigidBody.velocityY = this.speed;

    // Прыжок (пробел)
    if ((this.keyState[' '] || this.keyState['Spacebar']) && rigidBody.onGround) {
      rigidBody.velocityY = this.jumpForce;
    }
  }
}
