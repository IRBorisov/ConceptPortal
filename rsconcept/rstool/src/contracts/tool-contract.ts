export const CONTRACT_VERSION = '1.0.0';
export const RSToolErrorCode = {
  formalDefinitionNotAllowed: 0x8862
} as const;

export const CstType = {
  NOMINAL: 'nominal',
  BASE: 'basic',
  STRUCTURED: 'structure',
  TERM: 'term',
  AXIOM: 'axiom',
  FUNCTION: 'function',
  PREDICATE: 'predicate',
  CONSTANT: 'constant',
  THEOREM: 'theorem'
} as const;
export type CstType = (typeof CstType)[keyof typeof CstType];

export type RSToolValueClass = 'value' | 'property';

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

export interface SessionState {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  revisions: SessionRevision[];
  items: ConstituentaState[];
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
  valueClass: RSToolValueClass | null;
  diagnostics: RSToolErrorDescription[];
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
}
