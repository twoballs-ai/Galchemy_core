import type { GameObject3D } from "../GameObjects/primitives/GameObject3D";

export interface DragInfo {
  obj: GameObject3D;
  offset: [number, number, number];
}

export interface PanInfo {
  x: number;
  y: number;
}

export interface PickResult {
  obj: GameObject3D;
  pickPoint: [number, number, number];
}

export type DragState = {
    mode: "orbit" | "pan";
    x: number;
    y: number;
  };