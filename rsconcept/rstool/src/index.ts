import {
  CONTRACT_VERSION,
  type AddOrUpdateConstituentaInput,
  type AddOrUpdateConstituentaResult,
  type AnalyzeExpressionInput,
  type AnalysisResult,
  type ClearConstituentaValuesInput,
  type EvaluateConstituentaInput,
  type EvaluateExpressionInput,
  type EvaluationResult,
  type ListDiagnosticsFilters,
  type RecalculateModelResult,
  type RSFormAgentToolContract,
  type SessionHandle,
  type SessionModelState,
  type SessionRevision,
  type SessionState,
  type SetConstituentaValueInput,
  type SetConstituentaValuesInput
} from './contracts/tool-contract';
import { ModelAdapter } from './mappers/model-adapter';
import { SchemaAdapter } from './mappers/schema-adapter';
import { SessionStore } from './session/session-store';

export * from './contracts/tool-contract';
export * from './mappers/types';
export * from './wrapper/client';

export class RSFormAgentTool implements RSFormAgentToolContract {
  public readonly contractVersion = CONTRACT_VERSION;
  private readonly sessions = new SessionStore();
  private readonly adapter = new SchemaAdapter();
  private readonly evaluation = new ModelAdapter();

  public createSession(initial?: Partial<SessionState>): SessionHandle {
    return this.sessions.create(initial, this.contractVersion);
  }

  public addOrUpdateConstituenta(
    sessionId: string,
    input: AddOrUpdateConstituentaInput
  ): AddOrUpdateConstituentaResult {
    const envelope = this.sessions.get(sessionId);
    const { result, diagnostics } = this.adapter.analyzeAgainstSession(envelope.state, input.draft);
    const state = this.adapter.mergeStateWithDraft(envelope.state, input.draft, result);
    this.sessions.appendDiagnostics(sessionId, diagnostics);
    return {
      state,
      diagnostics
    };
  }

  public analyzeExpression(sessionId: string, input: AnalyzeExpressionInput): AnalysisResult {
    const envelope = this.sessions.get(sessionId);
    const { result, diagnostics } = this.adapter.analyzeAgainstSession(envelope.state, {
      id: -1,
      alias: '_analysis',
      cstType: input.cstType,
      definitionFormal: input.expression
    });
    this.sessions.appendDiagnostics(
      sessionId,
      diagnostics.map(item => ({ ...item, constituentId: undefined }))
    );
    return result;
  }

  public getFormState(sessionId: string): SessionState {
    const envelope = this.sessions.get(sessionId);
    return structuredClone(envelope.state);
  }

  public listDiagnostics(sessionId: string, filters?: ListDiagnosticsFilters) {
    return this.sessions.listDiagnostics(sessionId, filters);
  }

  public commitStep(sessionId: string, message?: string): SessionRevision {
    return this.sessions.addRevision(sessionId, message);
  }

  public exportSession(sessionId: string): string {
    const envelope = this.sessions.get(sessionId);
    return JSON.stringify(
      {
        contractVersion: this.contractVersion,
        state: envelope.state,
        diagnostics: envelope.diagnostics
      },
      null,
      2
    );
  }

  public importSession(payload: string): SessionHandle {
    const parsed = JSON.parse(payload) as {
      state: SessionState;
    };
    if (!parsed.state.model) {
      parsed.state.model = { items: [] };
    }
    return this.sessions.create(parsed.state, this.contractVersion);
  }

  public async setConstituentaValue(
    sessionId: string,
    input: SetConstituentaValueInput
  ): Promise<SessionModelState> {
    const envelope = this.sessions.get(sessionId);
    return this.evaluation.setConstituentaValue(envelope.state, input);
  }

  public async setConstituentaValues(
    sessionId: string,
    input: SetConstituentaValuesInput
  ): Promise<SessionModelState> {
    const envelope = this.sessions.get(sessionId);
    return this.evaluation.setConstituentaValues(envelope.state, input);
  }

  public async clearConstituentaValues(
    sessionId: string,
    input: ClearConstituentaValuesInput
  ): Promise<SessionModelState> {
    const envelope = this.sessions.get(sessionId);
    return this.evaluation.clearConstituentaValues(envelope.state, input.items);
  }

  public getModelState(sessionId: string): SessionModelState {
    const envelope = this.sessions.get(sessionId);
    return structuredClone(envelope.state.model);
  }

  public evaluateExpression(sessionId: string, input: EvaluateExpressionInput): EvaluationResult {
    const envelope = this.sessions.get(sessionId);
    return this.evaluation.evaluateExpression(envelope.state, input.expression, input.cstType);
  }

  public evaluateConstituenta(sessionId: string, input: EvaluateConstituentaInput): EvaluationResult {
    const envelope = this.sessions.get(sessionId);
    return this.evaluation.evaluateConstituenta(envelope.state, input.constituentId);
  }

  public recalculateModel(sessionId: string): RecalculateModelResult {
    const envelope = this.sessions.get(sessionId);
    return this.evaluation.recalculateModel(envelope.state);
  }
}
