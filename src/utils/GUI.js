export class GUI {
    constructor({
      showScore  = true,
      showHealth = true,
      showEnergy = true
    } = {}) {
      /* включатели */
      this.showScore  = showScore;
      this.showHealth = showHealth;
      this.showEnergy = showEnergy;
  
      /* значения по умолчанию */
      this.score  = 0;
      this.health = 5;
      this.energy = 100;
    }
  
    /* ---------- простейшие методы для ребёнка ---------- */
    setScore(n)     { this.score  = n; }
    addScore(n=1)   { this.score += n; }
  
    setHealth(n)    { this.health = n; }
    takeDamage(n=1) { this.health = Math.max(0, this.health - n); }
  
    setEnergy(n)    { this.energy = n; }
    useEnergy(n=1)  { this.energy = Math.max(0, this.energy - n); }
    gainEnergy(n=1) { this.energy = Math.min(100, this.energy + n); }
  
    /* ---------- отрисовка поверх игры ---------- */
    render(ctx) {
      ctx.save();
      ctx.fillStyle = '#fff';
      ctx.font = '18px Arial';
  
      let y = 28;          // вертикальная позиция первой строки
      if (this.showScore)  { ctx.fillText(`Score:  ${this.score}`,  20, y); y += 24; }
      if (this.showHealth) { ctx.fillText(`Health: ${this.health}`, 20, y); y += 24; }
      if (this.showEnergy) { ctx.fillText(`Energy: ${this.energy}`, 20, y);           }
  
      ctx.restore();
    }
  }
  