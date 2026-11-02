import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { type Diagnostic, type SessionState } from '../models';

export interface PersistedSessionEnvelope {
  state: SessionState;
  diagnostics: Diagnostic[];
}

const CURRENT_SESSION_FILE = '_current.json';
const UNSAFE_SESSION_ID = /[/\\:<>"|?*\u0000-\u001f]|\.\./;
const RESERVED_WINDOWS_NAME = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i;

/** Keep session files separate from metadata and portable across Windows and Linux. */
function assertSafeSessionId(sessionId: string): void {
  if (!sessionId || sessionId.toLowerCase() === '_current' || UNSAFE_SESSION_ID.test(sessionId) || RESERVED_WINDOWS_NAME.test(sessionId)) {
    throw new Error(`Invalid session ID: ${sessionId}`);
  }
}

export class SessionPersistence {
  private readonly dir: string;

  public constructor(dir: string) {
    this.dir = dir;
    fs.mkdirSync(dir, { recursive: true });
  }

  public save(sessionId: string, envelope: PersistedSessionEnvelope): void {
    writeJsonAtomically(this.filePath(sessionId), envelope);
  }

  public load(sessionId: string): PersistedSessionEnvelope | null {
    const file = this.filePath(sessionId);
    if (!fs.existsSync(file)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as PersistedSessionEnvelope;
  }

  public delete(sessionId: string): void {
    const file = this.filePath(sessionId);
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  }

  public saveCurrentSessionId(sessionId: string | null): void {
    writeJsonAtomically(path.join(this.dir, CURRENT_SESSION_FILE), { sessionId });
  }

  public loadCurrentSessionId(): string | null {
    const file = path.join(this.dir, CURRENT_SESSION_FILE);
    if (!fs.existsSync(file)) {
      return null;
    }
    const parsed = JSON.parse(fs.readFileSync(file, 'utf-8')) as { sessionId?: string | null };
    const sessionId = parsed.sessionId ?? null;
    if (sessionId === null) return null;
    try { assertSafeSessionId(sessionId); } catch { return null; }
    return sessionId;
  }

  private filePath(sessionId: string): string {
    assertSafeSessionId(sessionId);
    const file = path.resolve(this.dir, `${sessionId}.json`);
    const relative = path.relative(path.resolve(this.dir), file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error(`Invalid session ID: ${sessionId}`);
    }
    return file;
  }
}

/** Flush a private sibling file, then atomically replace the target without truncating it. */
function writeJsonAtomically(file: string, value: unknown): void {
  const json = JSON.stringify(value, null, 2);
  const temporary = path.join(path.dirname(file), `.${randomUUID()}.tmp`);
  let descriptor: number | undefined;
  let created = false;
  try {
    descriptor = fs.openSync(temporary, 'wx', 0o600);
    created = true;
    fs.writeFileSync(descriptor, json, 'utf8');
    fs.fsyncSync(descriptor);
    fs.closeSync(descriptor);
    descriptor = undefined;
    fs.renameSync(temporary, file);
  } catch (error) {
    const failures: unknown[] = [error];
    if (descriptor !== undefined) {
      try { fs.closeSync(descriptor); } catch (closeError) { failures.push(closeError); }
    }
    if (created) {
      try { fs.unlinkSync(temporary); } catch (cleanupError) {
        if ((cleanupError as NodeJS.ErrnoException).code !== 'ENOENT') failures.push(cleanupError);
      }
    }
    if (failures.length > 1) throw new AggregateError(failures, 'Session write and cleanup failed', { cause: error });
    throw error;
  }
}
