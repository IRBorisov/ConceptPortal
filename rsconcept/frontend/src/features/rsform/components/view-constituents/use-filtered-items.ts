import { type Constituenta, type RSForm } from '../../models/rsform';
import { isBasicConcept, matchConstituenta } from '../../models/rsform-api';
import { useCstSearchStore } from '../../stores/cst-search';

export function useFilteredItems(schema: RSForm): Constituenta[] {
  const query = useCstSearchStore(state => state.query);
  const filterMatch = useCstSearchStore(state => state.match);
  const showInherited = useCstSearchStore(state => state.isInherited);
  const showCrucial = useCstSearchStore(state => state.isCrucial);
  const showKernel = useCstSearchStore(state => state.isKernel);

  const kernel = showKernel ? schema.items.filter(cst => isBasicConcept(cst.cst_type)) : schema.items;
  const filtered = query ? kernel.filter(cst => matchConstituenta(cst, query, filterMatch)) : kernel;
  let items = showInherited !== null ? filtered.filter(cst => cst.is_inherited === showInherited) : filtered;
  items = showCrucial !== null ? items.filter(cst => cst.crucial === showCrucial) : items;
  return items;
}
