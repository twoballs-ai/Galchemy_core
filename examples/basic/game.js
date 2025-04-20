import { Game } from "../../src/index.js";

const game = Game.init({
  canvasId: "canvas",
  w: 1200,
  h: 800,
  bg: "#222",
  debug: false 
}).physics({ gravity: 0 });
const gui = game.setGUI({
  showScore: true,
  showHealth: true,
  showEnergy: true
});
const player = game
  .spawn("./raketa.png", 500, 600, { w: 100, h: 100, layer: 4,speed: 300 })
  // .moveLeft('a').moveRight('d').moveUp('w').moveDown('s')

  // Или сразу английская + русская + стрелки:
  .moveLeft(['a','ф','ArrowLeft'])
  .moveRight(['d','в','ArrowRight'])
  .moveUp(['w','ц','ArrowUp'])
  .moveDown(['s','ы','ArrowDown'])
  .shoot("space", {
  image: "./laserGreen02.png",
  w: 10,
  h: 70,
  speed: 1200,
  offset: { x: 0, y: -50 },
  dir: "up",
  cooldown: 300
})

game.spawnGroup({
  images: [
    "./meteorBrown_big1.png",
    "./meteorBrown_big2.png",
    "./meteorBrown_big3.png",
    "./meteorBrown_big4.png"
  ],
  pattern: "fallRandom",
  minSize:40,
  maxSize:100,
  layer: 3,
  every: 1000,
  score: 5 
});

game.start();
