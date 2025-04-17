// src/core/GameObjects/Character/Player.js
import { GameObject } from '../GameObject.js';
import { Mob }        from './Mob.js';

export class Player extends GameObject {
  constructor({
    imageSrc,
    x, y,
    width, height,
    speed   = 300,
    health  = 3,
    physics   = true,   // включаем по умолчанию
    collision = true,
    layer     = 1
  }) {
    super({ imageSrc, x, y, width, height, physics, collision, layer });
    this.speed  = speed;
    this.health = health;
    this.dead   = false;
  }

  onCollision(other) {
    console.log("столкновение")
    if (other instanceof Mob) this.takeDamage(1);
  }

  takeDamage(amount = 1) {
    this.health -= amount;
    console.log(`❤️  Игрок: осталось жизней ${this.health}`);
    if (this.health <= 0) this.dead = true;
  }
}
