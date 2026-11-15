import type { IncomingMessage, ServerResponse } from 'node:http';
import type { PortalPublisher } from './portal-publisher';

/** Public settings UI; credentials are kept only in transient input fields/memory. */
export const PORTAL_ACCOUNT_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Portal publication settings</title><link rel="stylesheet" href="/portal/account.css"></head><body><main>
<h1>Portal publication settings</h1><p>Use your separate human account token to open settings. This is not your agent's MCP token. Never paste this token or a Portal key into an agent chat.</p>
<form id="login"><label>Human account token <input id="access" type="password" autocomplete="off" required></label><button>Open settings</button></form>
<section id="settings" hidden><h2>Portal connection</h2><p id="connection"></p>
<p>Public reading needs no Portal key. Create a dedicated key with only the permissions and lifetime required for edits or private data. Existing unrestricted keys keep their previous permissions. Encryption does not protect keys from a compromised running service or server administrator.</p>
<p>A bound key can authorize private reading. Editing descriptions requires write permission; full publication requires publish permission. Your account must also have access to the target. Full schema replacements still require approval below.</p>
<form id="connect"><label>Personal Portal key <input id="key" type="password" autocomplete="off" required></label><button>Save personal key</button></form>
<button id="disconnect" type="button">Disconnect personal key</button><p>Disconnecting here does not revoke the original key. Revoke it in your Portal profile as well.</p>
<h2>Prepared publications</h2><button id="refresh" type="button">Refresh</button><p>Review the target and both complete schemas. Only approve the exact replacement you intend. Publication preserves the previous version and requires owner access.</p><div id="publications"></div></section>
<p id="message" role="status"></p><p>Credentials are never returned. Reload this page to clear your human account token.</p></main><script src="/portal/account.js"></script></body></html>`;

/** Never render returned user/schema data as HTML or persist credentials in browser storage. */
export const PORTAL_ACCOUNT_SCRIPT = `
let access = '';
const el = id => document.getElementById(id);
async function api(path, method = 'GET', body) {
  const response = await fetch('/portal/api/' + path, { method, credentials: 'omit', cache: 'no-store', redirect: 'error', headers: { Authorization: 'Bearer ' + access, 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!response.ok) throw new Error('Request failed (' + response.status + '). Refresh status and inspect Portal before retrying a publication.');
  return response.json();
}
async function refresh() {
  const connection = await api('connection'); el('connection').textContent = JSON.stringify(connection);
  el('connect').hidden = connection.mode === 'service'; el('disconnect').hidden = connection.mode === 'service' || (!connection.connected && !connection.keyPolicy);
  const proposals = await api('publications'); el('publications').replaceChildren();
  for (const proposal of proposals) {
    const section = document.createElement('section'); const title = document.createElement('h3'); title.textContent = proposal.apiOrigin + ' / schema ' + proposal.targetId + ': ' + proposal.state; section.append(title);
    const summary = document.createElement('pre'); summary.textContent = JSON.stringify({ changes: proposal.changes, digest: proposal.digest, expiresAt: proposal.expiresAt, result: proposal.result }, null, 2); section.append(summary);
    for (const side of ['before', 'after']) { const detail = document.createElement('details'); const heading = document.createElement('summary'); heading.textContent = side === 'before' ? 'Current Portal schema' : 'Proposed replacement'; const json = document.createElement('pre'); json.textContent = JSON.stringify(proposal[side], null, 2); detail.append(heading, json); section.append(detail); }
    if (proposal.state === 'prepared') { const button = document.createElement('button'); button.textContent = 'Approve and publish this replacement'; button.onclick = () => run(async () => {
      button.disabled = true; if (!window.confirm('Replace Portal schema ' + proposal.targetId + ' with the reviewed content?')) { button.disabled = false; return; }
      await api('publications/' + proposal.id + '/confirm', 'POST', { digest: proposal.digest }); await refresh(); el('message').textContent = 'Publication completed and read back from Portal.';
    }); section.append(button); } el('publications').append(section);
  }
}
async function run(operation) { try { el('message').textContent = ''; await operation(); } catch (error) { el('message').textContent = error.message; } }
el('login').onsubmit = event => { event.preventDefault(); access = el('access').value; el('access').value = ''; run(async () => { await refresh(); el('settings').hidden = false; }); };
el('connect').onsubmit = event => { event.preventDefault(); const key = el('key').value; el('key').value = ''; run(async () => { await api('connection', 'PUT', { key }); await refresh(); }); };
el('disconnect').onclick = () => run(async () => { await api('connection', 'DELETE'); await refresh(); });
el('refresh').onclick = () => run(refresh);
window.addEventListener('pagehide', () => { access = ''; el('access').value = ''; el('key').value = ''; el('settings').hidden = true; el('publications').replaceChildren(); });
`;

/** Serve static assets without embedding secrets, with scripts isolated by CSP. */
export function servePortalAccount(path: string, request: IncomingMessage, response: ServerResponse): boolean {
  if (!['/portal/account', '/portal/account.js', '/portal/account.css'].includes(path)) return false;
  if (request.method !== 'GET') {
    response.writeHead(405);
    response.end();
    return true;
  }
  response.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; form-action 'none'; frame-ancestors 'none'; base-uri 'none'"
  );
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader(
    'Content-Type',
    path.endsWith('.js')
      ? 'text/javascript; charset=utf-8'
      : path.endsWith('.css')
        ? 'text/css; charset=utf-8'
        : 'text/html; charset=utf-8'
  );
  response.end(
    path.endsWith('.js') ? PORTAL_ACCOUNT_SCRIPT : path.endsWith('.css') ? PORTAL_ACCOUNT_CSS : PORTAL_ACCOUNT_HTML
  );
  return true;
}

const PORTAL_ACCOUNT_CSS = `:root{font:16px/1.5 system-ui,sans-serif;color:#202923;background:#f6f7f5}*{box-sizing:border-box}main{max-width:64rem;margin:auto;padding:1rem}h1{font-size:1.65rem}section{border:1px solid #b9c7bd;border-radius:.5rem;padding:1rem;margin:1rem 0;background:white}form{margin:1rem 0}label{display:block}input{display:block;width:100%;max-width:36rem;padding:.55rem;margin:.4rem 0;font:inherit}button{font:inherit;padding:.5rem .8rem;margin:.3rem .3rem .3rem 0;cursor:pointer}pre{white-space:pre-wrap;overflow-wrap:anywhere;max-height:28rem;overflow:auto;padding:.7rem;background:#f0f3ef}details{margin:.7rem 0}summary{cursor:pointer;font-weight:600}#message{font-weight:600}h3{overflow-wrap:anywhere}`;

/** Authenticated management is outside MCP and requires the configured browser origin for writes. */
export async function handlePortalAccount(
  path: string,
  request: IncomingMessage,
  response: ServerResponse,
  subject: string,
  publisher: PortalPublisher,
  origin: string
): Promise<void> {
  if (request.method !== 'GET' && request.headers.origin !== origin) {
    response.writeHead(403);
    response.end(JSON.stringify({ error: 'Trusted account page origin required' }));
    return;
  }
  try {
    let result: unknown;
    if (path === '/portal/api/connection' && request.method === 'GET') result = publisher.connection(subject);
    else if (path === '/portal/api/publications' && request.method === 'GET') result = publisher.publications(subject);
    else if (path === '/portal/api/connection' && request.method === 'DELETE')
      result = await publisher.disconnect(subject);
    else if (path === '/portal/api/connection' && request.method === 'PUT') {
      const body = await readAccountBody(request);
      if (Object.keys(body).length !== 1 || typeof body.key !== 'string') throw new Error('Invalid body');
      result = await publisher.connect(subject, body.key);
    } else {
      const match = /^\/portal\/api\/publications\/([a-f0-9-]{36})\/confirm$/.exec(path);
      if (!match || request.method !== 'POST') {
        response.writeHead(404);
        response.end();
        return;
      }
      const body = await readAccountBody(request);
      if (Object.keys(body).length !== 1 || typeof body.digest !== 'string') throw new Error('Invalid body');
      result = await publisher.approve(subject, match[1], body.digest);
    }
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(result));
  } catch {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.end(
      JSON.stringify({ error: 'Portal operation failed. Refresh status and inspect Portal before retrying.' })
    );
  }
}

/** Credential requests are small and bounded, independent of the MCP schema body limit. */
async function readAccountBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  if (request.destroyed || request.aborted) throw new Error('Request aborted');
  if (!request.headers['content-type']?.startsWith('application/json')) throw new Error('JSON required');
  const chunks: Buffer[] = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > 4096) throw new Error('Body too large');
    chunks.push(Buffer.from(chunk));
  }
  if (request.aborted) throw new Error('Request aborted');
  const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Object required');
  return value;
}
