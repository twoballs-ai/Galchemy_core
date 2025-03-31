// integration/apiFactory.js
import { GameObjectAPI } from './API/GameObjectAPI.js';
import { CharacterAPI } from './API/CharacterAPI.js';
// import { SpriteAPI } from './API/spriteApi.js';

export function createAPI({ core }) {
  return {
    objects: new GameObjectAPI({ core }),
    character: new CharacterAPI({ core }),
    // sprite: SpriteAPI({ core }),  // добавляй аналогично другие API
    core,
    log: console.log,
  };
}
