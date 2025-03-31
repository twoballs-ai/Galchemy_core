// Core.js
import { ColorMixin } from "./ColorMixin.js";
import { GraphicalContext } from "./GraphicalContext.js";
import { GameTypeFactory } from "./GameTypeFactory.js";
import { Highlighter } from "./utils/Highlighter.js";
import { EventEmitter } from "./utils/EventEmitter.js"; // <-- Добавили
import { SceneManager } from "./SceneManager.js";

export class Core {
  constructor({
    canvasId,
    renderType = "2d",
    backgroundColor = "black",
    width = 900,
    height = 600,
  }) {
    this.renderType = renderType;
    const normalizedBackgroundColor = ColorMixin(backgroundColor, renderType);
    this.graphicalContext = new GraphicalContext(
      canvasId,
      renderType,
      normalizedBackgroundColor,
      width,
      height
    );
    this.renderer = this.graphicalContext.getRenderer();
    this.emitter = new EventEmitter(); // Создаём эмиттер сразу тут
    this.plugins = [];
    // 👇 Создаём SceneManager прямо здесь и передаём ему emitter
    this.sceneManager = new SceneManager(this.emitter);
    this.debugRender = true;
    this.currentMode = null; // Текущий режим
    this.lastTime = 0;

    // Поддержка пользовательского кода
    this.userLogic = null; // Функция, которая вызывается на каждом кадре

    // Привязка игрового цикла
    this.loop = this.loop.bind(this);
    this.animationFrameId = null;

    // Дополнительно (по вашему желанию)
    this.gameTypeInstance = null;
    this.selectedObject = null; // Текущий выделенный объект
  }

  // Переключение между режимами
  switchMode(ModeClass, ...args) {
    if (this.currentMode) {
      this.previousMode = this.currentMode;
      this.currentMode.stop();
    }
    this.currentMode = new ModeClass(this, ...args);
    this.currentMode.start();
    this.emitter.emit("modeChanged", { mode: ModeClass.name });
  }
  // 🔧 Регистрируем плагин
  registerPlugin(plugin) {
    if (plugin && typeof plugin.install === "function") {
      plugin.install(this); // передаём core внутрь плагина
      this.plugins.push(plugin);
    }
  }

  registerPlugin(plugin) {
    if (plugin && typeof plugin.install === "function") {
      plugin.install(this); // передаём core внутрь плагина
      this.plugins.push(plugin);
    }
  }

  setSelectedObject(object) {
    this.selectedObject = object;
    this.render();
    this.emitter.emit("objectSelected", { object }); // событие выбора объекта
  }
  // Установка типа игры через фабрику
  setGameType(gameType) {
    if (gameType) {
      console.log(`Setting game type: ${gameType}`);
      this.gameTypeInstance = new GameTypeFactory(this).loadGameType(gameType);
      if (!this.gameTypeInstance) {
        console.error(`Error: game type ${gameType} not loaded.`);
      }
    }
  }

  // Доступ к SceneManager
  getSceneManager() {
    return this.sceneManager;
  }

  // Запуск игрового цикла
  async start() {
    if (typeof this.renderer.init === "function") {
      await this.renderer.init();
    }

    if (
      this.gameTypeInstance &&
      typeof this.gameTypeInstance.start === "function"
    ) {
      this.gameTypeInstance.start();
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  }
  requestRender() {
    this.render();
  }
  // Главный цикл
  loop(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    if (this.currentMode) {
      // Обновление текущего режима
      this.currentMode.update(deltaTime);

      // Если задан пользовательский скрипт — вызываем
      if (this.userLogic) {
        try {
          const objects = this.sceneManager.getGameObjectsFromCurrentScene();
          this.userLogic(objects, this, deltaTime);
        } catch (err) {
          console.error("Ошибка в пользовательском коде:", err);
        }
      }

      // Рендер режима
      if (
        typeof this.currentMode.shouldRenderEachFrame === "function"
          ? this.currentMode.shouldRenderEachFrame()
          : true
      ) {
        this.currentMode.render();
      }
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      console.log("Game loop stopped.");
    }
  }

  // Изменение размеров канваса
  resize(width, height) {
    if (this.graphicalContext) {
      this.graphicalContext.resize(width, height);
      this.renderer.clear();
      this.sceneManager.render(this.renderer.context);
      this.emitter.emit("resize", { width, height });
    }
  }

  // Пример метода update (необязательно использовать)
  // Вызываем все плагины с render hook
  render() {
    this.renderer.clear();
    this.sceneManager.render(this.renderer.context);

    // 🔄 рендер плагинов
    this.plugins.forEach(plugin => {
      if (typeof plugin.render === 'function') {
        plugin.render(this.renderer.context, this.graphicalContext.canvas);
      }
    });

    if (this.selectedObject) {
      Highlighter.highlightObject(
        this.renderer.context,
        this.selectedObject,
        'purple',
        'rgba(200, 100, 255, 0.2)'
      );
    }

    console.log("dvdsvdv rendered.");
  }

  update(deltaTime) {
    this.sceneManager.update(deltaTime);

    // 🔄 update плагинов
    this.plugins.forEach(plugin => {
      if (typeof plugin.update === 'function') {
        plugin.update(deltaTime);
      }
    });

    this.render();
  }

}
