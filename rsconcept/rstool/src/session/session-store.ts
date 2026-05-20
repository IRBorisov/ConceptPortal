import { randomUUID } from 'node:crypto';

import {
  type DiagnosticRecord,
  type ListDiagnosticsFilters,
  type SessionHandle,
  type SessionRevision,
  type SessionState
} from '../contracts/tool-contract';

interface SessionEnvelope {
  state: SessionState;
  diagnostics: DiagnosticRecord[];
}

export class SessionStore {
  private sessions = new Map<string, SessionEnvelope>();

  public create(initial?: Partial<SessionState>, contractVersion?: string): SessionHandle {
    const now = new Date().toISOString();
    const sessionId = initial?.sessionId ?? randomUUID();
    const state: SessionState = {
      sessionId,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
      revisions: initial?.revisions ?? [],
      items: initial?.items ?? [],
      model: initial?.model ?? { items: [] }
    };
    this.sessions.set(sessionId, {
      state,
      diagnostics: []
    });
    return {
      sessionId,
      contractVersion: contractVersion ?? '1.0.0'
    };
  }

  public get(sessionId: string): SessionEnvelope {
    const found = this.sessions.get(sessionId);
    if (!found) {
      throw new Error(`Unknown session: ${sessionId}`);
    }
    return found;
  }

  public replaceState(sessionId: string, nextState: SessionState): void {
    const found = this.get(sessionId);
    found.state = {
      ...nextState,
      updatedAt: new Date().toISOString()
    };
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
    return revision;
  }

  public appendDiagnostics(sessionId: string, records: DiagnosticRecord[]): void {
    const found = this.get(sessionId);
    found.diagnostics.push(...records);
    found.state.updatedAt = new Date().toISOString();
  }

  public listDiagnostics(sessionId: string, filters?: ListDiagnosticsFilters): DiagnosticRecord[] {
    const found = this.get(sessionId);
    if (!filters?.constituentId) {
      return [...found.diagnostics];
    }
    return found.diagnostics.filter(record => record.constituentId === filters.constituentId);
  }
}
