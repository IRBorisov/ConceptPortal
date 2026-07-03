import { describe, expect, it } from 'vitest';

import { CstType } from '@rsconcept/domain/library';

import { schemaConstituentaBasics } from '@/features/rsform';
import { sbApi } from '@/features/sandbox/stores/sandbox-mutations';

import starterEn from './starter-bundles/starter-bundle.en.json';
import { schemaSandboxBundle } from './bundle';
import { createStarterSandboxBundle } from './bundle-starter';

describe('sandbox bundle / constituent alias validation', () => {
  it('rejects bundle with alias that does not match cst_type', () => {
    const invalid = structuredClone(starterEn);
    invalid.schema.items[0] = { ...invalid.schema.items[0], alias: 'D1', cst_type: CstType.BASE };
    const parsed = schemaSandboxBundle.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });
});

describe('sandbox bundle / DTO migration for typification_manual', () => {
  it('parses starter locale JSON (items omit typification_manual)', () => {
    const bundle = schemaSandboxBundle.parse(starterEn);
    expect(bundle.schema.items.length).toBeGreaterThan(0);
    for (const cst of bundle.schema.items) {
      expect(typeof cst.typification_manual).toBe('string');
    }
  });

  it('schemaConstituentaBasics coerces missing typification_manual to empty string', () => {
    const parsed = schemaConstituentaBasics.parse({
      id: 1,
      alias: 'X1',
      convention: '',
      crucial: false,
      cst_type: CstType.BASE,
      definition_formal: '',
      definition_raw: '',
      definition_resolved: '',
      term_raw: '',
      term_resolved: '',
      term_forms: []
    });
    expect(parsed.typification_manual).toBe('');
  });

  it('schemaConstituentaBasics coerces missing value_is_property to false', () => {
    const parsed = schemaConstituentaBasics.parse({
      id: 1,
      alias: 'X1',
      convention: '',
      crucial: false,
      cst_type: CstType.BASE,
      definition_formal: '',
      typification_manual: '',
      definition_raw: '',
      definition_resolved: '',
      term_raw: '',
      term_resolved: '',
      term_forms: []
    });
    expect(parsed.value_is_property).toBe(false);
  });

  it('schemaConstituentaBasics coerces null typification_manual to empty string', () => {
    const parsed = schemaConstituentaBasics.parse({
      id: 1,
      alias: 'X1',
      convention: '',
      crucial: false,
      cst_type: CstType.BASE,
      definition_formal: '',
      typification_manual: null,
      definition_raw: '',
      definition_resolved: '',
      term_raw: '',
      term_resolved: '',
      term_forms: []
    });
    expect(parsed.typification_manual).toBe('');
  });
});

describe('sandbox mutations', () => {
  it('updateConstituenta persists typification_manual', () => {
    let bundle = createStarterSandboxBundle('en');
    const target = bundle.schema.items[0];
    bundle = sbApi.updateConstituenta(bundle, {
      target: target.id,
      item_data: { typification_manual: 'ℬ(X1)' }
    });
    expect(bundle.schema.items.find(c => c.id === target.id)!.typification_manual).toBe('ℬ(X1)');
  });

  it('inlineSynthesis inserts source constituents with remapped aliases', () => {
    let bundle = createStarterSandboxBundle('en');
    const receiverCount = bundle.schema.items.length;
    const source: typeof bundle.schema = {
      ...bundle.schema,
      id: 99_001,
      items: [
        {
          id: 10,
          alias: 'X9',
          convention: '',
          crucial: false,
          cst_type: CstType.BASE,
          definition_formal: '',
          typification_manual: '',
          value_is_property: false,
          definition_raw: '',
          definition_resolved: '',
          term_raw: 'source term',
          term_resolved: 'source term',
          term_forms: []
        }
      ],
      attribution: []
    };

    bundle = sbApi.inlineSynthesis(
      bundle,
      {
        receiver: bundle.schema.id,
        source: source.id,
        items: [10],
        substitutions: []
      },
      source
    );

    expect(bundle.schema.items).toHaveLength(receiverCount + 1);
    const inserted = bundle.schema.items.at(-1)!;
    expect(inserted.term_raw).toBe('source term');
    expect(inserted.alias).not.toBe('X9');
    expect(inserted.alias.startsWith('X')).toBe(true);
  });

  it('inlineSynthesis applies substitutions after insert', () => {
    let bundle = createStarterSandboxBundle('en');
    const receiver = bundle.schema.items[0];
    const source: typeof bundle.schema = {
      ...bundle.schema,
      id: 99_002,
      items: [
        {
          id: 20,
          alias: 'Y1',
          convention: '',
          crucial: false,
          cst_type: CstType.TERM,
          definition_formal: 'Y1',
          typification_manual: '',
          value_is_property: false,
          definition_raw: '',
          definition_resolved: '',
          term_raw: 'imported',
          term_resolved: 'imported',
          term_forms: []
        }
      ],
      attribution: []
    };

    bundle = sbApi.inlineSynthesis(
      bundle,
      {
        receiver: bundle.schema.id,
        source: source.id,
        items: [20],
        substitutions: [{ original: 20, substitution: receiver.id }]
      },
      source
    );

    expect(bundle.schema.items.some(c => c.term_raw === 'imported')).toBe(false);
    expect(bundle.schema.items.find(c => c.id === receiver.id)).toBeDefined();
  });
});
