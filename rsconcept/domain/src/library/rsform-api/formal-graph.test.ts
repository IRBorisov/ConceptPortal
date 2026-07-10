import { describe, expect, it } from 'vitest';

import { CstType } from '../rsform';

import { buildFormalDependencyGraph, restoreConstituentOrder } from './formal-graph';
import { computeSemanticRelations } from './semantic-relations';
import { type OrderableConstituenta } from './types';

function cst(id: number, alias: string, cst_type: CstType, definition_formal = ''): OrderableConstituenta {
  return { id, alias, cst_type, definition_formal };
}

describe('restoreConstituentOrder', () => {
  it('keeps short lists unchanged', () => {
    expect(restoreConstituentOrder([])).toEqual([]);
    const only = [cst(1, 'X1', CstType.BASE)];
    expect(restoreConstituentOrder(only)).toEqual(only);
  });

  it('matches classic kernel order with sticky semantic child', () => {
    const items = [
      cst(1, 'D2', CstType.TERM, 'D{ξ∈S1 | 1=1}'),
      cst(2, 'D1', CstType.TERM, 'Pr1(S1)\\X1'),
      cst(3, 'X1', CstType.BASE),
      cst(4, 'X2', CstType.BASE),
      cst(5, 'S1', CstType.STRUCTURED, 'ℬ(X1×X1)'),
      cst(6, 'C1', CstType.CONSTANT),
      cst(7, 'S2', CstType.STRUCTURED, 'ℬ(X2×D1)'),
      cst(8, 'A1', CstType.AXIOM, 'D3=∅'),
      cst(9, 'A2', CstType.AXIOM, 'P1[S1]'),
      cst(10, 'D3', CstType.TERM, 'Pr2(S2)'),
      cst(11, 'F1', CstType.FUNCTION, '[α∈ℬ(X1)] D{σ∈S1 | α⊆pr1(σ)}'),
      cst(12, 'D4', CstType.TERM, 'Pr2(D3)'),
      cst(13, 'F2', CstType.FUNCTION, '[α∈ℬ(X1)] X1\\α'),
      cst(14, 'P1', CstType.PREDICATE, '[α∈ℬ(R1)] card(α)=0')
    ];

    const ordered = restoreConstituentOrder(items).map(item => item.alias);
    expect(ordered).toEqual(['X1', 'X2', 'C1', 'P1', 'S1', 'A2', 'D1', 'S2', 'D3', 'A1', 'D4', 'D2', 'F1', 'F2']);
  });

  it('keeps formal supplier before semantic child (schema 875 pattern)', () => {
    const items = [
      cst(1, 'X1', CstType.BASE),
      cst(2, 'C1', CstType.CONSTANT),
      cst(3, 'P2', CstType.PREDICATE, '[σ∈ℬ(C1)] card(σ)=0'),
      cst(4, 'P6', CstType.PREDICATE, '[σ∈ℬℬ(C1)] ∀ξ∈σ P2[ξ]'),
      cst(5, 'F7', CstType.FUNCTION, '[σ∈ℬ(R1×R2)] Pr1(σ)'),
      cst(6, 'F9', CstType.FUNCTION, '[β∈ℬ(R1×R2), α∈F7[β]] pr2(debool(Fi1[{α}](β)))'),
      cst(7, 'F3', CstType.FUNCTION, '[σ∈D{σ0∈ℬ(ℬ(R1)×ℬ(C1)) | P6[pr2(σ0)]}] F7[σ]'),
      cst(8, 'F4', CstType.FUNCTION, '[β∈D{β0∈ℬ(ℬ(R1)×ℬ(C1)) | P6[pr2(β0)]}, α∈F3[β]] F9[β,α]'),
      cst(9, 'S1', CstType.STRUCTURED, 'ℬ(ℬ(X1)×ℬ(C1))'),
      cst(10, 'A1', CstType.AXIOM, 'P6[ℬ(C1)]')
    ];

    const ordered = restoreConstituentOrder(items);
    const aliases = ordered.map(item => item.alias);
    expect(aliases.indexOf('P6')).toBeLessThan(aliases.indexOf('F3'));
    expect(aliases.indexOf('F9')).toBeLessThan(aliases.indexOf('F4'));

    const relations = computeSemanticRelations(items, buildFormalDependencyGraph(items));
    expect(relations.parentOf.get(8)).toBe(4); // F4 → P6
    expect(relations.childrenOf.get(4)).toEqual(expect.arrayContaining([7, 8]));
  });

  it('builds supplier → dependent formal edges', () => {
    const items = [cst(1, 'X1', CstType.BASE), cst(2, 'D1', CstType.TERM, 'ℬ(X1)')];
    const graph = buildFormalDependencyGraph(items);
    expect(graph.hasEdge(1, 2)).toBe(true);
    expect(graph.hasEdge(2, 1)).toBe(false);
  });
});
