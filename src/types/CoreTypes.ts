// types/CoreTypes.ts
export interface IGameObject {
  id: string;
  type: string;
  position?: number[];
  update?(dt: number): void;
  isCamera?: boolean;
  [key: string]: any;
}

export interface ICamera extends IGameObject {
  update(): void;
  resize?(w: number, h: number): void;
}

export interface IScene {
  name: string;
  objects: IGameObject[];
  activeCamera: ICamera | null;
  selectedObject: IGameObject | null;

  add(obj: IGameObject): void;
  remove(obj: IGameObject): void;
  clear(): void;
  update(dt: number): void;
  setSelectedById(id: string | null): void;
}
