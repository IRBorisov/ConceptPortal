import { describe, expect, it } from 'vitest';

import {
  assignSchemaDiagnostics,
  DiagnosticKind,
  hasCstDiagnostic,
  modelStatusCstDiagnostic,
  RSDiagnosticCode
} from './diagnostics';
import { type Constituenta, CstType } from './rsform';
import { EvalStatus } from './rsmodel';

function stubCst(id: number, alias: string, overrides: Partial<Constituenta> = {}): Constituenta {
  return {
    id,
    alias,
    term_resolved: '',
    definition_formal: '',
    convention: '',
    cst_type: CstType.BASE,
    is_type_mismatch: false,
    typification_manual: '',
    analysis: { success: true, type: null },
    diagnostics: [],
    ...overrides
  } as Constituenta;
}

describe('hasCstDiagnostic', () => {
  it('returns true when constituent has the requested code', () => {
    const cst = stubCst(1, 'X1', {
      diagnostics: [{ kind: DiagnosticKind.SCHEMA, code: RSDiagnosticCode.schemaHomonym, params: ['X2'] }]
    });
    expect(hasCstDiagnostic(cst, RSDiagnosticCode.schemaHomonym)).toBe(true);
    expect(hasCstDiagnostic(cst, RSDiagnosticCode.schemaFormalDuplicate)).toBe(false);
  });

  it('returns false when diagnostics are absent', () => {
    expect(hasCstDiagnostic(stubCst(1, 'X1'), RSDiagnosticCode.schemaHomonym)).toBe(false);
  });
});

describe('modelStatusCstDiagnostic', () => {
  it('maps model evaluation statuses to compact diagnostics', () => {
    expect(modelStatusCstDiagnostic(EvalStatus.EMPTY, CstType.BASE)).toEqual({
      kind: DiagnosticKind.MODEL,
      code: RSDiagnosticCode.modelEmpty,
      params: [String(EvalStatus.EMPTY)]
    });
    expect(modelStatusCstDiagnostic(EvalStatus.AXIOM_FALSE, CstType.AXIOM)).toEqual({
      kind: DiagnosticKind.MODEL,
      code: RSDiagnosticCode.modelAxiomFalse,
      params: [String(EvalStatus.AXIOM_FALSE)]
    });
    expect(modelStatusCstDiagnostic(EvalStatus.HAS_DATA, CstType.BASE)).toBeNull();
    expect(modelStatusCstDiagnostic(EvalStatus.EMPTY, CstType.TERM)).toBeNull();
  });
});

describe('assignSchemaDiagnostics', () => {
  it('detects homonyms and formal duplicates', () => {
    const items = [
      stubCst(1, 'X1', { term_resolved: 'person' }),
      stubCst(2, 'X2', { term_resolved: 'Person' }),
      stubCst(3, 'D1', { cst_type: CstType.TERM, definition_formal: 'Pr1(X1)' }),
      stubCst(4, 'D2', { cst_type: CstType.TERM, definition_formal: 'Pr1(X1)' })
    ];
    const resolveAlias = (id: number) => items.find(item => item.id === id)!.alias;
    const normalizedDefinitions = new Map<number, string>([
      [3, 'pr1(x1)'],
      [4, 'pr1(x1)']
    ]);

    assignSchemaDiagnostics(items, resolveAlias, normalizedDefinitions);

    expect(hasCstDiagnostic(items[0], RSDiagnosticCode.schemaHomonym)).toBe(true);
    expect(items[0].diagnostics.find(item => item.code === RSDiagnosticCode.schemaHomonym)?.params?.[0]).toBe('X2');
    expect(hasCstDiagnostic(items[1], RSDiagnosticCode.schemaHomonym)).toBe(true);
    expect(items[1].diagnostics.find(item => item.code === RSDiagnosticCode.schemaHomonym)?.params?.[0]).toBe('X1');
    expect(hasCstDiagnostic(items[2], RSDiagnosticCode.schemaFormalDuplicate)).toBe(true);
    expect(items[2].diagnostics.find(item => item.code === RSDiagnosticCode.schemaFormalDuplicate)?.params?.[0]).toBe(
      'D2'
    );
  });
});
