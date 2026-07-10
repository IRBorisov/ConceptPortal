import { restoreConstituentOrder } from '@rsconcept/domain/library/rsform-api';
import {
  portalDetailsToDrafts,
  portalDetailsToSessionSeed,
  portalSchemaToDrafts,
  portalSchemaToSessionSeed
} from '../mappers/portal-adapter';
import { collectModelDiagnostics, collectSchemaDiagnostics } from '../mappers/diagnostics-collector';
import { ModelAdapter } from '../mappers/model-adapter';
import { SchemaAdapter } from '../mappers/schema-adapter';
import { orderDrafts, reorderSessionItemsByDrafts } from '../session/batch-apply';
import { SessionStore } from '../session/session-store';
import {
  type AgentConstituentaPatch,
  type ApplySchemaPatchInput,
  type ApplySchemaPatchResult,
  type RestoreOrderResult,
  type SessionStateDetail,
  type SessionStateResult,
  type SessionSummary
} from './agent-workflow';
import { type AnalysisResult, type AnalyzeExpressionInput } from './analysis';
import { CstType } from './common';
import {
  type AddOrUpdateConstituentaInput,
  type AddOrUpdateConstituentaResult,
  type ApplyConstituentsInput,
  type ApplyConstituentsResult,
  type ConstituentaDraft,
  type ConstituentaState
} from './constituenta';
import { type Diagnostic, type ListDiagnosticsFilters } from './diagnostic';
import { type EvaluateInput, type EvaluationResult } from './evaluation';
import { detectImportKind, parseImportPayload } from './import-detect';
import { type ExportPortalInput, type ExportPortalResult, type ImportDataKind } from './import-export';
import { type RecalculateModelResult, type SessionModelState, type SetModelValuesInput } from './model-value';
import {
  PORTAL_JSON_CONTRACT_VERSION,
  type PortalModelImportData,
  type PortalRsformDetails,
  type PortalSchemaImportData
} from './portal-json';
import { type SessionHandle, type SessionRevision, type SessionState } from './session';
import { CONTRACT_VERSION, type RSToolAgentContract, type RSToolAgentOptions } from './tool-contract';

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
    kind === 'schema' ? { title: 'Conceptual schema', alias: 'SCHEMA' } : { title: 'Conceptual model', alias: 'MODEL' };
  const title = session.title.trim();
  const alias = session.alias.trim();
  return {
    title: title.length > 0 ? title : defaults.title,
    alias: alias.length > 0 ? alias : defaults.alias,
    description: session.comment.trim()
  };
}

function inferCstType(alias: string): CstType {
  const prefix = alias.trim().charAt(0).toUpperCase();
  switch (prefix) {
    case 'X':
      return CstType.BASE;
    case 'C':
      return CstType.CONSTANT;
    case 'S':
      return CstType.STRUCTURED;
    case 'D':
      return CstType.TERM;
    case 'A':
      return CstType.AXIOM;
    case 'F':
      return CstType.FUNCTION;
    case 'P':
      return CstType.PREDICATE;
    case 'N':
      return CstType.NOMINAL;
    case 'T':
      return CstType.STATEMENT;
    default:
      throw new Error(`Cannot infer cstType from alias "${alias}"; pass cstType explicitly`);
  }
}

/**
 * Agent-facing entry point for incremental RSForm editing, analysis, diagnostics,
 * modeling, and evaluation.
 *
 * Holds in-memory (optionally persisted) sessions and delegates language work
 * to internal schema and model adapters.
 */
export class RSToolAgent implements RSToolAgentContract {
  public readonly contractVersion = CONTRACT_VERSION;
  private readonly sessions: SessionStore;
  private readonly adapter = new SchemaAdapter();
  private readonly evaluation = new ModelAdapter();
  private currentSessionId: string | null;

  /** @param options - Optional persistence directory for session storage. */
  public constructor(options: RSToolAgentOptions = {}) {
    this.sessions = new SessionStore({ persistenceDir: options.persistenceDir });
    this.currentSessionId = this.sessions.loadCurrentSessionId();
  }

  /** @inheritdoc */
  public ensureSession(initial?: Partial<SessionState>): SessionHandle {
    const current = this.getCurrentSession();
    return current ?? this.createSession(initial);
  }

  /** @inheritdoc */
  public createSession(initial?: Partial<SessionState>): SessionHandle {
    return this.trackSession(this.sessions.create(initial, this.contractVersion));
  }

  /** @inheritdoc */
  public getCurrentSession(): SessionHandle | null {
    if (!this.currentSessionId) {
      return null;
    }
    if (!this.sessions.has(this.currentSessionId)) {
      this.currentSessionId = null;
      this.sessions.saveCurrentSessionId(null);
      return null;
    }
    return { sessionId: this.currentSessionId, contractVersion: this.contractVersion };
  }

  /** @inheritdoc */
  public setCurrentSession(sessionId: string): SessionHandle {
    if (!this.sessions.has(sessionId)) {
      throw new Error(`Unknown session: ${sessionId}`);
    }
    return this.trackSession({ sessionId, contractVersion: this.contractVersion });
  }

  /** @inheritdoc */
  public applySchemaPatch(input: ApplySchemaPatchInput, sessionId?: string): ApplySchemaPatchResult {
    const session = sessionId
      ? { sessionId: this.resolveSessionId(sessionId), contractVersion: this.contractVersion }
      : this.ensureSession(input.initial);
    const drafts = this.resolveAgentPatches(session.sessionId, input.items);
    const result = this.applyConstituents(
      {
        drafts,
        mode: input.mode
      },
      session.sessionId
    );
    const revision =
      result.success && input.commitMessage ? this.commitStep(input.commitMessage, session.sessionId) : undefined;
    return {
      ...result,
      session,
      summary: this.buildSessionSummary(session.sessionId),
      revision
    };
  }

  /** @inheritdoc */
  public getSessionState(detail: SessionStateDetail = 'summary', sessionId?: string): SessionStateResult {
    if (detail === 'full') {
      const envelope = this.sessions.get(this.resolveSessionId(sessionId));
      return structuredClone(envelope.state);
    }
    return this.buildSessionSummary(sessionId);
  }

  /** @inheritdoc */
  public listDiagnostics(filters?: ListDiagnosticsFilters, sessionId?: string) {
    return this.sessions.listDiagnostics(this.resolveSessionId(sessionId), filters);
  }

  /** @inheritdoc */
  public analyzeExpression(input: AnalyzeExpressionInput, sessionId?: string): AnalysisResult {
    const id = this.resolveSessionId(sessionId);
    const envelope = this.sessions.get(id);
    const { result, diagnostics } = this.adapter.analyzeAgainstSession(envelope.state, {
      id: -1,
      alias: '_analysis',
      cstType: input.cstType,
      definitionFormal: input.expression
    });
    const sanitizedDiagnostics = diagnostics.map(item => ({ ...item, constituentId: undefined }));
    if (input.recordDiagnostics) {
      this.sessions.setDiagnostics(id, [...collectSchemaDiagnostics(envelope.state), ...sanitizedDiagnostics]);
    }
    return { ...result, diagnostics: sanitizedDiagnostics };
  }

  /** @inheritdoc */
  public commitStep(message?: string, sessionId?: string): SessionRevision {
    return this.sessions.addRevision(this.resolveSessionId(sessionId), message);
  }

  /** @inheritdoc */
  public exportSession(sessionId?: string): string {
    const envelope = this.sessions.get(this.resolveSessionId(sessionId));
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

  /** @inheritdoc */
  public exportPortal(input: ExportPortalInput, sessionId?: string): ExportPortalResult {
    const format = input.format ?? 'json';
    const object =
      input.kind === 'schema' ? this.buildPortalSchemaObject(sessionId) : this.buildPortalModelObject(sessionId);
    return format === 'object' ? object : JSON.stringify(object, null, 2);
  }

  /** @inheritdoc */
  public importData(payload: string | object, kind: ImportDataKind = 'auto'): SessionHandle {
    const parsed = parseImportPayload(payload);
    const resolvedKind = kind === 'auto' ? detectImportKind(parsed) : kind;

    switch (resolvedKind) {
      case 'session':
        return this.importSessionExport(parsed);
      case 'portal-schema':
        return this.importPortalSchemaData(parsed as PortalSchemaImportData);
      case 'portal-details':
        return this.importPortalDetailsData(parsed as PortalRsformDetails);
      default:
        throw new Error(`Unsupported import kind: ${resolvedKind as string}`);
    }
  }

  /** @inheritdoc */
  public async setModelValues(input: SetModelValuesInput, sessionId?: string): Promise<SessionModelState> {
    const id = this.resolveSessionId(sessionId);
    const snapshot = this.sessions.snapshot(id);

    try {
      let state = this.sessions.get(id).state;

      if (input.clear?.length) {
        const model = await this.evaluation.clearConstituentaValues(state, input.clear);
        state = { ...state, model };
        this.sessions.replaceState(id, state);
      }

      if (input.set?.length) {
        state = this.sessions.get(id).state;
        const model = await this.evaluation.setConstituentaValues(state, { items: input.set });
        state = { ...state, model };
        this.sessions.replaceState(id, state);
        this.refreshModelDiagnostics(id);
        return model;
      }

      this.refreshModelDiagnostics(id);
      return structuredClone(this.sessions.get(id).state.model);
    } catch (error) {
      this.sessions.restore(id, snapshot);
      throw error;
    }
  }

  /** @inheritdoc */
  public getModelState(sessionId?: string): SessionModelState {
    const envelope = this.sessions.get(this.resolveSessionId(sessionId));
    return structuredClone(envelope.state.model);
  }

  /** @inheritdoc */
  public evaluate(input: EvaluateInput, sessionId?: string): EvaluationResult {
    const envelope = this.sessions.get(this.resolveSessionId(sessionId));

    if (input.constituentId !== undefined) {
      return this.evaluation.evaluateConstituenta(envelope.state, input.constituentId);
    }

    if (input.expression !== undefined && input.cstType !== undefined) {
      return this.evaluation.evaluateExpression(envelope.state, input.expression, input.cstType);
    }

    throw new Error('evaluate requires constituentId or expression with cstType');
  }

  /** @inheritdoc */
  public recalculateModel(sessionId?: string): RecalculateModelResult {
    const id = this.resolveSessionId(sessionId);
    const envelope = this.sessions.get(id);
    const result = this.evaluation.recalculateModel(envelope.state);
    this.refreshModelDiagnostics(id);
    return result;
  }

  /** @inheritdoc */
  public restoreOrder(sessionId?: string): RestoreOrderResult {
    const id = this.resolveSessionId(sessionId);
    const envelope = this.sessions.get(id);
    const orderable = envelope.state.items.map(item => ({
      id: item.id,
      alias: item.alias,
      cst_type: item.cstType,
      definition_formal: item.definitionFormal
    }));
    const ordered = restoreConstituentOrder(orderable);
    const byId = new Map(envelope.state.items.map(item => [item.id, item]));
    envelope.state.items = ordered.map(item => byId.get(item.id)!);
    envelope.state.updatedAt = new Date().toISOString();
    this.sessions.replaceState(id, envelope.state);
    return {
      orderedIds: ordered.map(item => item.id),
      orderedAliases: ordered.map(item => item.alias)
    };
  }

  private addOrUpdateConstituenta(
    input: AddOrUpdateConstituentaInput,
    sessionId?: string
  ): AddOrUpdateConstituentaResult {
    const id = this.resolveSessionId(sessionId);
    const envelope = this.sessions.get(id);
    const { result, diagnostics } = this.adapter.analyzeAgainstSession(envelope.state, input.draft);
    const state = this.adapter.mergeStateWithDraft(envelope.state, input.draft, result);
    return { state, diagnostics };
  }

  private applyConstituents(input: ApplyConstituentsInput, sessionId?: string): ApplyConstituentsResult {
    const id = this.resolveSessionId(sessionId);
    const mode = input.mode ?? 'atomic';
    const ordered = orderDrafts(this.sessions.get(id).state.items, input.drafts);
    const preBatchItemIds = new Set(this.sessions.get(id).state.items.map(item => item.id));
    const snapshot = this.sessions.snapshot(id);
    const applied: ConstituentaState[] = [];
    const failed: ApplyConstituentsResult['failed'] = [];

    for (const draft of ordered) {
      const result = this.addOrUpdateConstituenta({ draft }, id);
      if (result.state.analysis.success) {
        applied.push(result.state);
        continue;
      }
      failed.push({ draft, diagnostics: result.diagnostics });
      if (mode === 'atomic') {
        this.sessions.restore(id, snapshot);
        return {
          success: false,
          applied: [],
          failed,
          diagnostics: this.sessions.listDiagnostics(id)
        };
      }
    }

    const envelope = this.sessions.get(id);
    reorderSessionItemsByDrafts(envelope.state.items, input.drafts, preBatchItemIds);
    this.sessions.replaceState(id, envelope.state);
    this.refreshDiagnostics(id);

    return {
      success: failed.length === 0,
      applied,
      failed,
      diagnostics: this.sessions.listDiagnostics(id)
    };
  }

  private buildSessionSummary(sessionId?: string): SessionSummary {
    const id = this.resolveSessionId(sessionId);
    const envelope = this.sessions.get(id);
    const diagnostics = this.sessions.listDiagnostics(id);
    return {
      sessionId: id,
      contractVersion: this.contractVersion,
      alias: envelope.state.alias,
      title: envelope.state.title,
      comment: envelope.state.comment,
      itemCount: envelope.state.items.length,
      modelItemCount: envelope.state.model.items.length,
      diagnosticsCount: diagnostics.length,
      items: envelope.state.items.map(item => ({
        id: item.id,
        alias: item.alias,
        cstType: item.cstType,
        analysisSuccess: item.analysis.success
      })),
      diagnostics,
      lastRevision: envelope.state.revisions.at(-1)
    };
  }

  private buildPortalSchemaObject(sessionId?: string): PortalSchemaImportData {
    const envelope = this.sessions.get(this.resolveSessionId(sessionId));
    return {
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
  }

  private buildPortalModelObject(sessionId?: string): PortalModelImportData {
    const envelope = this.sessions.get(this.resolveSessionId(sessionId));
    return {
      contract_version: PORTAL_JSON_CONTRACT_VERSION,
      ...portalImportMetadata(envelope.state, 'model'),
      items: envelope.state.model.items.map(item => ({
        id: item.id,
        type: item.type,
        value: item.value
      }))
    };
  }

  private importSessionExport(parsed: unknown): SessionHandle {
    if (!parsed || typeof parsed !== 'object' || !('state' in parsed)) {
      throw new Error('Invalid session export payload');
    }
    const data = parsed as {
      state: SessionState;
      diagnostics?: Diagnostic[];
    };
    const handle = this.sessions.create(normalizeImportedState(data.state), this.contractVersion);
    if (data.diagnostics?.length) {
      this.sessions.setDiagnostics(handle.sessionId, data.diagnostics);
    } else {
      this.refreshDiagnostics(handle.sessionId);
    }
    return this.trackSession(handle);
  }

  private importPortalSchemaData(data: PortalSchemaImportData): SessionHandle {
    const handle = this.createSession(portalSchemaToSessionSeed(data));
    this.applyConstituents({ drafts: portalSchemaToDrafts(data), mode: 'best_effort' }, handle.sessionId);
    return handle;
  }

  private importPortalDetailsData(data: PortalRsformDetails): SessionHandle {
    const handle = this.createSession(portalDetailsToSessionSeed(data));
    this.applyConstituents({ drafts: portalDetailsToDrafts(data), mode: 'best_effort' }, handle.sessionId);
    return handle;
  }

  private resolveAgentPatches(sessionId: string, patches: AgentConstituentaPatch[]): ConstituentaDraft[] {
    const items = this.sessions.get(sessionId).state.items;
    const existingByAlias = new Map(items.map(item => [item.alias, item]));
    const usedIds = new Set(items.map(item => item.id));
    let nextId = items.reduce((max, item) => Math.max(max, item.id), 0) + 1;

    const reserveId = (id: number): void => {
      usedIds.add(id);
      if (id >= nextId) {
        nextId = id + 1;
      }
    };

    const allocateId = (): number => {
      while (usedIds.has(nextId)) {
        nextId += 1;
      }
      const id = nextId;
      nextId += 1;
      usedIds.add(id);
      return id;
    };

    return patches.map(patch => {
      const existing = existingByAlias.get(patch.alias);
      let id: number;
      if (patch.id !== undefined) {
        id = patch.id;
        reserveId(id);
      } else if (existing !== undefined) {
        id = existing.id;
      } else {
        id = allocateId();
      }
      const draft = {
        id,
        alias: patch.alias,
        cstType: patch.cstType ?? existing?.cstType ?? inferCstType(patch.alias),
        definitionFormal: patch.definitionFormal ?? existing?.definitionFormal ?? '',
        term: patch.term ?? existing?.term ?? '',
        definitionText: patch.definitionText ?? existing?.definitionText ?? '',
        convention: patch.convention ?? existing?.convention ?? ''
      };
      existingByAlias.set(patch.alias, {
        ...draft,
        analysis: existing?.analysis ?? { success: true, type: null, valueClass: 'value', diagnostics: [] }
      });
      return draft;
    });
  }

  private resolveSessionId(sessionId?: string): string {
    const id = sessionId ?? this.currentSessionId;
    if (!id) {
      return this.createSession().sessionId;
    }
    if (!this.sessions.has(id)) {
      if (sessionId) {
        throw new Error(`Unknown session: ${sessionId}`);
      }
      return this.createSession().sessionId;
    }
    return id;
  }

  private trackSession(handle: SessionHandle): SessionHandle {
    this.currentSessionId = handle.sessionId;
    this.sessions.saveCurrentSessionId(handle.sessionId);
    return handle;
  }

  private refreshDiagnostics(sessionId: string): void {
    const envelope = this.sessions.get(sessionId);
    this.sessions.setDiagnostics(sessionId, collectSchemaDiagnostics(envelope.state));
  }

  private refreshModelDiagnostics(sessionId: string): void {
    const envelope = this.sessions.get(sessionId);
    this.sessions.setDiagnostics(sessionId, [
      ...collectSchemaDiagnostics(envelope.state),
      ...collectModelDiagnostics(envelope.state)
    ]);
  }
}
