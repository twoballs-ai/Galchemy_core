// core/gameObjects/Character.js

import { RigidBody2d } from '../../../core/physics/RigidBody2d.js';

export class Character {
  constructor({
    x,
    y,
    width,
    height,
    color = 'transparent', 
    image,
    animations = {},
    health = 100,
    speed = 30,
    enablePhysics = false,
    layer = 1,
    preserveAspectRatio = false,
    isAnimated = false, 
  }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.health = health;
    this.speed = speed;
    this.layer = layer;
    this.preserveAspectRatio = preserveAspectRatio;
    this.isAnimated = isAnimated;

    this.currentFrameIndex = 0;
    this.frameDuration = 100;
    this.elapsedTime = 0;
    this.facingDirection = 1;

    if (!this.isAnimated) {
      this.image = null;
      if (image) {
        if (typeof image === 'string') {
          this.image = new Image();
          this.image.src = image;
        } else if (image instanceof HTMLImageElement) {
          this.image = image;
        }
      }
    }

    this.animations = {
      idle: this.isAnimated ? (animations.idle || []) : [],
      run: this.isAnimated ? (animations.run || []) : [],
      jump: this.isAnimated ? (animations.jump || []) : [],
      attack: this.isAnimated ? (animations.attack || []) : [],
    };

    if (this.isAnimated) {
      for (const key in this.animations) {
        this.animations[key] = this.animations[key].map((src) => {
          const img = new Image();
          img.src = src;
          return img;
        });
      }
      if (this.animations.idle.length === 0) {
        console.warn('Character must have an idle animation when isAnimated is true.');
      }
    } else {
      if (!this.image) {
        console.warn('Character must have an image when isAnimated is false.');
      }
    }

    this.currentAnimation = this.isAnimated ? 'idle' : null;

    if (enablePhysics) {
      this.rigidBody = new RigidBody2d({
        mass: 1,
        friction: 0.9,
        isStatic: false,
      });
      this.rigidBody.x = this.x;
      this.rigidBody.y = this.y;
      this.rigidBody.width = this.width;
      this.rigidBody.height = this.height;
    } else {
      this.rigidBody = null;
    }
  }

  setAnimation(animationName) {
    if (
      this.isAnimated &&
      this.animations[animationName] &&
      this.animations[animationName].length > 0
    ) {
      if (this.currentAnimation !== animationName) {
        this.currentAnimation = animationName;
        this.currentFrameIndex = 0;
        this.elapsedTime = 0;
      }
    }
  }

  update(deltaTime) {
    if (this.rigidBody) {
      this.x = this.rigidBody.x;
      this.y = this.rigidBody.y;

      if (this.rigidBody.velocityX > 0) {
        this.facingDirection = 1;
      } else if (this.rigidBody.velocityX < 0) {
        this.facingDirection = -1;
      }

      if (!this.rigidBody.onGround) {
        this.setAnimation('jump');
      } else if (this.rigidBody.velocityX !== 0) {
        this.setAnimation('run');
      } else {
        this.setAnimation('idle');
      }
    }

    if (this.isAnimated && this.currentAnimation) {
      const activeFrames = this.animations[this.currentAnimation] || [];
      if (activeFrames.length > 0) {
        this.elapsedTime += deltaTime;
        if (this.elapsedTime >= this.frameDuration) {
          this.elapsedTime = 0;
          this.currentFrameIndex = (this.currentFrameIndex + 1) % activeFrames.length;
        }
      }
    }
  }

  containsPoint(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }

  getBoundingBox() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  render(context) {
    context.save();

    if (this.facingDirection === -1) {
      context.translate(this.x + this.width / 2, this.y);
      context.scale(-1, 1);
      context.translate(-this.width / 2, 0);
    } else {
      context.translate(this.x, this.y);
    }

    if (!this.isAnimated && this.image && this.image.complete) {
      let renderWidth = this.width;
      let renderHeight = this.height;

      if (this.preserveAspectRatio) {
        const aspectRatio = this.image.width / this.image.height;
        if (this.width / this.height > aspectRatio) {
          renderWidth = this.height * aspectRatio;
        } else {
          renderHeight = this.width / aspectRatio;
        }
      }
      context.drawImage(this.image, 0, 0, renderWidth, renderHeight);
    } else if (this.isAnimated) {
      const activeFrames = this.currentAnimation ? this.animations[this.currentAnimation] : [];
      if (activeFrames.length > 0 && activeFrames[this.currentFrameIndex].complete) {
        context.drawImage(activeFrames[this.currentFrameIndex], 0, 0, this.width, this.height);
      } else {
        console.warn('Character has no animation available for rendering.');
      }
    } else {
      console.warn('Character has no image or animation available for rendering.');
    }

    context.restore();
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    console.log('Character died');
  }
}
