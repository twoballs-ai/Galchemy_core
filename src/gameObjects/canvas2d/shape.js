import { Sprite } from './shapes/Sprite.js';
import { SpriteGrid } from './shapes/SpriteGrid.js';
import { Character } from './characters/Character.js';
import { Enemy } from './characters/Enemy.js';
import { ColorMixin } from '../../core/core_logic/ColorMixin.js';

export function getShapes(renderType) {
  
  function applyColorMixin(params) {
    return {
      color: ColorMixin(params.color || 'black', renderType),
      borderColor: params.borderColor ? ColorMixin(params.borderColor, renderType) : null,
    };
  }

  return {

    sprite: function (params) {
      return new Sprite({
        image: params.image,
        id: params.id, 
        x: params.x,
        y: params.y,
        width: params.width,
        height: params.height,
        preserveAspectRatio: params.preserveAspectRatio || false,
        enablePhysics: params.enablePhysics || false,
        isStatic: params.isStatic || false,
        layer: params.layer || 0,
      });
    },

    spriteGrid: function (params) {
      return new SpriteGrid({
        image: params.image,
        id: params.id, 
        x: params.x,
        y: params.y,
        width: params.width,
        height: params.height,
        repeatX: params.repeatX || 1,
        repeatY: params.repeatY || 1,
        spacingX: params.spacingX || 0,
        spacingY: params.spacingY || 0,
        preserveAspectRatio: params.preserveAspectRatio || false,
        enablePhysics: params.enablePhysics || false,
        isStatic: params.isStatic || false,
        layer: params.layer || 0,
      });
    },

    character: function (params) {
      return new Character({
        x: params.x,
        y: params.y,
        id: params.id, 
        width: params.width || 50,
        height: params.height || 100,
        // color не передаём или передаём null
        color: null,
        isAnimated: params.isAnimated|| false,
        image: params.image || null,
        animations: params.animations || {},
        health: params.health || 100,
        speed: params.speed || 30,
        enablePhysics: params.enablePhysics || false,
        layer: params.layer || 1,
      });
   },
   

    enemy: function (params) {
      return new Enemy({
        id: params.id, 
        x: params.x,
        y: params.y,
        width: params.width || 50,
        height: params.height || 100,
        color: ColorMixin(params.color || 'red', renderType),
        image: params.image || null,
        isAnimated: params.isAnimated|| false,
        animations: params.animations || {},
        health: params.health || 50,
        speed: params.speed || 20,
        enablePhysics: params.enablePhysics || false,
        layer: params.layer || 1,
        leftBoundary: params.leftBoundary || 0,
        rightBoundary: params.rightBoundary || 800, // Примерный размер
      });
    },

  };
}
