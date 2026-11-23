const GROUP = 'I{(a,b) | a:∈X1; b:=F1[a]}';
const COUNT = 'D{a∈X1 | card(F1[a])>1}';
const SUBSET = 'D{(a,b)∈X1×X1 | F1[b]⊆F1[a]}';
const DISJOINT = 'D{(a,b)∈S2 | F1[a]∩F1[b]=∅}';
const FORWARD = '[a∈X1] Pr2(Fi1[{a}](S1))';
const REVERSE = '[a∈X1] Pr1(Fi2[{a}](S1))';
const MINES = 'I{(ξ, μ) | ξ:∈D3; μ:=card(S2∩F1[ξ])}';
const PAIR = -111;
const pair = (left, right) => [PAIR, left, right];

function ast(runtime, formula) {
  const parsed = runtime.parseRSLangExpression(formula);
  if (!parsed || parsed.hasError) throw new Error(`Could not parse fixture formula ${formula}`);
  return parsed;
}

function interpret(runtime, { expression, functionDefinition, bindings }, fast = false) {
  const calculator = new runtime.RSCalculator();
  for (const [alias, value] of Object.entries(bindings)) calculator.setValue(alias, value);
  calculator.setAST('F1', ast(runtime, functionDefinition));
  const tree = ast(runtime, expression);
  return fast ? calculator.evaluateFast(tree) : calculator.evaluateFull(tree);
}

function observed({ value, errors }) {
  return { value, errors };
}

function exerciseRelational({ check, reference, candidate, experiments }, { id, expected, expectedError, ...fixture }) {
  const input = { functionDefinition: FORWARD, ...fixture };
  const oracle = interpret(reference, structuredClone(input));
  if (expectedError) {
    check(
      `${id}.oracle.error`,
      { value: oracle.value, codes: oracle.errors.map(error => error.code) },
      {
        value: null,
        codes: [reference.RSErrorCode[expectedError]]
      }
    );
  } else {
    check(`${id}.oracle`, observed(oracle), { value: expected, errors: [] });
  }
  check(`${id}.candidate`, () => interpret(candidate, structuredClone(input)), oracle);
  check(`${id}.candidate-fast`, () => interpret(candidate, structuredClone(input), true), oracle.value);
  if (experiments?.relational) {
    check(
      `${id}.lowering`,
      () => {
        const value = experiments.relational({ runtime: candidate, ...structuredClone(input) });
        return value === undefined ? observed(interpret(candidate, structuredClone(input))) : { value, errors: [] };
      },
      observed(oracle)
    );
  }
}

function storedProjection(runtime, evaluate = engine => engine.calculateCst(5)) {
  const { CstType } = runtime;
  const items = [
    { id: 1, alias: 'X1', cst_type: CstType.BASE, definition_formal: '' },
    { id: 2, alias: 'X2', cst_type: CstType.BASE, definition_formal: '' },
    { id: 3, alias: 'S1', cst_type: CstType.STRUCTURED, definition_formal: 'ℬ(X1×X2)' },
    { id: 4, alias: 'F1', cst_type: CstType.FUNCTION, definition_formal: FORWARD },
    { id: 5, alias: 'D1', cst_type: CstType.TERM, definition_formal: GROUP }
  ];
  const analyzer = new runtime.RSLangAnalyzer();
  const schema = {
    items,
    analyzer,
    graph: runtime.buildFormalDependencyGraph(items),
    cstByAlias: new Map(items.map(item => [item.alias, item])),
    cstByID: new Map(items.map(item => [item.id, item]))
  };
  for (const item of items) {
    if (item.cst_type === CstType.BASE) {
      analyzer.addBase(item.alias);
      item.effectiveType = analyzer.getType(item.alias);
      continue;
    }
    item.analysis = analyzer.checkFull(item.definition_formal, { isDomain: item.cst_type === CstType.STRUCTURED });
    if (!item.analysis.success || item.analysis.errors.length > 0) throw new Error(`Could not analyze ${item.alias}`);
    item.effectiveType = item.analysis.type;
    analyzer.setGlobal(item.alias, item.effectiveType, item.analysis.valueClass);
  }
  // JSON.stringify(-0) would erase this stored input case before the load.
  const model = JSON.parse(`{
    "id":1,"schema":1,"items":[
      {"id":1,"type":"basic","value":{"1":"subject"}},
      {"id":2,"type":"basic","value":{"0":"object"}},
      {"id":3,"type":"shape:ℬ(*×*)","value":[[${PAIR},1,-0]]}
    ]
  }`);
  const engine = new runtime.RSEngine(model.id, {
    setCstValue: async () => {
      throw new Error('Read-only fixture');
    },
    clearValues: async () => {
      throw new Error('Read-only fixture');
    }
  });
  engine.loadData(schema, model);
  try {
    return {
      status: engine.getCstStatus(3),
      bindings: { X1: engine.getCstValue(1), S1: engine.getCstValue(3) },
      result: evaluate(engine)
    };
  } finally {
    engine.flushPendingChanges();
  }
}

function exerciseStoredProjection({ check, reference, candidate, experiments }) {
  const oracle = storedProjection(reference);
  const value = [pair(1, [-0])];
  check('typed.stored-signed-zero.oracle', observed(oracle.result), { value, errors: [] });
  check('typed.stored-signed-zero.status', oracle.status, reference.EvalStatus?.HAS_DATA ?? 7);
  check(
    'typed.stored-signed-zero.candidate',
    () => {
      const result = storedProjection(candidate);
      return { status: result.status, result: result.result };
    },
    { status: oracle.status, result: oracle.result }
  );
  check(
    'typed.stored-signed-zero.candidate-first-recalculation',
    () => {
      const result = storedProjection(candidate, engine => {
        engine.recalculateAll();
        return engine.getCstValue(5);
      });
      return { status: result.status, value: result.result };
    },
    { status: oracle.status, value: oracle.result.value }
  );
  if (experiments?.relational) {
    check(
      'typed.stored-signed-zero.lowering',
      () => {
        const result = storedProjection(candidate);
        const value = experiments.relational({
          runtime: candidate,
          operation: 'groups',
          expression: GROUP,
          functionDefinition: FORWARD,
          bindings: structuredClone(result.bindings)
        });
        return value === undefined ? observed(result.result) : { value, errors: [] };
      },
      observed(oracle.result)
    );
  }
}

function minesModel(keys, edges, mines) {
  return {
    id: 2,
    schema: 1,
    items: [
      { id: 1, type: 'basic', value: Object.fromEntries(keys.map(key => [key, 'cell'])) },
      { id: 2, type: 'shape:ℬ(*×*)', value: edges },
      { id: 3, type: 'shape:ℬ(*)', value: mines }
    ]
  };
}

function interpretMines(runtime, model, fast = false) {
  const [cells, relation, mines] = model.items.map(item => item.value);
  const domain = Object.keys(cells)
    .map(Number)
    .sort((left, right) => left - right);
  const calculator = new runtime.RSCalculator();
  calculator.setValue('X1', domain);
  calculator.setValue('S1', relation);
  calculator.setValue('S2', mines);
  calculator.setAST('F1', ast(runtime, FORWARD));
  const safe = calculator.evaluateFull(ast(runtime, 'X1\\S2'));
  if (safe.value === null || safe.errors.length > 0) return fast ? null : safe;
  calculator.setValue('D3', safe.value);
  const tree = ast(runtime, MINES);
  return fast ? calculator.evaluateFast(tree) : calculator.evaluateFull(tree);
}

function limitSummary(value) {
  return Array.isArray(value) ? `${value.length} result rows` : value;
}

function exerciseMines({ check, reference, candidate, experiments }, { id, model, expected, limit = false }) {
  const oracle = interpretMines(reference, structuredClone(model));
  const diagnostic = { code: reference.RSErrorCode.iterationsLimit, from: 11, to: 16, params: ['1000000'] };
  const summarizeValue = limit ? limitSummary : value => value;
  const summarize = result => ({ ...result, value: summarizeValue(result.value) });
  const snapshot = result => observed(summarize(result));
  check(
    `${id}.oracle`,
    snapshot(oracle),
    limit ? { value: null, errors: [diagnostic] } : { value: expected, errors: [] }
  );
  if (limit) check(`${id}.iterations`, oracle.iterations, 1_000_001);
  check(`${id}.candidate`, () => summarize(interpretMines(candidate, structuredClone(model))), summarize(oracle));
  check(
    `${id}.candidate-fast`,
    () => summarizeValue(interpretMines(candidate, structuredClone(model), true)),
    summarizeValue(oracle.value)
  );
  if (experiments?.minesD4) {
    check(
      `${id}.lowering`,
      () => {
        const value = experiments.minesD4({
          runtime: candidate,
          model: structuredClone(model),
          ids: { X1: 1, S1: 2, S2: 3 },
          expression: MINES
        });
        return snapshot(
          value === undefined ? interpretMines(candidate, structuredClone(model)) : { value, errors: [] }
        );
      },
      snapshot(oracle)
    );
  }
}

/**
 * Optional synchronous experiment hooks return a raw Value, or undefined to decline and use interpretation.
 * `relational` receives `{ runtime, operation, expression, functionDefinition, bindings }`.
 * `minesD4` receives `{ runtime, model, ids, expression }` with the original stored model shape.
 * Exceptions are failures. Adapters may catch only known guard rejections and return undefined.
 */
export function runTypedCases(context) {
  const minimum = Number.MIN_SAFE_INTEGER;
  const maximum = Number.MAX_SAFE_INTEGER;
  exerciseStoredProjection(context);
  for (const shape of [
    {
      id: 'typed.groups.signed-zero-first',
      bindings: { X1: [1], S1: [pair(1, -0), pair(1, 0)] },
      expected: [pair(1, [-0])]
    },
    {
      id: 'typed.groups.positive-zero-first',
      bindings: { X1: [1], S1: [pair(1, 0), pair(1, -0)] },
      expected: [pair(1, [0])]
    },
    {
      id: 'typed.groups.reverse-signed-zero',
      functionDefinition: REVERSE,
      bindings: { X1: [1], S1: [pair(-0, 1)] },
      expected: [pair(1, [-0])]
    },
    {
      id: 'typed.groups.sparse-deduplicated',
      bindings: {
        X1: [minimum, -19, 7, maximum],
        S1: [pair(7, maximum), pair(minimum, maximum), pair(7, minimum), pair(7, maximum)]
      },
      expected: [pair(minimum, [maximum]), pair(-19, []), pair(7, [minimum, maximum]), pair(maximum, [])]
    },
    {
      id: 'typed.groups.unordered-repeated-domain',
      bindings: { X1: [2, 1, 2], S1: [pair(1, 8)] },
      expected: [pair(1, [8]), pair(2, [])]
    },
    { id: 'typed.groups.empty', bindings: { X1: [], S1: [] }, expected: [] },
    {
      id: 'typed.groups.malformed-key',
      bindings: { X1: [1], S1: [pair([], 9)] },
      expectedError: 'calcInvalidData'
    }
  ])
    exerciseRelational(context, { operation: 'groups', expression: GROUP, ...shape });

  exerciseRelational(context, {
    id: 'typed.count.distinct-neighbors',
    operation: 'count-greater',
    expression: COUNT,
    bindings: { X1: [minimum, 0, maximum], S1: [pair(minimum, 13), pair(minimum, maximum), pair(0, 13), pair(0, 13)] },
    expected: [minimum]
  });

  for (const distinct of [32, 33]) {
    const edges = Array.from({ length: distinct }, (_, bit) => pair(1, bit));
    edges.push(pair(2, distinct - 1));
    const pairs = [pair(1, 1), pair(1, 2), pair(2, 1), pair(2, 2), pair(2, 3)];
    const bindings = { X1: [1, 2, 3], S1: edges, S2: pairs };
    exerciseRelational(context, {
      id: `typed.subset.mask-${distinct}`,
      operation: 'subset',
      expression: SUBSET,
      bindings,
      expected: [pair(1, 1), pair(1, 2), pair(1, 3), pair(2, 2), pair(2, 3), pair(3, 3)]
    });
    exerciseRelational(context, {
      id: `typed.disjoint.mask-${distinct}`,
      operation: 'disjoint',
      expression: DISJOINT,
      bindings,
      expected: [pair(2, 3)]
    });
  }
  const dense = Array.from({ length: 64 }, (_, index) => index - 18);
  exerciseRelational(context, {
    id: 'typed.subset.dense-4096-pairs',
    operation: 'subset',
    expression: SUBSET,
    bindings: { X1: dense, S1: dense.map(key => pair(key, maximum)) },
    expected: dense.flatMap(left => dense.map(right => pair(left, right)))
  });
  exerciseRelational(context, {
    id: 'typed.disjoint.repeated-pairs',
    operation: 'disjoint',
    expression: DISJOINT,
    bindings: { X1: [1, 2, 3], S1: [pair(1, 7), pair(2, 18)], S2: [pair(3, 1), pair(2, 2), pair(1, 2), pair(1, 2)] },
    expected: [pair(3, 1), pair(1, 2), pair(1, 2)]
  });

  const sparse = minesModel(
    [minimum, -19, 0, maximum],
    [pair(minimum, maximum), pair(-19, maximum), pair(-19, maximum), pair(0, -19)],
    [minimum, maximum]
  );
  exerciseMines(context, {
    id: 'typed.mines.sparse-wide-duplicate-edges',
    model: sparse,
    expected: [pair(-19, 1), pair(0, 0)]
  });
  const complete = Array.from({ length: 12 }, (_, index) => index - 5);
  const completeEdges = complete.flatMap(source =>
    complete.filter(target => target !== source).map(target => pair(source, target))
  );
  const firstMines = complete.slice(0, 3);
  exerciseMines(context, {
    id: 'typed.mines.dense-adjacency',
    model: minesModel(complete, completeEdges, firstMines),
    expected: complete.slice(3).map(cell => pair(cell, firstMines.length))
  });
  exerciseMines(context, {
    id: 'typed.mines.unknown-mine',
    model: minesModel([1, 2], [pair(1, 2)], [3]),
    expected: [pair(1, 0), pair(2, 0)]
  });
  exerciseMines(context, {
    id: 'typed.mines.unordered-edges',
    model: minesModel([1, 2], [pair(2, 1), pair(1, 2)], [2]),
    expected: [pair(1, 1)]
  });
  exerciseMines(context, {
    id: 'typed.mines.wider-legacy-tuple',
    model: minesModel([1, 2], [[PAIR, 1, 2, 8]], [2]),
    expected: [pair(1, 1)]
  });
  exerciseMines(context, { id: 'typed.mines.empty', model: minesModel([], [], []), expected: [] });
  exerciseMines(context, {
    id: 'typed.mines.all-mines',
    model: minesModel([1, 2], [pair(1, 2)], [1, 2]),
    expected: []
  });
  if (context.extended) {
    const keys = Array.from({ length: 250_001 }, (_, index) => index);
    exerciseMines(context, { id: 'typed.mines.iteration-limit', model: minesModel(keys, [], []), limit: true });
  }
}
