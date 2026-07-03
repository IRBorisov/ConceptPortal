import { describe, expect, it } from 'vitest';

import { globalTx } from '@/i18n';
import { CstType } from '@rsconcept/domain/library';

import starterEn from '@/features/sandbox/models/starter-bundles/starter-bundle.en.json';

import { PORTAL_JSON_CONTRACT_VERSION } from '@/utils/constants';

import { parseRSFormImportJson } from './parse-import-json';

describe('parseRSFormImportJson', () => {
  it('accepts Portal schema JSON export', () => {
    const payload = {
      contract_version: PORTAL_JSON_CONTRACT_VERSION,
      title: 'Test schema',
      alias: 'TS1',
      description: 'desc',
      items: [
        {
          id: 1,
          alias: 'X1',
          convention: '',
          crucial: false,
          cst_type: CstType.BASE,
          definition_formal: '',
          typification_manual: '',
          value_is_property: false,
          definition_raw: '',
          definition_resolved: '',
          term_raw: '',
          term_resolved: '',
          term_forms: []
        }
      ],
      attribution: []
    };

    expect(parseRSFormImportJson(payload)).toEqual(payload);
  });

  it('accepts sandbox bundle JSON export', () => {
    const parsed = parseRSFormImportJson(starterEn);

    expect(parsed.contract_version).toBe(PORTAL_JSON_CONTRACT_VERSION);
    expect(parsed.title).toBe(starterEn.schema.title);
    expect(parsed.alias).toBe(starterEn.schema.alias);
    expect(parsed.description).toBe(starterEn.schema.description);
    expect(parsed.items).toHaveLength(starterEn.schema.items.length);
    expect(parsed.items[0]?.alias).toBe(starterEn.schema.items[0]?.alias);
    expect(parsed.items[0]?.typification_manual).toBe('');
    expect(parsed.items[0]?.value_is_property).toBe(false);
    expect(parsed.attribution).toEqual(starterEn.schema.attribution);
  });

  it('rejects unknown JSON shape', () => {
    expect(() => parseRSFormImportJson({ foo: 'bar' })).toThrow(globalTx('tx.schema.upload.json.invalid'));
  });

  it('rejects sandbox bundle with invalid alias', () => {
    const invalid = structuredClone(starterEn);
    invalid.schema.items[0] = { ...invalid.schema.items[0], alias: 'D1', cst_type: CstType.BASE };

    expect(() => parseRSFormImportJson(invalid)).toThrow();
  });
});
