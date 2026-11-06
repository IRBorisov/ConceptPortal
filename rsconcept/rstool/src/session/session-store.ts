import { randomUUID } from 'node:crypto';

import {
  CONTRACT_VERSION,
  type Diagnostic,
  type ListDiagnosticsFilters,
  type SessionHandle,
  type SessionRevision,
  type SessionState,
  type RSToolAgentOptions
} from '../models';
import { SessionPersistence, type PersistedSessionEnvelope } from './persistence';

export interface SessionStoreOptions {
  persistenceDir?: string;
  sessionLifecycle?: RSToolAgentOptions['sessionLifecycle'];
}

interface SessionEnvelope {
  state: SessionState;
  diagnostics: Diagnostic[];
}

export class SessionStore {
  private sessions = new Map<string, SessionEnvelope>();
  private readonly persistence: SessionPersistence | null;
  private readonly transactions = new Set<string>();

  private readonly options: SessionStoreOptions;

  public constructor(options: SessionStoreOptions = {}) {
    this.options = options;
    this.persistence = options.persistenceDir ? new SessionPersistence(options.persistenceDir) : null;
    options.sessionLifecycle?.onEviction?.(sessionId => { this.sessions.delete(sessionId); });
  }

  public create(initial?: Partial<SessionState>, contractVersion?: string, diagnostics: Diagnostic[] = []): SessionHandle {
    const now = new Date().toISOString();
    const sessionId = initial?.sessionId ?? randomUUID();
    const state: SessionState = {
      sessionId,
      alias: initial?.alias ?? '',
      title: initial?.title ?? '',
      comment: initial?.comment ?? '',
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
      revisions: initial?.revisions ?? [],
      items: initial?.items ?? [],
      attribution: initial?.attribution ?? [],
      model: initial?.model ?? { items: [] }
    };
    const envelope: SessionEnvelope = {
      state,
      diagnostics
    };
    const committed = structuredClone(envelope);
    this.options.sessionLifecycle?.beforeCreate(sessionId);
    this.persist(sessionId, committed);
    this.sessions.set(sessionId, committed);
    this.options.sessionLifecycle?.created(sessionId);
    return {
      sessionId,
      contractVersion: contractVersion ?? CONTRACT_VERSION
    };
  }

  public get(sessionId: string): SessionEnvelope {
    this.options.sessionLifecycle?.access(sessionId);
    const found = this.sessions.get(sessionId) ?? this.loadFromDisk(sessionId);
    if (!found) {
      throw new Error(`Unknown session: ${sessionId}`);
    }
    return found;
  }

  public has(sessionId: string): boolean {
    this.options.sessionLifecycle?.access(sessionId);
    if (this.sessions.has(sessionId)) {
      return true;
    }
    if (!this.persistence) {
      return false;
    }
    return this.persistence.load(sessionId) !== null;
  }

  public replaceState(sessionId: string, nextState: SessionState): void {
    this.transaction(sessionId, () => {
      const found = this.get(sessionId);
      found.state = {
        ...nextState,
        updatedAt: new Date().toISOString()
      };
      this.persist(sessionId, found);
    });
  }

  public addRevision(sessionId: string, message?: string): SessionRevision {
    return this.transaction(sessionId, () => {
      const found = this.get(sessionId);
      const revision: SessionRevision = {
        revisionId: randomUUID(),
        at: new Date().toISOString(),
        message
      };
      found.state.revisions.push(revision);
      found.state.updatedAt = revision.at;
      this.persist(sessionId, found);
      return revision;
    });
  }

  /** Replace active diagnostics for one constituent (or scratch when constituentId is undefined). */
  public replaceDiagnosticsForConstituent(
    sessionId: string,
    constituentId: number | undefined,
    records: Diagnostic[]
  ): void {
    this.transaction(sessionId, () => {
      const found = this.get(sessionId);
      found.diagnostics = found.diagnostics.filter(record => record.constituentId !== constituentId);
      found.diagnostics.push(...records);
      found.state.updatedAt = new Date().toISOString();
      this.persist(sessionId, found);
    });
  }

  public setDiagnostics(sessionId: string, records: Diagnostic[]): void {
    this.transaction(sessionId, () => {
      const found = this.get(sessionId);
      found.diagnostics = [...records];
      found.state.updatedAt = new Date().toISOString();
      this.persist(sessionId, found);
    });
  }

  public listDiagnostics(sessionId: string, filters?: ListDiagnosticsFilters): Diagnostic[] {
    const found = this.get(sessionId);
    let records = found.diagnostics;
    if (filters?.kind !== undefined) {
      records = records.filter(record => record.kind === filters.kind);
    }
    if (filters?.severity !== undefined) {
      records = records.filter(record => record.severity === filters.severity);
    }
    if (filters?.constituentId === undefined) {
      return structuredClone(records);
    }
    return structuredClone(records.filter(record => record.constituentId === filters.constituentId));
  }

  public snapshot(sessionId: string): SessionEnvelope {
    const found = this.get(sessionId);
    return structuredClone(found);
  }

  public restore(sessionId: string, snapshot: SessionEnvelope): void {
    this.transaction(sessionId, () => {
      this.sessions.set(sessionId, structuredClone(snapshot));
    });
  }

  /** Stage synchronous changes and publish one detached envelope only after its save succeeds. */
  public transaction<T>(sessionId: string, action: () => T): T {
    if (this.transactions.has(sessionId)) return action();
    const original = this.get(sessionId);
    this.sessions.set(sessionId, structuredClone(original));
    this.transactions.add(sessionId);
    try {
      const result = action();
      const committed = structuredClone(this.get(sessionId));
      this.persistence?.save(sessionId, committed);
      this.sessions.set(sessionId, committed);
      return result;
    } catch (error) {
      this.sessions.set(sessionId, original);
      throw error;
    } finally {
      this.transactions.delete(sessionId);
    }
  }

  /** Reject stale async drafts without restoring over a newer committed session. */
  public commitIfUnchanged(sessionId: string, base: SessionEnvelope, next: SessionEnvelope): void {
    if (JSON.stringify(this.get(sessionId)) !== JSON.stringify(base)) {
      throw new Error('Session changed during model update; read the current state and retry');
    }
    this.restore(sessionId, next);
  }

  public saveCurrentSessionId(sessionId: string | null): void {
    this.persistence?.saveCurrentSessionId(sessionId);
  }

  public loadCurrentSessionId(): string | null {
    return this.persistence?.loadCurrentSessionId() ?? null;
  }

  private loadFromDisk(sessionId: string): SessionEnvelope | null {
    const loaded = this.persistence?.load(sessionId);
    if (!loaded) {
      return null;
    }
    this.sessions.set(sessionId, loaded);
    return loaded;
  }

  private persist(sessionId: string, envelope: SessionEnvelope): void {
    if (!this.transactions.has(sessionId)) this.persistence?.save(sessionId, envelope as PersistedSessionEnvelope);
  }
}
