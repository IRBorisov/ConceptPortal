/**
 * Module: OSS representation.
 */
import { Node } from 'reactflow';

import { IOperation } from './oss';

/**
 * Represents XY Position.
 */
export interface Position2D {
  x: number;
  y: number;
}

/**
 * Represents graph OSS node data.
 */
export interface OssNode extends Node {
  id: string;
  data: {
    label: string;
    operation: IOperation;
  };
  position: { x: number; y: number };
}

/**
 * Represents graph OSS node internal data.
 */
export interface OssNodeInternal {
  id: string;
  data: {
    label: string;
    operation: IOperation;
  };
  dragging: boolean;
  xPos: number;
  yPos: number;
}
