import { roundFixture } from './graph-fixtures.mjs';

const tupleMarker = -111;
const invalidDebool = 33029;
const undeclaredLocal = 34817;
const iterationLimit = 33028;

function graphProgram(runtime, source = 1, target = 2, inline = false, shadow = false) {
  const calculator = new runtime.RSCalculator();
  const parse = expression => {
    const ast = runtime.parseRSLangExpression(expression);
    if (!ast || ast.hasError) throw new Error('Could not parse graph fixture: ' + expression);
    return ast;
  };
  const image = keys => `Pr${target}(Fi${source}[${keys}](S7))`;
  const variable = shadow ? 'x' : 'r';
  const initial = inline ? image('{x}') : 'F14[x]';
  const step = inline ? image(variable) : `F15[${variable}]`;
  const closure = parse(`[x∈X4] R{${variable}:=${initial} | ${step}∪${variable}}`);
  calculator.setAST('F11', closure);
  calculator.setAST('F14', parse(`[a∈X4] ${image('{a}')}`));
  calculator.setAST('F15', parse(`[b∈ℬ(X4)] ${image('b')}`));
  return { calculator, closure, assertion: parse('∀u∈X4 u∉F11[u]') };
}

function graphResult(runtime, fixture, interpretOnly = false) {
  const { calculator, closure, assertion } = graphProgram(
    runtime,
    fixture.source,
    fixture.target,
    fixture.inline,
    fixture.shadow
  );
  if (fixture.invalidDeclaration) {
    closure.children[0].children[0].typeID = runtime.TokenID.NT_ENUM_DECL;
  }
  const domain = fixture.domain.slice();
  if (fixture.iteratedDomain) {
    Object.defineProperty(domain, Symbol.iterator, {
      value: fixture.iteratedDomain[Symbol.iterator].bind(fixture.iteratedDomain)
    });
  }
  calculator.setValue('X4', domain);
  if (fixture.relation !== undefined) {
    calculator.setValue('S7', structuredClone(fixture.relation));
  }
  const fast = interpretOnly ? undefined : calculator.evaluateFast(assertion);
  const detailed = calculator.evaluateFull(assertion);
  return { fast: interpretOnly ? detailed.value : fast, detailed };
}

function edge(from, to) {
  return [tupleMarker, from, to];
}

function runCycleCases({ check, reference, candidate, extended }) {
  const ordinary = [
    ['no-path-back', { domain: [1, 2, 3], relation: [edge(1, 2), edge(2, 3)] }, 1],
    ['cycle-through-vertices-outside-domain', { domain: [1], relation: [edge(1, 2), edge(2, 3), edge(3, 1)] }, 0],
    ['cycle-excluded-by-domain', { domain: [3], relation: [edge(1, 2), edge(2, 1)] }, 1],
    ['self-loop', { domain: [1], relation: [edge(1, 1)] }, 0],
    ['duplicate-rows', { domain: [1], relation: [edge(2, 1), edge(1, 2), edge(1, 2)] }, 0],
    [
      'inline-and-reversed-columns',
      { domain: [1], relation: [edge(2, 1), edge(1, 2)], source: 2, target: 1, inline: true },
      0
    ],
    ['same-source-and-target-column', { domain: [1], relation: [edge(1, 2)], source: 1, target: 1 }, 0],
    ['shadowed-recursion-variable', { domain: [1], relation: [edge(1, 2), edge(2, 1)], shadow: true }, 0],
    ['empty-domain-missing-relation', { domain: [], relation: undefined }, 1],
    [
      'signed-zero',
      { domain: [-0], relation: [edge(0, Number.MAX_SAFE_INTEGER), edge(Number.MAX_SAFE_INTEGER, -0)] },
      0
    ],
    ['nan-target-fallback', { domain: [1], relation: [edge(1, NaN)] }],
    ['nonnumeric-row-fallback', { domain: [1], relation: [edge(1, [1]), edge(1, 1)] }, null],
    ['array-iterator-does-not-replace-indexed-domain', { domain: [1], iteratedDomain: [2], relation: [edge(1, 1)] }, 0],
    ['invalid-argument-declaration-fallback', { domain: [1], relation: [edge(1, 1)], invalidDeclaration: true }, null]
  ];
  for (const [id, fixture, literal] of ordinary) {
    const expected = graphResult(reference, fixture, true);
    if (literal !== undefined) {
      check(`scc.${id}.oracle`, expected.fast, literal);
    }
    if (fixture.invalidDeclaration) {
      check(`scc.${id}.diagnostic`, expected.detailed.errors, [
        { code: undeclaredLocal, from: 8, to: 14, params: ['x'], stack: [{ alias: 'F11', from: 16, to: 17 }] }
      ]);
    }
    check(`scc.${id}`, () => graphResult(candidate, fixture), expected);
  }

  function reevaluate(runtime) {
    const { calculator, assertion } = graphProgram(runtime);
    const relation = [edge(1, 2), edge(2, 3)];
    calculator.setValue('X4', [1]);
    calculator.setValue('S7', relation);
    const first = calculator.evaluateFast(assertion);
    relation.push(edge(3, 1));
    const second = calculator.evaluateFast(assertion);
    return [first, second];
  }
  check('scc.changed-relation-between-runs', () => reevaluate(candidate), [1, 0]);

  let random = 0xffaf02;
  const sample = size => {
    random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
    return Math.floor((random * size) / 2 ** 32);
  };
  for (let index = 0; index < 48; index++) {
    const vertices = Array.from({ length: 2 + sample(7) }, (_, id) => id - 3);
    const fixture = {
      domain: vertices.filter(() => sample(2) === 0),
      relation: Array.from({ length: sample(vertices.length ** 2) }, () =>
        edge(vertices[sample(vertices.length)], vertices[sample(vertices.length)])
      ),
      source: index % 2 === 0 ? 1 : 2,
      target: index % 2 === 0 ? 2 : 1,
      inline: index % 3 === 0,
      shadow: index % 3 === 1
    };
    check(`scc.seeded-directed.${index}`, () => graphResult(candidate, fixture), graphResult(reference, fixture, true));
  }

  if (extended) {
    check(
      'scc.iteration-budget.last-completed',
      () => graphResult(candidate, { domain: Array(76_923).fill(1), relation: [] }),
      {
        fast: 1,
        detailed: { value: 1, iterations: 999_998, cacheHits: 0, errors: [] }
      }
    );
    check(
      'scc.iteration-budget.first-failure',
      () => graphResult(candidate, { domain: Array(76_924).fill(1), relation: [] }),
      {
        fast: null,
        detailed: {
          value: null,
          iterations: 1_000_002,
          cacheHits: 0,
          errors: [{ code: iterationLimit, from: 8, to: 14, params: ['1000000'] }]
        }
      }
    );
  }
}

function loadRoundEngine(runtime, { schemaDetails, modelDetails }) {
  if (runtime.prepare) {
    return runtime.prepare(schemaDetails, modelDetails).load();
  }

  const items = structuredClone(schemaDetails.items);
  const graph = runtime.buildFormalDependencyGraph(items);
  const analyzer = new runtime.RSLangAnalyzer();
  const cstByID = new Map(items.map(item => [item.id, item]));
  for (const id of graph.topologicalOrder()) {
    const constituent = cstByID.get(id);
    const { parse, effectiveType } = runtime.analyzeConstituentType(constituent, analyzer);
    constituent.analysis = parse;
    constituent.effectiveType = effectiveType;
    constituent.diagnostics = [];
  }
  const schema = {
    ...schemaDetails,
    items,
    graph,
    analyzer,
    cstByID,
    cstByAlias: new Map(items.map(item => [item.alias, item]))
  };
  const rejectWrite = () => {
    throw new Error('Correctness fixture is read-only');
  };
  const engine = new runtime.RSEngine(modelDetails.id, {
    setCstValue: rejectWrite,
    clearValues: rejectWrite
  });
  engine.loadData(schema, modelDetails);
  return engine;
}

function roundResult(runtime, fixture) {
  const engine = loadRoundEngine(runtime, structuredClone(fixture));
  engine.recalculateAll();
  engine.flushPendingChanges?.();
  const value = structuredClone(engine.getCstValue(fixture.constituentId));
  const status = engine.getCstStatus(fixture.constituentId);
  const detailed = engine.calculateCst(fixture.constituentId);
  engine.flushPendingChanges?.();
  return { value, status, detailed };
}

function checkRound({ check, reference, candidate, experiments }, id, fixture, literal) {
  const expected = roundResult(reference, fixture);
  if (literal !== undefined) {
    check(`rounds.${id}.oracle`, expected.value, literal);
  }
  check(`rounds.${id}`, () => roundResult(candidate, fixture), expected);
  if (experiments?.runRounds) {
    check(
      `rounds.${id}.experiment`,
      () => {
        const input = structuredClone(fixture);
        const engine = loadRoundEngine(candidate, input);
        const { schema, calculator } = engine;
        const inputs = new Set(schema.graph.expandAllInputs([fixture.constituentId]));
        // The hook must see the prerequisites, without a precomputed result for the expression under test.
        calculator.resetValue(schema.cstByID.get(fixture.constituentId).alias);
        const computedTypes = new Set([candidate.CstType.TERM, candidate.CstType.AXIOM, candidate.CstType.STATEMENT]);
        for (const id of schema.graph.topologicalOrder()) {
          if (inputs.has(id) && computedTypes.has(schema.cstByID.get(id).cst_type)) engine.calculateCst(id);
        }
        try {
          const value = experiments.runRounds({ engine, ...input });
          return value === undefined ? engine.calculateCst(fixture.constituentId).value : value;
        } finally {
          engine.flushPendingChanges();
        }
      },
      expected.value
    );
  }
  return expected;
}

function history(initial, result) {
  return [
    tupleMarker,
    result,
    1,
    [
      [tupleMarker, initial, 0],
      [tupleMarker, result, 1]
    ]
  ];
}

export async function runGraphCases(options) {
  runCycleCases(options);
  const { check, readSnapshot } = options;
  checkRound(options, 'canonical-history', roundFixture([1, 2]), history([1, 2], [1, 2, 3]));
  checkRound(options, 'legacy-unordered-history', roundFixture([2, 1]), history([2, 1], [2, 1, 3]));
  checkRound(options, 'legacy-duplicate-history', roundFixture([1, 1, 2]), history([1, 1, 2], [1, 1, 2, 3]));
  const invalid = checkRound(
    options,
    'revealed-vertex-without-clue',
    roundFixture([1, 2], { revealBlockedNeighbor: true }),
    null
  );
  check('rounds.revealed-vertex-without-clue.diagnostic', invalid.detailed.errors, [
    {
      code: invalidDebool,
      from: 18,
      to: 24,
      stack: [
        { alias: 'F4', from: 14, to: 31 },
        { alias: 'F9', from: 50, to: 55 },
        { alias: 'F10', from: 18, to: 23 },
        { alias: 'F12', from: 47, to: 53 },
        { alias: 'F13', from: 18, to: 24 }
      ]
    }
  ]);

  if (readSnapshot) {
    const [schemaDetails, modelDetails] = await Promise.all([
      readSnapshot('schema-782.json'),
      readSnapshot('model-786.json')
    ]);
    const constituentId = schemaDetails.items.find(item => item.alias === 'D8').id;
    const fixture = { schemaDetails, modelDetails, constituentId };
    const baseline = checkRound(options, 'portal-786.history', fixture);
    check(
      'rounds.portal-786.history-shape',
      baseline.value?.[3].map(row => [row[1].length, row[2]]),
      [
        [1, 0],
        [64, 1],
        [69, 2],
        [71, 3]
      ]
    );
    const revealedId = schemaDetails.items.find(item => item.alias === 'S3').id;
    const legacyModel = {
      ...modelDetails,
      items: modelDetails.items.map(item => (item.id === revealedId ? { ...item, value: [0, 10] } : item))
    };
    const legacy = checkRound(
      options,
      'portal-786.revealed-vertex-without-clue',
      { ...fixture, modelDetails: legacyModel },
      null
    );
    check('rounds.portal-786.revealed-vertex-without-clue.code', legacy.detailed.errors[0]?.code, invalidDebool);
  }
}
