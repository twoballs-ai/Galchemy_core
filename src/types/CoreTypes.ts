import { SceneManager } from '../core/SceneManager';
import { EventEmitter } from '../utils/EventEmitter';
import { Physics } from '../core/Physics';
import { GraphicalContext } from '../core/GraphicalContext';

/* ---------- тип входных параметров конструктора Core ---------- */
export interface CoreOptions {
  canvasId: string;
  width: number;
  height: number;
  backgroundColor?: string;
}

/* ---------- базовые типы для Core ---------- */
export interface IMode {
  enter(core: Core): void;
  exit?(): void;
  update?(dt: number): void;
}

export interface ICamera {
  update(): void;
  resize?(w: number, h: number): void;
}

export interface IGameObject {
  update(dt: number): void;
}
