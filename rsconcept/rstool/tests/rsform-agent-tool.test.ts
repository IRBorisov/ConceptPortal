import { describe, expect, it } from 'vitest';

import { CstType, RSFormAgentTool, RSToolErrorCode } from '../src';

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
    expect(result.diagnostics[0]?.error.code).toBe(RSToolErrorCode.formalDefinitionNotAllowed);
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
    expect(result.diagnostics[0]?.error.code).toBe(RSToolErrorCode.formalDefinitionNotAllowed);
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
