import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { TUPLE_ID } from '@rsconcept/domain';

import { CstType, EvalStatus, RSErrorCode, RSToolAgent } from './index';

function buildSampleForm(tool: RSToolAgent, sessionId: string) {
  tool.applySchemaPatch(
    {
      items: [{ alias: 'X1' }, { alias: 'D1', definitionFormal: '1+2' }, { alias: 'A1', definitionFormal: '1=1' }]
    },
    sessionId
  );
}

function fullState(tool: RSToolAgent, sessionId?: string) {
  return tool.getSessionState('full', sessionId) as import('./session').SessionState;
}

describe('RSToolAgent', () => {
  it('creates and exports a session', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    const exported = tool.exportSession(session.sessionId);
    expect(exported).toContain(session.sessionId);
    expect(exported).toContain('contractVersion');
  });

  it('analyzes a valid expression', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    const analysis = tool.analyzeExpression({ expression: '1+2', cstType: CstType.TERM }, session.sessionId);
    expect(analysis.success).toBe(true);
    expect(analysis.diagnostics.length).toBe(0);
  });

  it('returns syntax diagnostics for invalid expression', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    const analysis = tool.analyzeExpression({ expression: '(', cstType: CstType.TERM }, session.sessionId);
    expect(analysis.success).toBe(false);
    expect(analysis.diagnostics.length).toBeGreaterThan(0);
  });

  it('rejects formal definition for constants', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    const result = tool.applySchemaPatch(
      {
        items: [{ alias: 'C1', cstType: CstType.CONSTANT, definitionFormal: 'X1' }]
      },
      session.sessionId
    );
    expect(result.success).toBe(false);
    expect(result.failed[0]?.diagnostics[0]?.error.code).toBe(RSErrorCode.definitionNotAllowed);
  });

  it('rejects formal definition for basic sets', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    const result = tool.applySchemaPatch(
      {
        items: [{ alias: 'X1', cstType: CstType.BASE, definitionFormal: 'Z' }]
      },
      session.sessionId
    );
    expect(result.success).toBe(false);
    expect(result.failed[0]?.diagnostics[0]?.error.code).toBe(RSErrorCode.definitionNotAllowed);
  });

  it('returns known analysis for empty base definition', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    const result = tool.applySchemaPatch(
      {
        items: [{ alias: 'X1', cstType: CstType.BASE, definitionFormal: '' }]
      },
      session.sessionId
    );
    expect(result.success).toBe(true);
    const state = fullState(tool, session.sessionId);
    expect(state.items[0]?.analysis.type).not.toBeNull();
    expect(state.items[0]?.analysis.valueClass).toBe('value');
  });

  it('persists term, definitionText, and convention in session state', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    tool.applySchemaPatch(
      {
        items: [
          {
            alias: 'D2',
            cstType: CstType.TERM,
            definitionFormal: '1',
            term: 'natural number',
            definitionText: 'A positive integer',
            convention: 'Standard arithmetic'
          }
        ]
      },
      session.sessionId
    );

    const form = fullState(tool, session.sessionId);
    expect(form.items[0]).toMatchObject({
      term: 'natural number',
      definitionText: 'A positive integer',
      convention: 'Standard arithmetic'
    });

    const exported = tool.exportSession(session.sessionId);
    const imported = tool.importData(exported, 'session');
    const restored = fullState(tool, imported.sessionId);
    expect(restored.items[0]).toMatchObject({
      term: 'natural number',
      definitionText: 'A positive integer',
      convention: 'Standard arithmetic'
    });
  });

  it('stores and exports session metadata', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession({
      alias: 'KIN',
      title: 'Kinship',
      comment: 'Example schema'
    });

    expect(fullState(tool, session.sessionId)).toMatchObject({
      alias: 'KIN',
      title: 'Kinship',
      comment: 'Example schema'
    });

    const exported = JSON.parse(tool.exportPortal({ kind: 'schema' }, session.sessionId) as string) as {
      title: string;
      alias: string;
      description: string;
    };
    expect(exported).toMatchObject({
      title: 'Kinship',
      alias: 'KIN',
      description: 'Example schema'
    });
  });

  it('exports schema data for Portal JSON import', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    tool.applySchemaPatch(
      {
        items: [
          {
            alias: 'D2',
            cstType: CstType.TERM,
            definitionFormal: '1',
            term: 'natural number',
            definitionText: 'A positive integer',
            convention: 'Standard arithmetic'
          }
        ]
      },
      session.sessionId
    );

    const exported = JSON.parse(tool.exportPortal({ kind: 'schema' }, session.sessionId) as string) as {
      contract_version: string;
      title: string;
      alias: string;
      description: string;
      items: Array<Record<string, unknown>>;
      attribution: unknown[];
    };

    expect(exported.contract_version).toBe('1.0.0');
    expect(exported.title).toBe('Conceptual schema');
    expect(exported.alias).toBe('SCHEMA');
    expect(exported.description).toBe('');

    expect(exported.items[0]).toMatchObject({
      alias: 'D2',
      cst_type: CstType.TERM,
      definition_formal: '1',
      definition_raw: 'A positive integer',
      term_raw: 'natural number',
      convention: 'Standard arithmetic',
      crucial: false
    });
    expect(exported.attribution).toEqual([]);
  });

  it('exports model data for Portal JSON import', async () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    buildSampleForm(tool, session.sessionId);
    await tool.setModelValues({ set: [{ target: 1, value: { 1: 'Alice' } }] }, session.sessionId);

    const exported = JSON.parse(tool.exportPortal({ kind: 'model' }, session.sessionId) as string) as {
      contract_version: string;
      title: string;
      alias: string;
      description: string;
      items: Array<Record<string, unknown>>;
    };

    expect(exported.contract_version).toBe('1.0.0');
    expect(exported.title).toBe('Conceptual model');
    expect(exported.alias).toBe('MODEL');

    expect(exported.items).toEqual([
      {
        id: 1,
        type: 'basic',
        value: { 1: 'Alice' }
      }
    ]);
  });

  it('defaults missing text fields to empty strings', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    tool.applySchemaPatch(
      {
        items: [{ alias: 'D3', cstType: CstType.TERM, definitionFormal: '2' }]
      },
      session.sessionId
    );
    const state = fullState(tool, session.sessionId);
    expect(state.items[0]?.term).toBe('');
    expect(state.items[0]?.definitionText).toBe('');
    expect(state.items[0]?.convention).toBe('');
  });

  it('returns known analysis for empty constant definition', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    const result = tool.applySchemaPatch(
      {
        items: [{ alias: 'C1', cstType: CstType.CONSTANT, definitionFormal: '' }]
      },
      session.sessionId
    );
    expect(result.success).toBe(true);
    const state = fullState(tool, session.sessionId);
    expect(state.items[0]?.analysis.type).not.toBeNull();
    expect(state.items[0]?.analysis.valueClass).toBe('value');
  });
});

describe('RSToolAgent modeling and evaluation', () => {
  it('returns empty model on new session', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    const model = tool.getModelState(session.sessionId);
    expect(model.items).toEqual([]);
  });

  it('sets base constituenta binding', async () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    buildSampleForm(tool, session.sessionId);

    const model = await tool.setModelValues(
      { set: [{ target: 1, value: { 0: 'zero', 1: 'one' } }] },
      session.sessionId
    );
    expect(model.items).toHaveLength(1);
    expect(model.items[0]).toMatchObject({
      id: 1,
      type: 'basic',
      value: { 0: 'zero', 1: 'one' }
    });
  });

  it('rejects setting inferrable term directly', async () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    buildSampleForm(tool, session.sessionId);

    await expect(tool.setModelValues({ set: [{ target: 2, value: 3 }] }, session.sessionId)).rejects.toThrow(
      /inferrable/
    );
  });

  it('restores session state when setModelValues fails mid-batch', async () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    buildSampleForm(tool, session.sessionId);
    await tool.setModelValues({ set: [{ target: 1, value: { 0: 'a' } }] }, session.sessionId);

    await expect(
      tool.setModelValues(
        {
          set: [
            { target: 1, value: { 0: 'b' } },
            { target: 999, value: { 0: 'x' } }
          ]
        },
        session.sessionId
      )
    ).rejects.toThrow(/Unknown constituent/);

    expect(tool.getModelState(session.sessionId).items).toEqual([
      expect.objectContaining({ id: 1, value: { 0: 'a' } })
    ]);

    await expect(
      tool.setModelValues({ clear: [1], set: [{ target: 999, value: { 0: 'x' } }] }, session.sessionId)
    ).rejects.toThrow(/Unknown constituent/);

    expect(tool.getModelState(session.sessionId).items).toEqual([
      expect.objectContaining({ id: 1, value: { 0: 'a' } })
    ]);
  });

  it('evaluates expression against session context', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    buildSampleForm(tool, session.sessionId);

    const result = tool.evaluate({ expression: '1+2', cstType: CstType.TERM }, session.sessionId);
    expect(result.success).toBe(true);
    expect(result.value).toBe(3);
    expect(result.status).toBe(EvalStatus.HAS_DATA);
    expect(result.diagnostics).toHaveLength(0);
  });

  it('evaluates a stored constituenta', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    buildSampleForm(tool, session.sessionId);

    const result = tool.evaluate({ constituentId: 2 }, session.sessionId);
    expect(result.success).toBe(true);
    expect(result.value).toBe(3);
    expect(result.status).toBe(EvalStatus.HAS_DATA);
  });

  it('evaluates axiom constituenta', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    buildSampleForm(tool, session.sessionId);

    const result = tool.evaluate({ constituentId: 3 }, session.sessionId);
    expect(result.success).toBe(true);
    expect(result.value).toBe(1);
  });

  it('recalculates inferrable model values', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    buildSampleForm(tool, session.sessionId);

    const result = tool.recalculateModel(session.sessionId);
    const d1 = result.items.find(item => item.alias === 'D1');
    const a1 = result.items.find(item => item.alias === 'A1');
    expect(d1?.value).toBe(3);
    expect(d1?.status).toBe(EvalStatus.HAS_DATA);
    expect(a1?.value).toBe(1);
    expect(a1?.status).toBe(EvalStatus.HAS_DATA);
  });

  it('clears model values', async () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    buildSampleForm(tool, session.sessionId);
    await tool.setModelValues({ set: [{ target: 1, value: { 0: 'a' } }] }, session.sessionId);

    const model = await tool.setModelValues({ clear: [1] }, session.sessionId);
    expect(model.items).toHaveLength(0);
  });

  it('batch sets model values', async () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    tool.applySchemaPatch(
      {
        items: [{ alias: 'X1' }, { alias: 'C1', cstType: CstType.CONSTANT, definitionFormal: '' }]
      },
      session.sessionId
    );

    const model = await tool.setModelValues(
      {
        set: [
          { target: 1, value: { 0: 'a', 1: 'b' } },
          { target: 2, value: { 0: 'c' } }
        ]
      },
      session.sessionId
    );
    expect(model.items).toHaveLength(2);
  });

  it('exports and imports model state', async () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    buildSampleForm(tool, session.sessionId);
    await tool.setModelValues({ set: [{ target: 1, value: { 0: 'zero' } }] }, session.sessionId);

    const exported = tool.exportSession(session.sessionId);
    expect(exported).toContain('"model"');

    const newTool = new RSToolAgent();
    const imported = newTool.importData(exported, 'session');
    const model = newTool.getModelState(imported.sessionId);
    expect(model.items).toHaveLength(1);
    expect(model.items[0]?.value).toEqual({ 0: 'zero' });
  });
});

describe('RSToolAgent agent ergonomics', () => {
  it('tracks current session and allows omitting sessionId', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession({ title: 'Active' });
    expect(tool.getCurrentSession()?.sessionId).toBe(session.sessionId);
    expect(fullState(tool).title).toBe('Active');
  });

  it('auto-creates a session when sessionId is omitted', () => {
    const tool = new RSToolAgent();
    const result = tool.applySchemaPatch({
      items: [{ alias: 'X1' }]
    });

    expect(result.success).toBe(true);
    expect(tool.getCurrentSession()).not.toBeNull();
    expect(fullState(tool).items).toHaveLength(1);
  });

  it('applies agent schema patches with inferred ids and cstType', () => {
    const tool = new RSToolAgent();

    const result = tool.applySchemaPatch({
      initial: { title: 'Agent patch' },
      commitMessage: 'initial schema',
      items: [
        { alias: 'D1', definitionFormal: 'Pr1(S1)' },
        { alias: 'X1' },
        { alias: 'S1', definitionFormal: 'ℬ(X1×X1)' }
      ]
    });

    expect(result.success).toBe(true);
    expect(result.summary.title).toBe('Agent patch');
    expect(result.summary.itemCount).toBe(3);
    expect(result.revision?.message).toBe('initial schema');
    expect(fullState(tool).items.map(item => item.alias)).toEqual(['D1', 'X1', 'S1']);
    expect(fullState(tool).items.map(item => item.cstType)).toEqual([CstType.TERM, CstType.BASE, CstType.STRUCTURED]);
  });

  it('exports Portal payloads as structured objects', () => {
    const tool = new RSToolAgent();
    tool.applySchemaPatch({
      items: [{ alias: 'D1', definitionFormal: '1+2' }]
    });

    const schema = tool.exportPortal({ kind: 'schema', format: 'object' });
    expect(schema).toMatchObject({ items: [{ alias: 'D1', cst_type: CstType.TERM }] });
    expect(JSON.parse(tool.exportPortal({ kind: 'schema' }) as string).items[0]).toMatchObject(
      (schema as { items: unknown[] }).items[0] as object
    );
  });

  it('replaces active diagnostics per constituent on upsert', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    tool.applySchemaPatch(
      { mode: 'best_effort', items: [{ alias: 'X1', cstType: CstType.BASE, definitionFormal: 'Z' }] },
      session.sessionId
    );
    expect(tool.listDiagnostics(undefined, session.sessionId)).toHaveLength(1);

    tool.applySchemaPatch({ items: [{ alias: 'X1', cstType: CstType.BASE, definitionFormal: '' }] }, session.sessionId);
    expect(tool.listDiagnostics(undefined, session.sessionId)).toHaveLength(0);
  });

  it('does not record analyzeExpression diagnostics by default', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    tool.analyzeExpression({ expression: '(', cstType: CstType.TERM }, session.sessionId);
    expect(tool.listDiagnostics(undefined, session.sessionId)).toHaveLength(0);
  });

  it('records analyzeExpression diagnostics when requested', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    tool.analyzeExpression({ expression: '(', cstType: CstType.TERM, recordDiagnostics: true }, session.sessionId);
    expect(tool.listDiagnostics(undefined, session.sessionId).length).toBeGreaterThan(0);
  });

  it('applySchemaPatch rolls back in atomic mode', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    tool.applySchemaPatch({ items: [{ alias: 'X1' }] }, session.sessionId);

    const result = tool.applySchemaPatch(
      {
        mode: 'atomic',
        items: [
          { alias: 'D1', definitionFormal: '1+2' },
          { alias: 'D2', definitionFormal: 'Pr1(MISSING)' }
        ]
      },
      session.sessionId
    );

    expect(result.success).toBe(false);
    expect(result.applied).toHaveLength(0);
    expect(fullState(tool, session.sessionId).items).toHaveLength(1);
  });

  it('applySchemaPatch applies valid drafts in best_effort mode', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    tool.applySchemaPatch(
      {
        items: [{ alias: 'X1' }, { alias: 'S1', definitionFormal: 'ℬ(X1×X1)' }]
      },
      session.sessionId
    );

    const result = tool.applySchemaPatch(
      {
        mode: 'best_effort',
        items: [
          { alias: 'D1', definitionFormal: 'Pr1(S1)' },
          { alias: 'D2', definitionFormal: 'Pr1(MISSING)' }
        ]
      },
      session.sessionId
    );

    expect(result.applied).toHaveLength(1);
    expect(result.failed).toHaveLength(1);
    expect(fullState(tool, session.sessionId).items.map(item => item.alias)).toContain('D1');
  });

  it('imports portal details JSON', () => {
    const tool = new RSToolAgent();
    const payload = {
      title: 'Kinship',
      alias: 'KIN',
      description: 'Example',
      items: [
        { id: 1, alias: 'X1', cst_type: CstType.BASE, definition_formal: '' },
        { id: 2, alias: 'D1', cst_type: CstType.TERM, definition_formal: '1+2' }
      ]
    };
    const session = tool.importData(payload, 'portal-details');
    const state = fullState(tool, session.sessionId);
    expect(state.title).toBe('Kinship');
    expect(state.items).toHaveLength(2);
    expect(state.items.map(item => item.alias).sort()).toEqual(['D1', 'X1']);
  });

  it('auto-detects portal details import kind', () => {
    const tool = new RSToolAgent();
    const session = tool.importData({
      title: 'Auto',
      items: [{ id: 1, alias: 'X1', cst_type: CstType.BASE, definition_formal: '' }]
    });
    expect(fullState(tool, session.sessionId).title).toBe('Auto');
  });

  it('persists sessions across agent restarts', () => {
    const dir = mkdtempSync(join(tmpdir(), 'rstool-test-sessions-'));
    try {
      const tool = new RSToolAgent({ persistenceDir: dir });
      const session = tool.createSession({ title: 'Persisted' });
      tool.applySchemaPatch({ items: [{ alias: 'X1' }] }, session.sessionId);

      const restored = new RSToolAgent({ persistenceDir: dir });
      expect(restored.getCurrentSession()?.sessionId).toBe(session.sessionId);
      expect(fullState(restored, session.sessionId).items).toHaveLength(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('RSToolAgent session management', () => {
  it('ensureSession reuses the current session', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession({ title: 'First' });
    const ensured = tool.ensureSession({ title: 'Ignored' });
    expect(ensured.sessionId).toBe(session.sessionId);
    expect(fullState(tool).title).toBe('First');
  });

  it('ensureSession creates a session when none is active', () => {
    const tool = new RSToolAgent();
    expect(tool.getCurrentSession()).toBeNull();
    const ensured = tool.ensureSession({ title: 'Created' });
    expect(ensured.sessionId).toBeTruthy();
    expect(fullState(tool).title).toBe('Created');
  });

  it('switches current session with setCurrentSession', () => {
    const tool = new RSToolAgent();
    const first = tool.createSession({ title: 'First' });
    const second = tool.createSession({ title: 'Second' });
    tool.setCurrentSession(first.sessionId);
    expect(fullState(tool).title).toBe('First');
    tool.setCurrentSession(second.sessionId);
    expect(fullState(tool).title).toBe('Second');
  });

  it('throws when setCurrentSession receives an unknown id', () => {
    const tool = new RSToolAgent();
    const unknownId = randomUUID();
    expect(() => tool.setCurrentSession(unknownId)).toThrow(/Unknown session/);
  });

  it('throws when an explicit unknown sessionId is passed to API methods', () => {
    const tool = new RSToolAgent();
    const unknownId = randomUUID();
    expect(() => tool.getSessionState('full', unknownId)).toThrow(/Unknown session/);
  });

  it('applySchemaPatch with explicit sessionId does not switch current session', () => {
    const tool = new RSToolAgent();
    const first = tool.createSession({ title: 'First' });
    const second = tool.createSession({ title: 'Second' });
    tool.setCurrentSession(first.sessionId);

    tool.applySchemaPatch({ items: [{ alias: 'X1' }] }, second.sessionId);

    expect(tool.getCurrentSession()?.sessionId).toBe(first.sessionId);
    expect(tool.getSessionState('summary', second.sessionId)).toMatchObject({ itemCount: 1 });
    expect(tool.getSessionState('summary', first.sessionId)).toMatchObject({ itemCount: 0 });
  });

  it('returns summary session state by default', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession({ title: 'Summary', alias: 'SUM' });
    tool.applySchemaPatch({ items: [{ alias: 'X1' }] }, session.sessionId);

    const summary = tool.getSessionState('summary', session.sessionId);
    expect(summary).toMatchObject({
      sessionId: session.sessionId,
      title: 'Summary',
      alias: 'SUM',
      itemCount: 1,
      modelItemCount: 0
    });
    expect('items' in summary && summary.items[0]).toMatchObject({
      alias: 'X1',
      analysisSuccess: true
    });
  });

  it('records revisions via commitStep', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    tool.applySchemaPatch({ items: [{ alias: 'X1' }] }, session.sessionId);
    const revision = tool.commitStep('checkpoint', session.sessionId);
    expect(revision.message).toBe('checkpoint');
    expect(fullState(tool, session.sessionId).revisions).toHaveLength(1);
  });

  it('filters diagnostics by constituent id', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    tool.applySchemaPatch(
      {
        mode: 'best_effort',
        items: [
          { alias: 'X1', cstType: CstType.BASE, definitionFormal: 'Z' },
          { alias: 'X2', cstType: CstType.BASE, definitionFormal: 'Z' }
        ]
      },
      session.sessionId
    );
    const all = tool.listDiagnostics(undefined, session.sessionId);
    const forX1 = tool.listDiagnostics({ constituentId: 1 }, session.sessionId);
    expect(all.length).toBeGreaterThanOrEqual(2);
    expect(forX1.every(record => record.constituentId === 1)).toBe(true);
  });

  it('filters diagnostics by constituent id 0', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    tool.applySchemaPatch(
      {
        mode: 'best_effort',
        items: [
          { id: 0, alias: 'X0', cstType: CstType.BASE, definitionFormal: 'Z' },
          { alias: 'X1', cstType: CstType.BASE, definitionFormal: 'Z' }
        ]
      },
      session.sessionId
    );
    const all = tool.listDiagnostics(undefined, session.sessionId);
    const forX0 = tool.listDiagnostics({ constituentId: 0 }, session.sessionId);
    expect(all.length).toBeGreaterThanOrEqual(2);
    expect(forX0.length).toBeGreaterThan(0);
    expect(forX0.length).toBeLessThan(all.length);
    expect(forX0.every(record => record.constituentId === 0)).toBe(true);
  });

  it('applySchemaPatch avoids id collisions when explicit ids precede auto-assigned ones', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    tool.applySchemaPatch(
      {
        items: [
          { id: 1, alias: 'X1', cstType: CstType.BASE, definitionFormal: '' },
          { alias: 'X2', cstType: CstType.BASE, definitionFormal: '' }
        ]
      },
      session.sessionId
    );

    const ids = fullState(tool, session.sessionId).items.map(item => item.id);
    expect(ids).toEqual([1, 2]);
  });

  it('loads a persisted session from disk via setCurrentSession', () => {
    const dir = mkdtempSync(join(tmpdir(), 'rstool-test-sessions-'));
    try {
      const writer = new RSToolAgent({ persistenceDir: dir });
      const session = writer.createSession({ title: 'On disk' });
      writer.applySchemaPatch({ items: [{ alias: 'X1' }] }, session.sessionId);

      const reader = new RSToolAgent({ persistenceDir: dir });
      reader.setCurrentSession(session.sessionId);
      expect(fullState(reader, session.sessionId).title).toBe('On disk');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('clears current session when persisted file is missing', () => {
    const dir = mkdtempSync(join(tmpdir(), 'rstool-test-sessions-'));
    try {
      const writer = new RSToolAgent({ persistenceDir: dir });
      const session = writer.createSession({ title: 'Gone' });

      unlinkSync(join(dir, `${session.sessionId}.json`));

      const reader = new RSToolAgent({ persistenceDir: dir });
      expect(reader.getCurrentSession()).toBeNull();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('RSToolAgent import and export', () => {
  it('imports portal schema JSON', () => {
    const tool = new RSToolAgent();
    const payload = {
      contract_version: '1.0.0',
      title: 'Imported schema',
      alias: 'IMP',
      description: 'From portal',
      items: [
        { id: 1, alias: 'X1', cst_type: CstType.BASE, definition_formal: '' },
        { id: 2, alias: 'D1', cst_type: CstType.TERM, definition_formal: '1+2' }
      ],
      attribution: []
    };
    const session = tool.importData(payload, 'portal-schema');
    const state = fullState(tool, session.sessionId);
    expect(state).toMatchObject({ title: 'Imported schema', alias: 'IMP', comment: 'From portal' });
    expect(state.items.map(item => item.alias)).toEqual(['X1', 'D1']);
  });

  it('keeps declaration order in portal schema export', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession({ title: 'Order', alias: 'ORD' });
    tool.applySchemaPatch(
      {
        items: [
          { alias: 'D1', cstType: CstType.TERM, definitionFormal: 'Pr1(S1)' },
          { alias: 'S1', cstType: CstType.STRUCTURED, definitionFormal: 'ℬ(X1×X1)' },
          { alias: 'C1', cstType: CstType.CONSTANT, definitionFormal: '' },
          { alias: 'X1', cstType: CstType.BASE, definitionFormal: '' }
        ]
      },
      session.sessionId
    );

    const exported = tool.exportPortal({ kind: 'schema', format: 'object' }, session.sessionId) as {
      items: Array<{ alias: string }>;
    };
    expect(exported.items.map(item => item.alias)).toEqual(['D1', 'S1', 'C1', 'X1']);
  });

  it('round-trips portal schema export and import', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession({ title: 'Round trip', alias: 'RT' });
    tool.applySchemaPatch(
      {
        items: [{ alias: 'D1', cstType: CstType.TERM, definitionFormal: '1+2', term: 'sum' }]
      },
      session.sessionId
    );

    const exported = tool.exportPortal({ kind: 'schema', format: 'object' });
    const imported = tool.importData(exported, 'portal-schema');
    const state = fullState(tool, imported.sessionId);
    expect(state.title).toBe('Round trip');
    expect(state.items[0]).toMatchObject({
      alias: 'D1',
      definitionFormal: '1+2',
      term: 'sum'
    });
  });

  it('rejects invalid session export payloads', () => {
    const tool = new RSToolAgent();
    expect(() => tool.importData({ contractVersion: '2.0.0' }, 'session')).toThrow(/Invalid session export/);
  });

  it('rejects undetectable import payloads', () => {
    const tool = new RSToolAgent();
    expect(() => tool.importData({ title: 'orphan' })).toThrow(/Cannot detect import kind/);
  });

  it('infers cstType from N and T alias prefixes', () => {
    const tool = new RSToolAgent();
    const statementResult = tool.applySchemaPatch({ items: [{ alias: 'T1', definitionFormal: '1=1' }] });
    expect(statementResult.success).toBe(true);
    expect(fullState(tool).items[0]?.cstType).toBe(CstType.STATEMENT);

    const nominalResult = tool.applySchemaPatch({ items: [{ alias: 'N1' }] });
    expect(nominalResult.failed[0]?.draft.cstType).toBe(CstType.NOMINAL);
  });

  it('rejects aliases with unknown cstType prefix', () => {
    const tool = new RSToolAgent();
    expect(() =>
      tool.applySchemaPatch({
        items: [{ alias: 'Q1', definitionFormal: '1' }]
      })
    ).toThrow(/Cannot infer cstType/);
  });
});

describe('RSToolAgent modeling semantics', () => {
  function buildKinshipScratch(tool: RSToolAgent, sessionId: string) {
    tool.applySchemaPatch(
      {
        items: [
          { alias: 'X1' },
          { alias: 'S1', definitionFormal: 'ℬ(X1×X1)' },
          { alias: 'D1', definitionFormal: 'Pr1(S1)' },
          { alias: 'A1', cstType: CstType.AXIOM, definitionFormal: 'card(X1)≤1' }
        ]
      },
      sessionId
    );
  }

  it('returns EMPTY when a basic set has no binding', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    tool.applySchemaPatch({ items: [{ alias: 'X1' }] }, session.sessionId);

    const result = tool.evaluate({ constituentId: 1 }, session.sessionId);
    expect(result.status).toBe(EvalStatus.EMPTY);
    expect(result.value).toBeNull();
  });

  it('sets structured set values and evaluates projections', async () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    buildKinshipScratch(tool, session.sessionId);

    await tool.setModelValues(
      {
        set: [
          { target: 1, value: { 0: 'ann', 1: 'bob' } },
          {
            target: 2,
            value: [
              [TUPLE_ID, 0, 1],
              [TUPLE_ID, 1, 0]
            ]
          }
        ]
      },
      session.sessionId
    );

    const result = tool.evaluate({ constituentId: 3 }, session.sessionId);
    expect(result.success).toBe(true);
    expect(result.status).toBe(EvalStatus.HAS_DATA);
    expect(Array.isArray(result.value)).toBe(true);
    expect((result.value as unknown[]).length).toBeGreaterThan(0);
  });

  it('reports AXIOM_FALSE when model data violates the axiom', async () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    buildKinshipScratch(tool, session.sessionId);

    await tool.setModelValues({ set: [{ target: 1, value: { 0: 'ann', 1: 'bob' } }] }, session.sessionId);

    const result = tool.evaluate({ constituentId: 4 }, session.sessionId);
    expect(result.status).toBe(EvalStatus.AXIOM_FALSE);
    expect(result.value).toBe(0);
  });

  it('reports AXIOM_FALSE via recalculateModel', async () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    buildKinshipScratch(tool, session.sessionId);
    await tool.setModelValues({ set: [{ target: 1, value: { 0: 'ann', 1: 'bob' } }] }, session.sessionId);

    const recalculated = tool.recalculateModel(session.sessionId);
    const a1 = recalculated.items.find(item => item.alias === 'A1');
    expect(a1?.status).toBe(EvalStatus.AXIOM_FALSE);
    expect(a1?.value).toBe(0);
  });

  it('throws when evaluate input is incomplete', () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    expect(() => tool.evaluate({}, session.sessionId)).toThrow(/requires constituentId or expression/);
  });

  it('throws for unknown constituents on evaluate and setModelValues', async () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    buildSampleForm(tool, session.sessionId);

    expect(() => tool.evaluate({ constituentId: 999 }, session.sessionId)).toThrow(/Unknown constituent/);
    await expect(tool.setModelValues({ set: [{ target: 999, value: { 0: 'a' } }] }, session.sessionId)).rejects.toThrow(
      /Unknown constituent/
    );
  });

  it('rejects invalid basic binding data', async () => {
    const tool = new RSToolAgent();
    const session = tool.createSession();
    tool.applySchemaPatch({ items: [{ alias: 'X1' }] }, session.sessionId);

    await expect(
      tool.setModelValues({ set: [{ target: 1, value: [1, 2, 3] as never }] }, session.sessionId)
    ).rejects.toThrow(/Invalid basic binding/);
  });
});
