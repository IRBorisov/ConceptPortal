import { describe, expect, it } from 'vitest';

import { CstType } from '@/domain/library';

import { schemaConstituentaBasics } from '@/features/rsform/backend/types';
import { sbApi } from '@/features/sandbox/stores/sandbox-mutations';

import starterEn from './starter-bundles/starter-bundle.en.json';
import { schemaSandboxBundle } from './bundle';
import { createStarterSandboxBundle } from './bundle-starter';

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
});
