// core/TransformGizmo.ts
export class TransformGizmo {
    mode: 'translate'|'rotate'|'scale' = 'translate';
    target: SceneObject | null = null;
    isActive = false;
  
    setMode(m: 'translate'|'rotate'|'scale') { this.mode = m; }
    setTarget(obj: SceneObject | null) { this.target = obj; }
  
    // Вызывается из рендера
    draw(renderer: WebGLRenderer) {
      if (!this.isActive || !this.target) return;
      // ... рисуем оси / кольца ...
    }
  
    // Вызывается из обработчиков мыши
    handlePointerEvent(type: 'down'|'move'|'up', e: MouseEvent) {
      if (!this.isActive || !this.target) return;
      // 1) raycast по гизмо-хватам
      // 2) при drag вычисляем delta и применяем к this.target.position/rotation/scale
    }
  }
  