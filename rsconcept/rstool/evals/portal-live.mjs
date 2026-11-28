import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

import { Client } from '../../rstool-mcp/node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js';
import { StreamableHTTPClientTransport } from '../../rstool-mcp/node_modules/@modelcontextprotocol/sdk/dist/esm/client/streamableHttp.js';
import { createBearerIdentityVerifier, createRSToolHttpServer, PortalClient, PortalCreations, PortalPublisher, PortalVault }
  from '../../rstool-mcp/dist/index.js';

const [python, output] = process.argv.slice(2);
if (!python || !output) throw new Error('Usage: node rsconcept/rstool/evals/portal-live.mjs <backend-python> <result.json>');

const temporary = await realpath(tmpdir());
const directory = await realpath(await mkdtemp(join(temporary, 'rstool-portal-live-')));
const fixturePath = fileURLToPath(new URL('./portal-live-fixture.py', import.meta.url));
const backend = spawn(python, ['-B', fixturePath, join(directory, 'portal.sqlite3')], { stdio: ['ignore', 'pipe', 'inherit'] });
const backendOutput = readline.createInterface({ input: backend.stdout });
const backendClosed = new Promise(resolve => backend.once('close', resolve));
let mcp;
const clients = [];

try {
  const fixture = await new Promise((resolve, reject) => {
    backend.once('error', reject);
    backend.once('exit', code => reject(new Error(`Portal fixture stopped before startup (${code})`)));
    backendOutput.on('line', line => {
      const prefix = 'RSTOOL_EVAL_FIXTURE ';
      if (line.startsWith(prefix)) resolve(JSON.parse(line.slice(prefix.length)));
    });
  });
  const portal = `http://127.0.0.1:${fixture.port}`;
  const origin = 'https://portal.eval.invalid';
  const known = new Map();
  let trace, lose;
  const forward = async (url, init) => {
    const path = new URL(String(url)).pathname;
    const headers = new Headers(init?.headers);
    const droppingCreate = path === '/api/agents/rsforms' && init?.method === 'POST' && lose;
    // Model the old creation path on the same stack by dropping the idempotency header.
    if (droppingCreate === 'baseline') headers.delete('Idempotency-Key');
    const response = await fetch(String(url).replace(origin, portal), { ...init, headers });
    if (trace) {
      trace.portalRequests++;
      if (init?.method !== 'POST' && response.ok && /\/(access|details)$/.test(path)) {
        const revision = await response.clone().json();
        if (revision.id && revision.time_update) {
          const key = JSON.stringify([revision.id, revision.time_update]);
          if (known.has(key)) trace.repeatedRevisionReads++;
          known.set(key, true);
        }
      }
    }
    if (droppingCreate) {
      assert.equal(response.status, 201);
      lose = undefined;
      await response.body?.cancel();
      throw new Error('Synthetic transport response loss after Portal commits');
    }
    return response;
  };
  const publisher = new PortalPublisher(new PortalVault(join(directory, 'vault'), randomBytes(32)),
    new PortalClient(origin, forward), undefined, new PortalCreations(join(directory, 'receipts')));
  const credentials = Object.keys(fixture.accounts).map(subject => ({ subject, projectId: 'eval', token: randomBytes(32).toString('hex') }));
  mcp = createRSToolHttpServer({ persistenceDir: join(directory, 'sessions'), isolateComputations: false,
    verifyToken: createBearerIdentityVerifier(credentials),
    portal: { publisher, publicOrigin: 'https://mcp.eval.invalid', verifyAccountToken: () => null } });
  await new Promise((resolve, reject) => {
    mcp.server.once('error', reject);
    mcp.server.listen(0, '127.0.0.1', resolve);
  });
  const endpoint = `http://127.0.0.1:${mcp.server.address().port}`;

  function begin(version, scenario) {
    known.clear();
    trace = { version, scenario, steps: 0, toolOutputBytes: 0, largestOutputBytes: 0, portalRequests: 0,
      repeatedRevisionReads: 0, outputs: [] };
  }

  function record(name, value) {
    trace.steps++;
    const json = JSON.stringify({ name, value });
    assert.doesNotMatch(json, /\b(?:rcp_|rcm_|rcd_)[A-Za-z0-9_-]{20,}/);
    const size = Buffer.byteLength(json);
    trace.toolOutputBytes += size;
    trace.largestOutputBytes = Math.max(trace.largestOutputBytes, size);
    trace.outputs.push({ name, value });
    return value;
  }

  async function connect(token, name) {
    const client = new Client({ name: 'rstool-portal-eval', version: '1' });
    clients.push(client);
    await client.connect(new StreamableHTTPClientTransport(new URL(`${endpoint}/mcp/${name}`), {
      requestInit: { headers: { Authorization: `Bearer ${token}` } },
    }));
    return async (tool, args = {}, fails = false) => {
      const result = await client.callTool({ name: tool, arguments: args });
      assert.equal(!!result.isError, fails, `${tool} returned an unexpected result`);
      return record(tool, result.structuredContent ?? JSON.parse(result.content[0].text));
    };
  }

  async function rest(path, token) {
    const response = await forward(portal + path, { method: 'GET', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    assert.equal(response.status, 200, `fixture REST read ${path}`);
    return record('GET ' + path, await response.json());
  }

  const samples = [];
  for (const { subject: version, token } of credentials) {
    const account = fixture.accounts[version];
    const candidate = version === 'candidate';
    await publisher.connect([version, 'eval'], account.token);
    const call = await connect(token, `${version}-work`);
    const recover = await connect(token, `${version}-recovery`);

    begin(version, 'public-metadata');
    const metadata = candidate ? (await call('portal_preflight', {
      operation: 'read', audience: 'public', kind: 'schema', targetId: fixture.public,
    })).target : await rest(`/api/rsforms/${fixture.public}`);
    assert.equal(metadata.title, 'Public metadata');
    samples.push(trace);

    begin(version, 'evolve-schema');
    const source = await call('portal_get_details', { kind: 'schema', targetId: account.schema });
    await call('import_data', { payload: source, kind: 'portal-details' });
    const updated = await call('apply_schema_patch', { items: [
      { alias: 'X1', convention: 'Readers' }, { alias: 'X2', convention: 'Copies' },
      { alias: 'X3', convention: 'Open loans' },
      { alias: 'S1', definitionFormal: 'ℬ(X3×X2)', convention: 'Copy for each open loan' },
      { alias: 'S2', definitionFormal: 'ℬ(X3×X1)', convention: 'Reader for each open loan' },
      { alias: 'A1', definitionFormal: 'card(S1)=card(Pr2(S1))' },
    ] });
    assert.equal(updated.success, true);
    const state = await call('get_session_state', { detail: candidate ? 'summary' : 'full' });
    assert.equal(typeof state.sessionId, 'string');
    const ids = new Map(state.items.map(item => [item.alias, item.id]));
    const baseValues = { X1: { 0: 'reader 1', 1: 'reader 2' }, X2: { 0: 'copy 1', 1: 'copy 2' }, X3: { 0: 'loan 1', 1: 'loan 2' } };
    const interpretation = (secondCopy, secondReader) => ({ ...baseValues,
      S1: [[-111, 0, 0], [-111, 1, secondCopy]], S2: [[-111, 0, 0], [-111, 1, secondReader]] });
    for (const [values, expected] of [[interpretation(1, 0), 'HAS_DATA'], [interpretation(0, 1), 'AXIOM_FALSE']]) {
      await call('set_model_values', { set: Object.entries(values).map(([alias, value]) => ({ target: ids.get(alias), value })) });
      const evaluated = await call('evaluate', { constituentId: ids.get('A1') });
      assert.equal(evaluated.statusName, expected);
    }
    samples.push(trace);

    begin(version, 'recover-publication');
    const create = { requestId: 'stable-project-001', title: 'Source fixture', alias: 'SOURCE',
      location: '/U/Eval/Pilot', accessPolicy: 'private' };
    lose = version;
    await call(candidate ? 'portal_create_schema_from_session' : 'portal_create_schema', create, true);
    let targetId;
    if (candidate) {
      const receipt = await recover('portal_get_creation_status', { requestId: create.requestId });
      assert.equal(receipt.verifiedRevision, true);
      targetId = receipt.targetId;
    } else {
      const priorReceipt = await recover('portal_get_creation_status', { requestId: create.requestId });
      assert.equal(priorReceipt.state, 'uncertain');
      const result = await recover('portal_search_library', { query: create.title, location: create.location });
      assert.equal(result.ids.length, 1);
      [targetId] = result.ids;
      await call('portal_get_description', { targetId });
      const published = await call('portal_publish_schema', { targetId });
      assert.equal(published.verified, true);
    }
    const independentlyRead = await rest(`/api/agents/rsforms/${targetId}/details`, account.token);
    assert.equal(independentlyRead.owner, account.account);
    assert.equal(independentlyRead.location, create.location);
    assert.equal(independentlyRead.access_policy, 'private');
    assert.deepEqual(independentlyRead.items.map(item => item.alias), ['X1', 'X2', 'X3', 'S1', 'S2', 'A1']);
    samples.push(trace);
    trace = undefined;
  }

  const metrics = samples.map(({ outputs, ...metrics }) => metrics);
  await writeFile(output, JSON.stringify({ fixture: 'synthetic local Portal and MCP over HTTP', samples }, null, 2) + '\n');
  process.stdout.write(JSON.stringify(metrics, null, 2) + '\n');
} finally {
  for (const client of clients.reverse()) await client.close();
  await mcp?.close();
  backendOutput.close();
  backend.kill();
  await backendClosed;
  if (dirname(directory) === temporary && basename(directory).startsWith('rstool-portal-live-')) {
    await rm(directory, { recursive: true, force: true });
  }
}
