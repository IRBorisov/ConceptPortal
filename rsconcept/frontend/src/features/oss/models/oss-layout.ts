/**
 * Module: OSS graphical representation.
 */
import { type Node } from 'reactflow';

import { type IBlock, type IOperation } from './oss';

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

/** Represents graph OSS node data. */
export interface OssNode extends Node {
  id: string;
  data: {
    label: string;
    operation?: IOperation;
    block?: IBlock;
  };
  position: { x: number; y: number };
}

/** Represents graph OSS node internal data for {@link IOperation}. */
export interface OperationInternalNode {
  id: string;
  data: {
    label: string;
    operation: IOperation;
  };
  selected: boolean;
  dragging: boolean;
  xPos: number;
  yPos: number;
}

/** Represents graph OSS node internal data for {@link IBlock}. */
export interface BlockInternalNode {
  id: string;
  data: {
    label: string;
    block: IBlock;
  };
  selected: boolean;
  dragging: boolean;
  xPos: number;
  yPos: number;
}
