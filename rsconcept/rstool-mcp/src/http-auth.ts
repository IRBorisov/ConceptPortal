import { createHash } from 'node:crypto';

export interface HttpCredential {
  subject: string;
  token: string;
}

export type VerifyHttpToken = (token: string) => string | null | Promise<string | null>;

/** Tokens authenticate identities; workspace names and MCP session IDs never do. */
export function createBearerTokenVerifier(credentials: readonly HttpCredential[]): VerifyHttpToken {
  if (!Array.isArray(credentials) || credentials.length === 0) {
    throw new Error('HTTP credentials must be a non-empty array of { subject, token } entries');
  }
  const subjects = new Map<string, string>();
  for (const credential of credentials) {
    if (
      !credential || typeof credential.subject !== 'string' || !credential.subject.trim() ||
      typeof credential.token !== 'string' || credential.token.length < 32 || /\s/.test(credential.token)
    ) {
      throw new Error('Each HTTP credential needs a subject and a token of at least 32 non-whitespace characters');
    }
    const digest = hash(credential.token);
    if (subjects.has(digest)) {
      throw new Error('HTTP credentials contain a duplicate token');
    }
    subjects.set(digest, credential.subject);
  }
  return token => subjects.get(hash(token)) ?? null;
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
