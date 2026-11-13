import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs';
import { join } from 'node:path';

export type PortalItemKind = 'schema' | 'model' | 'oss';
export interface CreationReceipt {
  origin: string;
  accountId: number;
  digest: string;
  kind: PortalItemKind;
  state: 'sending' | 'created';
  targetId?: number;
}

/** Durable no-replay receipts. A lost POST response must never become a second POST. */
export class PortalCreations {
  private readonly directory: string;

  public constructor(directory: string) {
    this.directory = directory;
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  }

  public get(subject: string, requestId: string): CreationReceipt | null {
    const file = this.file(subject, requestId);
    try {
      const value: CreationReceipt = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (typeof value.origin !== 'string' || new URL(value.origin).origin !== value.origin ||
          !value.origin.startsWith('https://') || !Number.isSafeInteger(value.accountId) || !/^[a-f0-9]{64}$/.test(value.digest) ||
          !['schema', 'model', 'oss'].includes(value.kind) || !['sending', 'created'].includes(value.state) ||
          (value.targetId !== undefined && (!Number.isSafeInteger(value.targetId) || value.targetId <= 0)) ||
          (value.state === 'created' && value.targetId === undefined)) throw new Error('Invalid receipt');
      return value;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw new Error('Portal creation receipt is unavailable; do not repeat creation');
    }
  }

  /** Exclusive create also protects separate processes sharing this data directory. */
  public reserve(subject: string, requestId: string, receipt: CreationReceipt): void {
    const file = this.file(subject, requestId);
    let fd: number | undefined;
    try {
      fd = fs.openSync(file, 'wx', 0o600);
      fs.writeFileSync(fd, JSON.stringify(receipt));
      fs.fsyncSync(fd);
    } catch {
      throw new Error('Portal creation is already reserved or cannot be recorded; check creation status');
    } finally {
      if (fd !== undefined) fs.closeSync(fd);
    }
  }

  /** Persist the returned ID before attempting readback, so read failure is recoverable. */
  public complete(subject: string, requestId: string, receipt: CreationReceipt): void {
    const file = this.file(subject, requestId);
    const temporary = join(this.directory, `.${randomUUID()}.tmp`);
    let fd: number | undefined;
    try {
      fd = fs.openSync(temporary, 'wx', 0o600);
      fs.writeFileSync(fd, JSON.stringify(receipt));
      fs.fsyncSync(fd);
      fs.closeSync(fd);
      fd = undefined;
      fs.renameSync(temporary, file);
    } finally {
      if (fd !== undefined) fs.closeSync(fd);
      if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    }
  }

  private file(subject: string, requestId: string): string {
    if (typeof requestId !== 'string' || !/^[A-Za-z0-9_-]{8,128}$/.test(requestId))
      throw new Error('requestId must contain 8–128 letters, digits, underscores or hyphens');
    const id = createHash('sha256').update(JSON.stringify([subject, requestId])).digest('hex');
    return join(this.directory, `${id}.json`);
  }
}
