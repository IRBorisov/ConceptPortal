import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { RSToolAgent } from './rstool-agent';
import { CstType } from './common';

const directories: string[] = [];

afterEach(() => {
  vi.restoreAllMocks();
  for (const directory of directories.splice(0)) {
    const relative = path.relative(path.resolve(os.tmpdir()), path.resolve(directory));
    if (relative.startsWith('..') || !relative.startsWith('rstool-integrity-')) throw new Error('Unsafe cleanup path');
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

/** Create private storage for tests that must compare live state with a restarted agent. */
function persistedAgent() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rstool-integrity-'));
  directories.push(directory);
  const tool = new RSToolAgent({ persistenceDir: directory });
  tool.applySchemaPatch({ items: [{ alias: 'X1', convention: 'Objects' }] });
  return { directory, tool };
}

describe('RSToolAgent session integrity', () => {
  it('does not roll back a successful schema edit when an overlapping model update fails', async () => {
    const tool = new RSToolAgent();
    tool.applySchemaPatch({ items: [{ alias: 'X1' }] });
    const pending = tool.setModelValues({ set: [{ target: 1, value: { 0: 'one' } }, { target: 999, value: 1 }] });
    tool.applySchemaPatch({ items: [{ alias: 'X2' }] });
    await expect(pending).rejects.toThrow(/Unknown constituent/);
    expect(tool.getSessionState().items.map(item => item.alias)).toEqual(['X1', 'X2']);
    expect(tool.getModelState().items).toEqual([]);
  });

  it('keeps pending model changes private and rejects a stale successful commit', async () => {
    const tool = new RSToolAgent();
    tool.applySchemaPatch({ items: [{ alias: 'X1' }] });
    const pending = tool.setModelValues({ set: [{ target: 1, value: { 0: 'one' } }] });
    expect(tool.getModelState().items).toEqual([]);
    tool.applySchemaPatch({ items: [{ alias: 'X2' }] });
    await expect(pending).rejects.toThrow(/Session changed/);
    expect(tool.getSessionState().items.map(item => item.alias)).toEqual(['X1', 'X2']);
    expect(tool.getModelState().items).toEqual([]);
  });

  it('lets at most one conflicting model update commit without losing the winner', async () => {
    const tool = new RSToolAgent();
    tool.applySchemaPatch({ items: [{ alias: 'X1' }] });
    const results = await Promise.allSettled([
      tool.setModelValues({ set: [{ target: 1, value: { 0: 'first' } }] }),
      tool.setModelValues({ set: [{ target: 1, value: { 0: 'second' } }] }),
    ]);
    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(result => result.status === 'rejected')).toHaveLength(1);
    expect(tool.getModelState().items[0].value).toEqual({ 0: 'first' });
  });

  it('allows independent sessions to update concurrently despite a current-session switch', async () => {
    const tool = new RSToolAgent();
    const first = tool.applySchemaPatch({ items: [{ alias: 'X1' }] }).session;
    const pending = tool.setModelValues({ set: [{ target: 1, value: { 0: 'first' } }] });
    const second = tool.createSession();
    tool.applySchemaPatch({ items: [{ alias: 'X1' }] }, second.sessionId);
    await Promise.all([pending, tool.setModelValues({ set: [{ target: 1, value: { 0: 'second' } }] })]);
    expect(tool.getCurrentSession()?.sessionId).toBe(second.sessionId);
    expect(tool.getModelState(first.sessionId).items[0].value).toEqual({ 0: 'first' });
    expect(tool.getModelState(second.sessionId).items[0].value).toEqual({ 0: 'second' });
  });

  it.each(['patch', 'revision', 'diagnostics', 'order', 'recalculate', 'model'] as const)(
    'preserves live and persisted state when a %s save fails', async operation => {
      const { directory, tool } = persistedAgent();
      if (operation === 'order' || operation === 'recalculate') {
        tool.applySchemaPatch({ items: [{ alias: 'D1', definitionFormal: '1+2' }] });
        if (operation === 'recalculate') {
          tool.analyzeExpression({ expression: '(', cstType: CstType.TERM, recordDiagnostics: true });
        }
        const exported = JSON.parse(tool.exportSession());
        exported.state.items.reverse();
        tool.importData(exported, 'session');
        const control = new RSToolAgent();
        control.importData(tool.exportSession(), 'session');
        if (operation === 'order') {
          expect(control.restoreOrder().orderedAliases).toEqual(['X1', 'D1']);
          expect(JSON.parse(tool.exportSession()).state.items.map((item: { alias: string }) => item.alias)).toEqual(['D1', 'X1']);
        } else {
          const previousDiagnostics = control.listDiagnostics();
          expect(control.recalculateModel().items.find(item => item.alias === 'D1')?.value).toBe(3);
          expect(control.listDiagnostics()).not.toEqual(previousDiagnostics);
        }
      }
      const before = tool.exportSession();
      vi.spyOn(fs, 'renameSync').mockImplementation(() => { throw new Error('Simulated rename failure'); });
      const mutate = () => {
        switch (operation) {
          case 'patch': return tool.applySchemaPatch({ items: [{ alias: 'X2' }], commitMessage: 'must not commit' });
          case 'revision': return tool.commitStep('must not commit');
          case 'diagnostics': return tool.analyzeExpression({ expression: '(', cstType: CstType.TERM, recordDiagnostics: true });
          case 'order': return tool.restoreOrder();
          case 'recalculate': return tool.recalculateModel();
          case 'model': return tool.setModelValues({ set: [{ target: 1, value: { 0: 'one' } }] });
        }
      };
      await expect(Promise.resolve().then(async () => { await mutate(); })).rejects.toThrow(/Simulated rename failure/);
      vi.restoreAllMocks();
      expect(tool.exportSession()).toBe(before);
      expect(new RSToolAgent({ persistenceDir: directory }).exportSession()).toBe(before);
    },
  );

  it('does not switch the live current-session pointer when its durable update fails', () => {
    const { directory, tool } = persistedAgent();
    const first = tool.getCurrentSession();
    const second = tool.createSession();
    tool.setCurrentSession(first!.sessionId);
    const rename = fs.renameSync;
    vi.spyOn(fs, 'renameSync').mockImplementation((source, destination) => {
      if (String(destination).endsWith('_current.json')) throw new Error('Simulated pointer failure');
      return rename(source, destination);
    });
    expect(() => tool.setCurrentSession(second.sessionId)).toThrow(/Simulated pointer failure/);
    vi.restoreAllMocks();
    expect(tool.getCurrentSession()).toEqual(first);
    expect(new RSToolAgent({ persistenceDir: directory }).getCurrentSession()).toEqual(first);
  });

  it('does not expose committed state through patch results or revision handles', () => {
    const tool = new RSToolAgent();
    const result = tool.applySchemaPatch({ items: [{ alias: 'X1' }] });
    result.applied[0].alias = 'changed outside rstool';
    const revision = tool.commitStep('saved');
    revision.message = 'changed outside rstool';
    expect(tool.getSessionState().items[0].alias).toBe('X1');
    expect(tool.getSessionState()).toMatchObject({ lastRevision: { message: 'saved' } });
    const diagnostics = tool.listDiagnostics();
    diagnostics[0].alias = 'changed outside rstool';
    expect(tool.listDiagnostics()[0].alias).toBe('X1');
    const summary = tool.getSessionState() as import('./agent-workflow').SessionSummary;
    summary.lastRevision!.message = 'changed outside rstool';
    expect(tool.getSessionState()).toMatchObject({ lastRevision: { message: 'saved' } });
  });

  it('leaves no empty imported session or pointer change when the Portal payload is malformed', () => {
    const { directory, tool } = persistedAgent();
    const before = tool.exportSession();
    const files = fs.readdirSync(directory).sort();
    expect(() => tool.importData({ title: 'invalid', items: null }, 'portal-schema')).toThrow();
    expect(tool.exportSession()).toBe(before);
    expect(fs.readdirSync(directory).sort()).toEqual(files);
  });
});
