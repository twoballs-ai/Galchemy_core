# Galchemy Core

**Galchemy Core** — ядро движка для 3D‑сцен в браузере (WebGL2) с режимами редактора и предпросмотра.

> Текущий фокус проекта: **3D‑workflow** (сцена, камеры, примитивы, модели, свет, skybox, gizmo).
> Поддержка 2D‑спрайтов сохраняется как дополнительный слой для UI/эффектов и гибридных сцен.

## Что уже есть

- 3D‑ядро: `Core`, `Scene`, `SceneManager`, игровой цикл.
- Рендеринг WebGL2: шейдеры, shadow map, skybox, editor helpers.
- Фабрика объектов: сфера, куб, цилиндр, terrain, camera, light, character, model.
- Режимы:
  - `EditorMode` — helpers и управление объектами.
  - `PreviewMode` — запуск сцены без редакторских оверлеев.
- Импорт 3D‑моделей (GLB/glTF).
- Базовый 2D sprite‑pass (дополнительная поддержка).

## Установка

```bash
npm install game-alchemy-core
```

## Быстрый старт

```ts
import { GameAlchemy } from 'game-alchemy-core';

GameAlchemy
  .init({
    canvasId: 'app',
    w: 1280,
    h: 720,
    bg: '#101014',
  })
  .setEditorMode();

GameAlchemy.spawnCube(1.5, [0, 0, -6], '#e74c3c');
GameAlchemy.spawnSphere(1.0, 24, [2, 0, -8], '#4da3ff');

GameAlchemy.start();
```

## Скрипты

```bash
npm run build
```

Сборка выполняется через TypeScript (`tsc`) и складывается в `dist/`.

## Репозитории

- Core: https://github.com/twoballs-ai/Galchemy_core
- GUI: https://github.com/twoballs-ai/Galchemy_gui

## Лицензия

MIT
