import { type Constituenta, type RSForm } from '@/domain/library';
import { isBasicConcept, matchConstituenta } from '@/domain/library/rsform-api';

import { useCstSearchStore } from '../../stores/cst-search';

export function useFilteredItems(schema: RSForm, isProblematic?: (cst: Constituenta) => boolean): Constituenta[] {
  const query = useCstSearchStore(state => state.query);
  const filter = useCstSearchStore(state => state.filter);

  const filteredByQuery = query ? schema.items.filter(cst => matchConstituenta(cst, query)) : schema.items;

  switch (filter) {
    case 'problematic':
      return isProblematic ? filteredByQuery.filter(cst => isProblematic(cst)) : filteredByQuery;
    case 'crucial':
      return filteredByQuery.filter(cst => cst.crucial);
    case 'kernel':
      return filteredByQuery.filter(cst => isBasicConcept(cst.cst_type));
    case 'derived':
      return filteredByQuery.filter(cst => !isBasicConcept(cst.cst_type));
    case 'owned':
      return filteredByQuery.filter(cst => !cst.is_inherited);
    case 'inherited':
      return filteredByQuery.filter(cst => cst.is_inherited);
    case 'all':
    default:
      return filteredByQuery;
  }
}
