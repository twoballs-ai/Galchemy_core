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
  this.sceneManager.changeScene(this.levelName);

  this.handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      console.log("ESC pressed. Emitting pointerLockExit.");
      this.core.emitter.emit('pointerLockExit');
    }
  };
  window.addEventListener('keydown', this.handleKeyDown);

  if (this.userCode) {
    this.api = createAPI({ core: this.core });
    await runUserCode(this.userCode, this.api, this.core.emitter);
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

  shouldRenderEachFrame() {
    return true;
  }
  update(deltaTime) {
    this.core.sceneManager.update(deltaTime);
    if (this.core.logicSystem) {
      this.core.logicSystem.update(deltaTime);
    }
  
    // 👇 Здесь вызываем update API (например, для управления)
    if (this.api?.character) {
      this.api.character.update();
    }
  }

  render() {
    // console.log("Preview render called!") // или debugger;

    this.core.renderer.clear();
    this.sceneManager.render(this.core.renderer.context);

    const ctx = this.core.renderer.context;
  
    // Заливаем весь канвас черным фоном
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  
    // Отрисовываем объекты сцены (спрайты, игровые объекты)
    this.sceneManager.render(ctx);
  
    // Отрисовка индикатора предпросмотра
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // Белый текст для контраста
    ctx.font = '20px Arial';
    ctx.fillText(`Preview Mode: ${this.levelName}`, 10, 30);
    ctx.restore();
  }

  stop() {
    super.stop();
    window.removeEventListener('keydown', this.handleKeyDown);
    console.log(`Stopped previewing level: ${this.levelName}`);
  }
}
