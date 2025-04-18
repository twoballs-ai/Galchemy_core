// src/core/GameObjects/Projectile.js
import { GameObject } from '../GameObject.js';
import { Mob } from '../Character/Mob.js';

export class Projectile extends GameObject {
  constructor({
    imageSrc,
    x, y,
    width = 16,
    height = 16,
    speed = 500,
    direction = { x: 0, y: -1 }, // по умолчанию вверх
    layer = 2
  }) {
    super({ imageSrc, x, y, width, height, collision: true, layer });

    this.speed = speed;
    this.direction = direction;
    this.toDelete = false;
  }

  update(dt) {
    this.x += this.direction.x * this.speed * dt;
    this.y += this.direction.y * this.speed * dt;
  }

  onCollision(other) {
    if (other instanceof Mob) {
      this.toDelete = true;
      other.toDelete = true; // или вызвать other.takeDamage(), если нужно
    }
  }
}
