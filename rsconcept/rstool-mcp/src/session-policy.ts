import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs';
import { join } from 'node:path';

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

interface Owner { account: string }
interface Stamp { lastUsed: number }

/** Single-process account-wide quota and inactivity retention, independent of transport leases. */
export class SessionPolicy {
  private readonly busy = new Map<string, { count: number; started: number; accessed: Map<string, { persisted: number; lastUsed: number }> }>();

  private readonly evictions = new Map<string, (id: string) => void>();
  private readonly root: string;
  readonly limit: number;
  readonly retentionMs: number;
  private readonly now: () => number;
  private readonly expired: (namespace: string) => void;

  constructor(root: string, limit = 20, retentionMs = 30 * 86400_000,
    now: () => number = Date.now, expired: (namespace: string) => void = () => {}) {
    this.root = root;
    this.limit = limit;
    this.retentionMs = retentionMs;
    this.now = now;
    this.expired = expired;
    if (!Number.isSafeInteger(limit) || limit <= 0 || !Number.isSafeInteger(retentionMs) || retentionMs <= 0) {
      throw new Error('Stored session limit and retention must be positive safe integers');
    }
    this.directory(root);
  }

  /** Bind a verified workspace to an account and give legacy sessions a full initial retention period. */
  register(subject: string, namespace: string): number {
    const directory = this.workspace(namespace);
    this.directory(directory);
    this.directory(join(directory, '.lifecycle'));
    this.directory(join(directory, '.lifecycle', 'sessions'));
    const account = hash(subject);
    const owner = this.owner(namespace);
    if (owner && owner.account !== account) throw unavailable();
    if (!owner) this.write(this.ownerPath(namespace), { account });
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
          if (stamp.lastUsed !== stamp.persisted) this.write(this.stampPath(namespace, id), { lastUsed: stamp.lastUsed });
        }
      } finally { this.busy.delete(namespace); }
    };
  }

  /** Supply rstool's synchronous storage hooks; no language state is inspected or modified. */
  hooks(subject: string, namespace: string) {
    const account = hash(subject);
    return {
      beforeCreate: (id: string) => this.guard(() => {
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
          'Stored session limit reached for this account. Reuse an existing session or wait for expiry.',
          { limit: this.limit, count, retryAfterSeconds: Math.max(1, Math.ceil((earliest - this.now()) / 1000)) });
      }),
      created: (id: string) => {
        const now = this.now();
        this.write(this.stampPath(namespace, id), { lastUsed: now });
        this.busy.get(namespace)?.accessed.set(id, { persisted: now, lastUsed: now });
      },
      access: (id: string) => this.access(namespace, id),
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
      } catch { failures.set(namespace, unavailable()); }
    }
    return failures;
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
    const pin = this.busy.get(namespace);
    const touched = pin?.accessed.get(id);
    if (touched) { touched.lastUsed = this.now(); return; }
    const file = this.files(namespace).find(item => item.id === id);
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
    if (stamp.lastUsed !== now) this.write(this.stampPath(namespace, id), { lastUsed: now });
    pin?.accessed.set(id, { persisted: now, lastUsed: now });
  }

  /** Delete only enumerated files, never a path derived directly from an agent-supplied ID. */
  private remove(namespace: string, file: { id: string; path: string }): void {
    this.guard(() => {
      fs.unlinkSync(file.path);
      this.evictions.get(namespace)?.(file.id);
      this.expired(namespace);
      fs.rmSync(this.stampPath(namespace, file.id), { force: true });
    });
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
    return value as unknown as Owner;
  }

  private stamp(namespace: string, id: string): Stamp {
    this.directory(join(this.workspace(namespace), '.lifecycle', 'sessions'));
    const path = this.stampPath(namespace, id);
    const value = this.read(path);
    if (value === null) {
      // Only recognized rstool envelopes may acquire a retention timestamp.
      const file = this.files(namespace).find(item => item.id === id);
      const envelope = file ? this.read(file.path) : null;
      const state = envelope?.state;
      if (!state || typeof state !== 'object' || Array.isArray(state) ||
        (state as Record<string, unknown>).sessionId !== id || !Array.isArray(envelope?.diagnostics)) throw unavailable();
      const stamp = { lastUsed: this.now() };
      this.write(path, stamp);
      return stamp;
    }
    if (typeof value.lastUsed !== 'number' || !Number.isSafeInteger(value.lastUsed) || value.lastUsed < 0) throw unavailable();
    return value as unknown as Stamp;
  }

  /** Refuse symlink metadata rather than following it outside the protected service root. */
  private directory(path: string): void {
    this.guard(() => {
      if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true, mode: 0o700 });
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

  private write(path: string, value: object): void {
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
