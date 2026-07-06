import fs from 'node:fs';
import path from 'node:path';

import { type Diagnostic, type SessionState } from '../models';

export interface PersistedSessionEnvelope {
  state: SessionState;
  diagnostics: Diagnostic[];
}

const CURRENT_SESSION_FILE = '_current.json';
const UNSAFE_SESSION_ID = /[/\\]|\.\./;

function assertSafeSessionId(sessionId: string): void {
  if (!sessionId || UNSAFE_SESSION_ID.test(sessionId)) {
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
    fs.writeFileSync(this.filePath(sessionId), JSON.stringify(envelope, null, 2), 'utf-8');
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
    fs.writeFileSync(path.join(this.dir, CURRENT_SESSION_FILE), JSON.stringify({ sessionId }, null, 2), 'utf-8');
  }

  public loadCurrentSessionId(): string | null {
    const file = path.join(this.dir, CURRENT_SESSION_FILE);
    if (!fs.existsSync(file)) {
      return null;
    }
    const parsed = JSON.parse(fs.readFileSync(file, 'utf-8')) as { sessionId?: string | null };
    return parsed.sessionId ?? null;
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
