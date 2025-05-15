// src/GameFacade.js
import { Core }           from './Core.ts';
import { GameObject2D }   from '../GameObjects/primitives/GameObject2D.js';
import { primitiveFactory } from '../GameObjects/PrimitiveFactory.js';   // ← фабрика

import Entity             from '../GameObjects/EntityWrapper.js';
import { getSize }        from '../utils/getSize.js';

import { loadGLB }        from '../utils/GLTFLoader.js';

import { EditorMode }     from './modes/EditorMode.ts';
import { PreviewMode }    from './modes/PreviewMode.js';
import { patchObject, updateGeometry } from './helpers/objectUpdater.js';

export { GameObject3D }   from '../GameObjects/primitives/GameObject3D.js';
export { primitiveFactory } from '../GameObjects/PrimitiveFactory.js';   // ре-экспорт

class GameFacade {
  constructor() {
    this.core  = null;



  }

  /* -------- init / режимы ------------------------------------ */

  init({ canvasId, w, h, bg = '#000' }) {
    this.core = new Core({
      canvasId,
      width : w,
      height: h,
      backgroundColor: bg,
    });

    this.core.game  = this;            // ссылка «обратно»
    return this;
  }

  setEditorMode()  { this.core.setMode(new EditorMode());  return this; }
  setPreviewMode() { this.core.setMode(new PreviewMode()); return this; }
  setDebug(on=true){ this.core.setDebug(on);               return this; }
  physics({ gravity = 0 } = {}) {
    this.core.enablePhysics({ gravity });
    return this;
  }
  patchObject(id: string, props: any) {
    patchObject(this.core, id, props);
  }

  /** Обновление геометрии + патч остальных свойств */
  updateObject(id: string, type: string, props: any) {
    updateGeometry(this.core, id, type, props);
  }
  /* -------- 2-D спрайт -------------------------------------- */

  // spawn(img, x, y, opts = {}) {
  //   const { layer = 0 } = opts;
  //   const [w, h]        = getSize(opts);
  //   const go = new GameObject2D(this.core.ctx, {
  //     imageSrc : opts.image || img,
  //     x, y, width: w, height: h, layer,
  //     physics  : false,
  //     collision: true,
  //     speed    : opts.speed ?? 200,
  //   });
  //   this.core.add(go);
  //   return new Entity(go, this.core );
  // }

  /* -------- универсальный 3-D примитив ----------------------- */

  // spawnPrimitive(type, opts = {}) {
  //   const gl = this.core.ctx;
  //   const go = primitiveFactory.create(type, gl, opts);
  //   this.core.add(go);
  //   return new Entity(go, this.core);
  // }
  spawnCamera(opts = {}) {
    const gl = this.core.ctx;
    const camObj = primitiveFactory.create('camera', gl, opts);
    this.core.add(camObj);
    return camObj;
  }
  spawnLight(opts = {}) {
       const { subtype = 'point', ...rest } = opts;
   const lightObj = { type: 'light', subtype, ...rest };
    this.core.add(lightObj);
    return lightObj;
  }
  
  spawnTerrain(opts = {}) {
    const terrainObj = { type: 'terrain', ...opts };
    this.core.add(terrainObj);
    return terrainObj;
  }
  /* «сахар»-методы ------------------------------------------- */

  spawnSphere   (r=2, seg=24, pos=[0,0,-5], color='#fff')      {
    return this.spawnPrimitive('sphere',   { radius:r, segments:seg, position:pos, color });
  }
  spawnCube     (size=1,       pos=[0,0,-5], color='#e74c3c')  {
    return this.spawnPrimitive('cube',     { size, position:pos, color });
  }
  spawnCylinder (r=1, h=2,     pos=[0,0,-5], color='#2ecc71')  {
    return this.spawnPrimitive('cylinder', { radius:r, height:h, position:pos, color });
  }

  /* -------- загрузка glTF ----------------------------------- */

  async spawn3DModel(path, position=[0,0,0]) {
    const { json, binary } = await loadGLB(path);
    const mesh = extractFirstMesh(json, binary, this.core.ctx);
    const go   = new GameObject3D({ mesh, position });
    this.core.add(go);
    return go;
  }

  /* -------- управление циклом -------------------------------- */

  start() { this.core.start(); }
  stop()  { this.core.stop(); return this; }
}

/* ---------- singleton (GameAlchemy) ------------------------- */
const GameAlchemy = new GameFacade();
/* прикрепляем фабрику, чтобы GUI мог обращаться через GameAlchemy */
GameAlchemy.primitiveFactory = primitiveFactory;

/* экспортируем единственную точку входа пакета */
export default GameAlchemy;
