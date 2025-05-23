// src/index.js

// Импортируем внутренности
import { Core } from './core/core_logic/Core.js';
import { SceneManager } from './core/core_logic/SceneManager.js';
import { createAPI } from './core/integration/apiFactory.js';
import { runUserCode } from './core/integration/userCodeRunner.js';
import { EditorMode } from './core/core_logic/RenderMode/mode/EditorMode.js';
import { PreviewMode } from './core/core_logic/RenderMode/mode/PreviewMode.js';
import { getShape2d } from './gameObjects/shape2d.js'; // или как у вас устроен shape2d

// Собираем всё, что хотим отдать наружу
export default {
    Core,
    SceneManager,
    createAPI,
    runUserCode,
    EditorMode,
    PreviewMode,
    getShape2d,
  };