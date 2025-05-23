/* НИЧЕГО не импортируем!  */
/* ----------------------- */

export const HANDEDNESS   = "RH";   // "RH" | "LH"
export const UP_AXIS      = "Z";    // "Z"  | "Y"
export const CLIP_RANGE   = "MinusOneToOne"; // GL-style

/* векторные константы мира */
export const RIGHT   : [number,number,number] = [ 1, 0, 0 ];      // +X
export const FORWARD : [number,number,number] =
  UP_AXIS === "Z" ? [ 0, 1, 0 ] : [ 0, 0, 1 ];                    // +Y  или +Z
export const UP      : [number,number,number] =
  UP_AXIS === "Z" ? [ 0, 0, 1 ] : [ 0, 1, 0 ];                    // +Z  или +Y

/* цвета для гизмо/осей */
export const AXIS_X_COLOR = [1,0,0,1];
export const AXIS_Y_COLOR = [0,1,0,1];
export const AXIS_Z_COLOR = [0,0,1,1];
export const SELECTION_COLOR = [1,1,0,1];
