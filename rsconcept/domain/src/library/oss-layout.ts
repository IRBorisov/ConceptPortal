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

/** Represents a node in {@link OssLayout}. */
export interface NodePosition {
  nodeID: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Represents {@link OperationSchema} layout. */
export type OssLayout = NodePosition[];
