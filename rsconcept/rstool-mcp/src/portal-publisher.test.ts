import { createHash, randomBytes } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { RSToolAgent } from '@rsconcept/rstool';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PortalClient } from './portal-client';
import { PortalPublisher } from './portal-publisher';
import { PortalVault } from './portal-vault';

const token = 'rcp_abcd1234_' + 'secret'.repeat(8);
const directories: string[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  for (const directory of directories.splice(0)) {
    const relative = path.relative(path.resolve(os.tmpdir()), path.resolve(directory));
    if (relative.startsWith('..') || !relative.startsWith('portal-vault-test-')) throw new Error('Unsafe cleanup');
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

/** Real encrypted vault and rstool, with only the remote Portal boundary substituted. */
function setup() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-vault-test-'));
  directories.push(directory);
  const key = randomBytes(32);
  const vault = new PortalVault(directory, key);
  let current: Record<string, any> = {
    id: 1,
    title: 'Before',
    alias: 'OLD',
    description: '',
    items: [],
    attribution: [],
    time_update: '2026-11-06T01:00:00Z',
  };
  const request = vi.fn<typeof fetch>(async (input, options) => {
    const url = String(input);
    if (url.endsWith('/me')) return Response.json({ id: 10, username: 'Alice' });
    if (url.endsWith('/description')) {
      const body = JSON.parse(String(options?.body));
      if (body.expected_time_update !== current.time_update) return Response.json({}, { status: 409 });
      current = { ...current, description: body.description, time_update: '2026-11-06T02:00:00Z' };
      return Response.json({ id: 1, description: current.description, time_update: current.time_update });
    }
    if (url.endsWith('/publish')) {
      const body = JSON.parse(String(options?.body));
      if (body.expected_time_update !== current.time_update) return Response.json({}, { status: 409 });
      current = { ...body.schema, id: 1, time_update: '2026-11-06T02:00:00Z' };
      return Response.json({ version: 99, schema: current });
    }
    return Response.json(current);
  });
  const api = new PortalClient('https://api.portal.example', request);
  const publisher = new PortalPublisher(vault, api);
  const tool = new RSToolAgent();
  tool.applySchemaPatch({ initial: { alias: 'NEW' }, items: [{ alias: 'X1', term: 'object', convention: 'Objects' }] });
  return {
    directory,
    key,
    vault,
    publisher,
    tool,
    request,
    setRemote: (schema: Record<string, any>) => {
      current = { ...schema, id: 1, time_update: current.time_update };
    },
    changeRemote: () => {
      current.time_update = 'changed';
    },
  };
}

describe('Portal credential isolation and publication', () => {
  it('encrypts at rest, resumes with the key, and rejects tampering or cross-subject file substitution', async () => {
    const app = setup();
    await app.publisher.connect('alice', token);
    const file = fs.readdirSync(app.directory).find((name) => name.endsWith('.json'))!;
    const ciphertext = fs.readFileSync(path.join(app.directory, file), 'utf8');
    expect(ciphertext).not.toContain(token);
    expect(new PortalVault(app.directory, app.key).get('alice')?.token).toBe(token);
    expect(app.vault.get('bob')).toBeNull();
    const bobFile = createHash('sha256').update('bob').digest('hex') + '.json';
    fs.writeFileSync(path.join(app.directory, bobFile), ciphertext);
    expect(() => app.vault.get('bob')).toThrow('unavailable');
    expect(() => new PortalVault(app.directory, randomBytes(32)).get('alice')).toThrow('unavailable');
    const parsed = JSON.parse(ciphertext);
    parsed.data = Buffer.from('tampered').toString('base64');
    fs.writeFileSync(path.join(app.directory, file), JSON.stringify(parsed));
    expect(() => app.vault.get('alice')).toThrow('unavailable');
  });

  it('only prepares through MCP and publishes exactly once after the matching user approves', async () => {
    const app = setup();
    await app.publisher.connect('alice', token);
    const draft = await app.publisher.prepare('alice', 'workspace', 1, app.tool);
    expect(app.request.mock.calls.some(([url]) => String(url).endsWith('/publish'))).toBe(false);
    expect(app.publisher.publications('bob')).toEqual([]);
    await expect(app.publisher.approve('bob', draft.publicationId, draft.digest)).rejects.toThrow('not found');
    await expect(app.publisher.approve('alice', draft.publicationId, 'wrong')).rejects.toThrow('changed');
    const result = await app.publisher.approve('alice', draft.publicationId, draft.digest);
    expect(result).toMatchObject({ version: 99, targetId: 1 });
    expect(JSON.stringify(app.publisher.publications('alice'))).not.toContain(token);
    await expect(app.publisher.approve('alice', draft.publicationId, draft.digest)).rejects.toThrow(
      'already attempted'
    );
    expect(app.request.mock.calls.filter(([url]) => String(url).endsWith('/publish'))).toHaveLength(1);
  });

  it('rejects changed local content and stale Portal bases', async () => {
    const app = setup();
    await app.publisher.connect('alice', token);
    const old = await app.publisher.prepare('alice', 'workspace', 1, app.tool);
    app.tool.applySchemaPatch({ items: [{ alias: 'X2', term: 'other object', convention: 'Other objects' }] });
    await expect(app.publisher.approve('alice', old.publicationId, old.digest)).rejects.toThrow('Local schema changed');
    const stale = await app.publisher.prepare('alice', 'workspace', 1, app.tool);
    app.changeRemote();
    await expect(app.publisher.approve('alice', stale.publicationId, stale.digest)).rejects.toThrow('schema changed');
    expect(app.publisher.publications('alice')[0].state).toBe('uncertain');
    await expect(app.publisher.approve('alice', stale.publicationId, stale.digest)).rejects.toThrow(
      'already attempted'
    );
  });

  it('invalidates approval on key replacement, disconnect and workspace disposal', async () => {
    const app = setup();
    await app.publisher.connect('alice', token);
    const draft = await app.publisher.prepare('alice', 'workspace', 1, app.tool);
    await app.publisher.connect('alice', token + 'new');
    await expect(app.publisher.approve('alice', draft.publicationId, draft.digest)).rejects.toThrow('not found');
    await app.publisher.prepare('alice', 'workspace', 1, app.tool);
    app.publisher.invalidateWorkspace('alice', 'workspace');
    expect(app.publisher.publications('alice')).toEqual([]);
    await app.publisher.disconnect('alice');
    await expect(app.publisher.prepare('alice', 'workspace', 1, app.tool)).rejects.toThrow('personal Portal key');
  });

  it('allows service keys only for explicitly assigned subjects and targets without personal fallback', async () => {
    const app = setup();
    const publisher = new PortalPublisher(app.vault, new PortalClient('https://api.portal.example', app.request), {
      token,
      subjects: ['robot'],
      targetIds: [1],
    });
    await expect(publisher.prepare('alice', 'a', 1, app.tool)).rejects.toThrow('personal Portal key');
    await expect(publisher.prepare('robot', 'r', 2, app.tool)).rejects.toThrow('not allowed');
    await expect(publisher.connect('robot', token)).rejects.toThrow('administrator-managed');
    await expect(publisher.prepare('robot', 'r', 1, app.tool)).resolves.toMatchObject({ targetId: 1 });
  });

  it('does not leak remote bodies or fetch exceptions and refuses redirects', async () => {
    const app = setup();
    app.request.mockImplementationOnce(async () => {
      throw new Error('Authorization: Bearer ' + token);
    });
    await expect(app.publisher.connect('alice', token)).rejects.toThrow('Portal request failed');
    app.request.mockResolvedValueOnce(new Response(token, { status: 403 }));
    await expect(app.publisher.connect('alice', token)).rejects.toThrow('403');
    expect(app.request.mock.calls[0][1]?.redirect).toBe('error');
    expect(() => new PortalClient('http://public.example')).toThrow('HTTPS');
    expect(() => new PortalClient('https://public.example/other')).toThrow('HTTPS');
  });

  it('never reports success or retries when the returned schema differs from the approved content', async () => {
    const app = setup();
    await app.publisher.connect('alice', token);
    const draft = await app.publisher.prepare('alice', 'workspace', 1, app.tool);
    app.request.mockResolvedValueOnce(Response.json({ version: 99, schema: { id: 1, title: 'Ignored', items: [] } }));
    await expect(app.publisher.approve('alice', draft.publicationId, draft.digest)).rejects.toThrow(
      'verification failed'
    );
    await expect(app.publisher.approve('alice', draft.publicationId, draft.digest)).rejects.toThrow(
      'already attempted'
    );
    expect(app.request.mock.calls.filter(([url]) => String(url).endsWith('/publish'))).toHaveLength(1);
  });

  it('rejects expired approvals before sending a write', async () => {
    const app = setup();
    await app.publisher.connect('alice', token);
    const draft = await app.publisher.prepare('alice', 'workspace', 1, app.tool);
    vi.spyOn(Date, 'now').mockReturnValue(Date.parse(draft.expiresAt) + 1);
    await expect(app.publisher.approve('alice', draft.publicationId, draft.digest)).rejects.toThrow('expired');
    expect(app.request.mock.calls.some(([url]) => String(url).endsWith('/publish'))).toBe(false);
  });

  it('does not change the publication identity when a personal Portal key is revoked', async () => {
    const app = setup();
    await app.publisher.connect('alice', token);
    const draft = await app.publisher.prepare('alice', 'workspace', 1, app.tool);
    app.request.mockResolvedValueOnce(Response.json({}, { status: 401 }));
    await expect(app.publisher.approve('alice', draft.publicationId, draft.digest)).rejects.toThrow('401');
    expect(app.request.mock.calls.at(-1)![1]?.headers).toMatchObject({ Authorization: `Bearer ${token}` });
    await expect(app.publisher.approve('alice', draft.publicationId, draft.digest)).rejects.toThrow(
      'already attempted'
    );
  });

  it('preserves the old encrypted credential if durable replacement fails', async () => {
    const app = setup();
    await app.publisher.connect('alice', token);
    vi.spyOn(fs, 'renameSync').mockImplementationOnce(() => {
      throw new Error('disk full');
    });
    await expect(app.publisher.connect('alice', token + 'new')).rejects.toThrow('disk full');
    expect(app.vault.get('alice')?.token).toBe(token);
    expect(fs.readdirSync(app.directory)).toHaveLength(1);
  });
});

it('scopes workspace invalidation to its owner even when workspace names match', async () => {
  const app = setup();
  await app.publisher.connect('alice', token);
  await app.publisher.connect('bob', token);
  await app.publisher.prepare('alice', 'default', 1, app.tool);
  await app.publisher.prepare('bob', 'default', 1, app.tool);
  expect(app.publisher.publications('alice')).toHaveLength(1);
  app.publisher.invalidateWorkspace('bob', 'default');
  expect(app.publisher.publications('alice')).toHaveLength(1);
  expect(app.publisher.publications('bob')).toEqual([]);
});

it('cancels both queued and in-flight preparations when their workspace closes', async () => {
  const app = setup();
  await app.publisher.connect('alice', token);
  let release!: () => void;
  let started!: () => void;
  const waiting = new Promise<void>((resolve) => {
    started = resolve;
  });
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  app.request.mockImplementationOnce(async () => {
    started();
    await gate;
    return Response.json({ id: 1, time_update: '2026-11-06T01:00:00Z', items: [] });
  });
  const active = app.publisher.prepare('alice', 'default', 1, app.tool);
  const queued = app.publisher.prepare('alice', 'default', 1, app.tool);
  const activeRejected = expect(active).rejects.toThrow('Workspace was closed');
  const queuedRejected = expect(queued).rejects.toThrow('Workspace was closed');
  await waiting;
  app.publisher.invalidateWorkspace('alice', 'default');
  release();
  await Promise.all([activeRejected, queuedRejected]);
  expect(app.publisher.publications('alice')).toEqual([]);
  const replacement = new RSToolAgent();
  replacement.ensureSession();
  await app.publisher.prepare('alice', 'default', 1, replacement);
  expect(app.publisher.publications('alice')).toHaveLength(1);
});

it('reports attribution-only changes and accepts reordered equivalent attribution on readback', async () => {
  const app = setup();
  await app.publisher.connect('alice', token);
  const schema = {
    contract_version: '1.0.0',
    title: 'Attribution',
    alias: 'ATTR',
    description: '',
    items: [1, 2, 3].map((id) => ({
      id,
      alias: `X${id}`,
      cst_type: 'basic',
      term_raw: `object ${id}`,
      convention: 'Objects',
    })),
    attribution: [
      { container: 1, attribute: 2 },
      { container: 1, attribute: 3 },
    ],
  };
  app.tool.importData(schema, 'portal-schema');
  const exported = JSON.parse(app.tool.exportPortal({ kind: 'schema', format: 'json' }) as string);
  app.setRemote({ ...exported, attribution: [{ container: 3, attribute: 2 }] });
  const draft = await app.publisher.prepare('alice', 'workspace', 1, app.tool);
  expect(draft.changes).toMatchObject({
    added: [],
    removed: [],
    changed: [],
    metadataChanged: [],
    attributionAdded: [
      { container: 'X1', attribute: 'X2' },
      { container: 'X1', attribute: 'X3' },
    ],
    attributionRemoved: [{ container: 'X3', attribute: 'X2' }],
  });
  const normal = app.request.getMockImplementation()!;
  app.request.mockImplementation(async (input, options) => {
    const response = await normal(input, options);
    if (String(input).endsWith('/details')) {
      const data = (await response.json()) as Record<string, any>;
      return Response.json({ ...data, attribution: [...data.attribution].reverse() });
    }
    return response;
  });
  await expect(app.publisher.approve('alice', draft.publicationId, draft.digest)).resolves.toMatchObject({
    version: 99,
  });
});

it('marks a divergent independent readback uncertain and never repeats the write', async () => {
  const app = setup();
  await app.publisher.connect('alice', token);
  const draft = await app.publisher.prepare('alice', 'workspace', 1, app.tool);
  const normal = app.request.getMockImplementation()!;
  app.request
    .mockImplementationOnce(normal)
    .mockResolvedValueOnce(Response.json({ id: 1, title: 'Divergent', items: [] }));
  await expect(app.publisher.approve('alice', draft.publicationId, draft.digest)).rejects.toThrow(
    'verification failed'
  );
  expect(app.publisher.publications('alice')[0].state).toBe('uncertain');
  await expect(app.publisher.approve('alice', draft.publicationId, draft.digest)).rejects.toThrow('already attempted');
  expect(app.request.mock.calls.filter(([url]) => String(url).endsWith('/publish'))).toHaveLength(1);
});


it('updates only a description with a bound key and no local session or approval', async () => {
  const app = setup();
  await app.publisher.connect('alice', token);
  const result = await app.publisher.updateDescription('alice', 1, '2026-11-06T01:00:00Z', '  Comment\n');
  expect(result).toEqual({ targetId: 1, description: '  Comment\n', time_update: '2026-11-06T02:00:00Z' });
  const writes = app.request.mock.calls.filter(([, options]) => options?.method === 'POST');
  expect(writes).toHaveLength(1);
  expect(String(writes[0][0])).toMatch(/\/description$/);
  expect(JSON.parse(String(writes[0][1]?.body))).toEqual({ expected_time_update: '2026-11-06T01:00:00Z', description: '  Comment\n' });
  expect(app.publisher.publications('alice')).toEqual([]);
  await expect(app.publisher.updateDescription('bob', 1, result.time_update, 'Other')).rejects.toThrow('personal Portal key');
  await expect(app.publisher.updateDescription('alice', 1, '2026-11-06T01:00:00Z', 'Stale')).rejects.toThrow('schema changed');
  expect(app.request.mock.calls.filter(([, options]) => options?.method === 'POST')).toHaveLength(1);
});

it('detects readback divergence and never repeats an uncertain description write', async () => {
  const app = setup();
  await app.publisher.connect('alice', token);
  const normal = app.request.getMockImplementation()!;
  app.request.mockImplementationOnce(normal).mockImplementationOnce(normal)
    .mockResolvedValueOnce(Response.json({ id: 1, time_update: '2026-11-06T02:00:00Z', description: 'Comment',
      title: 'Tampered', items: [] }));
  await expect(app.publisher.updateDescription('alice', 1, '2026-11-06T01:00:00Z', 'Comment')).rejects.toThrow('verification failed');
  expect(app.request.mock.calls.filter(([, options]) => options?.method === 'POST')).toHaveLength(1);
});

it('enforces service target grants and sanitizes conflicts for description writes', async () => {
  const app = setup();
  const publisher = new PortalPublisher(app.vault, new PortalClient('https://api.portal.example', app.request), {
    token, subjects: ['robot'], targetIds: [1],
  });
  await expect(publisher.updateDescription('robot', 2, '2026-11-06T01:00:00Z', '')).rejects.toThrow('not allowed');
  const normal = app.request.getMockImplementation()!;
  app.request.mockImplementationOnce(normal).mockResolvedValueOnce(new Response(token, { status: 409 }));
  await expect(publisher.updateDescription('robot', 1, '2026-11-06T01:00:00Z', 'Comment')).rejects.toThrow(/^Portal schema changed; read the current revision before retrying$/);
  expect(app.request.mock.calls.at(-1)?.[1]?.headers).toMatchObject({ Authorization: `Bearer ${token}` });
});


it('reads public descriptions anonymously and private data through a bound key without creating a session', async () => {
  const app = setup();
  expect(await app.publisher.getDescription('alice', 1)).toMatchObject({ targetId: 1 });
  expect(app.request.mock.calls.at(-1)?.[1]?.headers).not.toHaveProperty('Authorization');
  await app.publisher.connect('alice', token);
  expect(await app.publisher.getDescription('alice', 1)).toEqual({ targetId: 1, description: '', time_update: '2026-11-06T01:00:00Z' });
  expect(app.request.mock.calls.at(-1)?.[1]?.headers).toMatchObject({ Authorization: `Bearer ${token}` });
  expect(await app.publisher.getDescription('bob', 1)).toMatchObject({ targetId: 1 });
  expect(app.request.mock.calls.at(-1)?.[1]?.headers).not.toHaveProperty('Authorization');
  expect(app.request.mock.calls.filter(([, options]) => options?.method === 'POST')).toHaveLength(0);
  expect(app.publisher.publications('alice')).toEqual([]);
});

it('enforces read target grants and rejects invalid revisions and remote errors without leaking bodies', async () => {
  const app = setup();
  const publisher = new PortalPublisher(app.vault, new PortalClient('https://api.portal.example', app.request), {
    token, subjects: ['robot'], targetIds: [1],
  });
  app.request.mockResolvedValueOnce(Response.json({ id: 2, description: '', time_update: '2026-11-06T01:00:00Z' }));
  expect(await publisher.getDescription('robot', 2)).toMatchObject({ targetId: 2 });
  expect(app.request.mock.calls.at(-1)?.[1]?.headers).not.toHaveProperty('Authorization');
  expect(await publisher.getDescription('robot', 1)).toMatchObject({ targetId: 1 });
  app.request.mockResolvedValueOnce(new Response(token, { status: 403 }));
  await expect(publisher.getDescription('robot', 1)).rejects.toThrow(/^Portal refused the request \(403\)$/);
  app.request.mockResolvedValueOnce(Response.json({ id: 1, description: '', time_update: 'invalid' }));
  await expect(publisher.getDescription('robot', 1)).rejects.toThrow('invalid schema metadata');
  app.request.mockResolvedValueOnce(Response.json({ id: 2, description: '', time_update: '2026-11-06T01:00:00Z' }));
  await expect(publisher.getDescription('robot', 1)).rejects.toThrow('invalid schema metadata');
});

it('keeps public reads anonymous while scoped keys independently restrict edits and publication', async () => {
  const app = setup();
  app.request.mockResolvedValueOnce(Response.json({ id: 10, username: 'Synthetic', scopes: ['read'], expires_at: null }));
  const status = await app.publisher.connect('alice', token);
  expect(status).toMatchObject({ connected: true, keyPolicy: { scopes: ['read'], expiresAt: null } });
  expect(JSON.stringify(status)).not.toContain(token);
  expect(await app.publisher.getDescription('alice', 1)).toMatchObject({ targetId: 1 });
  await expect(app.publisher.updateDescription('alice', 1, '2026-11-06T01:00:00Z', 'Denied')).rejects.toThrow('does not allow write');
  await expect(app.publisher.prepare('alice', 'task', 1, app.tool)).rejects.toThrow('does not allow publish');
  expect(app.request.mock.calls.filter(([, options]) => options?.method === 'POST')).toHaveLength(0);
});

it('rejects an expired bound key for writes but still reads public data without it', async () => {
  const app = setup();
  const expires = Date.now() + 3600000;
  app.request.mockResolvedValueOnce(Response.json({ id: 10, username: 'Synthetic', scopes: ['read', 'write', 'publish'], expires_at: new Date(expires).toISOString() }));
  await app.publisher.connect('alice', token);
  vi.spyOn(Date, 'now').mockReturnValue(expires);
  expect(app.publisher.connection('alice')).toMatchObject({ connected: false, expired: true });
  expect(await app.publisher.getDescription('alice', 1)).toMatchObject({ targetId: 1 });
  expect(app.request.mock.calls.at(-1)?.[1]?.headers).not.toHaveProperty('Authorization');
  await expect(app.publisher.updateDescription('alice', 1, '2026-11-06T01:00:00Z', 'Denied')).rejects.toThrow('expired');
  expect(app.request.mock.calls.filter(([, options]) => options?.method === 'POST')).toHaveLength(0);
});

it('does not turn an anonymous refusal into enrollment or expose the upstream body', async () => {
  const app = setup();
  app.request.mockResolvedValueOnce(new Response('SYNTHETIC_PRIVATE_BODY', { status: 403 }));
  await expect(app.publisher.getDescription('anonymous', 1)).rejects.toThrow(/^Portal refused the request \(403\)$/);
  expect(app.request.mock.calls).toHaveLength(1);
  expect(app.request.mock.calls[0][1]?.headers).not.toHaveProperty('Authorization');
  expect(app.vault.get('anonymous')).toBeNull();
});

it('requires read as well as the mutation scope before issuing any request', async () => {
  const app = setup();
  for (const scope of ['write', 'publish']) {
    app.request.mockResolvedValueOnce(Response.json({ id: 10, username: 'Synthetic', scopes: [scope], expires_at: null }));
    await app.publisher.connect('alice', token);
    const requests = app.request.mock.calls.length;
    if (scope === 'write') {
      await expect(app.publisher.updateDescription('alice', 1, '2026-11-06T01:00:00Z', 'Denied')).rejects.toThrow('does not allow read');
    } else {
      await expect(app.publisher.prepare('alice', 'task', 1, app.tool)).rejects.toThrow('does not allow read');
    }
    expect(app.request.mock.calls).toHaveLength(requests);
  }
});

function annotatedDuplicate(app: ReturnType<typeof setup>) {
  const comment = 'The printed source repeats this expression for different roles; preserve the error unchanged.';
  app.tool.applySchemaPatch({ initial: { comment: 'Annotated source with known errors, not a corrected theory.' }, items: [
    { alias: 'D1', term: 'First source role', definitionFormal: 'X1', convention: comment },
    { alias: 'D2', term: 'Second source role', definitionFormal: 'X1', convention: comment },
  ] });
  const material = JSON.parse(app.tool.exportPortal({ kind: 'schema', format: 'json' }) as string);
  material.description = 'Annotated source with known errors, not a corrected theory.';
  app.tool.importData(material);
  const diagnostics = app.tool.listDiagnostics().filter(d => d.kind === 'schema' && d.severity === 'error');
  expect(diagnostics).toHaveLength(2);
  return { intent: 'annotated_source', source: 'SYNTHETIC-SOURCE.pdf', sourceSha256: 'a'.repeat(64),
    diagnostics: diagnostics.map(d => ({ alias: d.alias!, code: d.code,
      expressionSha256: createHash('sha256').update(d.expression ?? '').digest('hex'), pages: [3], comment })) };
}

it('keeps the default gate and only prepares an exact annotated-source review for human approval', async () => {
  const app = setup();
  await app.publisher.connect('alice', token);
  const review = annotatedDuplicate(app);
  const unchanged = app.tool.exportSession();
  await expect(app.publisher.prepare('alice', 'task', 1, app.tool)).rejects.toThrow('Resolve schema diagnostics');
  const prepared = await app.publisher.prepare('alice', 'task', 1, app.tool, undefined, review);
  expect(prepared.sourceReview).toEqual(review);
  prepared.sourceReview!.source = 'TAMPERED-RETURN-VALUE';
  expect(app.request.mock.calls.filter(([url]) => String(url).endsWith('/publish'))).toHaveLength(0);
  const [proposal] = app.publisher.publications('alice');
  expect(proposal.sourceReview).toEqual(review);
  review.source = 'CHANGED-CALLER-VALUE';
  review.diagnostics[0].pages.push(999);
  expect(app.publisher.publications('alice')[0].sourceReview?.source).toBe('SYNTHETIC-SOURCE.pdf');
  expect(app.publisher.publications('alice')[0].sourceReview?.diagnostics[0].pages).toEqual([3]);
  await app.publisher.approve('alice', proposal.id, proposal.digest);
  expect(app.tool.exportSession()).toBe(unchanged);
  expect(app.tool.listDiagnostics().filter(d => d.kind === 'schema' && d.severity === 'error')).toHaveLength(2);
  expect(app.request.mock.calls.filter(([url]) => String(url).endsWith('/publish'))).toHaveLength(1);
  await expect(app.publisher.approve('alice', proposal.id, proposal.digest)).rejects.toThrow('already attempted');
});

it('rejects missing, stale, incomplete or detached source-error explanations without Portal reads or writes', async () => {
  const app = setup();
  await app.publisher.connect('alice', token);
  const valid = annotatedDuplicate(app);
  const invalid = [
    { ...valid, ignoreDiagnostics: true },
    { ...valid, sourceSha256: 'not-a-sha' },
    { ...valid, diagnostics: valid.diagnostics.slice(0, 1) },
    { ...valid, diagnostics: [valid.diagnostics[0], valid.diagnostics[0]] },
    { ...valid, diagnostics: valid.diagnostics.map(d => ({ ...d, expressionSha256: '0'.repeat(64) })) },
    { ...valid, diagnostics: valid.diagnostics.map(d => ({ ...d, pages: [] })) },
    { ...valid, diagnostics: valid.diagnostics.map(d => ({ ...d, comment: 'This explanation was never stored in the source constituent.' })) },
  ];
  const calls = app.request.mock.calls.length;
  for (const review of invalid) await expect(app.publisher.prepare('alice', 'task', 1, app.tool, undefined, review)).rejects.toThrow();
  expect(app.request.mock.calls).toHaveLength(calls);
  expect(app.publisher.publications('alice')).toEqual([]);
});

it('does not extend the review exception to other schema errors or allow publishing a changed source session', async () => {
  const app = setup();
  await app.publisher.connect('alice', token);
  const review = annotatedDuplicate(app);
  const prepared = await app.publisher.prepare('alice', 'task', 1, app.tool, undefined, review);
  app.tool.applySchemaPatch({ items: [{ alias: 'X1', convention: '' }] });
  await expect(app.publisher.approve('alice', prepared.publicationId, prepared.digest)).rejects.toThrow('Local schema changed');
  const actual = app.tool.listDiagnostics();
  const matchingLengthReview = { ...review, diagnostics: actual.filter(d => d.kind === 'schema' && d.severity === 'error')
    .map(() => review.diagnostics[0]) };
  vi.spyOn(app.tool, 'listDiagnostics').mockReturnValueOnce(actual.map(d =>
    d.kind === 'schema' && d.severity === 'error' ? { ...d, name: 'unreviewableSchemaError' } : d));
  await expect(app.publisher.prepare('alice', 'task', 1, app.tool, undefined, matchingLengthReview)).rejects.toThrow('other schema errors');
  expect(app.request.mock.calls.filter(([url]) => String(url).endsWith('/publish'))).toHaveLength(0);
});
