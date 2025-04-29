// src/modes/EditorMode.js
import { BaseMode } from './BaseMode.js';
import { EditorCamera } from '../cameras/EditorCamera.js';
import { vec3, mat4 } from '../../vendor/gl-matrix/index.js';

export class EditorMode extends BaseMode {
  enter(core) {
    super.enter(core);
    this.core = core;
    core.setShowHelpers(true);
    core.setDebugLogging(true);

    // переключаем камеру на редакторскую
    const editorCamera = new EditorCamera(core.canvas.width, core.canvas.height);
    core.setActiveCamera(editorCamera);

    // включаем флаг editorMode на всех объектах
    core.scene.objects.forEach(o => { o.isEditorMode = true; });

    // состояние для drag’n’drop
    this.dragInfo = null;

    // навешиваем мышиную логику
    core.canvas.addEventListener('mousedown', this._onMouseDown);
    core.canvas.addEventListener('mousemove', this._onMouseMove);
    core.canvas.addEventListener('mouseup',   this._onMouseUp);
  }

  exit() {
    // отписываем события
    const c = this.core;
    c.canvas.removeEventListener('mousedown', this._onMouseDown);
    c.canvas.removeEventListener('mousemove', this._onMouseMove);
    c.canvas.removeEventListener('mouseup',   this._onMouseUp);
  }

  /** hit‐тест: из экранных координат возвращает { obj, pickPoint } или null */
  _pickObject(x, y) {
    // 1) перевести screen → NDC → луч в world-space: origin, direction
    const { gl, canvas } = this.core;
    const cam = this.core.camera;
    // ... тут ваш код инверсии проекции+вида ...
    // 2) для каждого object: тестируете пересечение с плоскостью Y=0
    //    или bounding‐box. Возвращаете первое попавшееся.
    // Для простоты пример со плоскостью Y=0:
    //    t = -origin.y / dir.y; hitPoint = origin + dir * t;
    //    проверяете, что (hitPoint.x, hitPoint.z) внутри bounds
    return null;  // заменить на реальную реализацию
  }

  _onMouseDown = (e) => {
    const rect = this.core.canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    const pick = this._pickObject(x, y);
    if (pick) {
      const { obj, pickPoint } = pick;
      // смещение между точкой клика и позицией объекта
      this.dragInfo = {
        obj,
        offset: [
          pickPoint[0] - obj.position[0],
          pickPoint[1] - obj.position[1],
          pickPoint[2] - obj.position[2]
        ]
      };
    }
  }

  _onMouseMove = (e) => {
    if (!this.dragInfo) return;
    const rect = this.core.canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    // получаем новую точку пересечения с плоскостью
    const pick = this._pickObject(x, y);
    if (!pick) return;

    const { obj, offset } = this.dragInfo;
    const newPos = [
      pick.pickPoint[0] - offset[0],
      pick.pickPoint[1] - offset[1],
      pick.pickPoint[2] - offset[2]
    ];

    // обновляем позицию в самом объекте
    obj.position = newPos;

    // эмитим событие в SceneManager → React/Redux
    this.core.emitter.emit('objectUpdated', {
      scene: this.core.scene.name,
      object: {
        id:       obj.id,
        position: obj.position.slice(),
        // при необходимости: color, scale, rotation…
      }
    });
  }

  _onMouseUp = () => {
    this.dragInfo = null;
  }

  update(dt) {
    // здесь можно добавить hover-визуализацию или рамки
  }
}
