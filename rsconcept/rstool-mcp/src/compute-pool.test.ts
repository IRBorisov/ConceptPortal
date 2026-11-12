import fs from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { HostedRSToolAgent } from '@rsconcept/rstool/hosting';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ComputePool } from './compute-pool';

const pools: ComputePool[] = [];
const directories: string[] = [];
afterEach(async () => {
  await Promise.all(pools.splice(0).map(pool => pool.close()));
  vi.unstubAllEnvs();
  for (const directory of directories.splice(0)) fs.rmSync(directory, { recursive: true, force: true });
});
function pool(options: ConstructorParameters<typeof ComputePool>[0] = {}) {
  const value = new ComputePool(options);
  pools.push(value);
  return value;
}
function fixture(source: string) {
  const directory = fs.mkdtempSync(join(tmpdir(), 'rstool-compute-'));
  directories.push(directory);
  const file = join(directory, 'fixture.mjs');
  fs.writeFileSync(file, source);
  return pathToFileURL(file);
}

describe('disposable computation processes', () => {
  it('runs the real engine, commits one staged mutation and preserves library errors', async () => {
    const executor = pool();
    const live = new HostedRSToolAgent();
    await expect(executor.execute(live, 'evaluate', { expression: '1+2', cstType: 'term' })).rejects.toMatchObject({ code: 'NO_CURRENT_SESSION' });
    await executor.execute(live, 'apply_schema_patch', { items: [{ alias: 'X1' }] });
    expect(live.getSessionState().items).toHaveLength(1);
    await expect(executor.execute(live, 'evaluate', { expression: '1+2', cstType: 'term' })).resolves.toMatchObject({ success: true });
    const other = live.createSession();
    const selected = live.createSession();
    await executor.execute(live, 'apply_schema_patch', { sessionId: other.sessionId, items: [{ alias: 'X9' }] });
    expect(live.getCurrentSession()?.sessionId).toBe(selected.sessionId);
    expect(live.getSessionState('full', other.sessionId).items.map(item => item.alias)).toEqual(['X9']);
    await executor.execute(live, 'synthesize', { sourceSessionId: other.sessionId });
    await executor.execute(live, 'analyze_expression', { expression: '1+2', cstType: 'term' });
    await executor.execute(live, 'set_model_values', {});
    await executor.execute(live, 'recalculate_model', {});
    await executor.execute(live, 'restore_order', {});
    expect(live.getSessionState().items.map(item => item.alias)).toEqual(['X9']);
    const exported = live.exportSession(other.sessionId);
    await executor.execute(live, 'import_data', { payload: exported });
    expect(live.getCurrentSession()?.sessionId).toBe(other.sessionId);
  }, 30_000);

  it('preserves missing-session errors before source capture', async () => {
    const executor = pool();
    const live = new HostedRSToolAgent();
    live.createSession();
    await expect(executor.execute(live, 'evaluate', { sessionId: 'missing', expression: '1+2', cstType: 'term' }))
      .rejects.toMatchObject({ code: 'SESSION_NOT_FOUND' });
    await expect(executor.execute(live, 'synthesize', { sourceSessionId: 'missing' }))
      .rejects.toMatchObject({ code: 'SESSION_NOT_FOUND' });
    expect(live.getSessionState().items).toEqual([]);
  });

  it('kills a blocked CPU process, bounds parallel work and keeps the parent responsive', async () => {
    const executor = pool({ maxWorkers: 1, timeoutMs: 700, workerUrl: fixture("process.once('message', () => { while (true) {} });") });
    const live = new HostedRSToolAgent();
    live.createSession();
    const before = live.getSessionState('full');
    const work = executor.execute(live, 'evaluate', { expression: '1+2', cstType: 'term' });
    const rejected = expect(work).rejects.toMatchObject({ code: 'COMPUTE_TIMEOUT' });
    await expect(executor.execute(live, 'evaluate', {})).rejects.toMatchObject({ code: 'COMPUTE_CAPACITY_REACHED' });
    let beats = 0;
    const timer = setInterval(() => beats++, 20);
    try { await rejected; } finally { clearInterval(timer); }
    expect(beats).toBeGreaterThan(3);
    expect(live.getSessionState('full')).toEqual(before);
  }, 10_000);

  it('kills on abort or shutdown and never commits a disconnected result', async () => {
    const url = fixture("process.once('message', () => { while (true) {} });");
    const executor = pool({ workerUrl: url });
    const live = new HostedRSToolAgent();
    live.createSession();
    const controller = new AbortController();
    const work = executor.execute(live, 'evaluate', {}, controller.signal);
    const rejected = expect(work).rejects.toMatchObject({ code: 'COMPUTE_CANCELLED' });
    controller.abort();
    await rejected;
    const next = executor.execute(live, 'evaluate', {});
    const stopped = expect(next).rejects.toMatchObject({ code: 'COMPUTE_CANCELLED' });
    await executor.close();
    await stopped;
    await expect(executor.execute(live, 'evaluate', {})).rejects.toMatchObject({ code: 'COMPUTE_STOPPING' });
    await expect(pool().execute(live, 'apply_schema_patch', { items: [{ alias: 'X1' }] }, undefined, () => false))
      .rejects.toMatchObject({ code: 'COMPUTE_CANCELLED' });
    expect(live.getSessionState().items).toEqual([]);
  }, 15_000);

  it('does not inherit host credentials or NODE_OPTIONS', async () => {
    vi.stubEnv('RSTOOL_PRIVATE_TEST', 'synthetic-private-marker');
    vi.stubEnv('NODE_OPTIONS', '--expose-gc');
    const executor = pool({ workerUrl: fixture(`process.once('message', job => {
      process.send({ok: true, result: {secret: !!process.env.RSTOOL_PRIVATE_TEST, options: !!process.env.NODE_OPTIONS,
        bounded: process.execArgv.some(value => value === '--max-old-space-size=128')}, snapshot: job.snapshot});
    });`) });
    await expect(executor.execute(new HostedRSToolAgent(), 'import_data', {}))
      .resolves.toEqual({ secret: false, options: false, bounded: true });
  });

  it('rejects oversized model or result before committing any staged mutation', async () => {
    const live = new HostedRSToolAgent();
    live.createSession();
    const before = live.getSessionState('full');
    const limited = pool({ maxSessionBytes: 700 });
    await expect(limited.execute(live, 'apply_schema_patch', { items: [{ alias: 'X1', term: 'a'.repeat(3000) }] }))
      .rejects.toMatchObject({ code: 'SESSION_TOO_LARGE' });
    const smallResult = pool({ maxResultBytes: 1 });
    await expect(smallResult.execute(live, 'apply_schema_patch', { items: [{ alias: 'X1' }] }))
      .rejects.toMatchObject({ code: 'COMPUTE_RESULT_TOO_LARGE' });
    expect(live.getSessionState('full')).toEqual(before);
  }, 20_000);

  it('treats a crashed process as a failed invocation with no state change', async () => {
    const executor = pool({ workerUrl: fixture("process.once('message', () => process.exit(7));") });
    const live = new HostedRSToolAgent();
    live.createSession();
    await expect(executor.execute(live, 'evaluate', {})).rejects.toMatchObject({ code: 'COMPUTE_RESOURCE_LIMIT' });
    expect(live.getSessionState().items).toEqual([]);
  });
});
