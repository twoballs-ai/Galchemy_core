import { Game } from "../../src/index.js";

const game = Game.init({
  canvasId: "canvas",
  w: 1200,
  h: 800,
  bg: "#222",
}).physics({ gravity: 0 });
const player = game
  .spawn("./raketa.png", 500, 600, { size: 100, speed: 300 })
  .moveLeft("a")
  .moveRight("d")
  .moveUp("w")
  .moveDown("s")
  .shoot("space", {
    // ← больше никаких функций
    image: "./laser.png", // спрайт пули
    dir: "up", // направление: up / down / left / right
    offset: { x: 0, y: -50 }, // (необязательное) смещение
    speed: 1000, // скорость
  });

game.spawnGroup({
  images: ["./raketa.png", "./raketa.png"],
  pattern: "fallRandom",
  size: [40, 100],
  every: 3000,
});

game.start();
