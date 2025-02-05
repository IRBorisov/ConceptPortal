/**
 * Module: API for miscellaneous frontend model types. Future targets for refactoring aimed at extracting modules.
 */
import { PARAMETER } from '@/utils/constants';

import { DependencyMode, GraphFilterParams, Position2D } from './miscellaneous';
import { IOperationPosition, IOperationSchema, OperationID, OperationType } from './oss';
import { ConstituentaID, CstType, IConstituenta, IRSForm } from './rsform';

/**
 * Filter list of  {@link ILibraryItem} to a given graph query.
 */
export function applyGraphQuery(target: IRSForm, start: number, mode: DependencyMode): IConstituenta[] {
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

export function produceFilteredGraph(schema: IRSForm, params: GraphFilterParams, focusCst: IConstituenta | undefined) {
  const filtered = schema.graph.clone();
  const allowedTypes: CstType[] = (() => {
    const result: CstType[] = [];
    if (params.allowBase) result.push(CstType.BASE);
    if (params.allowStruct) result.push(CstType.STRUCTURED);
    if (params.allowTerm) result.push(CstType.TERM);
    if (params.allowAxiom) result.push(CstType.AXIOM);
    if (params.allowFunction) result.push(CstType.FUNCTION);
    if (params.allowPredicate) result.push(CstType.PREDICATE);
    if (params.allowConstant) result.push(CstType.CONSTANT);
    if (params.allowTheorem) result.push(CstType.THEOREM);
    return result;
  })();

  if (params.noHermits) {
    filtered.removeIsolated();
  }
  if (params.noTemplates) {
    schema.items.forEach(cst => {
      if (cst !== focusCst && cst.is_template) {
        filtered.foldNode(cst.id);
      }
    });
  }
  if (allowedTypes.length < Object.values(CstType).length) {
    schema.items.forEach(cst => {
      if (cst !== focusCst && !allowedTypes.includes(cst.cst_type)) {
        filtered.foldNode(cst.id);
      }
    });
  }
  if (!focusCst && params.foldDerived) {
    schema.items.forEach(cst => {
      if (cst.spawner) {
        filtered.foldNode(cst.id);
      }
    });
  }
  if (focusCst) {
    const includes: ConstituentaID[] = [
      focusCst.id,
      ...focusCst.spawn,
      ...(params.focusShowInputs ? schema.graph.expandInputs([focusCst.id]) : []),
      ...(params.focusShowOutputs ? schema.graph.expandOutputs([focusCst.id]) : [])
    ];
    schema.items.forEach(cst => {
      if (!includes.includes(cst.id)) {
        filtered.foldNode(cst.id);
      }
    });
  }
  if (params.noTransitive) {
    filtered.transitiveReduction();
  }

  return filtered;
}
