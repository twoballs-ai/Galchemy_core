// PreviewMode.js
import { BaseMode } from '../BaseMode.js';
import { createAPI } from '../../../integration/apiFactory.js';
import { runUserCode } from '../../../integration/userCodeRunner.js';
import { EditorMode } from './EditorMode.js'; // Импортируйте, если нужен для проверки instanceof

export class PreviewMode extends BaseMode {
  constructor(core, levelName, userCode) {
    super(core);
    this.levelName = levelName;
    this.userCode = userCode;  // <-- Принимаем сюда строку кода
  }

  async start() {
    super.start();

    // Очищаем и переключаемся на нужную сцену
    // this.sceneManager.clearScene(this.levelName);
    this.sceneManager.changeScene(this.levelName);

    // Если есть пользовательский код, запускаем
    if (this.userCode) {
      const api = createAPI({ core: this.core });
      await runUserCode(this.userCode, api, this.core.emitter);
    }

    this.preparePreview();
    console.log("запущен превью");
  }

  preparePreview() {
    const objects = this.sceneManager.getGameObjectsFromCurrentScene();
    objects.forEach((object) => {
      if (typeof object.prepareForPreview === 'function') {
        object.prepareForPreview();
      }
    });
  }


  update(deltaTime) {
    this.core.sceneManager.update(deltaTime);
    // Если есть глобальная логика
    if (this.core.logicSystem) {
      this.core.logicSystem.update(deltaTime);
    }
  }

  render() {
    console.log("2222222222222222222222222222222222");
    this.core.renderer.clear();
    this.sceneManager.render(this.core.renderer.context);

    // Отрисовка индикатора предпросмотра
    const ctx = this.core.renderer.context;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.font = '20px Arial';
    ctx.fillText(`Preview Mode: ${this.levelName}`, 10, 30);
    ctx.restore();
  }

  stop() {
    super.stop();
    console.log(`Stopped previewing level: ${this.levelName}`);

    // Пример возврата к EditorMode
    if (this.core.previousMode instanceof EditorMode) {
      this.sceneManager.changeScene(this.core.previousMode.levelName);
    }
  }
}
