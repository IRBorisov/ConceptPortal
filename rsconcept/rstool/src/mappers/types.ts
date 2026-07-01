import { type ValueClass } from '@rsconcept/domain/rslang';

import { type AnalysisResult, type RSToolErrorDescription } from '../models';

/** Minimal domain error shape before mapping to {@link RSToolErrorDescription}. */
export interface DomainErrorLike {
  code: number;
  from: number;
  to: number;
  params?: readonly string[];
}

/** Minimal domain analysis shape before mapping to {@link AnalysisResult}. */
export interface DomainAnalysisLike {
  success: boolean;
  type: Record<string, unknown> | null;
  valueClass: ValueClass | null;
  errors: DomainErrorLike[];
}

/** Map a domain parser/semantic error to the public diagnostic shape. */
export function toPublicError(error: DomainErrorLike): RSToolErrorDescription {
  return {
    code: error.code,
    from: error.from,
    to: error.to,
    params: error.params
  };
}

/** Map a domain analysis result to the public {@link AnalysisResult} shape. */
export function toPublicAnalysis(analysis: DomainAnalysisLike): AnalysisResult {
  return {
    success: analysis.success,
    type: analysis.type,
    valueClass: analysis.valueClass,
    diagnostics: analysis.errors.map(toPublicError)
  };
}
