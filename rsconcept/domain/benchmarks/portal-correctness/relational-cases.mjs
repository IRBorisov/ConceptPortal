const joinExpression = 'D{(a,b)∈X1×X1 | F1[a]=F1[b]}';
const imageExpression = 'I{(a,F1[a]) | a:∈X1}';
const projectionDefinition = '[a∈X1] Pr2(Fi1[{a}](S1))';

function parse(runtime, expression) {
  const ast = runtime.parseRSLangExpression(expression);
  if (!ast || ast.hasError) throw new Error(`Invalid relational fixture expression: ${expression}`);
  return ast;
}

function calculatorWith(runtime, values, definition = projectionDefinition) {
  const calculator = new runtime.RSCalculator();
  for (const [alias, value] of values) calculator.setValue(alias, value);
  const fn = parse(runtime, definition);
  calculator.setAST('F1', fn);
  return { calculator, fn };
}

function valueOf(runtime, calculator, expression, full) {
  const ast = typeof expression === 'string' ? parse(runtime, expression) : expression;
  return full ? calculator.evaluateFull(ast).value : calculator.evaluateFast(ast);
}

function relationRows(runtime) {
  return Array.from({ length: 40 }, (_, index) => [runtime.TUPLE_ID, (index % 8) + 1, (index % 10) + 10, index]);
}

function sourceValues(runtime) {
  return [
    ['X1', [1, 2, 3, 4, 5, 6, 7, 8]],
    ['S1', relationRows(runtime)]
  ];
}

function signedZero(runtime, full) {
  const { calculator } = calculatorWith(runtime, [
    ['X1', JSON.parse('[-0]')],
    ['S1', [[runtime.TUPLE_ID, 0, 10]]]
  ]);
  return valueOf(runtime, calculator, joinExpression, full);
}

function updateFunction(runtime, expression, full) {
  const { calculator, fn } = calculatorWith(runtime, sourceValues(runtime));
  const before = valueOf(runtime, calculator, expression, full);
  fn.children[1].data.value[0] = '3';
  calculator.setAST('F1', fn);
  const after = valueOf(runtime, calculator, expression, full);
  return { before, after };
}

function reuseRoot(runtime, full) {
  const { calculator } = calculatorWith(runtime, [
    ['X1', [1, 2]],
    ['X2', [3, 4, 5]],
    ['S1', []]
  ]);
  const ast = parse(runtime, joinExpression);
  const before = valueOf(runtime, calculator, ast, full);
  for (const factor of ast.children[1].children) factor.data.value = 'X2';
  const after = valueOf(runtime, calculator, ast, full);
  return { before, after };
}

function unselectedAccessor(runtime, expression, full) {
  const values = sourceValues(runtime);
  const unselected = [runtime.TUPLE_ID, 999, 0];
  let reads = 0;
  Object.defineProperty(unselected, '2', {
    enumerable: true,
    get() {
      reads++;
      throw new Error('Unselected projection field read');
    }
  });
  values[1][1].push(unselected);
  const { calculator } = calculatorWith(runtime, values);
  const value = valueOf(runtime, calculator, expression, full);
  return { value, reads };
}

function positiveJoin(runtime, full) {
  const t = runtime.TUPLE_ID;
  const { calculator } = calculatorWith(
    runtime,
    [
      ['X1', [1, 2, 3]],
      [
        'S1',
        [
          [t, 3, 4],
          [t, 1, 11],
          [t, 2, 11],
          [t, 1, 8],
          [t, 2, 8],
          [t, 1, 11]
        ]
      ]
    ],
    '[a∈X1] Pr2(Fi1[bool(a)](S1))'
  );
  return valueOf(runtime, calculator, joinExpression, full);
}

function malformedImage(runtime, full) {
  const values = sourceValues(runtime);
  values[1][1].push([runtime.TUPLE_ID, 8, [42], 100]);
  const { calculator } = calculatorWith(runtime, values);
  const ast = parse(runtime, imageExpression);
  return full ? calculator.evaluateFull(ast) : calculator.evaluateFast(ast);
}

function trace(runtime, values, definition, expression, withReporter = false) {
  const evaluator = new runtime.Evaluator(new Map(values), new Map([['F1', parse(runtime, definition)]]));
  const errors = [];
  const value = evaluator.run(parse(runtime, expression), withReporter ? error => errors.push(error) : undefined);
  return { value, iterations: evaluator.iterationCounter, cacheHits: evaluator.cacheHits, errors };
}

function collidingProjection(runtime) {
  return trace(
    runtime,
    sourceValues(runtime),
    projectionDefinition,
    'I{(a,u,v,w) | a:∈X1; u:=Pr2(Fi1[{a}](S1)); v:=F1[a]; w:=Pr2(Fi1[{a}](S1))}'
  );
}

function summarizeProduct(runtime, size, value) {
  if (!Array.isArray(value)) return value;
  return {
    length: value.length,
    firstMisorderedTuple: value.findIndex(
      (row, index) =>
        !Array.isArray(row) ||
        row.length !== 3 ||
        row[0] !== runtime.TUPLE_ID ||
        row[1] !== Math.floor(index / size) + 1 ||
        row[2] !== (index % size) + 1
    )
  };
}

function joinBudget(runtime, size, full) {
  const { calculator } = calculatorWith(runtime, [
    ['X1', Array.from({ length: size }, (_, index) => index + 1)],
    ['S1', []]
  ]);
  const ast = parse(runtime, joinExpression);
  if (!full) return summarizeProduct(runtime, size, calculator.evaluateFast(ast));
  const result = calculator.evaluateFull(ast);
  return { ...result, value: summarizeProduct(runtime, size, result.value) };
}

function imageBudget(runtime, withReporter) {
  const values = sourceValues(runtime);
  values.push(['C1', Array.from({ length: 1_000 }, (_, index) => index + 1)]);
  return trace(runtime, values, projectionDefinition, 'card(I{(a,F1[a]) | a:∈X1})>0 & ∀x,y∈C1 1=1', withReporter);
}

function seededFixtures(count) {
  let seed = 166_534_237;
  const next = limit => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) % limit;
  };
  const integers = [-Number.MAX_SAFE_INTEGER, -111, -9, -0, 3, 7, 15, Number.MAX_SAFE_INTEGER];
  const pick = values => values[next(values.length)];
  return Array.from({ length: count }, (_, index) => {
    const variant = Math.floor(index / 2) % 8;
    const columns = Array.from({ length: 33 + next(16) }, () => Array.from({ length: 3 }, () => pick(integers)));
    columns.push([...pick(columns)]);
    const subjects = integers.filter(() => next(3) !== 0);
    const from = next(3) + 1;
    const to = next(3) + 1;
    const useBoolSingleton = next(2) === 0;

    if (variant === 1) subjects.reverse();
    if (variant === 2 && subjects.length > 0) subjects.push(subjects[0]);
    if (variant === 3) columns[0][from - 1] = NaN;
    if (variant === 4) columns[0][to - 1] = [3, 7];
    if (variant === 5) delete columns[0][to - 1];
    if (variant === 6) columns.length = 3;

    const argumentsByRow = Array.from({ length: 9 }, (_, row) => {
      const numbers = Array.from({ length: next(5) }, () => pick(integers)).sort((a, b) => a - b);
      if (variant === 1 && row === 6) numbers.reverse();
      if (variant === 7 && row === 7) numbers.push(Infinity);
      return numbers;
    });
    return { columns, subjects, from, to, useBoolSingleton, argumentsByRow };
  });
}

function seededCase(runtime, fixture, index, mode) {
  const t = runtime.TUPLE_ID;
  const rows = fixture.columns.map(columns => {
    const row = structuredClone(columns);
    row.unshift(t);
    return row;
  });
  if (index % 2 === 0) {
    const source = fixture.useBoolSingleton ? 'bool(a)' : '{a}';
    const fn = `[a∈X1] Pr${fixture.to}(Fi${fixture.from}[${source}](S1))`;
    const { calculator } = calculatorWith(
      runtime,
      [
        ['X1', [...fixture.subjects]],
        ['S1', rows]
      ],
      fn
    );
    return valueOf(runtime, calculator, joinExpression, mode === 'full');
  }
  const keys = fixture.argumentsByRow.map((argument, row) => [t, row + 1, [...argument]]);
  const fn = `[a∈ℬ(X1)] Pr${fixture.to}(Fi${fixture.from}[a](S1))`;
  const bindings = [
    ['X1', [...fixture.subjects]],
    ['S1', rows],
    ['S2', keys]
  ];
  const expression = 'I{(i,F1[a]) | (i,a):∈S2}';
  if (mode === 'trace') return trace(runtime, bindings, fn, expression);
  return valueOf(runtime, calculatorWith(runtime, bindings, fn).calculator, expression, mode === 'full');
}

export function runRelationalCases({ check, reference, candidate, extended = false }) {
  const t = reference.TUPLE_ID;
  const checkFast = (id, exercise) => check(id, () => exercise(candidate, false), exercise(reference, true));

  check('relational.signed-zero-oracle', () => signedZero(reference, true), [[t, -0, -0]]);
  checkFast('relational.signed-zero', signedZero);

  const expectedJoin = [
    [t, 1, 1],
    [t, 1, 2],
    [t, 2, 1],
    [t, 2, 2],
    [t, 3, 3]
  ];
  check('relational.ordered-duplicate-oracle', () => positiveJoin(reference, true), expectedJoin);
  checkFast('relational.ordered-duplicates', positiveJoin);

  for (const [name, expression] of [
    ['join', joinExpression],
    ['image', imageExpression]
  ]) {
    const expected = updateFunction(reference, expression, true);
    check(
      `relational.${name}-update-changes-value`,
      () => JSON.stringify(expected.before) !== JSON.stringify(expected.after),
      true
    );
    check(`relational.${name}-same-function-ast`, () => updateFunction(candidate, expression, false), expected);

    const access = unselectedAccessor(reference, expression, true);
    check(`relational.${name}-unselected-access-oracle`, access.reads, 0);
    check(`relational.${name}-unselected-accessor`, () => unselectedAccessor(candidate, expression, false), access);
  }
  const reused = reuseRoot(reference, true);
  check('relational.join-root-update-size-oracle', () => [reused.before.length, reused.after.length], [4, 9]);
  check('relational.join-reused-root-ast', () => reuseRoot(candidate, false), reused);

  const bad = malformedImage(reference, true);
  check('relational.image-fallback-error-oracle', () => bad.errors.map(error => error.code), [
    reference.RSErrorCode.calcInvalidData
  ]);
  check('relational.image-fallback-value', () => malformedImage(candidate, false), bad.value);
  check('relational.image-fallback-full', () => malformedImage(candidate, true), bad);
  check('relational.image-cache-displacement', () => collidingProjection(candidate), collidingProjection(reference));

  for (const size of [377, 378]) {
    const below = size === 377;
    const expected = joinBudget(reference, size, true);
    const span = joinExpression.indexOf('F1[a]');
    const diagnostic = {
      code: reference.RSErrorCode.iterationsLimit,
      from: span,
      to: span + 'F1[a]'.length,
      params: ['1000000']
    };
    check(`relational.join-budget-${size}-oracle`, expected, {
      value: below ? { length: size * size, firstMisorderedTuple: -1 } : null,
      iterations: below ? 994_903 : 1_000_003,
      cacheHits: 0,
      errors: below ? [] : [diagnostic]
    });
    check(`relational.join-budget-${size}-fast`, () => joinBudget(candidate, size, false), expected.value);
    check(`relational.join-budget-${size}-full`, () => joinBudget(candidate, size, true), expected);
  }

  const unreportedLimit = imageBudget(reference, false);
  check('relational.image-budget-value-oracle', unreportedLimit, {
    value: null,
    iterations: 1_000_001,
    cacheHits: 999_968,
    errors: []
  });
  check('relational.image-budget-value', () => imageBudget(candidate, false), unreportedLimit);
  const reportedLimit = imageBudget(reference, true);
  check(
    'relational.image-budget-error-oracle',
    reportedLimit.errors.map(error => error.code),
    [reference.RSErrorCode.iterationsLimit]
  );
  check('relational.image-budget-error', () => imageBudget(candidate, true), reportedLimit);

  for (const [index, fixture] of seededFixtures(extended ? 256 : 48).entries()) {
    checkFast(`relational.seed-${index}`, (runtime, full) =>
      seededCase(runtime, fixture, index, full ? 'full' : 'fast')
    );
    if (index % 2 !== 0) {
      const trace = seededCase(reference, fixture, index, 'trace');
      check(`relational.seed-${index}.trace`, () => seededCase(candidate, fixture, index, 'trace'), trace);
    }
  }
}
