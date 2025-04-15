export class Physics {
    constructor(gravity) {
      this.gravity = gravity;
      this.bodies = [];
    }
  
    addBody(body) {
      this.bodies.push(body);
    }
  
    update(deltaTime) {
      this.bodies.forEach(body => {
        if (!body.isStatic) {
          body.velocity.y += this.gravity * deltaTime * 100;
          body.x += body.velocity.x * deltaTime;
          body.y += body.velocity.y * deltaTime;
        }
      });
    }
  }
  