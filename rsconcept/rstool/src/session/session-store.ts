import { randomUUID } from 'node:crypto';

import {
  CONTRACT_VERSION,
  type Diagnostic,
  type ListDiagnosticsFilters,
  type SessionHandle,
  type SessionRevision,
  type SessionState
} from '../models';
import { SessionPersistence, type PersistedSessionEnvelope } from './persistence';

export interface SessionStoreOptions {
  persistenceDir?: string;
}

interface SessionEnvelope {
  state: SessionState;
  diagnostics: Diagnostic[];
}

export class SessionStore {
  private sessions = new Map<string, SessionEnvelope>();
  private readonly persistence: SessionPersistence | null;

  public constructor(options: SessionStoreOptions = {}) {
    this.persistence = options.persistenceDir ? new SessionPersistence(options.persistenceDir) : null;
  }

  public create(initial?: Partial<SessionState>, contractVersion?: string): SessionHandle {
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
      model: initial?.model ?? { items: [] }
    };
    const envelope: SessionEnvelope = {
      state,
      diagnostics: []
    };
    this.sessions.set(sessionId, envelope);
    this.persist(sessionId, envelope);
    return {
      sessionId,
      contractVersion: contractVersion ?? CONTRACT_VERSION
    };
  }

  public get(sessionId: string): SessionEnvelope {
    const found = this.sessions.get(sessionId) ?? this.loadFromDisk(sessionId);
    if (!found) {
      throw new Error(`Unknown session: ${sessionId}`);
    }
    return found;
  }

  public has(sessionId: string): boolean {
    if (this.sessions.has(sessionId)) {
      return true;
    }
    if (!this.persistence) {
      return false;
    }
    return this.persistence.load(sessionId) !== null;
  }

  public replaceState(sessionId: string, nextState: SessionState): void {
    const found = this.get(sessionId);
    found.state = {
      ...nextState,
      updatedAt: new Date().toISOString()
    };
    this.persist(sessionId, found);
  }

  public addRevision(sessionId: string, message?: string): SessionRevision {
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
  }

  /** Replace active diagnostics for one constituent (or scratch when constituentId is undefined). */
  public replaceDiagnosticsForConstituent(
    sessionId: string,
    constituentId: number | undefined,
    records: Diagnostic[]
  ): void {
    const found = this.get(sessionId);
    found.diagnostics = found.diagnostics.filter(record => record.constituentId !== constituentId);
    found.diagnostics.push(...records);
    found.state.updatedAt = new Date().toISOString();
    this.persist(sessionId, found);
  }

  public setDiagnostics(sessionId: string, records: Diagnostic[]): void {
    const found = this.get(sessionId);
    found.diagnostics = [...records];
    found.state.updatedAt = new Date().toISOString();
    this.persist(sessionId, found);
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
      return [...records];
    }
    return records.filter(record => record.constituentId === filters.constituentId);
  }

  public snapshot(sessionId: string): SessionEnvelope {
    const found = this.get(sessionId);
    return structuredClone(found);
  }

  public restore(sessionId: string, snapshot: SessionEnvelope): void {
    this.sessions.set(sessionId, structuredClone(snapshot));
    this.persist(sessionId, this.sessions.get(sessionId)!);
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
    this.persistence?.save(sessionId, envelope as PersistedSessionEnvelope);
  }
}
