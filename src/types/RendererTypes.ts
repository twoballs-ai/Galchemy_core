export interface DragState {
    mode: 'orbit' | 'pan';
    x: number;
    y: number;
  }
  
  export interface CameraInterface {
    fov: number;
    near: number;
    far: number;
    width: number;
    height: number;
    isCamera: boolean;
    position: [number, number, number];
    lookAt: [number, number, number];
    up: [number, number, number];
    update(): void;
    getProjection(): Float32Array;
    getView(): Float32Array;
  }
  