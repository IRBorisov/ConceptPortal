import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from 'node:crypto';
import fs from 'node:fs';
import { join } from 'node:path';

export interface PortalKeyPolicy {
  scopes: Array<'read' | 'write' | 'publish'>;
  expiresAt: string | null;
}

export interface PortalCredential {
  token: string;
  generation: string;
  keyPolicy?: PortalKeyPolicy;
  account: { id: number; username: string };
}

/** Encrypt each subject's credential with a separately provisioned 256-bit service key. */
export class PortalVault {
  readonly #key: Buffer;
  readonly #directory: string;

  /** Keep an independent key buffer and create a private vault directory for encrypted records. */
  public constructor(directory: string, key: Buffer) {
    if (key.length !== 32) throw new Error('Portal vault needs a 32-byte encryption key');
    this.#key = Buffer.from(key);
    this.#directory = directory;
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  }

  /** The subject is trusted authentication context, never a tool argument or pathname. */
  public get(subject: string): PortalCredential | null {
    const id = this.id(subject);
    const file = join(this.#directory, `${id}.json`);
    if (!fs.existsSync(file)) return null;
    try {
      const stored = JSON.parse(fs.readFileSync(file, 'utf8'));
      const decipher = createDecipheriv('aes-256-gcm', this.#key, Buffer.from(stored.iv, 'base64'));
      decipher.setAAD(Buffer.from(id));
      decipher.setAuthTag(Buffer.from(stored.tag, 'base64'));
      return JSON.parse(
        Buffer.concat([decipher.update(Buffer.from(stored.data, 'base64')), decipher.final()]).toString('utf8')
      );
    } catch {
      throw new Error('Portal credential is unavailable');
    }
  }

  /** Replace the encrypted record atomically; only safe account metadata is returned by callers. */
  public set(subject: string, token: string, account: PortalCredential['account'], keyPolicy?: PortalKeyPolicy): void {
    const id = this.id(subject);
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.#key, iv);
    cipher.setAAD(Buffer.from(id));
    const value: PortalCredential = { token, account, generation: randomUUID(), ...(keyPolicy ? { keyPolicy } : {}) };
    const data = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
    const file = join(this.#directory, `${id}.json`);
    const temporary = join(this.#directory, `.${randomUUID()}.tmp`);
    let descriptor: number | undefined;
    let created = false;
    try {
      descriptor = fs.openSync(temporary, 'wx', 0o600);
      created = true;
      fs.writeFileSync(
        descriptor,
        JSON.stringify({
          iv: iv.toString('base64'),
          tag: cipher.getAuthTag().toString('base64'),
          data: data.toString('base64'),
        })
      );
      fs.fsyncSync(descriptor);
      fs.closeSync(descriptor);
      descriptor = undefined;
      fs.renameSync(temporary, file);
    } finally {
      if (descriptor !== undefined) fs.closeSync(descriptor);
      if (created && fs.existsSync(temporary)) fs.unlinkSync(temporary);
    }
  }

  /** Local disconnect does not revoke the original key in Portal. */
  public remove(subject: string): void {
    const file = join(this.#directory, `${this.id(subject)}.json`);
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }

  private id(subject: string): string {
    return createHash('sha256').update(subject).digest('hex');
  }
}
