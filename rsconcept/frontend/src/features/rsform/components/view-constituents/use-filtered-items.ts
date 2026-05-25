import { type Constituenta, type RSForm } from '@/domain/library';
import { isBasicConcept } from '@/domain/library/rsform-api';
import { matchConstituenta } from '@/services/search';

import { useCstSearchStore } from '../../stores/cst-search';

export function useFilteredItems(
  schema: RSForm,
  isSchemaIssue?: (cst: Constituenta) => boolean,
  isModelIssue?: (cst: Constituenta) => boolean
): Constituenta[] {
  const query = useCstSearchStore(state => state.query);
  const filter = useCstSearchStore(state => state.filter);

  const filteredByQuery = query ? schema.items.filter(cst => matchConstituenta(cst, query)) : schema.items;

  switch (filter) {
    case 'schema_issues':
      return isSchemaIssue ? filteredByQuery.filter(cst => isSchemaIssue(cst)) : filteredByQuery;
    case 'model_issues':
      return isModelIssue ? filteredByQuery.filter(cst => isModelIssue(cst)) : filteredByQuery;
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
