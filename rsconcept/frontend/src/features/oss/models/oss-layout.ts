/**
 * Module: OSS graphical representation.
 */

/** Represents XY Position. */
export interface Position2D {
  x: number;
  y: number;
}

/** Represents XY Position and dimensions. */
export interface Rectangle2D extends Position2D {
  width: number;
  height: number;
}
