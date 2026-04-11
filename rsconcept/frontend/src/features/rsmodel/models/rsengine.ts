import { toast } from 'react-toastify';

import { type RSForm } from '@/features/rsform';
import { CstType } from '@/features/rsform';
import { getAnalysisFor, isBaseSet, isBasicConcept, isFunctional } from '@/features/rsform/models/rsform-api';
import {
  type CalculatorEvaluateOptions, type CalculatorResult,
  RSCalculator, TypeID, type Value
} from '@/features/rslang';
import { compare } from '@/features/rslang/eval/value';
import { normalizeType } from '@/features/rslang/labels';

import { errorMsg, infoMsg } from '@/utils/labels';
import { type RO } from '@/utils/meta';
import { type AstNode } from '@/utils/parsing';

import { type RSModelDTO } from '../backend/types';

import { type BasicBinding, type BasicsContext, type EvalStatus, TYPE_BASIC } from './rsmodel';
import { inferStatus, isInferrable, tryFixValue } from './rsmodel-api';

const INVALID_TYPE_MARKER = 'INVALID';

export interface RSEngineServices {
  setCstValue: (args: {
    itemID: number;
    data: { target: number; type: string; data: Value | BasicBinding; }[];
  }) => Promise<unknown>;
  clearValues: (args: {
    itemID: number;
    data: { items: number[]; };
  }) => Promise<unknown>;
}

/** Calculation engine for {@link RSModel}. */
export class RSEngine {
  public modelID: number;
  public schema: RSForm | null = null;
  public data: RO<RSModelDTO> | null = null;
  public calculator = new RSCalculator();
  public basics: BasicsContext = new Map<number, BasicBinding>();

  private services: RSEngineServices;
  private invalidData = new Set<number>();
  private calculatedSet = new Set<number>();
  private valueSubscribers = new Map<number, Set<() => void>>();
  private statusSubscribers = new Map<number, Set<() => void>>();

  constructor(modelID: number, services: RSEngineServices) {
    this.services = services;
    this.modelID = modelID;
  }

  /** Updates data for {@link RSEngine}. */
  public loadData(schema: RSForm, dto: RO<RSModelDTO>): void {
    const newSchema = this.schema !== schema;
    this.schema = schema;
    if (newSchema) {
      this.prepareAst();
      this.setupEmptySets();
    }
    if (this.data !== dto) {
      this.data = dto;
      this.prepareValues();
    }
    this.notifyAll();
  }

  /** Updates services for {@link RSEngine}. */
  public updateServices(services: RSEngineServices): void {
    this.services = services;
  }

  /** Gets value of {@link Constituenta}. */
  public getCstValue(cstID: number): Value | null {
    const cst = this.schema?.cstByID.get(cstID);
    if (!cst) {
      return null;
    }
    return this.calculator.getValue(cst.alias);
  }

  /** Gets status of {@link Constituenta}. */
  public getCstStatus(cstID: number): EvalStatus {
    const cst = this.schema?.cstByID.get(cstID);
    if (!cst) {
      return inferStatus(null, CstType.NOMINAL, false);
    }
    const value = this.calculator.getValue(cst.alias);
    return inferStatus(value, cst.cst_type, this.calculatedSet.has(cstID), this.invalidData.has(cstID));
  }

  /** Subscribe to value change of {@link Constituenta}. */
  public subscribeValue(cstID: number, callbackFn: () => void): () => void {
    let subs = this.valueSubscribers.get(cstID);
    if (!subs) {
      subs = new Set();
      this.valueSubscribers.set(cstID, subs);
    }
    subs.add(callbackFn);
    return () => {
      const current = this.valueSubscribers.get(cstID);
      if (!current) {
        return;
      }
      current.delete(callbackFn);
      if (current.size === 0) {
        this.valueSubscribers.delete(cstID);
      }
    };
  }

  /** Subscribe to status change of {@link Constituenta}. */
  public subscribeStatus(cstID: number, callbackFn: () => void): () => void {
    let subs = this.statusSubscribers.get(cstID);
    if (!subs) {
      subs = new Set();
      this.statusSubscribers.set(cstID, subs);
    }
    subs.add(callbackFn);
    return () => {
      const current = this.statusSubscribers.get(cstID);
      if (!current) {
        return;
      }
      current.delete(callbackFn);
      if (current.size === 0) {
        this.statusSubscribers.delete(cstID);
      }
    };
  }

  /** Sets value for {@link Constituenta} from {@link Value}. */
  public async setStructureValue(cstID: number, data: Value): Promise<void> {
    const cst = this.schema?.cstByID.get(cstID);
    if (!this.schema || !cst || isInferrable(cst.cst_type)) {
      toast.error(errorMsg.invalidSetValue);
      return;
    }

    const typeStr = cst.analysis.type ? normalizeType(cst.analysis.type) : INVALID_TYPE_MARKER;
    const payload = [{ target: cstID, type: typeStr, data }];
    await this.services.setCstValue({ itemID: this.modelID, data: payload });

    if (!cst.analysis.type || !this.calculator.validate(data, cst.analysis.type)) {
      this.invalidData.add(cstID);
    } else {
      this.invalidData.delete(cstID);
    }
    this.calculator.setValue(cst.alias, data);
    this.notifyCst(cstID);
    this.cascadeReset([cstID]);
  }

  /** Sets value for {@link Constituenta} from {@link BasicBinding}. */
  public async setBasicValue(cstID: number, data: BasicBinding): Promise<void> {
    const cst = this.schema?.cstByID.get(cstID);
    if (!this.schema || !cst || !isBaseSet(cst.cst_type)) {
      toast.error(errorMsg.invalidSetValue);
      return;
    }
    const oldValue = this.calculator.getValue(cst.alias);
    const newValue = Object.keys(data).map(Number);

    const updateList: Parameters<RSEngineServices['setCstValue']>[0]['data']
      = [{ target: cstID, type: TYPE_BASIC, data }];
    const resetList: number[] = [];

    if (oldValue !== null && compare(newValue, oldValue) !== 0) {
      const dependencies = this.schema.graph.expandAllOutputs([cstID]);
      for (const childID of dependencies) {
        const child = this.schema.cstByID.get(childID)!;
        if (child.cst_type === CstType.STRUCTURED && !!child.analysis.type) {
          const value = this.calculator.getValue(child.alias);
          if (value !== null) {
            const fix = tryFixValue(value, child.analysis.type, cst.alias, newValue);
            if (fix === null) {
              resetList.push(childID);
            } else if (fix === true) {
              const typeStr = normalizeType(child.analysis.type);
              updateList.push({ target: childID, type: typeStr, data: [...value as Value[]] });
            }
          }
        }
      }
    }

    if (resetList.length > 0) {
      await Promise.all([
        this.services.setCstValue({ itemID: this.modelID, data: updateList }),
        this.services.clearValues({ itemID: this.modelID, data: { items: resetList } }),
      ]);
    } else {
      await this.services.setCstValue({ itemID: this.modelID, data: updateList });
    }
    const changed = [...resetList, ...updateList.map(item => item.target)];

    this.basics.set(cstID, data);
    this.calculator.setValue(cst.alias, Object.keys(data).map(Number));

    for (const item of resetList) {
      this.calculator.resetValue(this.schema.cstByID.get(item)!.alias);
      this.notifyCst(item);
    }
    for (const updateData of updateList) {
      if (updateData.target !== cstID) {
        this.calculator.setValue(
          this.schema.cstByID.get(updateData.target)!.alias, updateData.data as unknown as Value
        );
        this.notifyCst(updateData.target);
      }
    }
    for (const item of changed) {
      this.notifyCst(item);
    }
    this.cascadeReset(changed);
  }

  /** Resets value for {@link Constituenta}. */
  public async resetValue(cstID: number): Promise<void> {
    const cst = this.schema?.cstByID.get(cstID);
    if (!cst) {
      return;
    }
    await this.services.clearValues({ itemID: this.modelID, data: { items: [cstID] } });
    this.calculator.resetValue(cst.alias);
    this.basics.delete(cstID);
    this.calculatedSet.delete(cstID);
    this.invalidData.delete(cstID);
    this.notifyCst(cstID);
  }

  /** Evaluates expression for {@link RSEngine}. */
  public evaluateExpression(expression: string, cstType: CstType): CalculatorResult {
    return getEvaluationFor(expression, cstType, this.schema!, this.calculator);
  }

  /** Evaluates AST for {@link RSEngine}. */
  public evaluateAst(ast: AstNode, options?: CalculatorEvaluateOptions): CalculatorResult {
    try {
      const evaluation = this.calculator.evaluateFull(ast, options);
      return evaluation;
    } catch (error) {
      toast.error((error as Error).message);
      console.error(error);
      return {
        value: null,
        iterations: 0,
        errors: []
      };
    }
  }

  /** Calculates value for {@link Constituenta}. */
  public calculateCst(cstID: number): CalculatorResult {
    const cst = this.schema?.cstByID.get(cstID);
    if (!cst || !this.schema) {
      return { value: null, iterations: 0, errors: [] };
    }

    if (!this.calculatedSet.has(cstID)) {
      const predecessors = this.schema.graph.expandAllInputs([cstID]);
      this.prepareEvaluation(predecessors);
    }
    const result = getEvaluationFor(cst.definition_formal, cst.cst_type, this.schema, this.calculator);

    if (result.value === null) {
      this.calculator.resetValue(cst.alias);
    } else {
      this.calculator.setValue(cst.alias, result.value);
    }

    this.calculatedSet.add(cstID);
    this.notifyValue(cstID);
    this.notifyStatus(cstID);

    return result;
  }

  /** Recalculate model for all inferrable expressions. */
  recalculateAll(): void {
    const start = performance.now();
    this.calculatedSet.clear();
    this.recalculateInternal();
    const end = performance.now();
    const timeSpent = ((end - start) / 1000).toFixed(2);
    toast.success(infoMsg.calculationSuccess(timeSpent));
  }

  /** Notify subscribers about value and status change of {@link Constituenta}. */
  private notifyCst(cstID: number) {
    this.notifyStatus(cstID);
    this.notifyValue(cstID);
  }

  /** Notify all subscribers about value change. */
  private notifyValue(cstID: number) {
    const subs = this.valueSubscribers.get(cstID);
    if (subs) {
      for (const cb of subs) cb();
    }
  }

  /** Notify all subscribers about status change. */
  private notifyStatus(cstID: number) {
    const subs = this.statusSubscribers.get(cstID);
    if (subs) {
      for (const cb of subs) cb();
    }
  }

  /** Notify all subscribers about value and status change. */
  private notifyAll(): void {
    for (const subs of this.valueSubscribers.values()) {
      for (const cb of subs) cb();
    }
    for (const subs of this.statusSubscribers.values()) {
      for (const cb of subs) cb();
    }
  }

  private prepareAst(): void {
    this.calculator.clearAllAst();
    const functions = this.schema!.items.filter(cst => isFunctional(cst.cst_type) && cst.analysis?.success);
    for (const cst of functions) {
      const fullAnalysis = getAnalysisFor(cst.definition_formal, cst.cst_type, this.schema!);
      if (fullAnalysis.ast) {
        this.calculator.setAST(cst.alias, fullAnalysis.ast);
      }
    }
  }

  private prepareValues(): void {
    this.basics.clear();
    this.invalidData.clear();
    this.calculatedSet.clear();

    for (const item of this.data!.items) {
      const cst = this.schema!.cstByID.get(item.id)!;
      if (item.type === TYPE_BASIC) {
        if (cst.cst_type !== CstType.BASE && cst.cst_type !== CstType.CONSTANT) {
          throw new Error(`Invalid data for ${cst.alias}`);
        }
        const data = item.value as BasicBinding;
        this.basics.set(cst.id, data);
        this.calculator.setValue(cst.alias, Object.keys(data).map(Number));
      }
    }
    for (const item of this.data!.items) {
      const cst = this.schema!.cstByID.get(item.id)!;
      if (item.type !== TYPE_BASIC) {
        this.calculator.setValue(cst.alias, item.value as Value);
        if (!cst.analysis.type || !this.calculator.validate(item.value as Value, cst.analysis.type)) {
          this.invalidData.add(item.id);
        }
      }
    }
    this.setupEmptySets();
  }

  private setupEmptySets(): void {
    for (const cst of this.schema!.items) {
      if (isBasicConcept(cst.cst_type) && this.schema!.analyzer.getType(cst.alias)?.typeID === TypeID.collection) {
        if (this.calculator.getValue(cst.alias) === null) {
          this.calculator.setValue(cst.alias, []);
        }
      }
    }
  }

  private cascadeReset(cstIDs: number[]): void {
    if (!this.schema) {
      return;
    }
    const dependencies = this.schema.graph.expandAllOutputs(cstIDs);
    for (const cstID of dependencies) {
      const cst = this.schema.cstByID.get(cstID);
      if (!cst || !isInferrable(cst.cst_type)) {
        continue;
      }
      this.calculatedSet.delete(cstID);
      this.calculator.resetValue(this.schema.cstByID.get(cstID)!.alias);
      this.notifyCst(cstID);
    }
  }

  private prepareEvaluation(dependencies: number[]): void {
    for (const cstID of this.schema!.graph.topologicalOrder()) {
      if (dependencies.includes(cstID)) {
        const cst = this.schema!.cstByID.get(cstID)!;
        if (isInferrable(cst.cst_type)) {
          const value = fastEvaluation(cst.definition_formal, cst.cst_type, this.schema!, this.calculator);
          if (value !== null) {
            this.calculator.setValue(cst.alias, value);
          } else {
            this.calculator.resetValue(cst.alias);
          }
          this.notifyCst(cstID);
        }
        this.calculatedSet.add(cstID);
      }
    }
  }

  private recalculateInternal(): void {
    const processedIDs = [];
    for (const cst of this.schema!.cstByID.values()) {
      if (isInferrable(cst.cst_type)) {
        this.calculator.resetValue(cst.alias);
      }
    }

    for (const cstID of this.schema!.graph.topologicalOrder()) {
      processedIDs.push(cstID);
      const cst = this.schema!.cstByID.get(cstID)!;
      if (isInferrable(cst.cst_type)) {
        const value = fastEvaluation(cst.definition_formal, cst.cst_type, this.schema!, this.calculator);
        this.calculatedSet.add(cstID);
        if (value !== null) {
          this.calculator.setValue(cst.alias, value);
        }
      }
    }
    this.notifyAll();
  }
}

// ==== Internal functions ==== /

/** Evaluates expression for {@link Constituenta}, including error handling. */
function getEvaluationFor(
  expression: string, cstType: CstType, schema: RSForm, calculator: RSCalculator
): CalculatorResult {
  const parse = getAnalysisFor(expression, cstType, schema);
  if (!parse.success || !parse.ast) {
    return {
      value: null,
      iterations: 0,
      errors: parse.errors
    };
  } else {
    try {
      const result = calculator.evaluateFull(parse.ast);
      return {
        value: result.value,
        iterations: result.iterations,
        errors: [...parse.errors, ...result.errors]
      };
    } catch (error) {
      toast.error((error as Error).message);
      console.error(expression, error);
      return {
        value: null,
        iterations: 0,
        errors: []
      };
    }
  }
}

/** Evaluates expression for {@link RSModel}. */
function fastEvaluation(
  expression: string, cstType: CstType, schema: RSForm, calculator: RSCalculator
): Value | null {
  const parse = getAnalysisFor(expression, cstType, schema);
  if (!parse.success || !parse.ast) {
    return null;
  } else {
    try {
      return calculator.evaluateFast(parse.ast);
    } catch (error) {
      toast.error((error as Error).message);
      console.error(expression, error);
      return null;
    }
  }
}