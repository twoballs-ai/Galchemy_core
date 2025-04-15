import { BaseMode } from '../BaseMode.js';
import { Highlighter } from '../../../core_logic/utils/Highlighter.js';
import { GridPlugin } from '../../../../plugins/GridPlugin.js';

export class EditorMode extends BaseMode {
  constructor(core, onSelect) {
    super(core);
    this.selectedObject = null;
    this.onSelect = onSelect; // callback в React
    // Создаем и регистрируем плагин сетки только для редактора
    this.gridPlugin = GridPlugin({ cellSize: 50 });
    this.core.registerPlugin(this.gridPlugin);
  }

  start() {
    super.start();
    this.setupEventListeners();
  }

  stop() {
    this.removeEventListeners();
    // Удаляем плагин сетки, чтобы при переходе в превью он исчезал
    this.core.plugins = this.core.plugins.filter(p => p !== this.gridPlugin);
    super.stop();
  }

  setupEventListeners() {
    const canvas = this.core.graphicalContext.canvas;
    this.onClick = (event) => {
      const { offsetX, offsetY } = event;
      this.selectObjectAt(offsetX, offsetY);
    };
    canvas.addEventListener('click', this.onClick);
  }

  removeEventListeners() {
    const canvas = this.core.graphicalContext.canvas;
    canvas.removeEventListener('click', this.onClick);
  }

  selectObjectAt(x, y) {
    const objects = this.sceneManager.getGameObjectsFromCurrentScene();
    // Приводим коллекцию к массиву, если это Map
    const objectsArray = Array.isArray(objects) ? objects : Array.from(objects.values());
    this.selectedObject = objectsArray.find(obj => obj.containsPoint && obj.containsPoint(x, y));
    if (this.onSelect) {
      this.onSelect(this.selectedObject ? this.selectedObject.id : null);
    }
  }
  shouldRenderEachFrame() {
    return false; // Рендерим по необходимости
  }

  render() {
    console.log("EditorMode rendered.");
    super.render();
    if (this.selectedObject) {
      Highlighter.highlightObject(this.core.renderer.context, this.selectedObject, 'blue');
    }
  }
}
