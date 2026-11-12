import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs';
import { join, dirname, relative, isAbsolute, resolve } from 'node:path';

/** A safe, machine-readable storage failure for authenticated MCP callers. */
export class SessionStorageError extends Error {
  public readonly code: string;
  public readonly details: Record<string, number>;
  constructor(code: string, message: string, details: Record<string, number> = {}) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

interface Owner { account: string; workspace?: string }
interface Stamp { lastUsed: number; generation: string }
interface Invocation { count: number; started: number; accessed: Map<string, Stamp & { persisted: number }> }
interface CatalogRecord {
  namespace: string; id: string; path: string; stamp: Stamp; current: boolean;
  workspace?: string; connected: boolean; busy: boolean;
}


/** Single-process account-wide quota and inactivity retention, independent of transport leases. */
export class SessionPolicy {
  private readonly busy = new Map<string, Invocation>();

  private readonly evictions = new Map<string, (id: string) => void>();
  private readonly root: string;
  readonly limit: number;
  readonly retentionMs: number;
  readonly maxSessionBytes: number;
  private readonly now: () => number;
  private readonly expired: (namespace: string) => void;

  constructor(root: string, limit = 20, retentionMs = 30 * 86400_000,
    now: () => number = Date.now, expired: (namespace: string) => void = () => {}, maxSessionBytes = 2 * 1024 * 1024) {
    this.root = root;
    this.limit = limit;
    this.retentionMs = retentionMs;
    this.maxSessionBytes = maxSessionBytes;
    if (!Number.isSafeInteger(maxSessionBytes) || maxSessionBytes <= 0) throw new Error('maxSessionBytes must be a positive safe integer');
    this.now = now;
    this.expired = expired;
    if (!Number.isSafeInteger(limit) || limit <= 0 || !Number.isSafeInteger(retentionMs) || retentionMs <= 0) {
      throw new Error('Stored session limit and retention must be positive safe integers');
    }
    if (!Number.isFinite(new Date(now() + retentionMs).getTime())) throw new Error('Session retention produces an invalid expiry timestamp');
    this.directory(root);
  }

  /** Bind a verified workspace to an account and give legacy sessions a full initial retention period. */
  register(subject: string, namespace: string, workspaceName?: string): number {
    if (workspaceName !== undefined && (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(workspaceName) ||
      hash(JSON.stringify([subject, workspaceName])) !== namespace)) throw unavailable();
    const directory = this.workspace(namespace);
    this.directory(directory);
    this.directory(join(directory, '.lifecycle'));
    this.directory(join(directory, '.lifecycle', 'sessions'));
    const account = hash(subject);
    const owner = this.owner(namespace);
    if (owner && owner.account !== account) throw unavailable();
    if (owner?.workspace && workspaceName && owner.workspace !== workspaceName) throw unavailable();
    if (!owner || (workspaceName && !owner.workspace)) this.write(this.ownerPath(namespace), { account, workspace: workspaceName });
    const files = this.files(namespace);
    for (const file of files) this.stamp(namespace, file.id);
    return files.length;
  }

  /** Pin an entire invocation so background cleanup never deletes state underneath async work. */
  begin(namespace: string): () => void {
    const existing = this.busy.get(namespace);
    this.busy.set(namespace, existing ? { ...existing, count: existing.count + 1 }
      : { count: 1, started: this.now(), accessed: new Map() });
    return () => {
      const pin = this.busy.get(namespace);
      if (!pin) return;
      if (pin.count > 1) { this.busy.set(namespace, { ...pin, count: pin.count - 1 }); return; }
      try {
        for (const [id, stamp] of pin.accessed) {
          if (stamp.lastUsed !== stamp.persisted) this.write(this.stampPath(namespace, id), { lastUsed: stamp.lastUsed, generation: stamp.generation });
        }
      } finally { this.busy.delete(namespace); }
    };
  }

  /** Effective safe configuration and this account's usage, without renewing or removing sessions. */
  configuration(subject: string, cleanupIntervalMs = 60_000) {
    const limits = { maxSessionsPerAccount: this.limit, retentionSeconds: this.retentionMs / 1000,
      cleanupIntervalSeconds: cleanupIntervalMs / 1000, maxSessionBytes: this.maxSessionBytes, scope: 'account' as const };
    try {
      const catalog = this.catalog(subject);
      return { limits, serverTime: new Date(this.now()).toISOString(), usage: {
        status: catalog.complete ? 'complete' as const : 'migration_required' as const,
        storedSessions: catalog.entries.length,
        availableSlots: catalog.complete ? Math.max(0, this.limit - catalog.entries.length) : null,
        expiredAwaitingCleanup: catalog.entries.filter(item => item.stamp.lastUsed + this.retentionMs <= this.now() && !item.busy).length,
        errorCode: catalog.complete ? null : 'SESSION_STORAGE_MIGRATION_REQUIRED'
      } };
    } catch {
      return { limits, serverTime: new Date(this.now()).toISOString(), usage: {
        status: 'unavailable' as const, storedSessions: null, availableSlots: null, expiredAwaitingCleanup: null,
        errorCode: 'SESSION_STORAGE_UNAVAILABLE'
      } };
    }
  }

  /** Bounded oldest-first account metadata. Listing itself never touches the inactivity clock. */
  list(subject: string, callerNamespace: string, limit = 20, cursor?: string) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new SessionStorageError('INVALID_SESSION_PAGE', 'Page size must be an integer between 1 and 100.');
    }
    const catalog = this.catalog(subject);
    const entries = catalog.entries.sort((a, b) => a.stamp.lastUsed - b.stamp.lastUsed ||
      compare(a.namespace, b.namespace) || compare(a.id, b.id));
    const snapshot = hash(JSON.stringify(entries.map(item =>
      [item.namespace, item.id, item.stamp.lastUsed, item.stamp.generation, item.current])));
    let offset = 0;
    if (cursor !== undefined) {
      const parsed = decode(cursor, 'INVALID_SESSION_CURSOR');
      if (!Array.isArray(parsed) || parsed.length !== 2 || typeof parsed[0] !== 'string' || typeof parsed[1] !== 'string') {
        throw new SessionStorageError('INVALID_SESSION_CURSOR', 'Use a nextCursor returned by list_stored_sessions.');
      }
      if (parsed[0] !== snapshot) throw new SessionStorageError('SESSION_LIST_CHANGED',
        'Stored sessions changed while paging. Call list_stored_sessions again without a cursor.');
      const found = entries.findIndex(item => reference(item.namespace, item.id) === parsed[1]);
      if (found < 0) throw new SessionStorageError('INVALID_SESSION_CURSOR', 'Use a nextCursor returned by list_stored_sessions.');
      offset = found + 1;
    }
    const selected = entries.slice(offset, offset + limit);
    const items = selected.map(item => this.summary(item, callerNamespace));
    const last = selected.at(-1);
    return { serverTime: new Date(this.now()).toISOString(), total: entries.length,
      usageComplete: catalog.complete, migrationRequired: !catalog.complete, items,
      nextCursor: last && offset + selected.length < entries.length
        ? encode([snapshot, reference(last.namespace, last.id)]) : null };
  }

  /** Explicit compare-and-delete. Authentication, busy state and revision are checked before unlink. */
  delete(subject: string, sessionRef: string, expectedRevision: string, confirm: boolean, allowCurrent = false) {
    if (confirm !== true) throw new SessionStorageError('SESSION_DELETE_CONFIRMATION_REQUIRED',
      'Deletion is destructive. Select a session from list_stored_sessions and explicitly set confirm=true.');
    const parsed = decode(sessionRef, 'INVALID_SESSION_REFERENCE');
    if (!Array.isArray(parsed) || parsed.length !== 2 || typeof parsed[0] !== 'string' ||
      !/^[a-f0-9]{64}$/.test(parsed[0]) || typeof parsed[1] !== 'string' || !parsed[1] || parsed[1].length > 512 ||
      typeof expectedRevision !== 'string' || !/^[a-f0-9]{64}$/.test(expectedRevision)) {
      throw new SessionStorageError('INVALID_SESSION_REFERENCE', 'Use the exact sessionRef and revision returned by list_stored_sessions.');
    }
    const [namespace, id] = parsed;
    let owner: Owner | null;
    try { owner = this.owner(namespace); } catch { throw missing(); }
    if (!owner || owner.account !== hash(subject)) throw missing();
    if (this.busy.has(namespace)) throw new SessionStorageError('SESSION_BUSY',
      'The target workspace has an in-flight model operation. Wait, then refresh list_stored_sessions.');
    const file = this.files(namespace).find(item => item.id === id);
    if (!file) throw missing();
    const record = this.record(namespace, file, owner);
    const bytes = this.revisionBytes(file.path);
    if (this.revision(record, bytes) !== expectedRevision) throw new SessionStorageError('SESSION_CHANGED',
      'The selected session changed or was used since listing. Refresh list_stored_sessions before deleting.');
    if (record.current && allowCurrent !== true) throw new SessionStorageError('SESSION_IS_CURRENT',
      'The session is selected in its workspace. Set allowCurrent=true only when you intend to discard that selection.');
    const cleanupWarnings = this.remove(namespace, file);
    if (!cleanupWarnings.length) {
      try { this.pruneEmpty(namespace); }
      catch { cleanupWarnings.push('SESSION_WORKSPACE_CLEANUP_PENDING'); }
    }
    return { deleted: true, sessionId: id, workspaceId: namespace, freedSlots: 1,
      currentSelectionCleared: record.current && !cleanupWarnings.includes('SESSION_CACHE_CLEANUP_PENDING'),
      workspacePublicationsInvalidated: !cleanupWarnings.includes('SESSION_PUBLICATION_CLEANUP_PENDING'),
      cleanupWarnings, recovery: cleanupWarnings.length ?
        'The session was deleted and its slot freed. Do not delete another session to compensate. Check get_session_storage_config and contact the administrator if cleanup warnings persist.' : null,
      usage: this.configuration(subject).usage };
  }

  /** Account discovery reads foreign owners only, never their model payloads or activity metadata. */
  private catalog(subject: string): { entries: CatalogRecord[]; complete: boolean } {
    const account = hash(subject);
    const entries: CatalogRecord[] = [];
    let complete = true;
    for (const namespace of this.namespaces()) {
      const owner = this.owner(namespace);
      if (!owner) { if (this.files(namespace).length) complete = false; continue; }
      if (owner.account !== account) continue;
      for (const file of this.files(namespace)) entries.push(this.record(namespace, file, owner));
    }
    return { entries, complete };
  }

  private record(namespace: string, file: { id: string; path: string }, owner: Owner): CatalogRecord {
    const persisted = this.stamp(namespace, file.id, false);
    const accessed = this.busy.get(namespace)?.accessed.get(file.id);
    const stamp = accessed ? { lastUsed: accessed.lastUsed, generation: accessed.generation } : persisted;
    return { namespace, id: file.id, path: file.path, stamp, workspace: owner.workspace,
      current: this.read(join(this.workspace(namespace), '_current.json'))?.sessionId === file.id,
      connected: this.evictions.has(namespace), busy: this.busy.has(namespace) };
  }

  private revision(record: CatalogRecord, bytes: Buffer): string {
    return createHash('sha256').update(JSON.stringify([record.namespace, record.id, record.stamp.generation,
      record.stamp.lastUsed, record.current, record.busy])).update(bytes).digest('hex');
  }

  /** Oversized legacy models remain listable/deletable without loading their payload. */
  private revisionBytes(file: string): Buffer {
    const info = this.guard(() => fs.statSync(file));
    return info.size <= this.maxSessionBytes ? this.guard(() => fs.readFileSync(file))
      : Buffer.from(JSON.stringify(['oversize', info.dev, info.ino, info.size, info.mtimeMs, info.ctimeMs]));
  }

  private summary(record: CatalogRecord, callerNamespace: string) {
    const oversized = this.guard(() => fs.statSync(record.path)).size > this.maxSessionBytes;
    const bytes = this.revisionBytes(record.path);
    let state: Record<string, unknown> = {};
    let readable = true;
    try {
      if (oversized) throw unavailable();
      const payload: unknown = JSON.parse(bytes.toString('utf8'));
      if (!payload || typeof payload !== 'object' || !('state' in payload) || !payload.state ||
        typeof payload.state !== 'object' || Array.isArray(payload.state)) throw unavailable();
      state = payload.state as Record<string, unknown>;
    } catch { readable = false; }
    const title = clipped(state.title, 200);
    const alias = clipped(state.alias, 100);
    return { sessionRef: reference(record.namespace, record.id), sessionId: record.id,
      workspaceId: record.namespace, workspace: record.workspace ?? null, callerWorkspace: record.namespace === callerNamespace,
      title: title.value, titleTruncated: title.truncated, alias: alias.value, aliasTruncated: alias.truncated,
      readable, overSizeLimit: oversized, itemCount: Array.isArray(state.items) ? state.items.length : null,
      lastUsedAt: new Date(record.stamp.lastUsed).toISOString(),
      expiresAt: new Date(record.stamp.lastUsed + this.retentionMs).toISOString(),
      current: record.current, connected: record.connected, busy: record.busy,
      deletionAllowed: !record.busy, requiresAllowCurrent: record.current,
      revision: this.revision(record, bytes) };
  }

  /** Supply rstool's synchronous storage hooks; no language state is inspected or modified. */
  hooks(subject: string, namespace: string) {
    const account = hash(subject);
    return {
      beforeCreate: (id: string) => this.guard(() => {
        if (typeof id !== 'string' || !id || Buffer.byteLength(id, 'utf8') > 250) {
          throw new SessionStorageError('INVALID_SESSION_ID', 'Hosted session IDs must contain at most 250 UTF-8 bytes.');
        }
        const failures = this.sweep(namespace);
        for (const [failed, error] of failures) {
          const owner = this.owner(failed);
          if (!owner || owner.account === account) throw error;
        }
        if (this.files(namespace).some(file => file.id === id)) {
          this.access(namespace, id);
          return;
        }
        // Legacy hashes do not encode a recoverable owner. Do not silently undercount them.
        if (this.namespaces().some(ns => !this.owner(ns) && this.files(ns).length)) {
          throw new SessionStorageError('SESSION_STORAGE_MIGRATION_REQUIRED',
            'Existing workspace ownership must be indexed before creating sessions. Contact the administrator.');
        }
        let count = 0;
        let earliest = Infinity;
        for (const ns of this.namespaces()) {
          if (this.owner(ns)?.account !== account) continue;
          for (const file of this.files(ns)) {
            count++;
            earliest = Math.min(earliest, this.stamp(ns, file.id).lastUsed + this.retentionMs);
          }
        }
        if (count >= this.limit) throw new SessionStorageError('SESSION_LIMIT_REACHED',
          'Stored session limit reached. Call get_session_storage_config and list_stored_sessions; reuse a session or explicitly delete an unneeded one with delete_stored_session.',
          { limit: this.limit, count, retryAfterSeconds: Math.max(1, Math.ceil((earliest - this.now()) / 1000)) });
      }),
      created: (id: string) => {
        const now = this.now();
        const generation = randomUUID();
        this.write(this.stampPath(namespace, id), { lastUsed: now, generation });
        this.busy.get(namespace)?.accessed.set(id, { persisted: now, lastUsed: now, generation });
      },
      access: (id: string) => this.access(namespace, id),
      beforeWrite: (_id: string, bytes: number) => {
        if (bytes > this.maxSessionBytes) throw new SessionStorageError('SESSION_TOO_LARGE',
          'Session exceeds the configured serialized byte limit. Reduce the model before retrying.', { limit: this.maxSessionBytes });
      },
      onEviction: (evict: (id: string) => void) => { this.evictions.set(namespace, evict); },
    };
  }

  /** Release host cache callbacks when their exclusive transport lease closes. */
  release(namespace: string): void { this.evictions.delete(namespace); }

  /** Reclaim only expired regular session files in indexed, inactive workspaces. */
  sweep(creatingNamespace?: string): Map<string, SessionStorageError> {
    const failures = new Map<string, SessionStorageError>();
    for (const namespace of this.namespaces()) {
      try {
        if ((this.busy.has(namespace) && namespace !== creatingNamespace) || !this.owner(namespace)) continue;
        for (const file of this.files(namespace)) {
          if (this.busy.get(namespace)?.accessed.has(file.id)) continue;
          if (this.stamp(namespace, file.id).lastUsed + this.retentionMs <= this.now()) this.remove(namespace, file);
        }
        this.cleanOrphanStamps(namespace);
        try { this.pruneEmpty(namespace); }
        catch { process.stderr.write('rstool-mcp empty workspace cleanup pending\n'); }
      } catch { failures.set(namespace, unavailable()); }
    }
    return failures;
  }

  /** Remove only known metadata from an empty, disconnected workspace; never recurse into user data. */
  pruneEmpty(namespace: string): boolean {
    if (this.busy.has(namespace) || this.evictions.has(namespace)) return false;
    return this.guard(() => {
      const directory = this.workspace(namespace);
      if (!fs.existsSync(directory)) return false;
      this.assertDirectory(directory);
      const entries = fs.readdirSync(directory, { withFileTypes: true });
      if (entries.some(entry => !['_current.json', '.lifecycle'].includes(entry.name))) return false;
      const pointerPath = join(directory, '_current.json');
      const pointer = this.read(pointerPath);
      if (pointer && pointer.sessionId !== null) return false;
      const metadata = join(directory, '.lifecycle');
      if (fs.existsSync(metadata)) {
        this.assertDirectory(metadata);
        const metadataEntries = fs.readdirSync(metadata, { withFileTypes: true });
        if (metadataEntries.some(entry => !['owner.json', 'sessions'].includes(entry.name))) return false;
        if (!this.owner(namespace)) return false;
        const stamps = join(metadata, 'sessions');
        if (fs.existsSync(stamps)) {
          this.assertDirectory(stamps);
          if (fs.readdirSync(stamps).length) return false;
          fs.rmdirSync(stamps);
        }
        fs.unlinkSync(this.ownerPath(namespace));
        fs.rmdirSync(metadata);
      }
      if (pointer) fs.unlinkSync(pointerPath);
      fs.rmdirSync(directory);
      return true;
    });
  }

  /** Publication cannot borrow an older invocation pin or renew an already-expired source. */
  assertRetained(namespace: string, id: string): void {
    if (!this.files(namespace).some(file => file.id === id)) {
      throw new SessionStorageError('SESSION_NOT_FOUND_OR_EXPIRED', 'Publication source is no longer available.');
    }
    const lastUsed = this.busy.get(namespace)?.accessed.get(id)?.lastUsed ?? this.stamp(namespace, id).lastUsed;
    if (lastUsed + this.retentionMs <= this.now()) {
      this.expired(namespace);
      throw new SessionStorageError('SESSION_EXPIRED', 'Publication source session expired. Prepare a new session.');
    }
  }

  /** Validate cached as well as disk-backed access and renew the inactivity clock. */
  private access(namespace: string, id: string): void {
    const file = this.files(namespace).find(candidate => candidate.id === id);
    if (file && this.guard(() => fs.statSync(file.path)).size > this.maxSessionBytes) {
      throw new SessionStorageError('SESSION_TOO_LARGE',
        'Session exceeds the configured byte limit. Export it offline or explicitly delete it using a fresh list.', { limit: this.maxSessionBytes });
    }
    const pin = this.busy.get(namespace);
    const touched = pin?.accessed.get(id);
    if (touched) { touched.lastUsed = this.now(); return; }
    if (!file) throw new SessionStorageError('SESSION_NOT_FOUND_OR_EXPIRED',
      'Session does not exist in this workspace or its retention period has expired. Create a new session.');
    const stamp = this.stamp(namespace, id);
    const at = this.busy.get(namespace)?.started ?? this.now();
    if (stamp.lastUsed + this.retentionMs <= at) {
      this.remove(namespace, file);
      throw new SessionStorageError('SESSION_EXPIRED',
        'Session expired after inactivity and was removed. Create a new session.', { retentionSeconds: this.retentionMs / 1000 });
    }
    const now = this.now();
    const generation = randomUUID();
    this.write(this.stampPath(namespace, id), { lastUsed: now, generation });
    pin?.accessed.set(id, { persisted: now, lastUsed: now, generation });
  }

  /** Delete only enumerated files, never a path derived directly from an agent-supplied ID. */
  private remove(namespace: string, file: { id: string; path: string }): string[] {
    return this.guard(() => {
      this.assertDirectory(join(this.workspace(namespace), '.lifecycle', 'sessions'));
      const pointerPath = join(this.workspace(namespace), '_current.json');
      const pointer = this.read(pointerPath);
      const selected = pointer?.sessionId === file.id;
      if (selected) this.write(pointerPath, { sessionId: null });
      try { fs.unlinkSync(file.path); }
      catch (error) {
        if (selected && pointer) this.write(pointerPath, pointer);
        throw error;
      }
      // Unlink is the commit point. Later bookkeeping failures must never imply deletion failed.
      const warnings: string[] = [];
      try { this.evictions.get(namespace)?.(file.id); } catch { warnings.push('SESSION_CACHE_CLEANUP_PENDING'); }
      try { this.expired(namespace); } catch { warnings.push('SESSION_PUBLICATION_CLEANUP_PENDING'); }
      try { fs.rmSync(this.stampPath(namespace, file.id), { force: true }); }
      catch { warnings.push('SESSION_METADATA_CLEANUP_PENDING'); }
      if (warnings.length) process.stderr.write('rstool-mcp session deletion completed with cleanup warnings\n');
      return warnings;
    });
  }

  /** Retry harmless orphan timestamp cleanup without turning a freed slot back into a quota failure. */
  private cleanOrphanStamps(namespace: string): void {
    const directory = join(this.workspace(namespace), '.lifecycle', 'sessions');
    this.assertDirectory(directory);
    const live = new Set(this.files(namespace).map(file => `${hash(file.id)}.json`));
    for (const entry of this.guard(() => fs.readdirSync(directory, { withFileTypes: true }))) {
      if (!entry.isFile() || !/^[a-f0-9]{64}\.json$/.test(entry.name) || live.has(entry.name)) continue;
      try { fs.unlinkSync(join(directory, entry.name)); }
      catch { process.stderr.write('rstool-mcp orphan session metadata cleanup pending\n'); }
    }
  }

  private workspace(namespace: string): string {
    if (!/^[a-f0-9]{64}$/.test(namespace)) throw unavailable();
    return join(this.root, namespace);
  }

  private namespaces(): string[] {
    return this.guard(() => fs.readdirSync(this.root, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && /^[a-f0-9]{64}$/.test(entry.name)).map(entry => entry.name));
  }

  private files(namespace: string): { id: string; path: string }[] {
    const directory = this.workspace(namespace);
    this.directory(directory);
    return this.guard(() => fs.readdirSync(directory, { withFileTypes: true })
      .filter(entry => entry.isFile() && entry.name.endsWith('.json') && entry.name !== '_current.json')
      .map(entry => ({ id: entry.name.slice(0, -5), path: join(directory, entry.name) })));
  }

  private ownerPath(namespace: string): string { return join(this.workspace(namespace), '.lifecycle', 'owner.json'); }
  private stampPath(namespace: string, id: string): string {
    return join(this.workspace(namespace), '.lifecycle', 'sessions', `${hash(id)}.json`);
  }

  private owner(namespace: string): Owner | null {
    const metadata = join(this.workspace(namespace), '.lifecycle');
    if (!fs.existsSync(metadata)) return null;
    this.directory(metadata);
    const value = this.read(this.ownerPath(namespace));
    if (value === null) return null;
    if (typeof value.account !== 'string' || !/^[a-f0-9]{64}$/.test(value.account)) throw unavailable();
    if (value.workspace !== undefined && (typeof value.workspace !== 'string' ||
      !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(value.workspace))) throw unavailable();
    return { account: value.account, workspace: value.workspace as string | undefined };
  }

  private stamp(namespace: string, id: string, initialize = true): Stamp {
    this.assertDirectory(join(this.workspace(namespace), '.lifecycle'));
    const parent = join(this.workspace(namespace), '.lifecycle', 'sessions');
    if (initialize) this.directory(parent); else this.assertDirectory(parent);
    const path = this.stampPath(namespace, id);
    const value = this.read(path);
    if (value === null) {
      if (!initialize) throw unavailable();
      // Only recognized rstool envelopes may acquire a retention timestamp.
      const file = this.files(namespace).find(item => item.id === id);
      const envelope = file ? this.read(file.path) : null;
      const state = envelope?.state;
      if (!state || typeof state !== 'object' || Array.isArray(state) ||
        (state as Record<string, unknown>).sessionId !== id || !Array.isArray(envelope?.diagnostics)) throw unavailable();
      const stamp = { lastUsed: this.now(), generation: randomUUID() };
      this.write(path, stamp);
      return stamp;
    }
    if (typeof value.lastUsed !== 'number' || !Number.isSafeInteger(value.lastUsed) || value.lastUsed < 0 ||
      !Number.isFinite(new Date(value.lastUsed + this.retentionMs).getTime())) throw unavailable();
    if (value.generation === undefined) {
      if (!initialize) return { lastUsed: value.lastUsed, generation: 'legacy' };
      const stamp = { lastUsed: value.lastUsed, generation: randomUUID() };
      this.write(path, stamp);
      return stamp;
    }
    if (typeof value.generation !== 'string' || !/^[a-f0-9-]{36}$/.test(value.generation)) throw unavailable();
    return { lastUsed: value.lastUsed, generation: value.generation };
  }

  /** Refuse symlink metadata rather than following it outside the protected service root. */
  private directory(path: string): void {
    this.guard(() => {
      if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true, mode: 0o700 });
      const stat = fs.lstatSync(path);
      if (!stat.isDirectory() || stat.isSymbolicLink()) throw unavailable();
    });
  }

  /** Read-only metadata operations validate existing parents without creating directories. */
  private assertDirectory(path: string): void {
    this.guard(() => {
      const stat = fs.lstatSync(path);
      if (!stat.isDirectory() || stat.isSymbolicLink()) throw unavailable();
    });
  }

  private read(path: string): Record<string, unknown> | null {
    try {
      const stat = fs.lstatSync(path);
      if (!stat.isFile() || stat.isSymbolicLink()) throw unavailable();
      const value: unknown = JSON.parse(fs.readFileSync(path, 'utf8'));
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw unavailable();
      return value as Record<string, unknown>;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw unavailable();
    }
  }

  /** Keep filesystem paths and raw I/O diagnostics out of authenticated tool responses. */
  private guard<T>(action: () => T): T {
    try { return action(); } catch (error) {
      if (error instanceof SessionStorageError) throw error;
      throw unavailable();
    }
  }

  /** Reject symlink parents all the way back to the exclusively owned persistence root. */
  private assertParents(path: string): void {
    let parent = dirname(path);
    const child = relative(resolve(this.root), resolve(parent));
    if (child.startsWith('..') || isAbsolute(child)) throw unavailable();
    for (;;) {
      this.assertDirectory(parent);
      if (resolve(parent) === resolve(this.root)) return;
      const next = dirname(parent);
      if (next === parent) throw unavailable();
      parent = next;
    }
  }

  private write(path: string, value: object): void {
    this.assertParents(path);
    const temporary = `${path}.${randomUUID()}.tmp`;
    let descriptor: number | undefined;
    try {
      descriptor = fs.openSync(temporary, 'wx', 0o600);
      fs.writeFileSync(descriptor, JSON.stringify(value), 'utf8');
      fs.fsyncSync(descriptor);
      fs.closeSync(descriptor);
      descriptor = undefined;
      fs.renameSync(temporary, path);
    } catch {
      throw unavailable();
    } finally {
      this.guard(() => {
        if (descriptor !== undefined) fs.closeSync(descriptor);
        fs.rmSync(temporary, { force: true });
      });
    }
  }
}

function hash(value: string): string { return createHash('sha256').update(value).digest('hex'); }
function unavailable(): SessionStorageError {
  return new SessionStorageError('SESSION_STORAGE_UNAVAILABLE', 'Session storage metadata is unavailable. Contact the administrator.');
}

function compare(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }
function encode(value: unknown): string { return Buffer.from(JSON.stringify(value)).toString('base64url'); }
function reference(namespace: string, id: string): string { return encode([namespace, id]); }
function decode(value: string, code: string): unknown {
  try {
    if (typeof value !== 'string' || !value || value.length > 2048 || !/^[A-Za-z0-9_-]+$/.test(value)) throw missing();
    const bytes = Buffer.from(value, 'base64url');
    if (bytes.toString('base64url') !== value) throw missing();
    return JSON.parse(bytes.toString('utf8')) as unknown;
  } catch { throw new SessionStorageError(code, 'Use the opaque reference or cursor returned by list_stored_sessions.'); }
}
function clipped(value: unknown, maximum: number) {
  const text = typeof value === 'string' ? value : '';
  return { value: text.slice(0, maximum), truncated: text.length > maximum };
}
function missing(): SessionStorageError {
  return new SessionStorageError('SESSION_NOT_FOUND_OR_EXPIRED', 'Session is not available to this account or has expired.');
}
