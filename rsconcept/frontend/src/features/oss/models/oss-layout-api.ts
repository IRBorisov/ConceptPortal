import {
  type IBlockPosition,
  type ICreateBlockDTO,
  type ICreateOperationDTO,
  type IOperationPosition,
  type IOssLayout
} from '../backend/types';

import { type IOperationSchema } from './oss';
import { type Position2D, type Rectangle2D } from './oss-layout';

export const GRID_SIZE = 10; // pixels - size of OSS grid
const MIN_DISTANCE = 2 * GRID_SIZE; // pixels - minimum distance between nodes

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
  newOperationPosition(data: ICreateOperationDTO): Position2D {
    let result = { x: data.position_x, y: data.position_y };
    const operations = this.layout.operations;
    const parentNode = this.layout.blocks.find(pos => pos.id === data.item_data.parent);
    if (operations.length === 0) {
      return result;
    }

    if (data.arguments.length !== 0) {
      result = calculatePositionFromArgs(data.arguments, operations);
    } else if (parentNode) {
      result.x = parentNode.x + MIN_DISTANCE;
      result.y = parentNode.y + MIN_DISTANCE;
    } else {
      result = this.calculatePositionForFreeOperation(result);
    }

    result = preventOverlap(
      { ...result, width: OPERATION_NODE_WIDTH, height: OPERATION_NODE_HEIGHT },
      operations.map(node => ({ ...node, width: OPERATION_NODE_WIDTH, height: OPERATION_NODE_HEIGHT }))
    );

    if (parentNode) {
      const borderX = result.x + OPERATION_NODE_WIDTH + MIN_DISTANCE;
      const borderY = result.y + OPERATION_NODE_HEIGHT + MIN_DISTANCE;
      if (borderX > parentNode.x + parentNode.width) {
        parentNode.width = borderX - parentNode.x;
      }
      if (borderY > parentNode.y + parentNode.height) {
        parentNode.height = borderY - parentNode.y;
      }
      // TODO: trigger cascading updates
    }

    return { x: result.x, y: result.y };
  }

  /** Calculate insert position for a new {@link IBlock} */
  newBlockPosition(data: ICreateBlockDTO): Rectangle2D {
    const block_nodes = data.children_blocks
      .map(id => this.layout.blocks.find(block => block.id === id))
      .filter(node => !!node);
    const operation_nodes = data.children_operations
      .map(id => this.layout.operations.find(operation => operation.id === id))
      .filter(node => !!node);
    const parentNode = this.layout.blocks.find(pos => pos.id === data.item_data.parent);

    let result: Rectangle2D = { x: data.position_x, y: data.position_y, width: data.width, height: data.height };

    if (block_nodes.length !== 0 || operation_nodes.length !== 0) {
      result = calculatePositionFromChildren(
        { x: data.position_x, y: data.position_y, width: data.width, height: data.height },
        operation_nodes,
        block_nodes
      );
    } else if (parentNode) {
      result = {
        x: parentNode.x + MIN_DISTANCE,
        y: parentNode.y + MIN_DISTANCE,
        width: data.width,
        height: data.height
      };
    } else {
      result = this.calculatePositionForFreeBlock(result);
    }

    if (block_nodes.length === 0 && operation_nodes.length === 0) {
      if (parentNode) {
        const siblings = this.oss.blocks.filter(block => block.parent === parentNode.id).map(block => block.id);
        if (siblings.length > 0) {
          result = preventOverlap(
            result,
            this.layout.blocks.filter(block => siblings.includes(block.id))
          );
        }
      } else {
        const rootBlocks = this.oss.blocks.filter(block => block.parent === null).map(block => block.id);
        if (rootBlocks.length > 0) {
          result = preventOverlap(
            result,
            this.layout.blocks.filter(block => rootBlocks.includes(block.id))
          );
        }
      }
    }

    if (parentNode) {
      const borderX = result.x + result.width + MIN_DISTANCE;
      const borderY = result.y + result.height + MIN_DISTANCE;
      if (borderX > parentNode.x + parentNode.width) {
        parentNode.width = borderX - parentNode.x;
      }
      if (borderY > parentNode.y + parentNode.height) {
        parentNode.height = borderY - parentNode.y;
      }
      // TODO: trigger cascading updates
    }

    return result;
  }

  /** Update layout when parent changes */
  onOperationChangeParent(targetID: number, newParent: number | null) {
    console.error('not implemented', targetID, newParent);
  }

  /** Update layout when parent changes */
  onBlockChangeParent(targetID: number, newParent: number | null) {
    console.error('not implemented', targetID, newParent);
  }

  private calculatePositionForFreeOperation(initial: Position2D): Position2D {
    const operations = this.layout.operations;
    if (operations.length === 0) {
      return initial;
    }

    const freeInputs = this.oss.operations
      .filter(operation => operation.arguments.length === 0 && operation.parent === null)
      .map(operation => operation.id);
    let inputsPositions = operations.filter(pos => freeInputs.includes(pos.id));
    if (inputsPositions.length === 0) {
      inputsPositions = operations;
    }
    const maxX = Math.max(...inputsPositions.map(node => node.x));
    const minY = Math.min(...inputsPositions.map(node => node.y));
    return {
      x: maxX + OPERATION_NODE_WIDTH + MIN_DISTANCE + GRID_SIZE,
      y: minY
    };
  }

  private calculatePositionForFreeBlock(initial: Rectangle2D): Rectangle2D {
    const rootBlocks = this.oss.blocks.filter(block => block.parent === null).map(block => block.id);
    const blocksPositions = this.layout.blocks.filter(pos => rootBlocks.includes(pos.id));
    if (blocksPositions.length === 0) {
      return initial;
    }
    const maxX = Math.max(...blocksPositions.map(node => node.x + node.width));
    const minY = Math.min(...blocksPositions.map(node => node.y));
    return { ...initial, x: maxX + MIN_DISTANCE, y: minY };
  }
}

// ======= Internals =======
function rectanglesOverlap(a: Rectangle2D, b: Rectangle2D): boolean {
  return !(
    a.x + a.width + MIN_DISTANCE <= b.x ||
    b.x + b.width + MIN_DISTANCE <= a.x ||
    a.y + a.height + MIN_DISTANCE <= b.y ||
    b.y + b.height + MIN_DISTANCE <= a.y
  );
}

function getOverlapAmount(a: Rectangle2D, b: Rectangle2D): Position2D {
  const xOverlap = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const yOverlap = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  return { x: xOverlap, y: yOverlap };
}

function preventOverlap(target: Rectangle2D, fixedRectangles: Rectangle2D[]): Rectangle2D {
  let hasOverlap: boolean;
  do {
    hasOverlap = false;
    for (const fixed of fixedRectangles) {
      if (rectanglesOverlap(target, fixed)) {
        hasOverlap = true;
        const overlap = getOverlapAmount(target, fixed);
        if (overlap.x >= overlap.y) {
          target.x += overlap.x + MIN_DISTANCE;
        } else {
          target.y += overlap.y + MIN_DISTANCE;
        }
        break;
      }
    }
  } while (hasOverlap);

  return target;
}

function calculatePositionFromArgs(args: number[], operations: IOperationPosition[]): Position2D {
  const argNodes = operations.filter(pos => args.includes(pos.id));
  const maxY = Math.max(...argNodes.map(node => node.y));
  const minX = Math.min(...argNodes.map(node => node.x));
  const maxX = Math.max(...argNodes.map(node => node.x));
  return {
    x: Math.ceil((maxX + minX) / 2 / GRID_SIZE) * GRID_SIZE,
    y: maxY + 2 * OPERATION_NODE_HEIGHT + MIN_DISTANCE
  };
}

function calculatePositionFromChildren(
  initial: Rectangle2D,
  operations: IOperationPosition[],
  blocks: IBlockPosition[]
): Rectangle2D {
  let left = undefined;
  let top = undefined;
  let right = undefined;
  let bottom = undefined;

  for (const block of blocks) {
    left = left === undefined ? block.x - MIN_DISTANCE : Math.min(left, block.x - MIN_DISTANCE);
    top = top === undefined ? block.y - MIN_DISTANCE : Math.min(top, block.y - MIN_DISTANCE);
    right =
      right === undefined
        ? Math.max(left + initial.width, block.x + block.width + MIN_DISTANCE)
        : Math.max(right, block.x + block.width + MIN_DISTANCE);
    bottom = !bottom
      ? Math.max(top + initial.height, block.y + block.height + MIN_DISTANCE)
      : Math.max(bottom, block.y + block.height + MIN_DISTANCE);
  }

  for (const operation of operations) {
    left = left === undefined ? operation.x - MIN_DISTANCE : Math.min(left, operation.x - MIN_DISTANCE);
    top = top === undefined ? operation.y - MIN_DISTANCE : Math.min(top, operation.y - MIN_DISTANCE);
    right =
      right === undefined
        ? Math.max(left + initial.width, operation.x + OPERATION_NODE_WIDTH + MIN_DISTANCE)
        : Math.max(right, operation.x + OPERATION_NODE_WIDTH + MIN_DISTANCE);
    bottom = !bottom
      ? Math.max(top + initial.height, operation.y + OPERATION_NODE_HEIGHT + MIN_DISTANCE)
      : Math.max(bottom, operation.y + OPERATION_NODE_HEIGHT + MIN_DISTANCE);
  }

  return {
    x: left ?? initial.x,
    y: top ?? initial.y,
    width: right !== undefined && left !== undefined ? right - left : initial.width,
    height: bottom !== undefined && top !== undefined ? bottom - top : initial.height
  };
}
