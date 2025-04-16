import { Core, GameObject } from '../../src/index.js';
import { Mob } from '../../src/core/GameObjects/Character/Mob.js'; // или './Mob.js'

const game = new Core({
  canvasId: 'canvas',
  width: 1200,
  height: 800,
  backgroundColor: '#222'
});

game.enablePhysics({ gravity: 0 });

// Игрок
const player = new GameObject({
  imageSrc: './raketa.png',
  x: 500,
  y: 600,
  width: 50,
  height: 50,
  physics: true
});
game.add(player);

// Фон
const background = new GameObject({
  imageSrc: './SpaceShooterRedux/Backgrounds/blue.png',
  x: 0,
  y: 0,
  width: 1200,
  height: 800,
  repeatX: true,
  repeatY: true,
  scale: 1,
  layer: -10
});
game.add(background);

// Управление
game.setMovement(player, 300, { horizontal: true, vertical: true });

// Массив спрайтов врагов
const enemyImages = [
  './SpaceShooterRedux/PNG/Meteors/meteorBrown_big1.png',
  './SpaceShooterRedux/PNG/Meteors/meteorBrown_big2.png',
  './SpaceShooterRedux/PNG/Meteors/meteorBrown_big3.png',
  './SpaceShooterRedux/PNG/Meteors/meteorBrown_big4.png'
];

// ====== Пример: разные одиночные мобы ======

// mob1 – статический метеор
const mob1 = Mob.spawnSingle({
  game,
  image: enemyImages[0],
  x: 100,
  y: 100,
  width: 60,
  pattern: 'static'
});

// mob2 – падающий метеор
const mob2 = Mob.spawnSingle({
  game,
  image: enemyImages[1],
  x: 300,
  y: 60,
  width: 60,
  pattern: 'static'
});

// mob3 – «fallRandom» (падает с небольшим смещением по X)
const mob3 = Mob.spawnSingle({
  game,
  image: enemyImages[2],
  x: 200,
  y: -70,
  width: 70,
  pattern: 'fallRandom'
});

// Если нужно обратиться к ним дальше в коде, у нас есть mob1, mob2, mob3


// ====== Пример: массовое создание ======
// Создаст 5 случайных метеоров, возвращая массив
const meteorArray = Mob.spawnMultiple({
  game,
  images: enemyImages,
  count: 5,
  pattern: 'fallRandom',
  minSize: 40,
  maxSize: 100
});
// meteorArray[0], meteorArray[1], ... – ссылки на созданных мобов


// Запуск
game.start();
