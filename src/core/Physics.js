// src/core/Physics.js
export class Physics {
  constructor(gravity = 0) {
    this.gravity   = gravity;
    this.bodies    = []; // { body, owner }
    this.colliders = []; // GameObject с collision = true
  }

  addGameObject(go) {
    if (go.physicsBody) this.bodies.push({ body: go.physicsBody, owner: go });
    if (go.collision)   this.colliders.push(go);
  }

  update(dt) {
    /* 1. двигаем все тела с physics */
    for (const { body } of this.bodies) {
      body.velocity.y += this.gravity * dt * 100;
      body.x += body.velocity.x * dt;
      body.y += body.velocity.y * dt;
    }

    /* 2. проверяем столкновения AABB только для colliders */
    const colliders = this.colliders.filter(o => !o.toDelete && !o.dead);

    for (let i = 0; i < colliders.length; i++) {
      for (let j = i + 1; j < colliders.length; j++) {
        const A = colliders[i];
        const B = colliders[j];

        if (
          A.x < B.x + B.width  && A.x + A.width  > B.x &&
          A.y < B.y + B.height && A.y + A.height > B.y
        ) {
          A.onCollision?.(B);
          B.onCollision?.(A);
        }
      }
    }
  }
}
