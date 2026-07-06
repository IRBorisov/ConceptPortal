import { DiagnosticKind, expressionDiagnostic } from './diagnostic-assembly';
import { type RSErrorDescription, type Value } from '@rsconcept/domain/rslang';
import { isBaseSet } from '@rsconcept/domain/library/rsform-api';
import { CstType, type RSForm } from '@rsconcept/domain/library/rsform';
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
  type EvaluationResult,
  type RecalculateModelResult,
  type SessionModelState,
  type SessionState,
  type SetConstituentaValueInput
} from '../models';
import { buildRSFormFromSession } from './rsform-builder';

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
    return toPublicEvaluationResult(
      result.value,
      result.errors,
      result.iterations,
      result.cacheHits,
      status,
      expression
    );
  }

  public evaluateConstituenta(session: SessionState, constituentId: number): EvaluationResult {
    const cst = session.items.find(item => item.id === constituentId);
    if (!cst) {
      throw new Error(`Unknown constituent: ${constituentId}`);
    }
    const engine = this.createEngine(session);
    const result = engine.calculateCst(constituentId);
    const status = engine.getCstStatus(constituentId);
    return toPublicEvaluationResult(
      result.value,
      result.errors,
      result.iterations,
      result.cacheHits,
      status,
      cst.definitionFormal,
      { constituentId: cst.id, alias: cst.alias }
    );
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

function toPublicEvaluationResult(
  value: Value | null,
  errors: RSErrorDescription[],
  iterations: number,
  cacheHits: number,
  status: EvalStatus,
  expression: string,
  target?: { constituentId?: number; alias?: string }
): EvaluationResult {
  const diagnostics = errors.map(error => ({
    ...expressionDiagnostic(error, expression, target),
    kind: DiagnosticKind.MODEL
  }));
  return {
    success: diagnostics.length === 0 && value !== null,
    value: value as EvaluationResult['value'],
    status,
    iterations,
    cacheHits,
    diagnostics
  };
}
