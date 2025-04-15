import { GameType } from './GameType.js';
import { PhysicsEngine } from '../core/physics/PhysicsEngine.js';

export class FreeGameType extends GameType {
  constructor(core, options = {}) {
    super(core);
    
    // Позволяем задавать гравитацию и другие параметры извне
    const gravity = options.gravity ?? 0;
    const customPhysicsEngine = new PhysicsEngine(gravity);

    this.physicsEngine = customPhysicsEngine;
  }

  start() {
    super.start();
  }

  handleGameTypeSpecificLogic(deltaTime) {
    // Пусто — всё пишется пользователем
  }
}
