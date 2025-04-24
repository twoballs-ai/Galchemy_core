import { TextTexture } from './TextTexture.js';
import HUDSprite       from './HUDSprite.js';

/**
 * GUI формирует **HUD-спрайты** и добавляет их в SpriteRenderer.
 *  – никакого ctx.save / fillText;
 *  – текст кэшируется на уровне текстур.
 */
export class GUI {
  constructor({
    showScore  = true,
    showHealth = true,
    showEnergy = true
  } = {}) {
    this.showScore  = showScore;
    this.showHealth = showHealth;
    this.showEnergy = showEnergy;

    this.score  = 0;
    this.health = 5;
    this.energy = 100;
  }

  /* ───── публичные сеттеры ───── */
  setScore(n)     { this.score  = n; }
  addScore(n=1)   { this.score += n; }

  setHealth(n)    { this.health = n; }
  takeDamage(n=1) { this.health = Math.max(0, this.health - n); }

  setEnergy(n)    { this.energy = n; }
  useEnergy (n=1) { this.energy = Math.max(0, this.energy - n); }
  gainEnergy(n=1) { this.energy = Math.min(100, this.energy + n); }

  /* ───── главное: подготовить спрайты и закинуть в SpriteRenderer ───── */
  /**
   * @param {WebGLRenderingContext} gl
   * @param {SpriteRenderer} spriteRenderer
   */
  render(gl, spriteRenderer) {
    const lineH   = 24;
    const padding = 20;
    let   y       = padding + 8;     // небольшое смещение вниз

    if (this.showScore) {
      const tex = TextTexture.create(gl, `Score:  ${this.score}`);
      spriteRenderer.add(new HUDSprite(tex, padding, y));
      y += lineH;
    }
    if (this.showHealth) {
      const tex = TextTexture.create(gl, `Health: ${this.health}`);
      spriteRenderer.add(new HUDSprite(tex, padding, y));
      y += lineH;
    }
    if (this.showEnergy) {
      const tex = TextTexture.create(gl, `Energy: ${this.energy}`);
      spriteRenderer.add(new HUDSprite(tex, padding, y));
    }
  }
}
