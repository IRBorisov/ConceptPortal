/**
 * Module: API for miscellaneous frontend model types. Future targets for refactoring aimed at extracting modules.
 */
import { DependencyMode, GraphSizing } from './miscellaneous';
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
