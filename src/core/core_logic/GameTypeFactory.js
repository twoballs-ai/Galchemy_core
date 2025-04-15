// GameTypeFactory.js
import { PlatformerGameType } from '../../gameTypePresets/PlatformerGameType.js';
import { FreeGameType } from '../../gameTypePresets/FreeGameType.js'; // <-- добавили

export class GameTypeFactory {
  constructor(core) {
    this.core = core;
  }

  loadGameType(gameType, options = {}) {
    console.log(`Загрузка типа игры: ${gameType}`);
    switch (gameType) {
      case 'platformer':
        console.log(`Создание экземпляра PlatformerGameType для: ${gameType}`);
        return new PlatformerGameType(this.core, options);

      case 'free':
        console.log(`Создание экземпляра FreeGameType для: ${gameType}`);
        return new FreeGameType(this.core, options);

      default:
        console.warn(`Неизвестный тип игры: ${gameType}`);
        return null;
    }
  }
}
