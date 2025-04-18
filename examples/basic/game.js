import { Core, Player, Mob, GUI } from '../../src/index.js';

const game = new Core({ canvasId: 'canvas', width: 1200, height: 800, backgroundColor: '#222' });
game.enablePhysics({ gravity: 0 });

const gui = new GUI({
  showScore:true, showHealth:true, showEnergy:true   // любое можно отключить
});
game.setGUI(gui);

const player = new Player({
  imageSrc: './raketa.png',
  x: 500, y: 600,
  width: 100, height: 100,
  speed: 300,
  physics: true,   // включаем по умолчанию
  collision: true,
});
game.add(player);
game.setMovement(player, player.speed, { horizontal: true, vertical: true });

player.setProjectile({
  imageSrc : './laserGreen02.png',   // ← ЛЮБОЙ свой путь
  width    : 10,
  height   : 50,
  speed    : 1000
});

/* 3. назначаем кнопку */
game.setActions(player, { shoot: 'space' });


const enemyImages = [
  './SpaceShooterRedux/PNG/Meteors/meteorBrown_big1.png',
  './SpaceShooterRedux/PNG/Meteors/meteorBrown_big2.png',
  './SpaceShooterRedux/PNG/Meteors/meteorBrown_big3.png',
  './SpaceShooterRedux/PNG/Meteors/meteorBrown_big4.png'
];

const mob1 = Mob.spawnSingle({ game, imageSrc: enemyImages[0], x:100, y:100, width:60, pattern:'static' });
const mob2 = Mob.spawnSingle({ game, imageSrc: enemyImages[1], x:300, y:60,  width:60, pattern:'fall'   });
const mob3 = Mob.spawnSingle({ game, imageSrc: enemyImages[2], x:200, y:-70, width:70, pattern:'fallRandom' });

const meteorArray = Mob.spawnMultiple({
  game,
  images: enemyImages,
  count: 5,
  pattern: 'fallRandom',
  minSize: 40,
  maxSize: 100,
  interval: 3000,   
});

game.start();
