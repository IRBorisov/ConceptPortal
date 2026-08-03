import { describe, expect, test } from 'vitest';

import { CstType } from '@rsconcept/domain/library';

import {
  type ExpressionEditorTargetCst,
  resolveExpressionEditorTarget,
  showsExpressionEditor} from './resolve-expression-editor-target';

function cst(id: number, cst_type: CstType, definition_formal = ''): ExpressionEditorTargetCst {
  return { id, cst_type, definition_formal };
}

describe('showsExpressionEditor', () => {
  test('hides empty base and constant sets', () => {
    expect(showsExpressionEditor(cst(1, CstType.BASE))).toBe(false);
    expect(showsExpressionEditor(cst(2, CstType.CONSTANT))).toBe(false);
  });

  test('shows base/constant when a formal definition is present', () => {
    expect(showsExpressionEditor(cst(1, CstType.BASE, 'X1'))).toBe(true);
  });

  test('shows non-elementary types even with an empty definition', () => {
    expect(showsExpressionEditor(cst(3, CstType.STRUCTURED))).toBe(true);
    expect(showsExpressionEditor(cst(4, CstType.TERM))).toBe(true);
    expect(showsExpressionEditor(cst(5, CstType.AXIOM))).toBe(true);
  });
});

describe('resolveExpressionEditorTarget', () => {
  test('keeps the current selection when expression UI is already available', () => {
    const active = cst(10, CstType.STRUCTURED);
    expect(
      resolveExpressionEditorTarget({
        items: [cst(1, CstType.BASE), active],
        active
      })
    ).toBeNull();
  });

  test('picks the first constituenta that mounts expression UI', () => {
    expect(
      resolveExpressionEditorTarget({
        items: [cst(1, CstType.BASE), cst(2, CstType.CONSTANT), cst(3, CstType.TERM), cst(4, CstType.STRUCTURED)],
        active: cst(1, CstType.BASE)
      })
    ).toBe(3);
  });

  test('selects a candidate when nothing is active', () => {
    expect(
      resolveExpressionEditorTarget({
        items: [cst(1, CstType.BASE), cst(7, CstType.FUNCTION)],
        active: null
      })
    ).toBe(7);
  });

  test('returns null when no candidate exists', () => {
    expect(
      resolveExpressionEditorTarget({
        items: [cst(1, CstType.BASE), cst(2, CstType.CONSTANT)],
        active: cst(1, CstType.BASE)
      })
    ).toBeNull();
  });

  test('returns null for an empty session', () => {
    expect(resolveExpressionEditorTarget(null)).toBeNull();
    expect(resolveExpressionEditorTarget({ items: [], active: null })).toBeNull();
  });
});
