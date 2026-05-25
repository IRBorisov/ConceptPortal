import {
  type BasicBinding,
  type CstType,
  type EvalStatus,
  type RSToolErrorDescription,
  type RSToolValue
} from './common';

export interface EvaluateExpressionInput {
  expression: string;
  cstType: CstType;
}

export interface EvaluateConstituentaInput {
  constituentId: number;
}

export interface EvaluationResult {
  success: boolean;
  value: RSToolValue | BasicBinding | null;
  status: EvalStatus;
  iterations: number;
  cacheHits: number;
  diagnostics: RSToolErrorDescription[];
}
