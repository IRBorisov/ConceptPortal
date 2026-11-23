function schemaFor(runtime, definitions) {
  const { CstType, RSLangAnalyzer, analyzeConstituentType, buildFormalDependencyGraph } = runtime;
  const items = definitions.map(([id, alias, type, definition]) => ({
    id,
    alias,
    cst_type: CstType[type],
    definition_formal: definition,
    typification_manual: '',
    value_is_property: false
  }));
  const analyzer = new RSLangAnalyzer();
  const graph = buildFormalDependencyGraph(items);
  const cstByID = new Map(items.map(item => [item.id, item]));
  for (const id of graph.topologicalOrder()) {
    const item = cstByID.get(id);
    const { parse, effectiveType } = analyzeConstituentType(item, analyzer);
    item.analysis = parse;
    item.effectiveType = effectiveType;
  }
  return { id: 1, items, analyzer, graph, cstByID, cstByAlias: new Map(items.map(item => [item.alias, item])) };
}

function createModel(runtime, definitions, bindings) {
  const schema = schemaFor(runtime, definitions);
  const engine = new runtime.RSEngine(1, {
    setCstValue: async () => {},
    clearValues: async () => {}
  });
  const load = (items, replacement = schema) => {
    engine.loadData(replacement, { id: 1, schema: 1, items: structuredClone(items) });
    engine.flushPendingChanges();
  };
  load(bindings);
  return { engine, schema, load };
}

function result(engine, definitions) {
  return definitions.map(([id]) => [engine.getCstStatus(id), engine.getCstValue(id)]);
}

function recalculate(model, method, definitions) {
  model.engine[method]();
  model.engine.flushPendingChanges();
  return result(model.engine, definitions);
}

export function runModelCases({ check, reference, candidate }) {
  const definitions = [
    [1, 'X1', 'BASE', ''],
    [2, 'X2', 'BASE', ''],
    [3, 'F1', 'FUNCTION', '[x∈Z] x+card(X1)'],
    [4, 'D1', 'TERM', 'F1[1]'],
    [5, 'D2', 'TERM', 'card(X2)'],
    [6, 'D3', 'TERM', 'D1+D2'],
    [7, 'S1', 'STRUCTURED', 'ℬ(Z)'],
    [8, 'D4', 'TERM', 'S1'],
    [9, 'S2', 'STRUCTURED', 'Z'],
    [10, 'D5', 'TERM', 'S2+2']
  ];
  const bindings = [
    { id: 1, type: 'basic', value: { 1: 'a' } },
    { id: 2, type: 'basic', value: { 1: 'b' } },
    { id: 7, type: 'ℬ(Z)', value: [-0, 2] },
    { id: 9, type: 'Z', value: 7 }
  ];
  const baseline = createModel(reference, definitions, bindings);
  const incremental = createModel(candidate, definitions, bindings);
  const evaluateFast = incremental.engine.calculator.evaluateFast.bind(incremental.engine.calculator);
  let calls = 0;
  incremental.engine.calculator.evaluateFast = ast => {
    calls++;
    return evaluateFast(ast);
  };
  function compare(id, expectedCalls) {
    calls = 0;
    const expected = recalculate(baseline, 'recalculateAll', definitions);
    check(`model.${id}`, () => recalculate(incremental, 'recalculateChanged', definitions), expected);
    if (expectedCalls !== undefined) check(`model.${id}.evaluations`, calls, expectedCalls);
  }
  compare('first', 5);
  check('model.signed-zero.anchor', incremental.engine.getCstValue(8), [-0, 2]);
  compare('unchanged', 0);
  for (const model of [baseline, incremental]) model.load(bindings);
  compare('equivalent-reload', 0);

  const changed = [{ id: 1, type: 'basic', value: { 1: 'a', 2: 'c' } }, ...bindings.slice(1)];
  for (const model of [baseline, incremental]) model.load(changed);
  compare('through-function', 2);
  check('model.through-function.anchor', incremental.engine.getCstValue(6), 4);

  const legacy = changed.map(binding => (binding.id === 7 ? { ...binding, value: [2, -0, 2] } : binding));
  for (const model of [baseline, incremental]) model.load(legacy);
  compare('legacy-order-and-duplicates', 1);
  check('model.legacy-order-and-duplicates.anchor', incremental.engine.getCstValue(8), [2, -0, 2]);

  const edited = definitions.map(item => (item[0] === 3 ? [3, 'F1', 'FUNCTION', '[x∈Z] x+10+card(X1)'] : item));
  baseline.load(changed, schemaFor(reference, edited));
  incremental.load(changed, schemaFor(candidate, edited));
  compare('schema-and-ast-replacement', 5);
  check('model.schema-and-ast-replacement.anchor', incremental.engine.getCstValue(6), 14);

  const missing = changed.filter(binding => binding.id !== 9);
  for (const model of [baseline, incremental]) model.load(missing, model.engine.schema);
  compare('missing-binding', 1);
  const diagnostic = baseline.engine.calculateCst(10);
  check(
    'model.missing-binding.diagnostic',
    diagnostic.errors.map(error => error.code),
    [reference.RSErrorCode.calcGlobalMissing]
  );
  check('model.missing-binding.details', () => incremental.engine.calculateCst(10), diagnostic);
  for (const model of [baseline, incremental]) model.load(changed, model.engine.schema);
  compare('restored-binding', 1);
  check('model.restored-binding.anchor', incremental.engine.getCstValue(10), 9);

  for (const [model, runtime] of [
    [baseline, reference],
    [incremental, candidate]
  ]) {
    const ast = runtime.parseRSLangExpression('[x∈Z] x+20+card(X1)');
    if (!ast || ast.hasError) throw new Error('Could not parse replacement function');
    model.engine.calculator.setAST('F1', ast);
  }
  compare('ast-replacement-in-same-schema', 5);
  check('model.ast-replacement-in-same-schema.anchor', incremental.engine.getCstValue(6), 24);

  checkSharedNaN(check, reference, candidate);
  checkNaNDuringRefresh(check, reference, candidate);
}

function checkSharedNaN(check, reference, candidate) {
  const overflow = '1' + '0'.repeat(310);
  const definitions = [
    [1, 'X1', 'BASE', ''],
    [2, 'D1', 'TERM', `{${overflow}-${overflow}}`],
    [3, 'D2', 'TERM', 'D1'],
    [4, 'A1', 'AXIOM', 'D1=D2 & card(X1)>0']
  ];
  const initial = [{ id: 1, type: 'basic', value: { 1: 'a' } }];
  const next = [{ id: 1, type: 'basic', value: { 1: 'a', 2: 'b' } }];
  const baseline = createModel(reference, definitions, initial);
  const incremental = createModel(candidate, definitions, initial);
  const expected = recalculate(baseline, 'recalculateAll', definitions);
  check('model.shared-NaN.first', () => recalculate(incremental, 'recalculateChanged', definitions), expected);
  check('model.shared-NaN.anchor', incremental.engine.getCstValue(2), [NaN]);
  baseline.load(next);
  incremental.load(next);
  const refreshed = recalculate(baseline, 'recalculateAll', definitions);
  check('model.shared-NaN.refresh', () => recalculate(incremental, 'recalculateChanged', definitions), refreshed);
  check('model.shared-NaN.axiom', incremental.engine.getCstValue(4), 1);
}

function checkNaNDuringRefresh(check, reference, candidate) {
  const large = '1' + '0'.repeat(200);
  const definitions = [
    [1, 'X1', 'BASE', ''],
    [2, 'S1', 'STRUCTURED', 'Z'],
    [3, 'D1', 'TERM', `{S1*${large}-S1*${large}}`],
    [4, 'D2', 'TERM', 'D1'],
    [5, 'A1', 'AXIOM', 'D1=D2 & card(X1)>0']
  ];
  const initial = [
    { id: 1, type: 'basic', value: { 1: 'a' } },
    { id: 2, type: 'Z', value: 1 }
  ];
  const baseline = createModel(reference, definitions, initial);
  const incremental = createModel(candidate, definitions, initial);
  const compare = id => {
    const expected = recalculate(baseline, 'recalculateAll', definitions);
    check(
      `model.NaN-during-refresh.${id}`,
      () => recalculate(incremental, 'recalculateChanged', definitions),
      expected
    );
  };
  compare('finite-initial');
  check('model.NaN-during-refresh.finite-anchor', incremental.engine.getCstValue(3), [0]);
  const bindings = [initial[0], { ...initial[1], value: Number(large) }];
  baseline.load(bindings);
  incremental.load(bindings);
  compare('overflow');
  check('model.NaN-during-refresh.overflow-anchor', incremental.engine.getCstValue(3), [NaN]);
  const updated = [{ ...bindings[0], value: { 1: 'a', 2: 'b' } }, bindings[1]];
  baseline.load(updated);
  incremental.load(updated);
  compare('independent-binding-change');
  check('model.NaN-during-refresh.axiom', incremental.engine.getCstValue(5), 1);
}
