import { RigidBody2d } from '../../core/physics/RigidBody2d.js';

export class Canvas2dGameObject {
  constructor({
    id,
    type,
    x,
    y,
    width = null,
    height = null,
    radius = null,
    color,
    enablePhysics = false,
    isStatic = false,
    layer = 0,
    image = '',
  }) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.radius = radius;

    if (this.radius !== null) {
      this.width = this.radius * 2;
      this.height = this.radius * 2;
    } else {
      this.width = width ?? 50; // Default value
      this.height = height ?? 50;
    }

    this.color = color;
    this.layer = layer;

    this.enablePhysics = enablePhysics;
    this.isStatic = isStatic;

    // Support for physics
    if (enablePhysics) {
      this.rigidBody = new RigidBody2d({ isStatic });
      this.rigidBody.x = this.x;
      this.rigidBody.y = this.y;
      this.rigidBody.width = this.width;
      this.rigidBody.height = this.height;
    } else {
      this.rigidBody = null;
    }

    this.image = image;
  }

  serialize() {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      radius: this.radius,
      color: this.color,
      enablePhysics: this.enablePhysics,
      isStatic: this.isStatic,
      layer: this.layer,
      image: this.image,
    };
  }

  static deserialize(data) {
    return new Canvas2dGameObject({
      id: data.id,
      type: data.type,
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
      radius: data.radius,
      color: data.color,
      enablePhysics: data.enablePhysics,
      isStatic: data.isStatic,
      layer: data.layer,
      image: data.image,
    });
  }

  containsPoint(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
  }

  getBoundingBox() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  // Method to update object's position
  update(deltaTime) {
    if (this.rigidBody) {
      this.x = this.rigidBody.x;
      this.y = this.rigidBody.y;
      this.width = this.rigidBody.width;
      this.height = this.rigidBody.height;
    } else {
      // Если нет физики, просто обновляем позицию
      this.x += (this.speedX || 0) * deltaTime / 1000; // Speed в пикселях в секунду
      this.y += (this.speedY || 0) * deltaTime / 1000;
    }
  }
  

  // Method to render the object (should be implemented in subclasses)
  render(context) {
    // This method should be implemented in specific primitives (e.g., square, circle)
  }
}
