// src/controls/EditorControls.js
export class EditorControls {
    constructor(core) {
      this.core = core;
      this.dragInfo = null;    // состояние перетаскивания объектов
      this.panInfo  = null;    // состояние панорамирования камеры
  
      this._attachListeners();
    }
  
    _attachListeners() {
      const canvas = this.core.canvas;
  
      canvas.addEventListener('mousedown', this._onMouseDown);
      window.addEventListener('mousemove', this._onMouseMove);
      window.addEventListener('mouseup',   this._onMouseUp);
      canvas.addEventListener('wheel',     this._onWheel);
      window.addEventListener('keydown',   this._onKeyDown);
    }
  
    dispose() {
      const canvas = this.core.canvas;
  
      canvas.removeEventListener('mousedown', this._onMouseDown);
      window.removeEventListener('mousemove', this._onMouseMove);
      window.removeEventListener('mouseup',   this._onMouseUp);
      canvas.removeEventListener('wheel',     this._onWheel);
      window.removeEventListener('keydown',   this._onKeyDown);
    }
  
    /* -------------- обработчики событий -------------- */
  
    _onMouseDown = (e) => {
      const { shiftKey, button } = e;
  
      if (button === 0 && !shiftKey) { // ЛКМ без шифта — перетаскивание объекта
        const pick = this._pickObject(e);
        if (pick) {
          const { obj, pickPoint } = pick;
          this.dragInfo = {
            obj,
            offset: [
              pickPoint[0] - obj.position[0],
              pickPoint[1] - obj.position[1],
              pickPoint[2] - obj.position[2]
            ]
          };
        }
      } else if (button === 0 && shiftKey) { // ЛКМ + Shift — панорамирование сцены
        this.panInfo = { x: e.clientX, y: e.clientY };
      }
    };
  
    _onMouseMove = (e) => {
      const { dragInfo, panInfo } = this;
      if (dragInfo) {
        const pick = this._pickObject(e);
        if (pick) {
          const { obj, offset } = dragInfo;
          const newPos = [
            pick.pickPoint[0] - offset[0],
            pick.pickPoint[1] - offset[1],
            pick.pickPoint[2] - offset[2]
          ];
          obj.position = newPos;
          this.core.emitter.emit('objectUpdated', {
            scene: this.core.scene.name,
            object: { id: obj.id, position: obj.position.slice() }
          });
        }
      }
      if (panInfo) {
        const dx = e.clientX - panInfo.x;
        const dy = e.clientY - panInfo.y;
        this.core.renderer.camTarget[0] -= dx * 0.01;
        this.core.renderer.camTarget[2] += dy * 0.01;
        this.panInfo = { x: e.clientX, y: e.clientY };
      }
    };
  
    _onMouseUp = () => {
      this.dragInfo = null;
      this.panInfo  = null;
    };
  
    _onWheel = (e) => {
      const delta = Math.sign(e.deltaY);
      this.core.renderer.camDist *= delta > 0 ? 1.1 : 0.9;
      this.core.renderer.camDist = Math.min(Math.max(this.core.renderer.camDist, 1), 50);
    };
  
    _onKeyDown = (e) => {
      const speed = 0.1 * this.core.renderer.camDist;
      const k = e.key.toLowerCase();
      if (k === 'w') this.core.renderer.camTarget[2] -= speed;
      if (k === 's') this.core.renderer.camTarget[2] += speed;
      if (k === 'a') this.core.renderer.camTarget[0] -= speed;
      if (k === 'd') this.core.renderer.camTarget[0] += speed;
    };
  
    /* -------------- помощь: выбор объекта под курсором -------------- */
    _pickObject(e) {
      const rect = this.core.canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  
      const cam = this.core.camera;
      // Здесь нужно правильно рассчитать луч и пересечение с объектами (будет твой метод).
  
      return null;  // тут будет реальный hit-test
    }
  }
  