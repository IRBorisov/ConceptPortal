import { toast } from 'react-toastify';

import { type RSForm } from '@/features/rsform';
import { CstType } from '@/features/rsform';
import { getAnalysisFor, isBaseSet, isBasicConcept, isFunctional } from '@/features/rsform/models/rsform-api';
import { type CalculatorResult, RSCalculator, TypeID, type Value } from '@/features/rslang';

import { errorMsg, infoMsg } from '@/utils/labels';
import { type RO } from '@/utils/meta';

import { type RSModelDTO } from '../backend/types';

import { type BasicBinding, type BasicsContext, type EvalStatus, TYPE_BASIC } from './rsmodel';
import { fastEvaluation, getEvaluationFor, inferStatus, isInferrable, tryFixValue } from './rsmodel-api';

export interface RSEngineServices {
  setCstValue: (args: { itemID: number; data: { target: number; type: string; data: Value | BasicBinding; }[]; }) => Promise<unknown>;
  clearValues: (args: { itemID: number; data: { items: number[]; }; }) => Promise<unknown>;
}

export class RSEngine {
  public modelID: number;
  public schema: RSForm | null = null;
  public data: RO<RSModelDTO> | null = null;
  public calculator = new RSCalculator();
  public basics: BasicsContext = new Map<number, BasicBinding>();

  private services: RSEngineServices;
  private calculatedSet = new Set<number>();
  private valueSubscribers = new Map<number, Set<() => void>>();
  private statusSubscribers = new Map<number, Set<() => void>>();

  constructor(modelID: number, services: RSEngineServices) {
    console.log(`Creating engine for ${modelID}...`);
    this.services = services;
    this.modelID = modelID;
  }

  public loadData(schema: RSForm, dto: RO<RSModelDTO>): void {
    console.log(`Reloading data for ${this.modelID}...`);
    this.schema = schema;
    if (this.data !== dto) {
      this.data = dto;
      this.clear();
      this.prepareAst();
      this.prepareValues();
    }
    this.notifyAll();
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
    return inferStatus(value, cst.cst_type, this.calculatedSet.has(cstID));
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

    const type = cst.analysis.type;
    const payload = [{ target: cstID, type: type ? type.typeID.toString() : '', data }];
    await this.services.setCstValue({ itemID: this.modelID, data: payload });

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
    const newValue = Object.keys(data).map(Number);

    const updateList: Parameters<RSEngineServices['setCstValue']>[0]['data']
      = [{ target: cstID, type: TYPE_BASIC, data }];
    const resetList: number[] = [];
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
            updateList.push({ target: childID, type: child.cst_type, data: value });
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
    this.notifyValue(cstID);
    this.notifyStatus(cstID);
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

  private notifyAll(): void {
    for (const subs of this.valueSubscribers.values()) {
      for (const cb of subs) cb();
    }
    for (const subs of this.statusSubscribers.values()) {
      for (const cb of subs) cb();
    }
  }

  private clear(): void {
    this.basics.clear();
    this.calculatedSet.clear();
  }

  private prepareAst(): void {
    const functions = this.schema!.items.filter(cst => isFunctional(cst.cst_type) && cst.analysis?.success);
    for (const cst of functions) {
      const fullAnalysis = getAnalysisFor(cst.definition_formal, cst.cst_type, this.schema!);
      if (fullAnalysis.ast) {
        this.calculator.setAST(cst.alias, fullAnalysis.ast);
      }
    }
  }

  private prepareValues(): void {
    for (const item of this.data!.items) {
      const cst = this.schema!.cstByID.get(item.id)!;
      if (item.type === TYPE_BASIC) {
        if (cst.cst_type !== CstType.BASE && cst.cst_type !== CstType.CONSTANT) {
          throw new Error(`Invalid data for ${cst.alias}`);
        }
        const data = item.value as BasicBinding;
        this.basics.set(cst.id, data);
        this.calculator.setValue(cst.alias, Object.keys(data).map(Number));
      } else {
        // TODO: check typification
        this.calculator.setValue(cst.alias, item.value as Value);
      }
    }
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
        if (value !== null) {
          this.calculator.setValue(cst.alias, value);
        }
      }
    }
    this.notifyAll();
  }

}
