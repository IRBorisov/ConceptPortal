import { type Constituenta, type RSForm } from '../../models/rsform';
import { matchConstituenta } from '../../models/rsform-api';
import { DependencyMode, useCstSearchStore } from '../../stores/cst-search';

export function useFilteredItems(schema: RSForm, activeCst?: Constituenta | null): Constituenta[] {
  const query = useCstSearchStore(state => state.query);
  const filterMatch = useCstSearchStore(state => state.match);
  const filterSource = useCstSearchStore(state => state.source);
  const showInherited = useCstSearchStore(state => state.isInherited);
  const showCrucial = useCstSearchStore(state => state.isCrucial);

  const graphFiltered = activeCst ? applyGraphQuery(schema, activeCst.id, filterSource) : schema.items;
  const queryFiltered = query ? graphFiltered.filter(cst => matchConstituenta(cst, query, filterMatch)) : graphFiltered;
  let items = showInherited !== null ? queryFiltered.filter(cst => cst.is_inherited === showInherited) : queryFiltered;
  items = showCrucial !== null ? items.filter(cst => cst.crucial === showCrucial) : items;
  return items;
}

/**
 * Filter list of  {@link LibraryItem} to a given graph query.
 */
function applyGraphQuery(target: RSForm, pivot: number, mode: DependencyMode): Constituenta[] {
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
