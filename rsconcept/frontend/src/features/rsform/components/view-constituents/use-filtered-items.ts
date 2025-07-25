import { type IConstituenta, type IRSForm } from '../../models/rsform';
import { matchConstituenta } from '../../models/rsform-api';
import { DependencyMode, useCstSearchStore } from '../../stores/cst-search';

export function useFilteredItems(schema: IRSForm, activeCst?: IConstituenta | null): IConstituenta[] {
  const query = useCstSearchStore(state => state.query);
  const filterMatch = useCstSearchStore(state => state.match);
  const filterSource = useCstSearchStore(state => state.source);
  const includeInherited = useCstSearchStore(state => state.includeInherited);

  const graphFiltered = activeCst ? applyGraphQuery(schema, activeCst.id, filterSource) : schema.items;
  const queryFiltered = query ? graphFiltered.filter(cst => matchConstituenta(cst, query, filterMatch)) : graphFiltered;
  const items = !includeInherited ? queryFiltered.filter(cst => !cst.is_inherited) : queryFiltered;
  return items;
}

/**
 * Filter list of  {@link ILibraryItem} to a given graph query.
 */
function applyGraphQuery(target: IRSForm, pivot: number, mode: DependencyMode): IConstituenta[] {
  if (mode === DependencyMode.ALL) {
    return target.items;
  }
  const ids = (() => {
    switch (mode) {
      case DependencyMode.OUTPUTS: {
        return target.graph.nodes.get(pivot)?.outputs;
      }
      case DependencyMode.INPUTS: {
        return target.graph.nodes.get(pivot)?.inputs;
      }
      case DependencyMode.EXPAND_OUTPUTS: {
        return target.graph.expandAllOutputs([pivot]);
      }
      case DependencyMode.EXPAND_INPUTS: {
        return target.graph.expandAllInputs([pivot]);
      }
    }
  })();
  if (ids) {
    return target.items.filter(cst => ids.find(id => id === cst.id));
  } else {
    return target.items;
  }
}
