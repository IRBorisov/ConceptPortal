import { isProjectId } from './http-auth';
import { isPortalKeyScope, type PortalCredential } from './portal-vault';

export interface McpOAuthIdentity {
  subject: string;
  projectId: string;
  /** Null means the MCP identity is valid but its Portal delegation was revoked. */
  delegation: PortalCredential | null;
}

export interface McpOAuth {
  issuer: string;
  resource(workspace?: string): string;
  verify(token: string, workspace?: string, signal?: AbortSignal): Promise<McpOAuthIdentity | null>;
}

/** Introspect a Portal-issued MCP token using the independent host credential. */
export function createPortalMcpOAuth(issuer: string, mcpOrigin: string, hostSecret: string, request: typeof fetch = fetch): McpOAuth {
  for (const origin of [issuer, mcpOrigin]) {
    const url = new URL(origin);
    if (url.origin !== origin || (url.protocol !== 'https:' &&
        !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))))
      throw new Error('OAuth configuration requires fixed origins');
  }
  if (!/^\S{32,512}$/.test(hostSecret)) throw new Error('Invalid MCP OAuth configuration');
  const resource = (workspace?: string) => `${mcpOrigin}/mcp${workspace ? `/${workspace}` : ''}`;
  return { issuer, resource, async verify(token, workspace, signal) {
    if (!/^rcm_[A-Za-z0-9_-]{43}$/.test(token)) return null;
    const audience = resource(workspace);
    const response = await request(`${issuer}/api/agents/oauth/introspect`, {
      method: 'POST', redirect: 'error', signal: signal ?? AbortSignal.timeout(5000),
      headers: { Authorization: `Bearer ${hostSecret}`, Accept: 'application/json' },
      body: new URLSearchParams({ token, resource: audience }),
    });
    if (!response.ok || !response.body) { await response.body?.cancel().catch(() => undefined); return null; }
    const reader = response.body.getReader();
    const parts: Uint8Array[] = [];
    let bytes = 0;
    try {
      while (true) {
        const next = await reader.read();
        if (next.done) break;
        bytes += next.value.byteLength;
        if (bytes > 8192) return null;
        parts.push(next.value);
      }
      const row = JSON.parse(Buffer.concat(parts).toString('utf8'));
      if (row?.active !== true || row.iss !== issuer || row.aud !== audience || !isProjectId(row.project_id) ||
          !Number.isSafeInteger(row.portal_account_id) || row.portal_account_id <= 0 || row.sub !== `portal:${row.portal_account_id}` ||
          !Number.isSafeInteger(row.exp) || row.exp <= Date.now() / 1000 || row.exp > Date.now() / 1000 + 3600 ||
          typeof row.grant_id !== 'string' || !/^[0-9a-f-]{36}$/.test(row.grant_id) || typeof row.portal_username !== 'string' ||
          !Array.isArray(row.scopes) || !row.scopes.includes('read') || !row.scopes.every(isPortalKeyScope) ||
          (row.portal_token !== null && (typeof row.portal_token !== 'string' || !/^rcd_[a-f0-9]{32}_[a-f0-9]{64}$/.test(row.portal_token)))) return null;
      return { subject: row.sub, projectId: row.project_id, delegation: row.portal_token === null ? null : {
        token: row.portal_token, generation: row.grant_id, account: { id: row.portal_account_id, username: row.portal_username },
        keyPolicy: { scopes: row.scopes, expiresAt: new Date(row.exp * 1000).toISOString() },
      } };
    } catch { return null; }
    finally { await reader.cancel().catch(() => undefined); }
  } };
}
