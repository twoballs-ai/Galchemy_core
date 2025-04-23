import { Game } from "../../src/index.js";

const game = Game.init({
  canvasId: "canvas",
  w: 1280,
  h: 720,
  renderType: "webgl3d",
  debug: true 
});

game.spawnSpherePlanet(1, 32, [10, 0, -5]);

// const planet = await game.spawn3DModel('./untitled.glb', [0,0,-8]);
game.start();

