import { describe, expect, it } from 'vitest';

import { type ArgumentValue, type Constituenta, CstClass, CstType, type RSForm } from './rsform';
import { planTemplateInstantiation } from './template-instantiation';

function mockSchema(items: Constituenta[]): RSForm {
  return { items } as RSForm;
}

function mockCst(partial: Pick<Constituenta, 'id' | 'alias' | 'cst_type'> & Partial<Constituenta>): Constituenta {
  return {
    schema: 1,
    crucial: false,
    convention: '',
    definition_raw: '',
    definition_resolved: '',
    term_raw: '',
    term_resolved: '',
    term_forms: [],
    typification_manual: '',
    value_is_property: false,
    homonyms: [],
    formalDuplicates: [],
    analysis: { success: true } as Constituenta['analysis'],
    effectiveType: null,
    is_type_mismatch: false,
    status: 'verified',
    is_template: true,
    is_simple_expression: true,
    parent_schema_index: 0,
    parent_schema: null,
    is_inherited: false,
    has_inherited_children: false,
    attributes: [],
    spawn: [],
    spawn_alias: [],
    cst_class: CstClass.TEMPLATE,
    definition_formal: '',
    ...partial
  };
}

describe('planTemplateInstantiation', () => {
  const f42 = mockCst({
    id: 1,
    alias: 'F42',
    cst_type: CstType.FUNCTION,
    term_raw: 'операция',
    definition_formal: '[α∈R1, β∈R1, σ∈ℬ((R1×R1)×R1)] debool(Pr2(Fi1[{(α,β)}](σ)))'
  });

  const p29 = mockCst({
    id: 2,
    alias: 'P29',
    cst_type: CstType.PREDICATE,
    term_raw: 'замкнутость',
    definition_formal: '[α∈ℬ(R1), σ∈ℬ((R1×R1)×R1)] Pr1(σ) = α×α & card(σ) = card(Pr1(σ))'
  });

  const p30 = mockCst({
    id: 3,
    alias: 'P30',
    cst_type: CstType.PREDICATE,
    term_raw: 'ассоциативность',
    definition_formal: '[σ∈ℬ((R1×R1)×R1)] ∀α,β,γ∈Pr1(Pr1(σ)) F42[F42[α,β,σ],γ,σ] = F42[α,F42[β,γ,σ],σ]'
  });

  const p35 = mockCst({
    id: 4,
    alias: 'P35',
    cst_type: CstType.PREDICATE,
    term_raw: 'полугруппа',
    definition_formal: '[α∈ℬ(R1), σ∈ℬ((R1×R1)×R1)] P29[α, σ] & P30[σ]'
  });

  const templateItems = [f42, p29, p30, p35];
  const targetSchema = mockSchema([
    mockCst({ id: 10, alias: 'S1', cst_type: CstType.STRUCTURED, definition_formal: 'ℬ(X1)' }),
    mockCst({ id: 11, alias: 'S2', cst_type: CstType.STRUCTURED, definition_formal: 'ℬ((X1×X1)×X1)' })
  ]);

  it('creates nested template functions with propagated argument bindings', () => {
    const userArgs: ArgumentValue[] = [
      { alias: 'α', typification: 'ℬ(R1)', value: 'S1' },
      { alias: 'σ', typification: 'ℬ((R1×R1)×R1)', value: 'S2' }
    ];

    const plan = planTemplateInstantiation({
      targetSchema,
      templateItems,
      prototype: p35,
      userArgs,
      mainItem: {
        alias: 'A1',
        cst_type: CstType.PREDICATE,
        crucial: false,
        convention: '',
        definition_formal: p35.definition_formal,
        definition_raw: p35.definition_raw,
        term_raw: p35.term_raw,
        term_forms: [],
        typification_manual: '',
        value_is_property: false
      }
    });

    expect(plan.items.length).toBe(4);
    expect(plan.items[0].alias).toBe('F1');
    expect(plan.items[0].cst_type).toBe(CstType.FUNCTION);
    expect(plan.items[0].definition_formal).toContain('S2');
    expect(plan.items[0].definition_formal).not.toContain('F42');

    const p29Item = plan.items.find(item => item.term_raw === 'замкнутость');
    const p30Item = plan.items.find(item => item.term_raw === 'ассоциативность');
    expect(p29Item?.cst_type).toBe(CstType.AXIOM);
    expect(p30Item?.cst_type).toBe(CstType.AXIOM);
    expect(p30Item?.definition_formal).toContain('F1[');

    const main = plan.items.at(-1)!;
    expect(main.alias).toBe('A1');
    expect(main.cst_type).toBe(CstType.AXIOM);
    expect(main.definition_formal).toContain(`${p29Item?.alias}[S1, S2]`);
    expect(main.definition_formal).toContain(`${p30Item?.alias}[S2]`);
  });

  it('does not assign dependency aliases that collide with the main constituent alias', () => {
    const userArgs: ArgumentValue[] = [
      { alias: 'α', typification: 'ℬ(R1)', value: 'S1' },
      { alias: 'σ', typification: 'ℬ((R1×R1)×R1)', value: 'S2' }
    ];

    const plan = planTemplateInstantiation({
      targetSchema: mockSchema([
        ...targetSchema.items,
        mockCst({ id: 12, alias: 'P1', cst_type: CstType.PREDICATE, definition_formal: 'true' }),
        mockCst({ id: 13, alias: 'P2', cst_type: CstType.PREDICATE, definition_formal: 'true' }),
        mockCst({ id: 14, alias: 'P3', cst_type: CstType.PREDICATE, definition_formal: 'true' }),
        mockCst({ id: 15, alias: 'P4', cst_type: CstType.PREDICATE, definition_formal: 'true' }),
        mockCst({ id: 16, alias: 'P5', cst_type: CstType.PREDICATE, definition_formal: 'true' })
      ]),
      templateItems,
      prototype: p35,
      userArgs,
      mainItem: {
        alias: 'P6',
        cst_type: CstType.PREDICATE,
        crucial: false,
        convention: '',
        definition_formal: p35.definition_formal,
        definition_raw: p35.definition_raw,
        term_raw: p35.term_raw,
        term_forms: [],
        typification_manual: '',
        value_is_property: false
      }
    });

    const aliases = plan.items.map(item => item.alias);
    expect(new Set(aliases).size).toBe(aliases.length);
    expect(aliases.at(-1)).toBe('P6');
    expect(aliases.slice(0, -1).every(alias => alias !== 'P6')).toBe(true);
  });

  it('reuses schema constituent matched by normalized substituted expression', () => {
    const userArgs: ArgumentValue[] = [{ alias: 'σ', typification: 'ℬ((R1×R1)×R1)', value: 'S2' }];

    const baseline = planTemplateInstantiation({
      targetSchema,
      templateItems,
      prototype: p30,
      userArgs,
      mainItem: {
        alias: 'A2',
        cst_type: CstType.PREDICATE,
        crucial: false,
        convention: '',
        definition_formal: p30.definition_formal,
        definition_raw: '',
        term_raw: p30.term_raw,
        term_forms: [],
        typification_manual: '',
        value_is_property: false
      }
    });

    const existingFunction = baseline.items[0];
    const schemaWithEquivalentFunction = mockSchema([
      ...targetSchema.items,
      mockCst({
        id: 12,
        alias: 'F9',
        cst_type: existingFunction.cst_type,
        definition_formal: existingFunction.definition_formal
      })
    ]);

    const plan = planTemplateInstantiation({
      targetSchema: schemaWithEquivalentFunction,
      templateItems,
      prototype: p30,
      userArgs,
      mainItem: {
        alias: 'A2',
        cst_type: CstType.PREDICATE,
        crucial: false,
        convention: '',
        definition_formal: p30.definition_formal,
        definition_raw: '',
        term_raw: p30.term_raw,
        term_forms: [],
        typification_manual: '',
        value_is_property: false
      }
    });

    expect(plan.items).toHaveLength(1);
    expect(plan.items[0].alias).toBe('A2');
    expect(plan.items[0].definition_formal).toContain('F9[');
    expect(plan.items[0].definition_formal).not.toContain('F42[');
  });

  it('instantiates bank dependency when target alias collides but definition differs', () => {
    const schemaWithUnrelatedF42 = mockSchema([
      ...targetSchema.items,
      mockCst({
        id: 12,
        alias: 'F42',
        cst_type: CstType.FUNCTION,
        definition_formal: '[α∈R1] α'
      })
    ]);

    const plan = planTemplateInstantiation({
      targetSchema: schemaWithUnrelatedF42,
      templateItems,
      prototype: p30,
      userArgs: [{ alias: 'σ', typification: 'ℬ((R1×R1)×R1)', value: 'S2' }],
      mainItem: {
        alias: 'A2',
        cst_type: CstType.PREDICATE,
        crucial: false,
        convention: '',
        definition_formal: p30.definition_formal,
        definition_raw: '',
        term_raw: p30.term_raw,
        term_forms: [],
        typification_manual: '',
        value_is_property: false
      }
    });

    const dependency = plan.items[0];
    expect(plan.items).toHaveLength(2);
    expect(dependency.alias).not.toBe('F42');
    expect(dependency.definition_formal).toContain('S2');
    expect(plan.items.at(-1)!.definition_formal).toContain(`${dependency.alias}[`);
    expect(plan.items.at(-1)!.definition_formal).not.toContain('F42[');
  });

  it('reuses template dependency when target has matching substituted definition', () => {
    const userArgs: ArgumentValue[] = [{ alias: 'σ', typification: 'ℬ((R1×R1)×R1)', value: 'S2' }];

    const baseline = planTemplateInstantiation({
      targetSchema,
      templateItems,
      prototype: p30,
      userArgs,
      mainItem: {
        alias: 'A2',
        cst_type: CstType.PREDICATE,
        crucial: false,
        convention: '',
        definition_formal: p30.definition_formal,
        definition_raw: '',
        term_raw: p30.term_raw,
        term_forms: [],
        typification_manual: '',
        value_is_property: false
      }
    });

    const equivalentFunction = baseline.items[0];
    const schemaWithF42 = mockSchema([
      ...targetSchema.items,
      mockCst({
        id: 12,
        alias: 'F42',
        cst_type: equivalentFunction.cst_type,
        definition_formal: equivalentFunction.definition_formal
      })
    ]);

    const plan = planTemplateInstantiation({
      targetSchema: schemaWithF42,
      templateItems,
      prototype: p30,
      userArgs,
      mainItem: {
        alias: 'A2',
        cst_type: CstType.PREDICATE,
        crucial: false,
        convention: '',
        definition_formal: p30.definition_formal,
        definition_raw: '',
        term_raw: p30.term_raw,
        term_forms: [],
        typification_manual: '',
        value_is_property: false
      }
    });

    expect(plan.items).toHaveLength(1);
    expect(plan.items[0].alias).toBe('A2');
    expect(plan.items[0].definition_formal).toContain('F42[');
  });

  it('reports duplicate alias when the selected expression already exists in the schema', () => {
    const userArgs: ArgumentValue[] = [
      { alias: 'α', typification: 'ℬ(R1)', value: 'S1' },
      { alias: 'σ', typification: 'ℬ((R1×R1)×R1)', value: 'S2' }
    ];

    const baseline = planTemplateInstantiation({
      targetSchema,
      templateItems,
      prototype: p35,
      userArgs,
      mainItem: {
        alias: 'A1',
        cst_type: CstType.PREDICATE,
        crucial: false,
        convention: '',
        definition_formal: p35.definition_formal,
        definition_raw: p35.definition_raw,
        term_raw: p35.term_raw,
        term_forms: [],
        typification_manual: '',
        value_is_property: false
      }
    });

    const existingMain = baseline.items.at(-1)!;
    const plan = planTemplateInstantiation({
      targetSchema: mockSchema([
        ...targetSchema.items,
        mockCst({
          id: 20,
          alias: 'A9',
          cst_type: existingMain.cst_type,
          definition_formal: existingMain.definition_formal
        })
      ]),
      templateItems,
      prototype: p35,
      userArgs,
      mainItem: {
        alias: 'A1',
        cst_type: CstType.PREDICATE,
        crucial: false,
        convention: '',
        definition_formal: p35.definition_formal,
        definition_raw: p35.definition_raw,
        term_raw: p35.term_raw,
        term_forms: [],
        typification_manual: '',
        value_is_property: false
      }
    });

    expect(plan.mainDuplicateAlias).toBe('A9');
    expect(plan.items.some(item => item.term_raw === p35.term_raw)).toBe(false);
  });

  it('reports binding conflict when the same template parameter is bound to different aliases', () => {
    const f10 = mockCst({
      id: 5,
      alias: 'F10',
      cst_type: CstType.FUNCTION,
      term_raw: 'g',
      definition_formal: '[x∈R1] x'
    });
    const p11 = mockCst({
      id: 6,
      alias: 'P11',
      cst_type: CstType.PREDICATE,
      term_raw: 'h',
      definition_formal: '[y∈R1] F10[y]'
    });
    const mainTemplate = mockCst({
      id: 7,
      alias: 'P12',
      cst_type: CstType.PREDICATE,
      term_raw: 'main',
      definition_formal: '[a∈R1, b∈R1] P11[a] & P11[b]'
    });

    const plan = planTemplateInstantiation({
      targetSchema,
      templateItems: [f10, p11],
      prototype: mainTemplate,
      userArgs: [
        { alias: 'a', typification: 'R1', value: 'S1' },
        { alias: 'b', typification: 'R1', value: 'S2' }
      ],
      mainItem: {
        alias: 'A1',
        cst_type: CstType.PREDICATE,
        crucial: false,
        convention: '',
        definition_formal: mainTemplate.definition_formal,
        definition_raw: '',
        term_raw: mainTemplate.term_raw,
        term_forms: [],
        typification_manual: '',
        value_is_property: false
      }
    });

    expect(plan.bindingConflict).toEqual({
      templateAlias: 'P11',
      paramAlias: 'y',
      existing: 'S1',
      incoming: 'S2'
    });
    expect(plan.items).toHaveLength(0);
  });
});
