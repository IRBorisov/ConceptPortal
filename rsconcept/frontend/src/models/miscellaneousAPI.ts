/**
 * Module: API for miscellaneous frontend model types. Future targets for refactoring aimed at extracting modules.
 */
import { PARAMETER } from '@/utils/constants';

import { DependencyMode, GraphSizing, Position2D } from './miscellaneous';
import { IOperationPosition, IOperationSchema, OperationID, OperationType } from './oss';
import { IConstituenta, IRSForm } from './rsform';

/**
 * Filter list of  {@link ILibraryItem} to a given graph query.
 */
export function applyGraphFilter(target: IRSForm, start: number, mode: DependencyMode): IConstituenta[] {
  if (mode === DependencyMode.ALL) {
    return target.items;
  }
  const ids: number[] | undefined = (() => {
    switch (mode) {
      case DependencyMode.OUTPUTS: {
        return target.graph.nodes.get(start)?.outputs;
      }
      case DependencyMode.INPUTS: {
        return target.graph.nodes.get(start)?.inputs;
      }
      case DependencyMode.EXPAND_OUTPUTS: {
        return target.graph.expandAllOutputs([start]);
      }
      case DependencyMode.EXPAND_INPUTS: {
        return target.graph.expandAllInputs([start]);
      }
    }
    return undefined;
  })();
  if (ids) {
    return target.items.filter(cst => ids.find(id => id === cst.id));
  } else {
    return target.items;
  }
}

/**
 * Apply {@link GraphSizing} to a given {@link IConstituenta}.
 */
export function applyNodeSizing(target: IConstituenta, sizing: GraphSizing): number | undefined {
  if (sizing === 'none') {
    return undefined;
  } else if (sizing === 'complex') {
    return target.is_simple_expression ? 1 : 2;
  } else {
    return target.spawner ? 1 : 2;
  }
}

/**
 * Calculate insert position for a new {@link IOperation}
 */
export function calculateInsertPosition(
  oss: IOperationSchema,
  operationType: OperationType,
  argumentsOps: OperationID[],
  positions: IOperationPosition[],
  defaultPosition: Position2D
): Position2D {
  const result = defaultPosition;
  if (positions.length === 0) {
    return result;
  }

  if (operationType === OperationType.INPUT) {
    let inputsNodes = positions.filter(pos =>
      oss.items.find(operation => operation.operation_type === OperationType.INPUT && operation.id === pos.id)
    );
    if (inputsNodes.length > 0) {
      inputsNodes = positions;
    }
    const maxX = Math.max(...inputsNodes.map(node => node.position_x));
    const minY = Math.min(...inputsNodes.map(node => node.position_y));
    result.x = maxX + PARAMETER.ossDistanceX;
    result.y = minY;
  } else {
    const argNodes = positions.filter(pos => argumentsOps.includes(pos.id));
    const maxY = Math.max(...argNodes.map(node => node.position_y));
    const minX = Math.min(...argNodes.map(node => node.position_x));
    const maxX = Math.max(...argNodes.map(node => node.position_x));
    result.x = Math.ceil((maxX + minX) / 2 / PARAMETER.ossGridSize) * PARAMETER.ossGridSize;
    result.y = maxY + PARAMETER.ossDistanceY;
  }

  let flagIntersect = false;
  do {
    flagIntersect = positions.some(
      position =>
        Math.abs(position.position_x - result.x) < PARAMETER.ossMinDistance &&
        Math.abs(position.position_y - result.y) < PARAMETER.ossMinDistance
    );
    if (flagIntersect) {
      result.x += PARAMETER.ossMinDistance;
      result.y += PARAMETER.ossMinDistance;
    }
  } while (flagIntersect);
  return result;
}
