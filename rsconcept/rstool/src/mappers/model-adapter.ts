import { Graph } from '@rsconcept/domain/graph/graph';
import { extractGlobals } from '@rsconcept/domain/rslang/api';
import { type ExpressionType, RSLangAnalyzer, type Value, type ValueClass } from '@rsconcept/domain/rslang';
import { isBaseSet } from '@rsconcept/domain/library/rsform-api';
import { type Constituenta, CstType, type RSForm } from '@rsconcept/domain/library/rsform';
import { RSEngine, type RSEngineServices } from '@rsconcept/domain/library/rsengine';
import { type BasicBinding, EvalStatus, type RSModel } from '@rsconcept/domain/library/rsmodel';
import {
  isInferrable,
  isInterpretable,
  toBasicBinding,
  validateBasicBindingData,
  validateValueData
} from '@rsconcept/domain/library/rsmodel-api';

import {
  type ConstituentaState,
  type EvaluationResult,
  type RecalculateModelResult,
  type SessionModelState,
  type SessionState,
  type SetConstituentaValueInput
} from '../models';
import { toPublicError } from './types';

const SESSION_MODEL_ID = 0;

export class ModelAdapter {
  public async setConstituentaValue(
    session: SessionState,
    input: SetConstituentaValueInput
  ): Promise<SessionModelState> {
    this.validateSetInput(session, input);
    const engine = this.createEngine(session);
    const cst = session.items.find(item => item.id === input.target)!;
    const frontendType = cst.cstType;

    if (isBaseSet(frontendType)) {
      const binding = toBasicBinding(input.value as Record<string | number, string>);
      await engine.setBasicValue(input.target, binding);
    } else {
      await engine.setStructureValue(input.target, input.value as Value);
    }
    session.updatedAt = new Date().toISOString();
    return structuredClone(session.model);
  }

  public async setConstituentaValues(
    session: SessionState,
    input: { items: SetConstituentaValueInput[] }
  ): Promise<SessionModelState> {
    for (const item of input.items) {
      await this.setConstituentaValue(session, item);
    }
    return structuredClone(session.model);
  }

  public async clearConstituentaValues(session: SessionState, ids: number[]): Promise<SessionModelState> {
    const engine = this.createEngine(session);
    for (const id of ids) {
      await engine.resetValue(id);
      session.updatedAt = new Date().toISOString();
    }
    return structuredClone(session.model);
  }

  public evaluateExpression(session: SessionState, expression: string, cstType: CstType): EvaluationResult {
    const engine = this.createEngine(session);
    const result = engine.evaluateExpression(expression, cstType);
    const status =
      result.value === null
        ? result.errors.length > 0
          ? EvalStatus.EVAL_FAIL
          : EvalStatus.EMPTY
        : EvalStatus.HAS_DATA;
    return toPublicEvaluationResult(result.value, result.errors, result.iterations, result.cacheHits, status);
  }

  public evaluateConstituenta(session: SessionState, constituentId: number): EvaluationResult {
    const cst = session.items.find(item => item.id === constituentId);
    if (!cst) {
      throw new Error(`Unknown constituent: ${constituentId}`);
    }
    const engine = this.createEngine(session);
    const result = engine.calculateCst(constituentId);
    const status = engine.getCstStatus(constituentId);
    return toPublicEvaluationResult(result.value, result.errors, result.iterations, result.cacheHits, status);
  }

  public recalculateModel(session: SessionState): RecalculateModelResult {
    const engine = this.createEngine(session);
    engine.recalculateAll();
    const items = session.items.map(item => ({
      id: item.id,
      alias: item.alias,
      value: engine.getCstValue(item.id) as number | number[] | null,
      status: engine.getCstStatus(item.id)
    }));
    return { items };
  }

  public createEngine(session: SessionState): RSEngine {
    const schema = buildRSFormFromSession(session);
    const model = buildRSModelFromSession(session);
    const engine = new RSEngine(SESSION_MODEL_ID, createInMemoryServices(session));
    engine.loadData(schema, model);
    return engine;
  }

  private validateSetInput(session: SessionState, input: SetConstituentaValueInput): void {
    const cst = session.items.find(item => item.id === input.target);
    if (!cst) {
      throw new Error(`Unknown constituent: ${input.target}`);
    }
    const frontendType = cst.cstType;
    if (!isInterpretable(frontendType)) {
      throw new Error(`Constituent ${cst.alias} is not interpretable`);
    }
    if (isInferrable(frontendType)) {
      throw new Error(`Constituent ${cst.alias} is inferrable and cannot be set directly`);
    }
    if (isBaseSet(frontendType)) {
      if (!validateBasicBindingData(input.value)) {
        throw new Error(`Invalid basic binding for ${cst.alias}`);
      }
      return;
    }
    if (!validateValueData(input.value)) {
      throw new Error(`Invalid structured value for ${cst.alias}`);
    }
  }
}

function createInMemoryServices(session: SessionState): RSEngineServices {
  return {
    setCstValue: async ({ data }) => {
      for (const item of data) {
        const entry = {
          id: item.target,
          type: item.type,
          value: item.data as Value | BasicBinding
        };
        const index = session.model.items.findIndex(existing => existing.id === item.target);
        if (index === -1) {
          session.model.items.push(entry);
        } else {
          session.model.items[index] = entry;
        }
      }
    },
    clearValues: async ({ data }) => {
      const ids = new Set(data.items);
      session.model.items = session.model.items.filter(item => !ids.has(item.id));
    }
  };
}

function buildRSFormFromSession(session: SessionState): RSForm {
  const graph = new Graph<number>();
  const cstByAlias = new Map<string, Constituenta>();
  const cstByID = new Map<number, Constituenta>();
  const analyzer = new RSLangAnalyzer();

  const items = session.items.map(item => {
    const cst = toFrontendConstituenta(item);
    cstByAlias.set(cst.alias, cst);
    cstByID.set(cst.id, cst);
    graph.addNode(cst.id);
    if (item.cstType === CstType.BASE) {
      analyzer.addBase(cst.alias);
    }
    if (cst.effectiveType) {
      analyzer.setGlobal(cst.alias, cst.effectiveType, cst.analysis.valueClass as ValueClass | null);
    }
    return cst;
  });

  for (const cst of items) {
    for (const alias of extractGlobals(cst.definition_formal)) {
      const source = cstByAlias.get(alias);
      if (source) {
        graph.addEdge(source.id, cst.id);
      }
    }
  }

  return {
    id: 0,
    items,
    cstByAlias,
    cstByID,
    graph,
    analyzer,
    inheritance: [],
    attribution: [],
    attribution_graph: graph.clone(),
    oss: [],
    models: [],
    editors: [],
    versions: [],
    is_produced: false,
    is_attributive: false,
    version: 'latest'
  } as unknown as RSForm;
}

function buildRSModelFromSession(session: SessionState): RSModel {
  return {
    id: SESSION_MODEL_ID,
    schema: 0,
    editors: [],
    items: session.model.items.map(item => ({
      id: item.id,
      type: item.type,
      value: item.value as Value | BasicBinding
    }))
  } as unknown as RSModel;
}

function toFrontendConstituenta(item: ConstituentaState): Constituenta {
  const effectiveType = (item.analysis.type ?? null) as ExpressionType | null;
  return {
    id: item.id,
    alias: item.alias,
    cst_type: item.cstType,
    definition_formal: item.definitionFormal,
    definition_raw: item.definitionFormal,
    definition_resolved: item.definitionFormal,
    term_raw: item.term,
    term_resolved: item.term,
    term_forms: [],
    convention: item.convention,
    typification_manual: '',
    value_is_property: false,
    crucial: false,
    attributes: [],
    homonyms: [],
    formalDuplicates: [],
    analysis: {
      success: item.analysis.success,
      type: effectiveType,
      valueClass: item.analysis.valueClass
    },
    effectiveType,
    is_type_mismatch: false,
    schema: 0,
    cst_class: 'derived',
    status: item.analysis.success ? 'verified' : 'incorrect',
    is_template: false,
    is_simple_expression: true,
    parent_schema_index: 0,
    parent_schema: null,
    is_inherited: false,
    has_inherited_children: false,
    spawn: [],
    spawn_alias: []
  } as unknown as Constituenta;
}

function toPublicEvaluationResult(
  value: Value | null,
  errors: { code: number; from: number; to: number; params?: readonly string[] }[],
  iterations: number,
  cacheHits: number,
  status: EvalStatus
): EvaluationResult {
  const diagnostics = errors.map(toPublicError);
  return {
    success: diagnostics.length === 0 && value !== null,
    value: value as EvaluationResult['value'],
    status,
    iterations,
    cacheHits,
    diagnostics
  };
}
