import { ModelAdapter } from '../mappers/model-adapter';
import { SchemaAdapter } from '../mappers/schema-adapter';
import { SessionStore } from '../session/session-store';
import { type AnalysisResult, type AnalyzeExpressionInput } from './analysis';
import {
  type AddOrUpdateConstituentaInput,
  type AddOrUpdateConstituentaResult
} from './constituenta';
import { type ListDiagnosticsFilters } from './diagnostic';
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
  PORTAL_JSON_CONTRACT_VERSION,
  type PortalModelImportData,
  type PortalSchemaImportData
} from './portal-json';
import { type SessionHandle, type SessionRevision, type SessionState } from './session';
import { CONTRACT_VERSION, type RSToolAgentContract } from './tool-contract';

function normalizeImportedState(state: SessionState): SessionState {
  return {
    ...state,
    alias: state.alias ?? '',
    title: state.title ?? '',
    comment: state.comment ?? '',
    model: state.model ?? { items: [] }
  };
}

function portalImportMetadata(
  session: SessionState,
  kind: 'schema' | 'model'
): Pick<PortalSchemaImportData, 'title' | 'alias' | 'description'> {
  const defaults =
    kind === 'schema'
      ? { title: 'Conceptual schema', alias: 'SCHEMA' }
      : { title: 'Conceptual model', alias: 'MODEL' };
  const title = session.title.trim();
  const alias = session.alias.trim();
  return {
    title: title.length > 0 ? title : defaults.title,
    alias: alias.length > 0 ? alias : defaults.alias,
    description: session.comment.trim()
  };
}

export class RSToolAgent implements RSToolAgentContract {
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

  public exportPortalSchema(sessionId: string): string {
    const envelope = this.sessions.get(sessionId);
    const payload: PortalSchemaImportData = {
      contract_version: PORTAL_JSON_CONTRACT_VERSION,
      ...portalImportMetadata(envelope.state, 'schema'),
      items: envelope.state.items.map(item => ({
        id: item.id,
        alias: item.alias,
        convention: item.convention,
        crucial: false,
        cst_type: item.cstType,
        definition_formal: item.definitionFormal,
        typification_manual: '',
        value_is_property: false,
        definition_raw: item.definitionText,
        definition_resolved: item.definitionText,
        term_raw: item.term,
        term_resolved: item.term,
        term_forms: []
      })),
      attribution: []
    };
    return JSON.stringify(payload, null, 2);
  }

  public exportPortalModel(sessionId: string): string {
    const envelope = this.sessions.get(sessionId);
    const payload: PortalModelImportData = {
      contract_version: PORTAL_JSON_CONTRACT_VERSION,
      ...portalImportMetadata(envelope.state, 'model'),
      items: envelope.state.model.items.map(item => ({
        id: item.id,
        type: item.type,
        value: item.value
      }))
    };
    return JSON.stringify(payload, null, 2);
  }

  public importSession(payload: string): SessionHandle {
    const parsed = JSON.parse(payload) as {
      state: SessionState;
    };
    return this.sessions.create(normalizeImportedState(parsed.state), this.contractVersion);
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
