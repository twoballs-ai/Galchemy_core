import { Core } from '../../src/core/core_logic/Core.js';
import { GameMode } from '../../src/core/core_logic/RenderMode/mode/GameMode.js';
import { getShape2d } from '../../src/gameObjects/shape2d.js';
import { KeyboardControl } from '../../src/core/controls/keyboardControl.js';

const renderType = '2d';

const core = new Core({
  canvasId: 'canvas',
  renderType,
  backgroundColor: '#000',
  width: 1200,
  height: window.innerHeight,
});

// Отключаем гравитацию
core.setGameType('free', { gravity: 0 });

const shape2d = getShape2d(renderType);
const sceneManager = core.getSceneManager();
sceneManager.createScene('level1');

// 🎨 Фон
const background = shape2d.spriteGrid({
  id: 'background',
  image: './SpaceShooterRedux/Backgrounds/black.png',
  x: 0,
  y: 0,
  width: 200,
  height: 200,
  repeatX: 10,
  repeatY: 10,
  preserveAspectRatio: false,
  enablePhysics: false,
  isStatic: true,
  layer: 0,
});

// 🚀 Игрок
const playerCharacter = shape2d.character({
  id: 'playerCharacter',
  x: 300,
  y: 300,
  width: 150,
  height: 150,
  image: './raketa.png',
  preserveAspectRatio: true,
  enablePhysics: true,
  isAnimated: false,
  layer: 1,
});

// Добавляем в сцену только фон и игрока
sceneManager.addGameObjectToScene('level1', background);
sceneManager.addGameObjectToScene('level1', playerCharacter);

// Активируем сцену
sceneManager.changeScene('level1');

// 🎮 Управление
const keyboard = new KeyboardControl();

// 🧊 Список изображений для случайных астероидов
const asteroidImages = [
  'meteorGrey_tiny2.png', 'meteorGrey_tiny1.png',
  'meteorGrey_small2.png', 'meteorGrey_small1.png',
  'meteorGrey_med2.png', 'meteorGrey_med1.png',
  'meteorGrey_big4.png', 'meteorGrey_big3.png',
  'meteorGrey_big2.png', 'meteorGrey_big1.png',
  'meteorBrown_tiny2.png', 'meteorBrown_tiny1.png',
  'meteorBrown_small2.png', 'meteorBrown_small1.png',
  'meteorBrown_med3.png', 'meteorBrown_med1.png',
  'meteorBrown_big4.png', 'meteorBrown_big3.png',
  'meteorBrown_big2.png', 'meteorBrown_big1.png',
].map(name => `./SpaceShooterRedux/PNG/Meteors/${name}`);

let lastAsteroidSpawn = 0;
const asteroidSpawnInterval = 800;

// 🌠 Спавн одного астероида
function spawnAsteroid() {
  const id = 'asteroid-' + Date.now();
  const image = asteroidImages[Math.floor(Math.random() * asteroidImages.length)];
  const x = Math.random() * (core.graphicalContext.canvas.width - 80);
  const y = 100;

  const asteroid = shape2d.sprite({
    id,
    x,
    y,
    width: 80,
    height: 80,
    image,
    preserveAspectRatio: true,
    enablePhysics: true,
    isStatic: false,
    layer: 1,
  });

  if (asteroid.rigidBody) {
    const angle = (Math.random() * 0.5 - 0.25); // ±15°
    const speed = 200 + Math.random() * 200;
    asteroid.rigidBody.velocityX = Math.sin(angle) * speed;
    asteroid.rigidBody.velocityY = Math.cos(angle) * speed;
  }

  sceneManager.addGameObjectToScene('level1', asteroid);
}

// 🔁 Главная игровая логика
core.userLogic = (objects, core, deltaTime) => {
  const dt = deltaTime / 200;
  const accel = 1600;
  const decel = 1600;
  const maxSpeed = playerCharacter.speed * 2600;
  const canvas = core.graphicalContext.canvas;

  const body = playerCharacter.rigidBody;
  if (!body) return;

  // 🎮 Управление игроком
  if (keyboard.isKeyPressed('a') || keyboard.isKeyPressed('ArrowLeft')) {
    body.velocityX = Math.max(body.velocityX - accel * dt, -maxSpeed);
  } else if (keyboard.isKeyPressed('d') || keyboard.isKeyPressed('ArrowRight')) {
    body.velocityX = Math.min(body.velocityX + accel * dt, maxSpeed);
  } else {
    body.velocityX = body.velocityX > 0
      ? Math.max(body.velocityX - decel * dt, 0)
      : Math.min(body.velocityX + decel * dt, 0);
  }

  if (keyboard.isKeyPressed('w') || keyboard.isKeyPressed('ArrowUp')) {
    body.velocityY = Math.max(body.velocityY - accel * dt, -maxSpeed);
  } else if (keyboard.isKeyPressed('s') || keyboard.isKeyPressed('ArrowDown')) {
    body.velocityY = Math.min(body.velocityY + accel * dt, maxSpeed);
  } else {
    body.velocityY = body.velocityY > 0
      ? Math.max(body.velocityY - decel * dt, 0)
      : Math.min(body.velocityY + decel * dt, 0);
  }

  // 📏 Ограничение движения игрока
  body.x = Math.max(0, Math.min(body.x, canvas.width - body.width));
  body.y = Math.max(0, Math.min(body.y, canvas.height - body.height));
  playerCharacter.x = body.x;
  playerCharacter.y = body.y;

  // ☄️ Спавн астероидов по таймеру (макс. 10)
  const now = performance.now();
  const sceneObjects = sceneManager.getGameObjectsFromCurrentScene();
  const currentAsteroids = Array.from(sceneObjects.values()).filter(obj =>
    obj.id?.startsWith('asteroid-')
  );

  if (now - lastAsteroidSpawn > asteroidSpawnInterval && currentAsteroids.length < 10) {
    spawnAsteroid();
    lastAsteroidSpawn = now;
  }

  // 🧹 Удаление астероидов, вышедших за нижнюю или боковые границы
  currentAsteroids.forEach(asteroid => {
    if (
      asteroid.x + asteroid.width < 0 || // ушёл за левую границу
      asteroid.x > canvas.width ||       // ушёл за правую границу
      asteroid.y > canvas.height + 100   // ушёл вниз
    ) {
      sceneManager.removeGameObjectFromScene('level1', asteroid.id);
    }
  });
};

// 🚀 Запуск игры
async function startGame() {
  core.switchMode(GameMode);
}

core.start().then(() => {
  startGame();
});
