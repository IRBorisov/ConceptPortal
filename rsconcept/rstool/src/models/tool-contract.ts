import { type AnalysisResult, type AnalyzeExpressionInput } from './analysis';
import {
  type AddOrUpdateConstituentaInput,
  type AddOrUpdateConstituentaResult
} from './constituenta';
import {
  type DiagnosticRecord,
  type ListDiagnosticsFilters
} from './diagnostic';
import {
  type EvaluateConstituentaInput,
  type EvaluateExpressionInput,
  type EvaluationResult
} from './evaluation';
import {
  type ClearConstituentaValuesInput,
  type RecalculateModelResult,
  type SessionModelState,
  type SetConstituentaValueInput,
  type SetConstituentaValuesInput
} from './model-value';
import {
  type SessionHandle,
  type SessionRevision,
  type SessionState
} from './session';

export const CONTRACT_VERSION = '1.4.0';

export interface RSToolAgentContract {
  readonly contractVersion: string;
  createSession(initial?: Partial<SessionState>): SessionHandle;
  addOrUpdateConstituenta(sessionId: string, input: AddOrUpdateConstituentaInput): AddOrUpdateConstituentaResult;
  analyzeExpression(sessionId: string, input: AnalyzeExpressionInput): AnalysisResult;
  getFormState(sessionId: string): SessionState;
  listDiagnostics(sessionId: string, filters?: ListDiagnosticsFilters): DiagnosticRecord[];
  commitStep(sessionId: string, message?: string): SessionRevision;
  exportSession(sessionId: string): string;
  exportPortalSchema(sessionId: string): string;
  exportPortalModel(sessionId: string): string;
  importSession(payload: string): SessionHandle;
  setConstituentaValue(sessionId: string, input: SetConstituentaValueInput): Promise<SessionModelState>;
  setConstituentaValues(sessionId: string, input: SetConstituentaValuesInput): Promise<SessionModelState>;
  clearConstituentaValues(sessionId: string, input: ClearConstituentaValuesInput): Promise<SessionModelState>;
  getModelState(sessionId: string): SessionModelState;
  evaluateExpression(sessionId: string, input: EvaluateExpressionInput): EvaluationResult;
  evaluateConstituenta(sessionId: string, input: EvaluateConstituentaInput): EvaluationResult;
  recalculateModel(sessionId: string): RecalculateModelResult;
}
