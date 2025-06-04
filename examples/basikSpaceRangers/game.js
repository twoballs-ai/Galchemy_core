/* game.js (запускать в браузере) */
import { Game }  from '../../src/index.js';
import addOrbit  from './OrbitComponent.js';

/* ───────── helpers ───────── */

const rand   = (min,max) => Math.random()*(max-min)+min;
const randi  = (min,max) => Math.floor(rand(min,max+1));
const randHex = () =>
  '#'+[0,0,0].map(()=>randi(64,255).toString(16).padStart(2,'0')).join('');

/* ───────── init движка ───────── */

const game = Game.init({ canvasId:'canvas', w:1280, h:720, debug:true });

/* ───────── Солнце ───────── */

const sun = game.spawnSphere(2.5, 48, [0,0,0], '#ffaa00');

/* ───────── Планеты ───────── */

const nPlanets = randi(3, 4);         // 3‒8 планет
let usedRadii  = [];                  // чтобы не пересекались

for (let i=0;i<nPlanets;i++) {

  // радиус планеты и орбиты
  const pr  = rand(0.4, 1.2);         // размер сферы
  let  dist;
  do { dist = rand(4, 25);            // расстояние от Солнца
  } while (usedRadii.some(r => Math.abs(r-dist) < 2)); // зазор ≥2
  usedRadii.push(dist);

  const planet = game.spawnSphere(
    pr,
    randi(24, 40),                    // сегменты
    [dist, 0, 0],
    randHex()                         // случайный цвет
  );

  // орбита планеты
  addOrbit(planet, {
    center : sun.go,
    radius : dist,
    speed  : (2*Math.PI) / rand(150, 600) // «год» 150-600 дней
  });

  /* ───── луны (0-3 шт) ───── */
  const nMoons = randi(0, 3);
  for (let m=0; m<nMoons; m++) {
    const mr   = rand(0.1, 0.35);
    const md   = rand(pr+0.5, pr+3);      // чуть дальше радиуса планеты
    const moon = game.spawnSphere(
      mr, randi(16, 24), [0,0,0], randHex()
    );
    addOrbit(moon, {
      center : planet.go,
      radius : md,
      speed  : (2*Math.PI) / rand(10, 60) // период 10-60 «дней»
    });
  }
}

game.start();
