import { filterConstituentaByQuery } from '@/services/search';
import { type Constituenta, type RSForm } from '@rsconcept/domain/library';
import { isBasicConcept, type ModelEvalFields, type SchemaIssueFields } from '@rsconcept/domain/library/rsform-api';

import { useCstSearchStore } from '../../stores/cst-search';

export function useFilteredItems(
  schema: RSForm,
  isSchemaIssue?: (cst: SchemaIssueFields) => boolean,
  isModelIssue?: (cst: ModelEvalFields) => boolean
): Constituenta[] {
  const query = useCstSearchStore(state => state.query);
  const filter = useCstSearchStore(state => state.filter);

  const filteredByQuery = filterConstituentaByQuery(schema.items, query);

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
