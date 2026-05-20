import { CstType } from '@/domain/library/rsform';
import { EvalStatus, type BasicBinding } from '@/domain/library/rsmodel';
import { ValueClass } from '@/domain/rslang';
import { RSErrorCode } from '@/domain/rslang/error';

export const CONTRACT_VERSION = '1.2.0';

export { CstType, EvalStatus, RSErrorCode, ValueClass };
export type { BasicBinding };

/** Runtime evaluation value: number, nested array (set/tuple), or boolean 0/1. */
export type RSToolValue = number | RSToolValue[];

export interface RSToolErrorDescription {
  code: number;
  from: number;
  to: number;
  params?: readonly string[];
}

export interface SessionHandle {
  sessionId: string;
  contractVersion: string;
}

export interface SessionRevision {
  revisionId: string;
  at: string;
  message?: string;
}

export interface ConstituentaDraft {
  id: number;
  /** Alias */
  alias: string;
  /** CST type */
  cstType: CstType;
  /** Formal definition */
  definitionFormal: string;
  /** Natural-language term */
  term?: string;
  /** Natural-language definition */
  definitionText?: string;
  /** Convention or comment */
  convention?: string;
}

export interface ConstituentaState extends Omit<ConstituentaDraft, 'term' | 'definitionText' | 'convention'> {
  term: string;
  definitionText: string;
  convention: string;
  analysis: AnalysisResult;
}

export interface ModelValueState {
  id: number;
  /** Frontend type string: `basic` or normalized effective typification. */
  type: string;
  value: RSToolValue | BasicBinding;
}

export interface SessionModelState {
  items: ModelValueState[];
}

export interface SessionState {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  revisions: SessionRevision[];
  items: ConstituentaState[];
  model: SessionModelState;
}

export interface DiagnosticRecord {
  sessionId: string;
  constituentId?: number;
  expression: string;
  error: RSToolErrorDescription;
}

export interface AnalyzeExpressionInput {
  expression: string;
  cstType: CstType;
}

export interface AnalysisResult {
  success: boolean;
  type: Record<string, unknown> | null;
  valueClass: ValueClass | null;
  diagnostics: RSToolErrorDescription[];
}

export interface EvaluationResult {
  success: boolean;
  value: RSToolValue | BasicBinding | null;
  status: EvalStatus;
  iterations: number;
  cacheHits: number;
  diagnostics: RSToolErrorDescription[];
}

export interface EvaluateExpressionInput {
  expression: string;
  cstType: CstType;
}

export interface EvaluateConstituentaInput {
  constituentId: number;
}

export interface SetConstituentaValueInput {
  target: number;
  /** Optional type override; inferred from schema when omitted. */
  type?: string;
  value: RSToolValue | BasicBinding;
}

export interface SetConstituentaValuesInput {
  items: SetConstituentaValueInput[];
}

export interface ClearConstituentaValuesInput {
  items: number[];
}

export interface RecalculateModelResult {
  items: Array<{ id: number; alias: string; value: RSToolValue | null; status: EvalStatus }>;
}

export interface AddOrUpdateConstituentaInput {
  draft: ConstituentaDraft;
}

export interface AddOrUpdateConstituentaResult {
  state: ConstituentaState;
  diagnostics: DiagnosticRecord[];
}

export interface ListDiagnosticsFilters {
  constituentId?: number;
}

export interface RSFormAgentToolContract {
  readonly contractVersion: string;
  createSession(initial?: Partial<SessionState>): SessionHandle;
  addOrUpdateConstituenta(sessionId: string, input: AddOrUpdateConstituentaInput): AddOrUpdateConstituentaResult;
  analyzeExpression(sessionId: string, input: AnalyzeExpressionInput): AnalysisResult;
  getFormState(sessionId: string): SessionState;
  listDiagnostics(sessionId: string, filters?: ListDiagnosticsFilters): DiagnosticRecord[];
  commitStep(sessionId: string, message?: string): SessionRevision;
  exportSession(sessionId: string): string;
  importSession(payload: string): SessionHandle;
  setConstituentaValue(sessionId: string, input: SetConstituentaValueInput): SessionModelState;
  setConstituentaValues(sessionId: string, input: SetConstituentaValuesInput): SessionModelState;
  clearConstituentaValues(sessionId: string, input: ClearConstituentaValuesInput): SessionModelState;
  getModelState(sessionId: string): SessionModelState;
  evaluateExpression(sessionId: string, input: EvaluateExpressionInput): EvaluationResult;
  evaluateConstituenta(sessionId: string, input: EvaluateConstituentaInput): EvaluationResult;
  recalculateModel(sessionId: string): RecalculateModelResult;
}
