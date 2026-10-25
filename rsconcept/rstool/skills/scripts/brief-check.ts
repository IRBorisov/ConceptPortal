/**
 * Brief check: runs brief scenarios on a session copy and computes readiness.
 *
 * Prototype of the planned `runScenarios` / `getReadiness` contract (rstool 4.0).
 * Brief format — `docs/BRIEF.md`, JSON schema — `docs/brief.schema.json`.
 */
import { labelType } from '@rsconcept/domain/rslang/labels';
import { normalizeValue } from '@rsconcept/domain/rslang/eval/value-api';
import { TUPLE_ID, type Value } from '@rsconcept/domain/rslang/eval/value';
import {
  type EchelonFunctional,
  type EchelonPredicate,
  type ExpressionType,
  TypeID,
  type Typification
} from '@rsconcept/domain/rslang/semantic/typification';

import { type ConstituentaState, CstType, EvalStatus, RSToolAgent, type SessionState } from '../../src';

// ===== Brief format =====

export type BriefStatus = 'draft' | 'assumed' | 'confirmed';
export type BriefApproach = 'research' | 'education' | 'project';

export interface BriefRestriction {
  id: string;
  excludes: string;
  inexpressible?: string[];
}

export interface BriefRequirement {
  id: string;
  concept: string;
  ref?: string;
  via?: string;
  constituent: string | null;
}

export interface BriefDistinction {
  id: string;
  between: [string, string];
  text?: string;
  witness?: string | null;
}

export interface BriefInvariant {
  id: string;
  text: string;
  ref?: string;
  constituent: string | null;
  positive?: string | null;
  negative?: string | null;
}

export interface BriefDecision {
  id: string;
  topic: string;
  alternatives?: string[];
  choice: string;
  rationale: string;
  supersedes?: string;
}

/** Labelled value: labels for elements of `X#` / `C#`, numbers for `Z`, arrays for tuples and sets. */
export type LabelValue = string | number | LabelValue[];

export interface BriefExpectation {
  of?: string;
  expr?: string;
  /** Arguments of `F#` / `P#` in labels. */
  args?: LabelValue[];
  value?: LabelValue;
  holds?: boolean;
  contains?: LabelValue[];
  excludes?: LabelValue[];
  note?: string;
}

export interface BriefScenario {
  id: string;
  title: string;
  base?: string;
  values: Record<string, LabelValue>;
  expect: BriefExpectation[];
}

export interface Brief {
  version: 1;
  status: BriefStatus;
  approach: BriefApproach;
  object: string;
  task: string;
  source?: string;
  restrictions?: BriefRestriction[];
  expressiveness: BriefRequirement[];
  distinctions?: BriefDistinction[];
  invariants?: BriefInvariant[];
  decisions?: BriefDecision[];
  scenarios?: BriefScenario[];
  questions?: unknown[];
  assumptions?: string[];
  openQuestions?: string[];
}

// ===== Results =====

export type Stage = 'scope' | 'core' | 'explicate' | 'interpret' | 'review';

export interface ExpectationResult {
  target: string;
  passed: boolean;
  expected: string;
  actual: string;
}

export interface ScenarioResult {
  id: string;
  title: string;
  passed: boolean;
  checks: ExpectationResult[];
  error?: string;
}

export interface Readiness {
  stage: Stage;
  ready: boolean;
  diagnostics: { errors: number; warnings: number };
  coverage: { expressiveness: string; invariants: string; distinctions: string };
  scenarios: { passed: number; failed: number; missing: number };
  blockers: string[];
  warnings: string[];
  next: string;
}

export interface BriefCheckInput {
  /** Session JSON (`exportSession`). */
  session: string;
  brief: Brief;
  /** Session JSON of the previous version: enables weakening checks. */
  base?: string;
  /** `review` — someone else's schema: blockers are report findings, not a plan of edits. */
  mode?: 'build' | 'review';
}

export interface BriefCheckResult {
  readiness: Readiness;
  scenarios: ScenarioResult[];
}

// ===== Implementation =====

const UNDEFINED_TYPES: readonly string[] = [CstType.BASE, CstType.CONSTANT, CstType.STRUCTURED];
const BASIC_TYPES: readonly string[] = [CstType.BASE, CstType.CONSTANT];
const LOGIC_TYPES: readonly string[] = [CstType.AXIOM, CstType.STATEMENT];
const ALIAS_PATTERN = /\b([XCSDFPAT])(\d+)\b/g;

interface SchemaIndex {
  byAlias: Map<string, ConstituentaState>;
  items: ConstituentaState[];
}

function indexSchema(state: SessionState): SchemaIndex {
  return { byAlias: new Map(state.items.map(item => [item.alias, item])), items: state.items };
}

function typeOf(item: ConstituentaState): ExpressionType | null {
  return item.analysis.type as unknown as ExpressionType | null;
}

function isUndefinedConcept(item: ConstituentaState): boolean {
  return UNDEFINED_TYPES.includes(item.cstType);
}

function suppliersOf(item: ConstituentaState): string[] {
  return [...item.definitionFormal.matchAll(ALIAS_PATTERN)]
    .map(match => match[0])
    .filter(alias => alias !== item.alias);
}

function isTrivialFormula(item: ConstituentaState): boolean {
  const formula = item.definitionFormal.replace(/\s+/g, '');
  if (formula === '' || formula === '∅' || /^[XCSDFPAT]\d+$/.test(formula)) {
    return true;
  }
  const equality = /^([XCSDFPAT]\d+)=([XCSDFPAT]\d+)$/.exec(formula);
  return equality !== null && equality[1] === equality[2];
}

/** Maps element labels of basic sets to indices, per scenario. */
class LabelSpace {
  private readonly labels = new Map<string, string[]>();

  setBasic(alias: string, labels: string[]): Record<number, string> {
    this.labels.set(alias, labels);
    return Object.fromEntries(labels.map((label, index) => [index, label]));
  }

  encode(value: LabelValue, type: Typification): Value {
    switch (type.typeID) {
      case TypeID.integer:
        if (typeof value !== 'number') {
          throw new Error(`ожидалось целое, получено ${JSON.stringify(value)}`);
        }
        return value;
      case TypeID.basic: {
        const index = this.labels.get(type.baseID)?.indexOf(String(value)) ?? -1;
        if (index < 0) {
          throw new Error(`нет элемента «${String(value)}» в ${type.baseID}`);
        }
        return index;
      }
      case TypeID.tuple:
        if (!Array.isArray(value) || value.length !== type.factors.length) {
          throw new Error(`ожидался кортеж ${labelType(type)}, получено ${JSON.stringify(value)}`);
        }
        return [TUPLE_ID, ...value.map((component, index) => this.encode(component, type.factors[index]))];
      case TypeID.collection: {
        if (!Array.isArray(value)) {
          throw new Error(`ожидалось множество ${labelType(type)}, получено ${JSON.stringify(value)}`);
        }
        const result = value.map(element => this.encode(element, type.base));
        normalizeValue(result);
        return result;
      }
      default:
        throw new Error(`нельзя задать значение ступени ${labelType(type)}`);
    }
  }

  decode(value: Value, type: Typification): LabelValue {
    switch (type.typeID) {
      case TypeID.basic:
        return this.labels.get(type.baseID)?.[value as number] ?? `#${String(value)}`;
      case TypeID.tuple:
        return (value as Value[]).slice(1).map((component, index) => this.decode(component, type.factors[index]));
      case TypeID.collection:
        return (value as Value[]).map(element => this.decode(element, type.base));
      default:
        return value as number;
    }
  }
}

function print(value: LabelValue | undefined): string {
  return JSON.stringify(value ?? null);
}

function sameValue(a: Value, b: Value): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function resolveValues(brief: Brief, scenario: BriefScenario, depth = 0): Record<string, LabelValue> {
  if (!scenario.base) {
    return scenario.values;
  }
  const base = brief.scenarios?.find(item => item.id === scenario.base);
  if (!base || depth > 16) {
    throw new Error(`базовый сценарий ${scenario.base} не найден`);
  }
  return { ...resolveValues(brief, base, depth + 1), ...scenario.values };
}

/** Isolated session with scenario values loaded. */
class ScenarioRun {
  private readonly tool = new RSToolAgent();
  readonly space = new LabelSpace();

  private readonly schema: SchemaIndex;

  private constructor(schema: SchemaIndex) {
    this.schema = schema;
  }

  static async create(session: string, schema: SchemaIndex, values: Record<string, LabelValue>): Promise<ScenarioRun> {
    const run = new ScenarioRun(schema);
    run.tool.importData(session, 'session');
    for (const alias of Object.keys(values)) {
      const item = schema.byAlias.get(alias);
      if (!item) {
        throw new Error(`${alias}: конституента не найдена в схеме`);
      }
      if (!isUndefinedConcept(item)) {
        throw new Error(`${alias}: значения задаются только неопределяемым понятиям (X#, C#, S#)`);
      }
    }
    const set: Array<{ target: number; value: unknown }> = [];
    for (const item of schema.items.filter(cst => BASIC_TYPES.includes(cst.cstType))) {
      const labels = (values[item.alias] ?? []) as LabelValue[];
      set.push({ target: item.id, value: run.space.setBasic(item.alias, labels.map(String)) });
    }
    for (const item of schema.items.filter(cst => cst.cstType === CstType.STRUCTURED)) {
      const type = typeOf(item) as Typification | null;
      if (!type) {
        throw new Error(`${item.alias}: нет типизации`);
      }
      const given = values[item.alias] ?? (type.typeID === TypeID.collection ? [] : undefined);
      if (given !== undefined) {
        set.push({ target: item.id, value: run.space.encode(given, type) });
      }
    }
    await run.tool.setModelValues({ set } as Parameters<RSToolAgent['setModelValues']>[0]);
    return run;
  }

  /** Evaluates a constituent, scratch expression or parametrized call. Returns value and its typification. */
  evaluate(expectation: BriefExpectation): { value: Value; type: ExpressionType | null; status: number } {
    if (expectation.expr) {
      const cstType = expectation.holds !== undefined ? CstType.AXIOM : CstType.TERM;
      const analysis = this.tool.analyzeExpression({ expression: expectation.expr, cstType });
      const result = this.tool.evaluate({ expression: expectation.expr, cstType });
      this.assertEvaluated(expectation.expr, result.status, result.success);
      return {
        value: result.value as Value,
        type: analysis.type as unknown as ExpressionType | null,
        status: result.status
      };
    }
    const item = this.schema.byAlias.get(expectation.of ?? '');
    if (!item) {
      throw new Error(`конституента ${expectation.of ?? '?'} не найдена`);
    }
    if (item.cstType === CstType.FUNCTION || item.cstType === CstType.PREDICATE) {
      return this.evaluateCall(item, expectation.args ?? []);
    }
    const result = this.tool.evaluate({ constituentId: item.id });
    this.assertEvaluated(item.alias, result.status, result.success);
    return { value: result.value as Value, type: typeOf(item), status: result.status };
  }

  /** Graph of `F#` / `P#` over finite argument domains: rows `(args…, result)` or accepted args. */
  graph(item: ConstituentaState): { rows: Value[]; type: EchelonFunctional | EchelonPredicate } {
    const type = typeOf(item) as EchelonFunctional | EchelonPredicate | null;
    if (!type) {
      throw new Error(`${item.alias}: нет типизации`);
    }
    const domains = type.args.map(arg => labelType(arg.type));
    if (domains.some(domain => /R\d|Z/.test(domain))) {
      throw new Error(`${item.alias}: перебор аргументов с радикалами или Z не поддерживается — используй expr`);
    }
    const vars = type.args.map((_, index) => `α${index + 1}`);
    const loops = vars.map((variable, index) => `${variable}:∈${domains[index]}`).join('; ');
    const call = `${item.alias}[${vars.join(', ')}]`;
    const isPredicate = item.cstType === CstType.PREDICATE;
    const head = isPredicate ? (vars.length === 1 ? vars[0] : `(${vars.join(', ')})`) : `(${vars.join(', ')}, ${call})`;
    const expression = isPredicate ? `I{${head} | ${loops}; ${call}}` : `I{${head} | ${loops}}`;
    const result = this.tool.evaluate({ expression, cstType: CstType.TERM });
    this.assertEvaluated(`${item.alias}[…]`, result.status, result.success);
    return { rows: result.value as Value[], type };
  }

  /** Comparable value of a constituent: its value, or its graph for `F#` / `P#`. */
  valueOf(item: ConstituentaState): Value {
    if (item.cstType === CstType.FUNCTION || item.cstType === CstType.PREDICATE) {
      return this.graph(item).rows;
    }
    return this.evaluate({ of: item.alias }).value;
  }

  private evaluateCall(item: ConstituentaState, args: LabelValue[]) {
    const { rows, type } = this.graph(item);
    if (type.args.length !== args.length) {
      throw new Error(`${item.alias}: нужно ${type.args.length} аргумент(а) в args`);
    }
    const encodedArgs = args.map((arg, index) => this.space.encode(arg, type.args[index].type));
    if (item.cstType === CstType.PREDICATE) {
      const key = encodedArgs.length === 1 ? encodedArgs[0] : [TUPLE_ID, ...encodedArgs];
      const holds = rows.some(row => sameValue(row, key));
      return { value: holds ? 1 : 0, type: { typeID: TypeID.logic } as ExpressionType, status: EvalStatus.HAS_DATA };
    }
    const row = rows.find(candidate =>
      encodedArgs.every((arg, index) => sameValue((candidate as Value[])[index + 1], arg))
    ) as Value[] | undefined;
    if (!row) {
      throw new Error(`${item.alias}: аргументы ${print(args)} вне области определения`);
    }
    return { value: row[row.length - 1], type: type.result as ExpressionType, status: EvalStatus.HAS_DATA };
  }

  private assertEvaluated(target: string, status: number, success: boolean) {
    if (!success || status === EvalStatus.EVAL_FAIL || status === EvalStatus.INVALID_DATA) {
      throw new Error(`${target}: вычисление не удалось (статус ${status})`);
    }
  }
}

function describeExpectation(expectation: BriefExpectation): string {
  if (expectation.holds !== undefined) {
    return expectation.holds ? 'истина' : 'ложь';
  }
  if (expectation.value !== undefined) {
    return print(expectation.value);
  }
  return (
    [
      expectation.contains ? `содержит ${print(expectation.contains)}` : '',
      expectation.excludes ? `не содержит ${print(expectation.excludes)}` : ''
    ]
      .filter(Boolean)
      .join(', ') || '—'
  );
}

function checkExpectation(run: ScenarioRun, expectation: BriefExpectation): ExpectationResult {
  const target = expectation.expr ?? `${expectation.of ?? '?'}${expectation.args ? print(expectation.args) : ''}`;
  const expected = describeExpectation(expectation);
  try {
    const { value, type } = run.evaluate(expectation);
    if (expectation.holds !== undefined) {
      const holds = value === 1;
      return {
        target,
        passed: holds === expectation.holds,
        expected,
        actual: holds ? 'истина' : 'ложь'
      };
    }
    if (!type || type.typeID === TypeID.logic || type.typeID === TypeID.function || type.typeID === TypeID.predicate) {
      throw new Error('для логического выражения используй holds');
    }
    const actual = run.space.decode(value, type as Typification);
    if (expectation.value !== undefined) {
      return {
        target,
        passed: sameValue(run.space.encode(expectation.value, type as Typification), value),
        expected,
        actual: print(actual)
      };
    }
    if (type.typeID !== TypeID.collection) {
      throw new Error('contains / excludes применимы только к множествам');
    }
    const elements = value as Value[];
    const missing = (expectation.contains ?? []).filter(
      element => !elements.some(item => sameValue(item, run.space.encode(element, type.base)))
    );
    const extra = (expectation.excludes ?? []).filter(element =>
      elements.some(item => sameValue(item, run.space.encode(element, type.base)))
    );
    return {
      target,
      passed: missing.length === 0 && extra.length === 0,
      expected,
      actual: print(actual)
    };
  } catch (error) {
    return { target, passed: false, expected, actual: `ошибка: ${(error as Error).message}` };
  }
}

/** In a scenario that is nobody's counterexample every axiom of the schema must hold. */
function admissibleChecks(run: ScenarioRun, schema: SchemaIndex, scenario: BriefScenario): ExpectationResult[] {
  const listed = new Set(scenario.expect.map(expectation => expectation.of));
  return schema.items
    .filter(item => item.cstType === CstType.AXIOM && !listed.has(item.alias))
    .map(item => ({
      ...checkExpectation(run, { of: item.alias, holds: true }),
      target: `${item.alias} (допустимый сценарий)`
    }))
    .filter(check => !check.passed);
}

async function runScenarios(session: string, schema: SchemaIndex, brief: Brief): Promise<ScenarioResult[]> {
  const results: ScenarioResult[] = [];
  const negatives = new Set((brief.invariants ?? []).map(inv => inv.negative).filter(Boolean));
  for (const scenario of brief.scenarios ?? []) {
    try {
      const run = await ScenarioRun.create(session, schema, resolveValues(brief, scenario));
      const checks = scenario.expect.map(expectation => checkExpectation(run, expectation));
      if (!negatives.has(scenario.id)) {
        checks.push(...admissibleChecks(run, schema, scenario));
      }
      results.push({ id: scenario.id, title: scenario.title, passed: checks.every(check => check.passed), checks });
    } catch (error) {
      results.push({
        id: scenario.id,
        title: scenario.title,
        passed: false,
        checks: [],
        error: (error as Error).message
      });
    }
  }
  return results;
}

/** Distinction members resolved to constituent aliases. */
function resolveMember(brief: Brief, ref: string): string | null {
  if (/^E\d+$/.test(ref)) {
    return brief.expressiveness.find(item => item.id === ref)?.constituent ?? null;
  }
  return ref;
}

async function distinctionCollapsed(
  session: string,
  schema: SchemaIndex,
  brief: Brief,
  members: [string, string],
  witness: string | null | undefined
): Promise<'kept' | 'collapsed' | 'unchecked'> {
  const [first, second] = members.map(alias => schema.byAlias.get(alias));
  if (!first || !second || isUndefinedConcept(first) || isUndefinedConcept(second)) {
    return 'kept';
  }
  if (labelType(typeOf(first)) !== labelType(typeOf(second))) {
    return 'kept';
  }
  const candidates = (brief.scenarios ?? []).filter(scenario => !witness || scenario.id === witness);
  let evaluated = 0;
  for (const scenario of candidates) {
    try {
      const run = await ScenarioRun.create(session, schema, resolveValues(brief, scenario));
      const a = run.valueOf(first);
      const b = run.valueOf(second);
      evaluated++;
      if (!sameValue(a, b)) {
        return 'kept';
      }
    } catch {
      continue;
    }
  }
  return evaluated > 0 ? 'collapsed' : 'unchecked';
}

function briefAliases(brief: Brief): Set<string> {
  const aliases = new Set<string>();
  for (const item of [...brief.expressiveness, ...(brief.invariants ?? [])]) {
    if (item.constituent) {
      aliases.add(item.constituent);
    }
  }
  for (const scenario of brief.scenarios ?? []) {
    for (const expectation of scenario.expect) {
      if (expectation.of) {
        aliases.add(expectation.of);
      }
    }
  }
  return aliases;
}

function findOrphans(schema: SchemaIndex, brief: Brief): string[] {
  const needed = new Set<string>(briefAliases(brief));
  for (const item of schema.items) {
    if (item.cstType === CstType.AXIOM) {
      needed.add(item.alias);
    }
  }
  const queue = [...needed];
  while (queue.length > 0) {
    const item = schema.byAlias.get(queue.pop()!);
    for (const supplier of item ? suppliersOf(item) : []) {
      if (!needed.has(supplier)) {
        needed.add(supplier);
        queue.push(supplier);
      }
    }
  }
  return schema.items
    .filter(item => item.cstType !== CstType.NOMINAL && !needed.has(item.alias))
    .map(item => item.alias);
}

function weakeningIssues(
  schema: SchemaIndex,
  base: SchemaIndex,
  brief: Brief
): { blockers: string[]; warnings: string[] } {
  const blockers: string[] = [];
  const warnings: string[] = [];
  // only a new decision that supersedes an earlier one may justify removing or weakening a concept
  const decisionsText = JSON.stringify((brief.decisions ?? []).filter(decision => decision.supersedes));
  const linked = new Set([
    ...briefAliases(brief),
    ...base.items.filter(item => item.cstType === CstType.AXIOM).map(item => item.alias)
  ]);
  for (const alias of linked) {
    const before = base.byAlias.get(alias);
    if (!before) {
      continue;
    }
    const justified = new RegExp(`\\b${alias}\\b`).test(decisionsText);
    const report = (message: string) =>
      (justified ? warnings : blockers).push(
        justified
          ? `${message} (обосновано новым решением в журнале)`
          : `${message} — без нового решения (supersedes) в журнале`
      );
    const after = schema.byAlias.get(alias);
    if (!after) {
      report(`${alias} «${before.term}» удалена`);
      continue;
    }
    if (!isUndefinedConcept(before) && isUndefinedConcept(after)) {
      report(`${alias}: производное понятие стало неопределяемым (${after.cstType})`);
    } else if (!isTrivialFormula(before) && isTrivialFormula(after)) {
      report(`${alias}: формула стала тривиальной («${after.definitionFormal}»)`);
    } else if (before.cstType === CstType.AXIOM && before.definitionFormal !== after.definitionFormal) {
      warnings.push(
        `${alias}: формула аксиомы изменена — убедись, что сценарии инварианта проходят и смысл не ослаблен`
      );
    }
  }
  return { blockers, warnings };
}

const NEXT_STEP: Record<Stage, string> = {
  scope: 'Этап 1 (rs-scope): заверши бриф и подтверди его у пользователя (или запиши допущения и статус assumed)',
  core: 'Этап 2 (rs-core): выбери ядро и запиши для каждого требования, как оно выразится через ядро (поле via), и решения в журнал',
  explicate: 'Этап 3 (rs-explicate): выведи недостающие понятия и аксиомы, исправь диагностики без потери смысла',
  interpret: 'Этап 4 (rs-interpret): допиши недостающие сценарии и разбери провалы; при провале смысла вернись к ядру',
  review: 'Этап 5 (rs-review): ревью по брифу и отчёт пользователю'
};

const REVIEW_NEXT =
  'Ревью (rs-review): блокеры и предупреждения — находки отчёта; схему без запроса не правь и новую сессию не собирай';

/** Session description must carry the brief: Portal does not store the brief yet. */
function descriptionIssues(state: SessionState, brief: Brief): string[] {
  const issues: string[] = [];
  const comment = state.comment.trim();
  if (comment === '') {
    issues.push('Описание схемы пусто: запиши назначение, ограничения с невыразимым и краткий журнал решений');
  }
  const referenced = new Set(
    state.items.flatMap(item => [...`${item.convention} ${item.definitionText}`.matchAll(/\bDC\d+\b/g)].map(m => m[0]))
  );
  const missing = [...referenced].filter(id => !new RegExp(`\\b${id}\\b`).test(comment));
  if (missing.length > 0 && (brief.decisions ?? []).length > 0) {
    issues.push(`Конвенции ссылаются на решения ${missing.join(', ')}, которых нет в описании схемы`);
  }
  return issues;
}

/** Checks session against brief: diagnostics, coverage, scenarios, distinctions, weakening. */
export async function checkBrief(input: BriefCheckInput): Promise<BriefCheckResult> {
  const { brief } = input;
  const tool = new RSToolAgent();
  tool.importData(input.session, 'session');
  const state = tool.getSessionState('full') as SessionState;
  const schema = indexSchema(state);
  const isProject = brief.approach === 'project';

  const blockers: string[] = [];
  const warnings: string[] = [];
  const stages = new Set<Stage>();
  const block = (stage: Stage, message: string) => {
    stages.add(stage);
    blockers.push(message);
  };

  if (brief.status === 'draft') {
    block('scope', 'Бриф в статусе draft: подтверди у пользователя или переведи в assumed с допущениями');
  }

  const diagnostics = tool.listDiagnostics();
  const errors = diagnostics.filter(item => item.severity === 'error');
  if (errors.length > 0) {
    block(
      'explicate',
      `Диагностики: ${errors.length} ошибок (${[...new Set(errors.map(item => `${item.alias ?? '?'} ${item.name}`))].slice(0, 5).join('; ')})`
    );
  }

  for (const item of schema.items.filter(cst => isUndefinedConcept(cst) && cst.convention.trim() === '')) {
    block('explicate', `${item.alias}: пустая конвенция у неопределяемого понятия`);
  }

  const covered = brief.expressiveness.filter(req => req.constituent && schema.byAlias.has(req.constituent));
  for (const req of brief.expressiveness) {
    if (!req.via) {
      block('core', `${req.id} «${req.concept}»: не записано, как требование выражается через ядро (via)`);
    }
    if (!req.constituent) {
      block(
        'explicate',
        `${req.id} «${req.concept}»: нет конституенты — не хватает исходного понятия, понятие не выведено или нужен синтез`
      );
    } else if (!schema.byAlias.has(req.constituent)) {
      block('explicate', `${req.id}: конституента ${req.constituent} не найдена в схеме`);
    }
  }

  const invariants = brief.invariants ?? [];
  let missing = 0;
  const invariantsCovered = invariants.filter(inv => {
    const item = inv.constituent ? schema.byAlias.get(inv.constituent) : undefined;
    return item !== undefined && LOGIC_TYPES.includes(item.cstType);
  });
  for (const inv of invariants) {
    const item = inv.constituent ? schema.byAlias.get(inv.constituent) : undefined;
    if (!item || !LOGIC_TYPES.includes(item.cstType)) {
      block('explicate', `${inv.id} «${inv.text}»: нет аксиомы или высказывания`);
    }
    for (const side of ['positive', 'negative'] as const) {
      if (!inv[side]) {
        missing++;
        const message = `${inv.id}: нет ${side === 'positive' ? 'позитивного' : 'негативного'} сценария`;
        if (isProject) {
          block('interpret', message);
        } else {
          warnings.push(message);
        }
      }
    }
  }

  if (brief.approach === 'education') {
    const tested = briefAliases({ ...brief, expressiveness: [], invariants: [] });
    for (const req of brief.expressiveness.filter(item => item.constituent && !tested.has(item.constituent))) {
      missing++;
      block('interpret', `${req.id}: нет сценария, проверяющего ${req.constituent}`);
    }
  }

  const scenarios = await runScenarios(input.session, schema, brief);
  const scenarioIds = new Set(scenarios.map(item => item.id));
  for (const inv of invariants) {
    for (const side of ['positive', 'negative'] as const) {
      const id = inv[side];
      if (id && !scenarioIds.has(id)) {
        block('interpret', `${inv.id}: сценарий ${id} не найден`);
      }
    }
  }
  for (const result of scenarios.filter(item => !item.passed)) {
    const detail =
      result.error ??
      result.checks
        .filter(check => !check.passed)
        .map(check => `${check.target}: ожидалось ${check.expected}, получено ${check.actual}`)
        .join('; ');
    block('interpret', `${result.id} «${result.title}»: ${detail}`);
  }

  const distinctions = brief.distinctions ?? [];
  let distinctionsKept = 0;
  for (const distinction of distinctions) {
    const members = distinction.between.map(ref => resolveMember(brief, ref));
    if (members.some(member => !member || !schema.byAlias.has(member))) {
      block('explicate', `${distinction.id}: понятия различения не выражены в схеме`);
      continue;
    }
    const verdict = await distinctionCollapsed(
      input.session,
      schema,
      brief,
      members as [string, string],
      distinction.witness
    );
    if (verdict !== 'kept') {
      const message =
        verdict === 'collapsed'
          ? `${distinction.id}: ${members.join(' и ')} совпадают на всех сценариях${distinction.witness ? ` (свидетель ${distinction.witness})` : ''} — различение не подтверждено`
          : `${distinction.id}: не удалось вычислить ${members.join(' и ')} ни в одном сценарии — различение не проверено`;
      if (brief.approach === 'research') {
        block('interpret', message);
      } else {
        warnings.push(message);
      }
      continue;
    }
    distinctionsKept++;
  }

  const orphans = findOrphans(schema, brief);
  if (orphans.length > 0) {
    const message = `Конституенты вне путей к требованиям и аксиомам: ${orphans.join(', ')}`;
    if (isProject) {
      block('explicate', message);
    } else {
      warnings.push(message);
    }
  }

  if (input.base) {
    const baseTool = new RSToolAgent();
    baseTool.importData(input.base, 'session');
    const issues = weakeningIssues(schema, indexSchema(baseTool.getSessionState('full') as SessionState), brief);
    issues.blockers.forEach(message => block('explicate', message));
    warnings.push(...issues.warnings);
  }

  for (const req of brief.expressiveness) {
    const item = req.constituent ? schema.byAlias.get(req.constituent) : undefined;
    if (
      item?.cstType === CstType.STRUCTURED &&
      !(brief.decisions ?? []).some(dc => JSON.stringify(dc).includes(item.alias))
    ) {
      warnings.push(
        `${req.id}: выражено родовой структурой ${item.alias} — запиши решение, почему понятие не выводится`
      );
    }
  }

  warnings.push(...descriptionIssues(state, brief));

  const order: Stage[] = ['scope', 'core', 'explicate', 'interpret', 'review'];
  const stage = order.find(item => stages.has(item)) ?? 'review';
  const passed = scenarios.filter(item => item.passed).length;
  return {
    scenarios,
    readiness: {
      stage,
      ready: blockers.length === 0,
      diagnostics: { errors: errors.length, warnings: diagnostics.length - errors.length },
      coverage: {
        expressiveness: `${covered.length}/${brief.expressiveness.length}`,
        invariants: `${invariantsCovered.length}/${invariants.length}`,
        distinctions: `${distinctionsKept}/${distinctions.length}`
      },
      scenarios: { passed, failed: scenarios.length - passed, missing },
      blockers,
      warnings,
      next: input.mode === 'review' ? REVIEW_NEXT : NEXT_STEP[stage]
    }
  };
}
