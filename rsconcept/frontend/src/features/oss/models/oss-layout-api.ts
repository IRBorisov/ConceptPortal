import { type ICreateBlockDTO, type ICreateOperationDTO, type IOssLayout } from '../backend/types';

import { type IOperationSchema } from './oss';
import { type Position2D, type Rectangle2D } from './oss-layout';

export const GRID_SIZE = 10; // pixels - size of OSS grid
const MIN_DISTANCE = 2 * GRID_SIZE; // pixels - minimum distance between nodes
const DISTANCE_X = 180; // pixels - insert x-distance between node centers
const DISTANCE_Y = 100; // pixels - insert y-distance between node centers

const OPERATION_NODE_WIDTH = 150;
const OPERATION_NODE_HEIGHT = 40;

/** Layout manipulations for {@link IOperationSchema}. */
export class LayoutManager {
  public oss: IOperationSchema;
  public layout: IOssLayout;

  constructor(oss: IOperationSchema, layout?: IOssLayout) {
    this.oss = oss;
    if (layout) {
      this.layout = layout;
    } else {
      this.layout = this.oss.layout;
    }
  }

  /** Calculate insert position for a new {@link IOperation} */
  calculateNewOperationPosition(data: ICreateOperationDTO): Position2D {
    // TODO: check parent node

    const result = { x: data.position_x, y: data.position_y };
    const operations = this.layout.operations;
    if (operations.length === 0) {
      return result;
    }

    if (data.arguments.length === 0) {
      let inputsPositions = operations.filter(pos =>
        this.oss.operations.find(operation => operation.arguments.length === 0 && operation.id === pos.id)
      );
      if (inputsPositions.length === 0) {
        inputsPositions = operations;
      }
      const maxX = Math.max(...inputsPositions.map(node => node.x));
      const minY = Math.min(...inputsPositions.map(node => node.y));
      result.x = maxX + DISTANCE_X;
      result.y = minY;
    } else {
      const argNodes = operations.filter(pos => data.arguments.includes(pos.id));
      const maxY = Math.max(...argNodes.map(node => node.y));
      const minX = Math.min(...argNodes.map(node => node.x));
      const maxX = Math.max(...argNodes.map(node => node.x));
      result.x = Math.ceil((maxX + minX) / 2 / GRID_SIZE) * GRID_SIZE;
      result.y = maxY + DISTANCE_Y;
    }

    let flagIntersect = false;
    do {
      flagIntersect = operations.some(
        position => Math.abs(position.x - result.x) < MIN_DISTANCE && Math.abs(position.y - result.y) < MIN_DISTANCE
      );
      if (flagIntersect) {
        result.x += MIN_DISTANCE;
        result.y += MIN_DISTANCE;
      }
    } while (flagIntersect);
    return result;
  }

  /** Calculate insert position for a new {@link IBlock} */
  calculateNewBlockPosition(data: ICreateBlockDTO): Rectangle2D {
    const block_nodes = data.children_blocks
      .map(id => this.layout.blocks.find(block => block.id === id))
      .filter(node => !!node);
    const operation_nodes = data.children_operations
      .map(id => this.layout.operations.find(operation => operation.id === id))
      .filter(node => !!node);

    if (block_nodes.length === 0 && operation_nodes.length === 0) {
      return { x: data.position_x, y: data.position_y, width: data.width, height: data.height };
    }

    let left = undefined;
    let top = undefined;
    let right = undefined;
    let bottom = undefined;

    for (const block of block_nodes) {
      left = !left ? block.x - MIN_DISTANCE : Math.min(left, block.x - MIN_DISTANCE);
      top = !top ? block.y - MIN_DISTANCE : Math.min(top, block.y - MIN_DISTANCE);
      right = !right
        ? Math.max(left + data.width, block.x + block.width + MIN_DISTANCE)
        : Math.max(right, block.x + block.width + MIN_DISTANCE);
      bottom = !bottom
        ? Math.max(top + data.height, block.y + block.height + MIN_DISTANCE)
        : Math.max(bottom, block.y + block.height + MIN_DISTANCE);
    }

    for (const operation of operation_nodes) {
      left = !left ? operation.x - MIN_DISTANCE : Math.min(left, operation.x - MIN_DISTANCE);
      top = !top ? operation.y - MIN_DISTANCE : Math.min(top, operation.y - MIN_DISTANCE);
      right = !right
        ? Math.max(left + data.width, operation.x + OPERATION_NODE_WIDTH + MIN_DISTANCE)
        : Math.max(right, operation.x + OPERATION_NODE_WIDTH + MIN_DISTANCE);
      bottom = !bottom
        ? Math.max(top + data.height, operation.y + OPERATION_NODE_HEIGHT + MIN_DISTANCE)
        : Math.max(bottom, operation.y + OPERATION_NODE_HEIGHT + MIN_DISTANCE);
    }

    return {
      x: left ?? data.position_x,
      y: top ?? data.position_y,
      width: right && left ? right - left : data.width,
      height: bottom && top ? bottom - top : data.height
    };
  }

  /** Update layout when parent changes */
  onOperationChangeParent(targetID: number, newParent: number | null) {
    console.error('not implemented', targetID, newParent);
  }

  /** Update layout when parent changes */
  onBlockChangeParent(targetID: number, newParent: number | null) {
    console.error('not implemented', targetID, newParent);
  }
}
