import { describe, expect, it } from 'vitest';

import { CstType, type RSForm } from '../rsform';

import { calculateSchemaStats } from './stats';

function item(cst_type: CstType, convention: string) {
  return {
    cst_type,
    convention,
    crucial: false,
    term_raw: '',
    definition_raw: '',
    term_resolved: '',
    is_type_mismatch: false,
    status: 'verified',
    is_inherited: false,
    analysis: { success: true }
  };
}

describe('calculateSchemaStats comments', () => {
  it('counts a supplied comment on a derived constituent', () => {
    const schema = { items: [item(CstType.TERM, 'A comment')] } as RSForm;
    expect(calculateSchemaStats(schema).count_comment).toBe(1);
    expect(calculateSchemaStats(schema).count_convention).toBe(0);
  });

  it('ignores an empty or whitespace-only comment', () => {
    const schema = { items: [item(CstType.TERM, ''), item(CstType.TERM, '   ')] } as RSForm;
    expect(calculateSchemaStats(schema).count_comment).toBe(0);
  });

  it('counts a basic convention on its own counter', () => {
    const schema = { items: [item(CstType.BASE, 'A convention')] } as RSForm;
    const stats = calculateSchemaStats(schema);
    expect(stats.count_convention).toBe(1);
    expect(stats.count_comment).toBe(0);
  });

  it('treats a whitespace-only basic convention as empty', () => {
    const schema = { items: [item(CstType.BASE, '   ')] } as RSForm;
    expect(calculateSchemaStats(schema).count_convention).toBe(0);
  });
});
