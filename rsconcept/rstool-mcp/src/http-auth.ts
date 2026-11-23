import { createHash } from 'node:crypto';

export interface HttpCredential {
  subject: string;
  token: string;
  projectId?: string;
}

export type HttpIdentity = string | { subject: string; projectId: string };
export type VerifyHttpToken<T extends HttpIdentity = string> = (token: string, signal?: AbortSignal) => T | null | Promise<T | null>;

export function isProjectId(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(value);
}

/** Tokens authenticate identities; workspace names and MCP session IDs never do. */
export function createBearerTokenVerifier(credentials: readonly HttpCredential[]): VerifyHttpToken {
  if (Array.isArray(credentials) && credentials.some(credential => credential?.projectId !== undefined)) {
    throw new Error('This credential audience does not accept project IDs');
  }
  const verify = createBearerIdentityVerifier(credentials);
  return token => {
    const identity = verify(token);
    return typeof identity === 'string' ? identity : null;
  };
}

/** Only the trusted token configuration can assign a request to a project. */
export function createBearerIdentityVerifier(credentials: readonly HttpCredential[]) {
  if (!Array.isArray(credentials) || credentials.length === 0) {
    throw new Error('HTTP credentials must be a non-empty array of { subject, token } entries');
  }
  const identities = new Map<string, HttpIdentity>();
  for (const credential of credentials) {
    if (
      !credential || typeof credential.subject !== 'string' || !credential.subject.trim() ||
      typeof credential.token !== 'string' || credential.token.length < 32 || /\s/.test(credential.token)
    ) {
      throw new Error('Each HTTP credential needs a subject and a token of at least 32 non-whitespace characters');
    }
    const digest = hash(credential.token);
    if (identities.has(digest)) {
      throw new Error('HTTP credentials contain a duplicate token');
    }
    if (credential.projectId !== undefined && !isProjectId(credential.projectId)) {
      throw new Error('Invalid HTTP credential project ID');
    }
    identities.set(digest, credential.projectId === undefined ? credential.subject :
      Object.freeze({ subject: credential.subject, projectId: credential.projectId }));
  }
  return (token: string): HttpIdentity | null => identities.get(hash(token)) ?? null;
}

/** Use fixed-length lookup keys without retaining bearer tokens in the verifier map. */
function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
