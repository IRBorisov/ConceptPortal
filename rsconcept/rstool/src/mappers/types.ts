import { type AnalysisResult, type RSToolErrorDescription, type RSToolValueClass } from '../contracts/tool-contract';

export interface DomainErrorLike {
  code: number;
  from: number;
  to: number;
  params?: readonly string[];
}

export interface DomainAnalysisLike {
  success: boolean;
  type: Record<string, unknown> | null;
  valueClass: string | null;
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
    valueClass: toPublicValueClass(analysis.valueClass),
    diagnostics: analysis.errors.map(toPublicError)
  };
}

function toPublicValueClass(valueClass: string | null): RSToolValueClass | null {
  if (valueClass === 'value' || valueClass === 'property') {
    return valueClass;
  }
  return null;
}
