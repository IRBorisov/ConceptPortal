import { describe, expect, it } from 'vitest';

import { CstType } from '@rsconcept/domain/library';
import { type RelativizationProjection } from '@rsconcept/domain/library/relativization';

import { canConfirmReview, prepareReview } from './review';

function makeDraft(convention: string): RelativizationProjection {
  return {
    items: [
      {
        id: 2,
        alias: 'S1',
        cst_type: CstType.STRUCTURED,
        term_raw: 'Contexts',
        term_resolved: 'Contexts',
        term_forms: [],
        convention,
        definition_formal: 'ℬ(X1)',
        definition_raw: 'All contexts',
        definition_resolved: 'All contexts',
        typification_manual: '',
        crucial: false,
        value_is_property: false
      }
    ],
    attribution: [],
    proposals: [
      {
        id: 2,
        origin: 1,
        role: 'axis',
        sourceAlias: 'X1',
        before: { term_raw: '', definition_raw: '', convention: '' },
        beforeType: '',
        afterType: 'ℬ(X1)',
        component: null,
        coordinates: [],
        ambiguous: [],
        missing: [],
        inKernel: true,
        changed: true,
        formalInvalid: false
      }
    ]
  };
}

describe('relativization text review', () => {
  it('offers the saved text after recalculation even when a previous review row exists', () => {
    const prior = [{ id: 2, fields: { convention: 'Saved convention' }, stillCurrent: false }];
    const previous = prepareReview({
      ...makeDraft('Saved convention'),
      prior: prior.map(row => ({ ...row, stillCurrent: true }))
    });
    const draft = { ...makeDraft('New convention'), prior };
    const [row] = prepareReview(draft, previous);

    expect(row.fields.convention).toBe('Saved convention');
    expect(row.conflicts).toEqual(['convention']);
    expect(canConfirmReview([row])).toBe(false);
  });

  it('keeps an explicit choice when preparing the same draft again', () => {
    const draft = {
      ...makeDraft('New convention'),
      prior: [{ id: 2, fields: { convention: 'Saved convention' }, stillCurrent: false }]
    };
    const [row] = prepareReview(draft);
    const accepted = {
      ...row,
      fields: { ...row.fields, convention: 'New convention' },
      visited: true,
      conflicts: []
    };

    expect(prepareReview(draft, [accepted])).toEqual([accepted]);
  });

  it('does not submit edits to an optional row with a missing required field', () => {
    const draft = makeDraft('');
    draft.proposals[0]!.inKernel = false;
    draft.proposals[0]!.missing = ['convention'];
    const [row] = prepareReview(draft);

    expect(canConfirmReview([row])).toBe(true);
    expect(canConfirmReview([{ ...row, fields: { ...row.fields, term_raw: 'Edited term' } }])).toBe(false);
    expect(canConfirmReview([{ ...row, fields: { ...row.fields, convention: 'Filled convention' } }])).toBe(true);
  });
});
