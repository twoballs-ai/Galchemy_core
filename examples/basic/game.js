import { Core, GameObject } from '../../src/index.js';

const game = new Core({
  canvasId: 'canvas',
  width: 1200,
  height: 800,
  backgroundColor: '#222'
});

game.enablePhysics({ gravity: 0 });

const player = new GameObject({
  imageSrc: './raketa.png',
  x: 500,
  y: 600,
  width: 50,
  height: 50,
  physics: true
});

game.add(player);

const background = new GameObject({
  imageSrc: './SpaceShooterRedux/Backgrounds/blue.png',
  x: 0,
  y: 0,
  width: 1200,
  height: 800,
  repeatX: true,
  repeatY: true,
  scale: 1,
  layer: -10 // позади всего
});

game.add(background);
// Настраиваем простое передвижение: объект двигается только по горизонтали
game.setMovement(player, 300, { horizontal: true, vertical: true });

game.start();