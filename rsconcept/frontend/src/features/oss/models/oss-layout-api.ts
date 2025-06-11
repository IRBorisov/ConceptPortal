import { type ICreateBlockDTO, type ICreateOperationDTO, type INodePosition, type IOssLayout } from '../backend/types';

import { type IOperationSchema } from './oss';
import { type Position2D, type Rectangle2D } from './oss-layout';

export const GRID_SIZE = 10; // pixels - size of OSS grid
const MIN_DISTANCE = 2 * GRID_SIZE; // pixels - minimum distance between nodes

export const OPERATION_NODE_WIDTH = 150;
export const OPERATION_NODE_HEIGHT = 40;

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
  newOperationPosition(data: ICreateOperationDTO): Rectangle2D {
    let result = { x: data.position_x, y: data.position_y, width: data.width, height: data.height };
    const parentNode = this.layout.find(pos => pos.nodeID === `b${data.item_data.parent}`);
    if (this.oss.operations.length === 0) {
      return result;
    }

    const operations = this.layout.filter(pos => pos.nodeID.startsWith('o'));
    if (data.arguments.length !== 0) {
      const pos = calculatePositionFromArgs(
        operations.filter(node => data.arguments.includes(Number(node.nodeID.slice(1))))
      );
      result.x = pos.x;
      result.y = pos.y;
    } else if (parentNode) {
      result.x = parentNode.x + MIN_DISTANCE;
      result.y = parentNode.y + MIN_DISTANCE;
    } else {
      const pos = this.calculatePositionForFreeOperation(result);
      result.x = pos.x;
      result.y = pos.y;
    }

    result = preventOverlap(result, operations);

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

    return result;
  }

  /** Calculate insert position for a new {@link IBlock} */
  newBlockPosition(data: ICreateBlockDTO): Rectangle2D {
    const block_nodes = data.children_blocks
      .map(id => this.layout.find(block => block.nodeID === `b${id}`))
      .filter(node => !!node);
    const operation_nodes = data.children_operations
      .map(id => this.layout.find(operation => operation.nodeID === `o${id}`))
      .filter(node => !!node);
    const parentNode = this.layout.find(pos => pos.nodeID === `b${data.item_data.parent}`);

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
        const siblings = this.oss.blocks
          .filter(block => block.parent === data.item_data.parent)
          .map(block => block.nodeID);
        if (siblings.length > 0) {
          result = preventOverlap(
            result,
            this.layout.filter(node => siblings.includes(node.nodeID))
          );
        }
      } else {
        const rootBlocks = this.oss.blocks.filter(block => block.parent === null).map(block => block.nodeID);
        if (rootBlocks.length > 0) {
          result = preventOverlap(
            result,
            this.layout.filter(node => rootBlocks.includes(node.nodeID))
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
    const targetNode = this.layout.find(pos => pos.nodeID === `o${targetID}`);
    if (!targetNode) {
      return;
    }

    if (newParent === null) {
      const rootBlocks = this.oss.blocks.filter(block => block.parent === null).map(block => block.nodeID);
      const blocksPositions = this.layout.filter(pos => rootBlocks.includes(pos.nodeID));
      if (blocksPositions.length === 0) {
        return;
      }

      const operationPositions = this.layout.filter(pos => pos.nodeID.startsWith('o') && pos.nodeID !== `o${targetID}`);
      const newRect = preventOverlap(targetNode, [...blocksPositions, ...operationPositions]);
      targetNode.x = newRect.x;
      targetNode.y = newRect.y;
      return;
    } else {
      const parentNode = this.layout.find(pos => pos.nodeID === `b${newParent}`);
      if (!parentNode) {
        return;
      }
      if (rectanglesOverlap(parentNode, targetNode)) {
        return;
      }

      // TODO: fix position based on parent
    }
  }

  /** Update layout when parent changes */
  onBlockChangeParent(targetID: number, newParent: number | null) {
    console.error('not implemented', targetID, newParent);
  }

  private calculatePositionForFreeOperation(initial: Position2D): Position2D {
    if (this.oss.operations.length === 0) {
      return initial;
    }

    const freeInputs = this.oss.operations
      .filter(operation => operation.arguments.length === 0 && operation.parent === null)
      .map(operation => operation.nodeID);
    let inputsPositions = this.layout.filter(pos => freeInputs.includes(pos.nodeID));
    if (inputsPositions.length === 0) {
      inputsPositions = this.layout.filter(pos => pos.nodeID.startsWith('o'));
    }
    const maxX = Math.max(...inputsPositions.map(node => node.x));
    const minY = Math.min(...inputsPositions.map(node => node.y));
    return {
      x: maxX + OPERATION_NODE_WIDTH + MIN_DISTANCE + GRID_SIZE,
      y: minY
    };
  }

  private calculatePositionForFreeBlock(initial: Rectangle2D): Rectangle2D {
    const rootBlocks = this.oss.blocks.filter(block => block.parent === null).map(block => block.nodeID);
    const blocksPositions = this.layout.filter(pos => rootBlocks.includes(pos.nodeID));
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

function calculatePositionFromArgs(args: INodePosition[]): Position2D {
  const maxY = Math.max(...args.map(node => node.y));
  const minX = Math.min(...args.map(node => node.x));
  const maxX = Math.max(...args.map(node => node.x));
  return {
    x: Math.ceil((maxX + minX) / 2 / GRID_SIZE) * GRID_SIZE,
    y: maxY + 2 * OPERATION_NODE_HEIGHT + MIN_DISTANCE
  };
}

function calculatePositionFromChildren(
  initial: Rectangle2D,
  operations: INodePosition[],
  blocks: INodePosition[]
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
        ? Math.max(left + initial.width, operation.x + operation.width + MIN_DISTANCE)
        : Math.max(right, operation.x + operation.width + MIN_DISTANCE);
    bottom = !bottom
      ? Math.max(top + initial.height, operation.y + operation.height + MIN_DISTANCE)
      : Math.max(bottom, operation.y + operation.height + MIN_DISTANCE);
  }

  return {
    x: left ?? initial.x,
    y: top ?? initial.y,
    width: right !== undefined && left !== undefined ? right - left : initial.width,
    height: bottom !== undefined && top !== undefined ? bottom - top : initial.height
  };
}
