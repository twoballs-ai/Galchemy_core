// src/core/GameObjects/Character/Player.js
import { GameObject } from '../GameObject.js';
import { Mob }        from './Mob.js';
import { Projectile } from '../Character/Projectile.js';

export class Player extends GameObject {
  constructor({
    imageSrc,
    x, y,
    width, height,
    speed     = 300,
    health    = 3,
    physics   = true,
    collision = true,
    layer     = 1,

    /* — конфигурация снаряда по умолчанию (пользователь может менять) — */
    projectile = {
      imageSrc : null,          // ПУСТО! пользователь обязан указать
      width    : 8,
      height   : 16,
      speed    : 600,
      direction: { x: 0, y: -1 }
    }
  }) {
    super({ imageSrc, x, y, width, height, physics, collision, layer });

    this.speed  = speed;
    this.health = health;
    this.dead   = false;

    this.lastShotTime  = 0;
    this.shotDelay     = 0.25;     // сек между выстрелами
    this.projectileCfg = projectile;
  }

  /* --- пользователь может изменить снаряд в любой момент --- */
  setProjectile(cfg = {}) {
    this.projectileCfg = { ...this.projectileCfg, ...cfg };
  }

  shoot(game, overrideCfg = {}) {
    const now = performance.now() / 1000;
    if (now - this.lastShotTime < this.shotDelay) return;
    this.lastShotTime = now;

    const cfg = { ...this.projectileCfg, ...overrideCfg };

    /* защита: картинка должна быть указана пользователем */
    if (!cfg.imageSrc) {
      console.warn('⚠️  Projectile imageSrc не задан.');
      return;
    }

    const bullet = new Projectile({
      imageSrc : cfg.imageSrc,
      x        : this.x + this.width / 2 - cfg.width / 2,
      y        : this.y - cfg.height,
      width    : cfg.width,
      height   : cfg.height,
      speed    : cfg.speed,
      direction: cfg.direction,
      layer    : 2
    });

    game.add(bullet);
  }

  onCollision(other) { if (other instanceof Mob) this.takeDamage(1); }

  takeDamage(n = 1) {
    this.health -= n;
    if (this.health <= 0) this.dead = true;
  }
}
