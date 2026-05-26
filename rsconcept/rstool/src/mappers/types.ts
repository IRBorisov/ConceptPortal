import { type ValueClass } from '@rsconcept/domain/rslang';

import { type AnalysisResult, type RSToolErrorDescription } from '../models';

export interface DomainErrorLike {
  code: number;
  from: number;
  to: number;
  params?: readonly string[];
}

export interface DomainAnalysisLike {
  success: boolean;
  type: Record<string, unknown> | null;
  valueClass: ValueClass | null;
  errors: DomainErrorLike[];
}

export function toPublicError(error: DomainErrorLike): RSToolErrorDescription {
  return {
    code: error.code,
    from: error.from,
    to: error.to,
    params: error.params
  };
}

export function toPublicAnalysis(analysis: DomainAnalysisLike): AnalysisResult {
  return {
    success: analysis.success,
    type: analysis.type,
    valueClass: analysis.valueClass,
    diagnostics: analysis.errors.map(toPublicError)
  };
}
