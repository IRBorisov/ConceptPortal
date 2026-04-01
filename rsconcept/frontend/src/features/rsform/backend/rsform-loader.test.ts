import { describe, expect, it } from 'vitest';

import { AccessPolicy, LibraryItemType } from '@/features/library';

import { CstStatus, CstType } from '../models/rsform';

import { RSFormLoader } from './rsform-loader';
import { type ConstituentaBasicsDTO, type RSFormDTO } from './types';

describe('RSFormLoader', () => {
  function createMinimalDTO(overrides: Partial<RSFormDTO> = {}): RSFormDTO {
    return {
      id: 1,
      item_type: LibraryItemType.RSFORM,
      alias: 'test',
      title: 'Title',
      description: 'Description',
      visible: true,
      read_only: false,
      location: '',
      access_policy: AccessPolicy.PUBLIC,
      time_create: '',
      time_update: '',
      owner: 1,
      editors: [],
      versions: [],
      attribution: [],
      is_produced: false,
      oss: [],
      models: [],
      items: [],
      inheritance: [],
      ...overrides,
    };
  }

  function createCst(id: number, alias: string, type: CstType, definition: string, term: string = ''): ConstituentaBasicsDTO {
    return {
      id: id,
      alias: alias,
      cst_type: type,
      definition_formal: definition,
      convention: '',
      definition_raw: '',
      term_raw: '',
      term_forms: [],
      term_resolved: term,
      definition_resolved: '',
      crucial: false
    };
  }

  it('should correctly instantiate and produce RSForm with empty items', () => {
    const dto = createMinimalDTO();
    const loader = new RSFormLoader(dto);
    const rsform = loader.produceRSForm();
    expect(rsform).toBeDefined();
    expect(rsform.version).toBe('latest');
    expect(rsform.items).toEqual([]);
    expect(rsform.analyzer).toBeDefined();
    expect(rsform.graph).toBeDefined();
    expect(rsform.cstByAlias instanceof Map).toBe(true);
    expect(rsform.cstByID instanceof Map).toBe(true);
    expect(rsform.attribution_graph).toBeDefined();
  });

  it('should index and lookup items by alias and ID', () => {
    const item = {
      id: 1,
      alias: 'X1',
      cst_type: CstType.BASE,
      definition_formal: '',
      convention: 't1',
      definition_raw: 't2',
      term_raw: 't3',
      term_forms: [],
      term_resolved: 't4',
      definition_resolved: 't5',
      crucial: true,
    };
    const dto = createMinimalDTO({ items: [item] });
    const loader = new RSFormLoader(dto);
    const rsform = loader.produceRSForm();
    expect(rsform.cstByAlias.get(item.alias)).toEqual(expect.objectContaining({ id: item.id }));
    expect(rsform.cstByID.get(item.id)).toEqual(expect.objectContaining({ alias: item.alias }));
    const cst = rsform.cstByAlias.get('X1');
    expect(cst).toBeDefined();
    expect(cst!.id).toBe(item.id);
    expect(cst!.alias).toBe(item.alias);
    expect(cst!.cst_type).toBe(item.cst_type);
    expect(cst!.definition_formal).toBe(item.definition_formal);
    expect(cst!.convention).toBe(item.convention);
    expect(cst!.definition_raw).toBe(item.definition_raw);
    expect(cst!.term_raw).toBe(item.term_raw);
    expect(cst!.term_forms).toEqual(item.term_forms);
    expect(cst!.term_resolved).toBe(item.term_resolved);
    expect(cst!.definition_resolved).toBe(item.definition_resolved);
    expect(cst!.crucial).toBe(item.crucial);
  });

  it('should create analysis on parsed item', () => {
    const x1raw = createCst(1, 'X1', CstType.BASE, '', 'Люди');
    const s1raw = createCst(2, 'S1', CstType.STRUCTURED, 'ℬℬ(X1×X1)', 'РС1');
    const d1raw = createCst(3, 'D1', CstType.TERM, 'Pr1(red(S1))', 'Терм1');
    const f1raw = createCst(4, 'F1', CstType.FUNCTION, '[α∈ℬ(Z×Z)] Fi2[Pr2(α)\\Pr1(α)](α)', 'Функция1');
    const f2raw = createCst(5, 'F2', CstType.FUNCTION, '[α∈ℬ(Z×Z)] Pr1(F1[α])', 'Функция2');
    const dto = createMinimalDTO({ items: [x1raw, s1raw, d1raw, f1raw, f2raw] });
    const loader = new RSFormLoader(dto);
    const rsform = loader.produceRSForm();
    const x1 = rsform.cstByAlias.get('X1');
    expect(x1).toBeDefined();
    const s1 = rsform.cstByAlias.get('S1');
    expect(s1).toBeDefined();
    const d1 = rsform.cstByAlias.get('D1');
    expect(d1).toBeDefined();
    expect(s1!.analysis.success).toBe(true);
    expect(s1!.status).toBe(CstStatus.VERIFIED);
    expect(d1!.analysis.success).toBe(true);
    expect(d1!.status).toBe(CstStatus.VERIFIED);
    expect(d1!.is_simple_expression).toBe(true);
    expect(d1!.spawner).toBe(s1!.id);
    expect(d1!.spawner_alias).toBe('S1');
    expect(d1!.spawner_path).toEqual([0, 0, 1]);

    const f1 = rsform.cstByAlias.get('F1');
    expect(f1).toBeDefined();
    const f2 = rsform.cstByAlias.get('F2');
    expect(f2).toBeDefined();
    expect(f1!.analysis.success).toBe(true);
    expect(f1!.status).toBe(CstStatus.VERIFIED);
    expect(f2!.analysis.success).toBe(true);
    expect(f2!.status).toBe(CstStatus.VERIFIED);
    expect(f2!.is_simple_expression).toBe(true);
    expect(f2!.spawner).toBe(f1!.id);
    expect(f2!.spawner_alias).toBe('F1');
    expect(f2!.spawner_path).toEqual([0, 1]);
  });
});
