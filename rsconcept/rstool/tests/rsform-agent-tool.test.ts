import { describe, expect, it } from 'vitest';

import { CstType, EvalStatus, RSFormAgentTool, RSErrorCode } from '../src';

function buildSampleForm(tool: RSFormAgentTool, sessionId: string) {
  tool.addOrUpdateConstituenta(sessionId, {
    draft: { id: 1, alias: 'X1', cstType: CstType.BASE, definitionFormal: '' }
  });
  tool.addOrUpdateConstituenta(sessionId, {
    draft: { id: 2, alias: 'D1', cstType: CstType.TERM, definitionFormal: '1+2' }
  });
  tool.addOrUpdateConstituenta(sessionId, {
    draft: { id: 3, alias: 'A1', cstType: CstType.AXIOM, definitionFormal: '1=1' }
  });
}

describe('RSFormAgentTool', () => {
  it('creates and exports a session', () => {
    const tool = new RSFormAgentTool();
    const session = tool.createSession();
    const exported = tool.exportSession(session.sessionId);
    expect(exported).toContain(session.sessionId);
    expect(exported).toContain('contractVersion');
  });

  it('analyzes a valid expression', () => {
    const tool = new RSFormAgentTool();
    const session = tool.createSession();
    const analysis = tool.analyzeExpression(session.sessionId, {
      expression: '1+2',
      cstType: CstType.TERM
    });
    expect(analysis.success).toBe(true);
    expect(analysis.diagnostics.length).toBe(0);
  });

  it('returns syntax diagnostics for invalid expression', () => {
    const tool = new RSFormAgentTool();
    const session = tool.createSession();
    const analysis = tool.analyzeExpression(session.sessionId, {
      expression: '(',
      cstType: CstType.TERM
    });
    expect(analysis.success).toBe(false);
    expect(analysis.diagnostics.length).toBeGreaterThan(0);
  });

  it('rejects formal definition for constants', () => {
    const tool = new RSFormAgentTool();
    const session = tool.createSession();
    const result = tool.addOrUpdateConstituenta(session.sessionId, {
      draft: {
        id: 11,
        alias: 'C1',
        cstType: CstType.CONSTANT,
        definitionFormal: 'X1'
      }
    });
    expect(result.state.analysis.success).toBe(false);
    expect(result.diagnostics[0]?.error.code).toBe(RSErrorCode.definitionNotAllowed);
  });

  it('rejects formal definition for basic sets', () => {
    const tool = new RSFormAgentTool();
    const session = tool.createSession();
    const result = tool.addOrUpdateConstituenta(session.sessionId, {
      draft: {
        id: 12,
        alias: 'X1',
        cstType: CstType.BASE,
        definitionFormal: 'Z'
      }
    });
    expect(result.state.analysis.success).toBe(false);
    expect(result.diagnostics[0]?.error.code).toBe(RSErrorCode.definitionNotAllowed);
  });

  it('returns known analysis for empty base definition', () => {
    const tool = new RSFormAgentTool();
    const session = tool.createSession();
    const result = tool.addOrUpdateConstituenta(session.sessionId, {
      draft: {
        id: 13,
        alias: 'X1',
        cstType: CstType.BASE,
        definitionFormal: ''
      }
    });
    expect(result.state.analysis.success).toBe(true);
    expect(result.state.analysis.type).not.toBeNull();
    expect(result.state.analysis.valueClass).toBe('value');
  });

  it('persists term, definitionText, and convention in session state', () => {
    const tool = new RSFormAgentTool();
    const session = tool.createSession();
    const result = tool.addOrUpdateConstituenta(session.sessionId, {
      draft: {
        id: 15,
        alias: 'D2',
        cstType: CstType.TERM,
        definitionFormal: '1',
        term: 'natural number',
        definitionText: 'A positive integer',
        convention: 'Standard arithmetic'
      }
    });
    expect(result.state.term).toBe('natural number');
    expect(result.state.definitionText).toBe('A positive integer');
    expect(result.state.convention).toBe('Standard arithmetic');

    const form = tool.getFormState(session.sessionId);
    expect(form.items[0]).toMatchObject({
      term: 'natural number',
      definitionText: 'A positive integer',
      convention: 'Standard arithmetic'
    });

    const exported = tool.exportSession(session.sessionId);
    const imported = tool.importSession(exported);
    const restored = tool.getFormState(imported.sessionId);
    expect(restored.items[0]).toMatchObject({
      term: 'natural number',
      definitionText: 'A positive integer',
      convention: 'Standard arithmetic'
    });
  });

  it('defaults missing text fields to empty strings', () => {
    const tool = new RSFormAgentTool();
    const session = tool.createSession();
    const result = tool.addOrUpdateConstituenta(session.sessionId, {
      draft: {
        id: 16,
        alias: 'D3',
        cstType: CstType.TERM,
        definitionFormal: '2'
      }
    });
    expect(result.state.term).toBe('');
    expect(result.state.definitionText).toBe('');
    expect(result.state.convention).toBe('');
  });

  it('returns known analysis for empty constant definition', () => {
    const tool = new RSFormAgentTool();
    const session = tool.createSession();
    const result = tool.addOrUpdateConstituenta(session.sessionId, {
      draft: {
        id: 14,
        alias: 'C1',
        cstType: CstType.CONSTANT,
        definitionFormal: ''
      }
    });
    expect(result.state.analysis.success).toBe(true);
    expect(result.state.analysis.type).not.toBeNull();
    expect(result.state.analysis.valueClass).toBe('value');
  });
});

describe('RSFormAgentTool modeling and evaluation', () => {
  it('returns empty model on new session', () => {
    const tool = new RSFormAgentTool();
    const session = tool.createSession();
    const model = tool.getModelState(session.sessionId);
    expect(model.items).toEqual([]);
  });

  it('sets base constituenta binding', () => {
    const tool = new RSFormAgentTool();
    const session = tool.createSession();
    buildSampleForm(tool, session.sessionId);

    const model = tool.setConstituentaValue(session.sessionId, {
      target: 1,
      value: { 0: 'zero', 1: 'one' }
    });
    expect(model.items).toHaveLength(1);
    expect(model.items[0]).toMatchObject({
      id: 1,
      type: 'basic',
      value: { 0: 'zero', 1: 'one' }
    });
  });

  it('rejects setting inferrable term directly', () => {
    const tool = new RSFormAgentTool();
    const session = tool.createSession();
    buildSampleForm(tool, session.sessionId);

    expect(() =>
      tool.setConstituentaValue(session.sessionId, {
        target: 2,
        value: 3
      })
    ).toThrow(/inferrable/);
  });

  it('evaluates expression against session context', () => {
    const tool = new RSFormAgentTool();
    const session = tool.createSession();
    buildSampleForm(tool, session.sessionId);

    const result = tool.evaluateExpression(session.sessionId, {
      expression: '1+2',
      cstType: CstType.TERM
    });
    expect(result.success).toBe(true);
    expect(result.value).toBe(3);
    expect(result.status).toBe(EvalStatus.HAS_DATA);
    expect(result.diagnostics).toHaveLength(0);
  });

  it('evaluates a stored constituenta', () => {
    const tool = new RSFormAgentTool();
    const session = tool.createSession();
    buildSampleForm(tool, session.sessionId);

    const result = tool.evaluateConstituenta(session.sessionId, { constituentId: 2 });
    expect(result.success).toBe(true);
    expect(result.value).toBe(3);
    expect(result.status).toBe(EvalStatus.HAS_DATA);
  });

  it('evaluates axiom constituenta', () => {
    const tool = new RSFormAgentTool();
    const session = tool.createSession();
    buildSampleForm(tool, session.sessionId);

    const result = tool.evaluateConstituenta(session.sessionId, { constituentId: 3 });
    expect(result.success).toBe(true);
    expect(result.value).toBe(1);
  });

  it('recalculates inferrable model values', () => {
    const tool = new RSFormAgentTool();
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

  it('clears model values', () => {
    const tool = new RSFormAgentTool();
    const session = tool.createSession();
    buildSampleForm(tool, session.sessionId);
    tool.setConstituentaValue(session.sessionId, {
      target: 1,
      value: { 0: 'a' }
    });

    const model = tool.clearConstituentaValues(session.sessionId, { items: [1] });
    expect(model.items).toHaveLength(0);
  });

  it('batch sets model values', () => {
    const tool = new RSFormAgentTool();
    const session = tool.createSession();
    tool.addOrUpdateConstituenta(session.sessionId, {
      draft: { id: 1, alias: 'X1', cstType: CstType.BASE, definitionFormal: '' }
    });
    tool.addOrUpdateConstituenta(session.sessionId, {
      draft: { id: 2, alias: 'C1', cstType: CstType.CONSTANT, definitionFormal: '' }
    });

    const model = tool.setConstituentaValues(session.sessionId, {
      items: [
        { target: 1, value: { 0: 'a', 1: 'b' } },
        { target: 2, value: { 0: 'c' } }
      ]
    });
    expect(model.items).toHaveLength(2);
  });

  it('exports and imports model state', () => {
    const tool = new RSFormAgentTool();
    const session = tool.createSession();
    buildSampleForm(tool, session.sessionId);
    tool.setConstituentaValue(session.sessionId, {
      target: 1,
      value: { 0: 'zero' }
    });

    const exported = tool.exportSession(session.sessionId);
    expect(exported).toContain('"model"');

    const imported = tool.importSession(exported);
    const model = tool.getModelState(imported.sessionId);
    expect(model.items).toHaveLength(1);
    expect(model.items[0]?.value).toEqual({ 0: 'zero' });
  });
});
