// Mob.js
import { GameObject } from '../GameObject.js';

export class Mob {
  static spawnSingle({
    game,
    image,
    x,
    y,
    width = 50,
    height,
    pattern = 'static'
  }) {
    const finalHeight = height || width;

    const mob = new GameObject({
      imageSrc: image,
      x,
      y,
      width,
      height: finalHeight,
      isEnemy: true,
      layer: 0
    });

    // Настраиваем паттерн движения, если метод в GameObject есть
    if (typeof mob.setMovementPattern === 'function') {
      mob.setMovementPattern(pattern);
    }

    // Добавляем в игру
    game.add(mob);

    // ВАЖНО: возвращаем объект
    return mob;
  }

  static spawnMultiple({
    game,
    images,
    count = 5,
    pattern = 'fall',
    minSize = 50,
    maxSize = 90
  }) {
    const resultArray = [];

    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * images.length);
      const image = images[randomIndex];

      const size = minSize + Math.random() * (maxSize - minSize);

      const x = Math.random() * (game.canvas.width - size);
      const y = -size;

      // Создаём и тут же запоминаем ссылку, чтобы при необходимости
      // вернуть весь массив созданных мобов
      const mob = Mob.spawnSingle({
        game,
        image,
        x,
        y,
        width: size,
        height: size,
        pattern
      });

      resultArray.push(mob);
    }

    // Если нужно, можете возвращать массив созданных мобов
    return resultArray;
  }
}
