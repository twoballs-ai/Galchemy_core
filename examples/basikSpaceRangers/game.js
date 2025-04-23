import { Game } from "../../src/index.js";

const game = Game.init({
  canvasId: "canvas",
  w: 1280,
  h: 720,
  renderType: "webgl3d",
  debug: false
});

game.spawnSpherePlanet(1, 32, [0, 0, -5]);
game.start();

