
import { CstType } from '@/features/rsform';
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

/** Evaluate if {@link CstType} is interpretable. */
export function isInterpretable(type: CstType): boolean {
  switch (type) {
    case CstType.NOMINAL: return false;
    case CstType.BASE: return true;
    case CstType.CONSTANT: return true;
    case CstType.STRUCTURED: return true;
    case CstType.AXIOM: return true;
    case CstType.TERM: return true;
    case CstType.FUNCTION: return false;
    case CstType.PREDICATE: return false;
    case CstType.THEOREM: return true;
  }
}