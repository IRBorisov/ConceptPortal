import { RSToolAgent } from './models/rstool-agent';
import { RSToolError } from './models/tool-error';
import type { RSToolAgentOptions } from './models/tool-contract';
import type { PersistedSessionEnvelope } from './session/persistence';

/** Private transport snapshot. It is never exposed as an agent tool or a file path argument. */
export interface ExecutionSnapshot {
  currentSessionId: string | null;
  sessions: PersistedSessionEnvelope[];
}

/** Host-only staging bridge: language operations run on a detached copy, commits stay authoritative. */
export class HostedRSToolAgent extends RSToolAgent {
  private readonly transient: boolean;

  constructor(options: RSToolAgentOptions = {}) {
    super(options);
    this.transient = !options.persistenceDir && !options.sessionLifecycle;
  }

  /** Capture only sessions referenced by one invocation, enforcing normal access/retention hooks. */
  public captureExecutionState(requiredIds: readonly string[] = [], optionalIds: readonly string[] = [], includeCurrent = true): ExecutionSnapshot {
    const currentSessionId = includeCurrent ? this.getCurrentSession()?.sessionId ?? null : this.currentSessionId;
    const required = new Set([...requiredIds, ...(includeCurrent && currentSessionId ? [currentSessionId] : [])]);
    const snapshots = new Map<string, PersistedSessionEnvelope>();
    for (const id of required) {
      const snapshot = this.sessions.findSnapshot(id);
      if (!snapshot) throw new RSToolError('SESSION_NOT_FOUND', `Unknown session: ${id}`);
      snapshots.set(id, snapshot);
    }
    for (const id of optionalIds) {
      if (snapshots.has(id)) continue;
      const snapshot = this.sessions.findSnapshot(id);
      if (snapshot) snapshots.set(id, snapshot);
    }
    return { currentSessionId, sessions: [...snapshots.values()] };
  }

  /** Only a fresh in-memory agent can be seeded; persisted or lifecycle-managed hosts cannot bypass hooks. */
  public seedExecutionState(snapshot: ExecutionSnapshot): void {
    if (!this.transient) throw new Error('Execution seeding requires a transient agent');
    const records = recordsById(snapshot);
    this.sessions.seedTransient([...records.values()]);
    this.currentSessionId = snapshot.currentSessionId;
  }

  /** Capture all detached sessions after a computation, including a newly created import. */
  public completedExecutionState(): ExecutionSnapshot {
    if (!this.transient) throw new Error('Execution export requires a transient agent');
    return { currentSessionId: this.currentSessionId, sessions: this.sessions.cachedSnapshots() };
  }

  /** Release unselected cached models without changing storage or retention clocks. */
  public trimExecutionCache(): void {
    this.sessions.evictCachedExcept(this.currentSessionId ? [this.currentSessionId] : []);
  }

  /** Compare every source before one atomic model commit; timeout or stale results cannot overwrite live state. */
  public commitExecutionState(base: ExecutionSnapshot, next: ExecutionSnapshot): void {
    const original = recordsById(base);
    const completed = recordsById(next);
    if (this.currentSessionId !== base.currentSessionId) {
      throw new Error('Session selection changed during computation; read state before retrying');
    }
    for (const [id, snapshot] of original) {
      if (!completed.has(id) || JSON.stringify(this.sessions.snapshot(id)) !== JSON.stringify(snapshot)) {
        throw new Error('Session changed during computation; read state before retrying');
      }
    }
    if (next.currentSessionId !== base.currentSessionId && (!next.currentSessionId || !completed.has(next.currentSessionId))) {
      throw new Error('Invalid staged session selection');
    }
    const changed = [...completed].filter(([id, snapshot]) => JSON.stringify(original.get(id)) !== JSON.stringify(snapshot));
    if (changed.length > 1) throw new Error('A staged invocation may change only one session');
    if (changed.length) {
      const [id, snapshot] = changed[0];
      const previous = original.get(id);
      if (previous) this.sessions.commitIfUnchanged(id, previous, snapshot);
      else {
        if (this.sessions.findSnapshot(id)) throw new Error('Session appeared during computation; read state before retrying');
        this.sessions.create(snapshot.state, this.contractVersion, snapshot.diagnostics, true);
      }
    }
    if (next.currentSessionId !== base.currentSessionId) {
      if (!next.currentSessionId) throw new Error('A staged invocation cannot clear selection');
      this.setCurrentSession(next.currentSessionId);
    }
  }
}

function recordsById(snapshot: ExecutionSnapshot): Map<string, PersistedSessionEnvelope> {
  const result = new Map<string, PersistedSessionEnvelope>();
  for (const envelope of snapshot.sessions) {
    const id = envelope.state.sessionId;
    if (!id || result.has(id)) throw new Error('Invalid execution snapshot');
    result.set(id, envelope);
  }
  return result;
}
