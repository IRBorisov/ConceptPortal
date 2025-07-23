import {
  type ICreateBlockDTO,
  type ICreateSchemaDTO,
  type ICreateSynthesisDTO,
  type IImportSchemaDTO,
  type INodePosition,
  type IOssLayout
} from '../backend/types';

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
  newOperationPosition(data: ICreateSchemaDTO | ICreateSynthesisDTO | IImportSchemaDTO): Rectangle2D {
    const result = { ...data.position };
    const parentNode = this.layout.find(pos => pos.nodeID === `b${data.item_data.parent}`) ?? null;
    const parentID = parentNode ? data.item_data.parent : null;
    const operations = this.layout.filter(pos => pos.nodeID.startsWith('o'));
    const hasArguments = 'arguments' in data && data.arguments.length !== 0;
    if (hasArguments) {
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

    const siblingBlocks = this.oss.blocks.filter(block => block.parent === parentID).map(block => block.nodeID);
    preventOverlap(
      result,
      this.layout.filter(node => siblingBlocks.includes(node.nodeID)),
      {
        moveX: !hasArguments,
        moveY: hasArguments
      }
    );

    preventOverlap(result, operations);
    this.extendParentBounds(parentNode, result);

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
    const parentNode = this.layout.find(pos => pos.nodeID === `b${data.item_data.parent}`) ?? null;
    const parentID = parentNode ? data.item_data.parent : null;

    let result: Rectangle2D = { ...data.position };

    if (block_nodes.length !== 0 || operation_nodes.length !== 0) {
      result = calculatePositionFromChildren(data.position, operation_nodes, block_nodes);
    } else if (parentNode) {
      result = {
        x: parentNode.x + MIN_DISTANCE,
        y: parentNode.y + MIN_DISTANCE,
        width: data.position.width,
        height: data.position.height
      };
    } else {
      result = this.calculatePositionForFreeBlock(result);
    }

    if (block_nodes.length === 0 && operation_nodes.length === 0) {
      const siblings = this.oss.blocks.filter(block => block.parent === parentID).map(block => block.nodeID);
      preventOverlap(
        result,
        this.layout.filter(node => siblings.includes(node.nodeID))
      );
    }

    this.extendParentBounds(parentNode, result);
    return result;
  }

  /** Update layout when parent changes */
  onChangeParent(targetID: string, newParent: string | null) {
    const targetNode = this.layout.find(pos => pos.nodeID === targetID);
    if (!targetNode) {
      return;
    }

    const parentNode = this.layout.find(pos => pos.nodeID === newParent) ?? null;
    const offset = this.calculateOffsetForParentChange(targetNode, parentNode);
    if (offset.x === 0 && offset.y === 0) {
      return;
    }

    targetNode.x += offset.x;
    targetNode.y += offset.y;

    const children = this.oss.hierarchy.expandAllOutputs([targetID]);
    const childrenPositions = this.layout.filter(pos => children.includes(pos.nodeID));
    for (const child of childrenPositions) {
      child.x += offset.x;
      child.y += offset.y;
    }

    this.extendParentBounds(parentNode, targetNode);
  }

  private extendParentBounds(parent: INodePosition | null, child: Rectangle2D) {
    if (!parent) {
      return;
    }
    const borderX = child.x + child.width + MIN_DISTANCE;
    const borderY = child.y + child.height + MIN_DISTANCE;
    parent.width = Math.max(parent.width, borderX - parent.x);
    parent.height = Math.max(parent.height, borderY - parent.y);
    // TODO: cascade update
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

  private calculateOffsetForParentChange(target: INodePosition, parent: INodePosition | null): Position2D {
    const newPosition = { ...target };
    if (parent === null) {
      const rootElements = this.oss.hierarchy.rootNodes();
      const positions = this.layout.filter(pos => rootElements.includes(pos.nodeID));
      preventOverlap(newPosition, positions);
    } else if (!rectanglesOverlap(target, parent)) {
      newPosition.x = parent.x + MIN_DISTANCE;
      newPosition.y = parent.y + MIN_DISTANCE;

      const siblings = this.oss.hierarchy.at(parent.nodeID)?.outputs ?? [];
      const siblingsPositions = this.layout.filter(pos => siblings.includes(pos.nodeID));
      preventOverlap(newPosition, siblingsPositions);
    }
    return { x: newPosition.x - target.x, y: newPosition.y - target.y };
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

function preventOverlap(
  target: Rectangle2D,
  fixedRectangles: Rectangle2D[],
  options: { moveX?: boolean; moveY?: boolean } = { moveX: true, moveY: true }
) {
  if ((!options.moveX && !options.moveY) || fixedRectangles.length === 0) {
    return;
  }
  let hasOverlap: boolean;
  do {
    hasOverlap = false;
    for (const fixed of fixedRectangles) {
      if (rectanglesOverlap(target, fixed)) {
        hasOverlap = true;
        if (options.moveX) {
          target.x += MIN_DISTANCE;
        }
        if (options.moveY) {
          target.y += MIN_DISTANCE;
        }
        break;
      }
    }
  } while (hasOverlap);
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
  const allNodes = [...blocks, ...operations];
  if (allNodes.length === 0) {
    return initial;
  }

  const left = Math.min(...allNodes.map(n => n.x)) - MIN_DISTANCE;
  const top = Math.min(...allNodes.map(n => n.y)) - MIN_DISTANCE;
  const right = Math.max(...allNodes.map(n => n.x + n.width)) + MIN_DISTANCE;
  const bottom = Math.max(...allNodes.map(n => n.y + n.height)) + MIN_DISTANCE;

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top
  };
}
