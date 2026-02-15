
import { calculateSchemaStats } from '@/features/rsform/models/rsform-api';

import { type RSModel, type RSModelStats } from './rsmodel';

/** Calculate statistics for {@link RSModel}. */
export function calculateModelStats(target: RSModel): RSModelStats {
  return {
    ...calculateSchemaStats(target.schema),
    count_missing_base: 0,
    count_false_axioms: 0,
    count_invalid_calculations: 0,
    count_empty_terms: 0
  };
}