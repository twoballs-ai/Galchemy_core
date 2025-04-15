import { Core, GameObject, Input } from '../../src/index.js';

const core = new Core({
  canvasId: 'canvas',
  width: 1200,
  height: 800,
  backgroundColor: '#222'
});

core.enablePhysics({ gravity: 0 });

const player = new GameObject({
  imageSrc: './raketa.png',
  x: 100,
  y: 100,
  width: 50,
  height: 50,
  physics: true
});

const enemy = new GameObject({
  imageSrc: './raketa.png',
  x: 400,
  y: 100,
  width: 50,
  height: 50,
  physics: true
});

core.add(player, enemy);

const input = new Input();

core.scene.update = (deltaTime) => {
  if (input.isPressed('ArrowLeft')) player.physicsBody.velocity.x = -200;
  else if (input.isPressed('ArrowRight')) player.physicsBody.velocity.x = 200;
  else player.physicsBody.velocity.x = 0;

  if (input.isPressed('ArrowUp')) player.physicsBody.velocity.y = -200;
  else if (input.isPressed('ArrowDown')) player.physicsBody.velocity.y = 200;
  else player.physicsBody.velocity.y = 0;
};

core.start();
