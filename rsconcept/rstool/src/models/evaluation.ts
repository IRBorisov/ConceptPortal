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

/** Evaluate a scratch expression or a stored constituent (provide one variant). */
export interface EvaluateInput {
  /** Scratch expression; requires `cstType`. */
  expression?: string;
  /** Type context when evaluating `expression`. */
  cstType?: CstType;
  /** Stored constituent id to evaluate. */
  constituentId?: number;
}

/** Outcome of model evaluation for one expression or constituent. */
export interface EvaluationResult {
  success: boolean;
  value: RSToolValue | BasicBinding | null;
  status: EvalStatus;
  iterations: number;
  cacheHits: number;
  diagnostics: RSToolErrorDescription[];
}
