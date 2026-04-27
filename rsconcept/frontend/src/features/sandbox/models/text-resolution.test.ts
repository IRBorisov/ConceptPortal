import { describe, expect, it } from 'vitest';

import { type ConstituentaBasicsDTO } from '@/features/rsform/backend/types';

import { resolveConstituentTextChange } from './text-resolution';

function row(
  data: Partial<ConstituentaBasicsDTO> & Pick<ConstituentaBasicsDTO, 'alias' | 'id'>
): ConstituentaBasicsDTO {
  return {
    id: data.id,
    alias: data.alias,
    convention: '',
    crucial: false,
    cst_type: 'term',
    definition_formal: '',
    definition_raw: data.definition_raw ?? '',
    definition_resolved: data.definition_resolved ?? '',
    term_raw: data.term_raw ?? data.alias,
    term_resolved: data.term_resolved ?? data.term_raw ?? data.alias,
    term_forms: data.term_forms ?? []
  };
}

describe('Sandbox text reference resolution', () => {
  it('cascades term changes into dependent terms and definitions', () => {
    const items = [
      row({ id: 1, alias: 'T1', term_raw: 'base concept', term_resolved: 'base concept' }),
      row({
        id: 2,
        alias: 'T2',
        term_raw: '@{T1|nomn,sing}',
        term_resolved: 'base concept',
        definition_raw: '@{T1|nomn,sing}',
        definition_resolved: 'base concept',
        term_forms: [{ text: 'stale manual form', tags: 'gent,sing' }]
      }),
      row({ id: 3, alias: 'T3', definition_raw: '@{T2|nomn,sing}', definition_resolved: 'base concept' })
    ];

    items[0].term_raw = 'updated concept';
    resolveConstituentTextChange(items, 1, {
      termChanged: true,
      termRawChanged: true,
      definitionRawChanged: false,
      clearTargetForms: true
    });

    expect(items[0].term_resolved).toBe('updated concept');
    expect(items[1].term_resolved).toBe('updated concept');
    expect(items[1].term_forms).toStrictEqual([]);
    expect(items[1].definition_resolved).toBe('updated concept');
    expect(items[2].definition_resolved).toBe('updated concept');
  });

  it('uses updated manual forms as a term change trigger', () => {
    const items = [
      row({ id: 1, alias: 'T1', term_raw: 'base concept', term_resolved: 'base concept' }),
      row({ id: 2, alias: 'T2', term_raw: '@{T1|gent,sing}', term_resolved: 'base concept' })
    ];

    items[0].term_forms = [{ text: 'manual genitive singular', tags: 'gent,sing' }];
    resolveConstituentTextChange(items, 1, {
      termChanged: true,
      termRawChanged: false,
      definitionRawChanged: false,
      clearTargetForms: false
    });

    expect(items[1].term_resolved).toBe('manual genitive singular');
  });

  it('does not cascade definition-only edits', () => {
    const items = [
      row({ id: 1, alias: 'T1', term_raw: 'base concept', term_resolved: 'base concept' }),
      row({ id: 2, alias: 'T2', definition_raw: '@{T1|nomn,sing}', definition_resolved: 'base concept' }),
      row({ id: 3, alias: 'T3', definition_raw: '@{T2|nomn,sing}', definition_resolved: 'old T2' })
    ];

    items[1].definition_raw = 'Only @{T1|nomn,sing}';
    resolveConstituentTextChange(items, 2, {
      termChanged: false,
      termRawChanged: false,
      definitionRawChanged: true,
      clearTargetForms: false
    });

    expect(items[1].definition_resolved).toBe('Only base concept');
    expect(items[2].definition_resolved).toBe('old T2');
  });
});
