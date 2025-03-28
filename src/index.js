// src/index.js

// Импортируем внутренности
import Core from './core/Core.js';
import SceneManager from './core/SceneManager.js';
import { spriteApi, createAPI } from './core/integration/apiFactory.js';
import { runUserCode } from './core/integration/userCodeRunner.js';
import BaseMode from './modes/BaseMode.js';
import EditorMode from './modes/EditorMode.js';
import PreviewMode from './modes/PreviewMode.js';
import getShape2d from './shape2d/index.js'; // или как у вас устроен shape2d

// Собираем всё, что хотим отдать наружу
export default {
    Core,
    SceneManager,
    spriteApi,
    createAPI,
    runUserCode,
    BaseMode,
    EditorMode,
    PreviewMode,
    getShape2d,
  };