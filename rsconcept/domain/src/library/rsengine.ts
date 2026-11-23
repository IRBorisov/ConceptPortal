import { type Graph } from '../graph';
import { type AstNode } from '../parsing';
import {
  type AnalysisFull,
  type CalculatorEvaluateOptions,
  type CalculatorResult,
  RSCalculator,
  type RSLangAnalyzer,
  TypeID,
  type Value
} from '../rslang';
import { createModelValueArray } from '../rslang/eval/model-value-arrays';
import { compare } from '../rslang/eval/value';
import { normalizeType } from '../rslang/labels';
import { type ExpressionType } from '../rslang/semantic/typification';

import { type Constituenta, CstType, type RSForm } from './rsform';
import { buildFormalDependencyGraph, getAnalysisFor, isBaseSet, isBasicConcept, isFunctional } from './rsform-api';
import { type BasicBinding, type BasicsContext, type EvalStatus, type RSModel, TYPE_BASIC } from './rsmodel';
import { inferEvalStatus, isInferrable, tryFixValue } from './rsmodel-api';

const INVALID_TYPE_MARKER = 'INVALID';
const MAX_SNAPSHOT_CELLS = 100_000;
const MAX_SNAPSHOT_DEPTH = 64;

interface CachedConstituentAnalysis {
  definition: string;
  cstType: CstType;
  analysis: AnalysisFull;
}

interface ConstituentAnalysisCache {
  schema: RSForm;
  analyzer: RSLangAnalyzer;
  revision: number;
  entries: WeakMap<Constituenta, CachedConstituentAnalysis>;
}

interface IncrementalConstituent {
  alias: string;
  definition: string;
  type: CstType;
  value: Value | null;
  cells: number;
}

interface IncrementalCalculation {
  schema: RSForm;
  analyzer: RSLangAnalyzer;
  analyzerRevision: number;
  calculator: RSCalculator;
  astRevision: number;
  order: number[];
  dependencies: Graph;
  constituents: Map<number, IncrementalConstituent>;
  cells: number;
}

interface ChangedConstituents {
  inputs: number[];
  outputs: number[];
}

interface PreparedFunctions {
  calculator: RSCalculator;
  revision: number;
  definitions: Map<number, Pick<Constituenta, 'alias' | 'definition_formal'>>;
}

/** Services for {@link RSEngine}. */
export interface RSEngineServices {
  setCstValue: (args: {
    itemID: number;
    data: { target: number; type: string; data: Value | BasicBinding }[];
  }) => Promise<unknown>;
  clearValues: (args: { itemID: number; data: { items: number[] } }) => Promise<unknown>;
  /** Format stored metadata for the destination. Defaults to the legacy normalized typification. */
  formatStructureType?: (type: ExpressionType) => string;
}

/** Notifications for {@link RSEngine}. */
export interface RSEngineNotifications {
  onInvalidSetValue: () => void;
  onCalculationSuccess: (timeSpent: string) => void;
}

/** Calculation engine for {@link RSModel}. */
export class RSEngine {
  public modelID: number;
  public schema: RSForm | null = null;
  public data: RSModel | null = null;
  public calculator = new RSCalculator();
  public basics: BasicsContext = new Map<number, BasicBinding>();

  private services: RSEngineServices;
  private notifications: RSEngineNotifications | null;
  private invalidData = new Set<number>();
  private calculatedSet = new Set<number>();
  private calculationPasses = 0;
  private constituentAnalysisCache: ConstituentAnalysisCache | undefined;
  private incrementalCalculation: IncrementalCalculation | undefined;
  private preparedFunctions: PreparedFunctions | undefined;
  private valueSubscribers = new Map<number, Set<() => void>>();
  private statusSubscribers = new Map<number, Set<() => void>>();
  private changeSubscribers = new Set<() => void>();
  private changeGeneration = 0;
  private pendingChange = false;
  private coalescedEmitTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(modelID: number, services: RSEngineServices, notifications: RSEngineNotifications | null = null) {
    this.services = services;
    this.notifications = notifications;
    this.modelID = modelID;
  }

  /** Updates data for {@link RSEngine}. */
  public loadData(schema: RSForm, model: RSModel): void {
    const oldSchema = this.schema;
    const schemaChanged = oldSchema !== schema;
    const modelChanged = this.data !== model;
    this.schema = schema;
    if (schemaChanged) {
      this.calculationPasses = 0;
      this.constituentAnalysisCache = undefined;
      this.incrementalCalculation = undefined;
      const changedCst = this.collectChanged(oldSchema, schema);
      this.prepareAst();
      if (!modelChanged) {
        this.rebindAliases(oldSchema);
      }
      this.setupEmptySets();
      this.onChangeDefinitions(changedCst);
    }
    if (modelChanged) {
      this.prepareValues(model);
      this.data = model;
    }
    this.notifyAll();
  }

  /** Updates services for {@link RSEngine}. */
  public updateServices(services: RSEngineServices): void {
    this.services = services;
  }

  /** Updates notifications for {@link RSEngine}. */
  public updateNotifications(notifications: RSEngineNotifications | null): void {
    this.notifications = notifications;
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
      return inferEvalStatus(null, CstType.NOMINAL, false);
    }
    const value = this.calculator.getValue(cst.alias);
    return inferEvalStatus(value, cst.cst_type, this.calculatedSet.has(cstID), this.invalidData.has(cstID));
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

  /**
   * Subscribe to any engine change that can affect evaluation (values, status, or loaded data).
   */
  public subscribeChanges(callbackFn: () => void): () => void {
    this.changeSubscribers.add(callbackFn);
    return () => {
      this.changeSubscribers.delete(callbackFn);
    };
  }

  /** Monotonic counter bumped whenever the engine emits a change to {@link RSEngine.subscribeChanges} listeners. */
  public getChangeGeneration(): number {
    return this.changeGeneration;
  }

  /**
   * Runs pending {@link RSEngine.subscribeChanges} notifications immediately and clears the coalescing queue.
   * Use after a synchronous batch of engine updates when listeners must observe a bumped {@link getChangeGeneration}
   * in the same turn.
   */
  public flushPendingChanges(): void {
    if (this.coalescedEmitTimeout !== null) {
      clearTimeout(this.coalescedEmitTimeout);
      this.coalescedEmitTimeout = null;
    }
    if (!this.pendingChange) {
      return;
    }
    this.pendingChange = false;
    this.emitChange();
  }

  /** Sets value for {@link Constituenta} from {@link Value}. */
  public async setStructureValue(cstID: number, data: Value): Promise<void> {
    const cst = this.schema?.cstByID.get(cstID);
    if (!this.schema || !cst || isInferrable(cst.cst_type)) {
      this.notifications?.onInvalidSetValue();
      return;
    }

    const typeStr = this.formatStructureType(cst.effectiveType);
    const payload = [{ target: cstID, type: typeStr, data }];
    await this.services.setCstValue({ itemID: this.modelID, data: payload });

    if (!cst.effectiveType || !this.calculator.validate(data, cst.effectiveType)) {
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
      this.notifications?.onInvalidSetValue();
      return;
    }
    const oldValue = this.calculator.getValue(cst.alias);
    const newValue = canonicalBasicIds(data);

    const updateList: Parameters<RSEngineServices['setCstValue']>[0]['data'] = [
      { target: cstID, type: TYPE_BASIC, data }
    ];
    const resetList: number[] = [];

    if (oldValue !== null && compare(newValue, oldValue) !== 0) {
      const dependencies = this.schema.graph.expandAllOutputs([cstID]);
      for (const childID of dependencies) {
        const child = this.schema.cstByID.get(childID)!;
        if (child.cst_type === CstType.STRUCTURED && !!child.effectiveType) {
          const value = this.calculator.getValue(child.alias);
          if (value !== null) {
            const draft = cloneValue(value);
            const fix = tryFixValue(draft, child.effectiveType, cst.alias, newValue);
            if (fix === null) {
              resetList.push(childID);
            } else if (fix === true) {
              const typeStr = this.formatStructureType(child.effectiveType);
              updateList.push({ target: childID, type: typeStr, data: draft });
            }
          }
        }
      }
    }

    // Sequential writes: both endpoints share the model concurrency token.
    // A parallel pair would send the same expected time_update and the second would 409.
    // Local state changes only after a write succeeds, so a rejected save leaves values intact.
    await this.services.setCstValue({ itemID: this.modelID, data: updateList });
    if (resetList.length > 0) {
      try {
        await this.services.clearValues({ itemID: this.modelID, data: { items: resetList } });
      } catch (error) {
        this.commitBasicUpdate(cst, data, newValue, updateList, []);
        // The base write landed, but these children still hold values the new base cannot contain.
        for (const childID of resetList) {
          this.invalidData.add(childID);
          this.notifyCst(childID);
        }
        throw error;
      }
    }
    this.commitBasicUpdate(cst, data, newValue, updateList, resetList);
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
    this.cascadeReset([cstID]);
  }

  /** Evaluates expression for {@link RSEngine}. */
  public evaluateExpression(expression: string, cstType: CstType): CalculatorResult {
    return evaluateAnalysis(getAnalysisFor(expression, cstType, this.schema!), this.calculator);
  }

  /** Evaluates AST for {@link RSEngine}. */
  public evaluateAst(ast: AstNode, options?: CalculatorEvaluateOptions): CalculatorResult {
    return this.calculator.evaluateFull(ast, options);
  }

  /** Calculates value for {@link Constituenta}. */
  public calculateCst(cstID: number): CalculatorResult {
    const cst = this.schema?.cstByID.get(cstID);
    if (!cst || !this.schema) {
      return { value: null, iterations: 0, errors: [], cacheHits: 0 };
    }

    this.calculationPasses++;
    if (!this.calculatedSet.has(cstID)) {
      const predecessors = this.schema.graph.expandAllInputs([cstID]);
      this.prepareEvaluation(predecessors);
    }
    const result = evaluateAnalysis(this.getConstituentAnalysis(cst), this.calculator);

    if (result.value === null) {
      this.calculator.resetValue(cst.alias);
    } else {
      this.calculator.setValue(cst.alias, result.value);
    }

    this.calculatedSet.add(cstID);
    this.notifyCst(cstID);

    return result;
  }

  /** Recalculate model for all inferrable expressions. */
  recalculateAll(): void {
    const start = performance.now();
    this.calculationPasses++;
    this.calculatedSet.clear();
    this.recalculateInternal();
    this.notifyAll();
    const timeSpent = ((performance.now() - start) / 1000).toFixed(2);
    this.notifications?.onCalculationSuccess(timeSpent);
  }

  /** Recalculate only constituents affected by changes since the previous incremental pass. */
  public recalculateChanged(): void {
    if (this.calculator.hasValueSubscribers) {
      this.incrementalCalculation = undefined;
      this.recalculateAll();
      return;
    }
    const schema = this.schema!;
    const start = performance.now();
    this.calculationPasses++;
    const order = schema.graph.topologicalOrder();
    const previous = this.incrementalCalculation;
    const changed = previous && this.findChangedConstituents(previous, order);
    if (!previous || !changed) {
      this.calculatedSet.clear();
      this.recalculateInternal(undefined, order);
      this.incrementalCalculation = this.captureCalculation(schema, order);
    } else if (changed.inputs.length > 0 || changed.outputs.length > 0) {
      const affected = new Set([...changed.inputs, ...previous.dependencies.expandAllOutputs(changed.inputs)]);
      for (const id of changed.outputs) {
        if (affected.has(id)) {
          continue;
        }
        const { alias, value } = previous.constituents.get(id)!;
        if (value === null) {
          this.calculator.resetValue(alias);
        } else {
          this.calculator.setValue(alias, cloneValue(value));
        }
        this.calculatedSet.add(id);
      }
      if (affected.size > 0) {
        this.recalculateInternal(order.filter(id => affected.has(id)));
        if (!this.refreshCalculationSnapshot(previous, [...affected])) {
          this.incrementalCalculation = undefined;
        }
      }
    }
    this.notifyAll();
    const end = performance.now();
    const timeSpent = ((end - start) / 1000).toFixed(2);
    this.notifications?.onCalculationSuccess(timeSpent);
  }

  private captureCalculation(schema: RSForm, order: number[]): IncrementalCalculation | undefined {
    const prepared = this.preparedFunctions;
    if (
      prepared?.calculator !== this.calculator ||
      prepared.revision !== this.calculator.astRevision ||
      this.calculator.hasValueSubscribers ||
      this.calculator.hasValuesOutside(schema.cstByAlias)
    ) {
      return undefined;
    }

    const constituents = [...schema.cstByID.values()];
    const functions = constituents.filter(item => isFunctional(item.cst_type));
    if (
      functions.length !== prepared.definitions.size ||
      functions.some(item => {
        const definition = prepared.definitions.get(item.id);
        return definition?.alias !== item.alias || definition.definition_formal !== item.definition_formal;
      })
    ) {
      return undefined;
    }
    const dependencies = buildFormalDependencyGraph(constituents);
    const positions = new Map(order.map((id, index) => [id, index]));
    if (
      order.length !== constituents.length ||
      constituents.some(item => {
        const position = positions.get(item.id);
        return position === undefined || dependencies.at(item.id)!.inputs.some(id => positions.get(id)! >= position);
      })
    ) {
      return undefined;
    }

    const snapshots = new Map<number, IncrementalConstituent>();
    for (const item of constituents) {
      if (schema.cstByAlias.get(item.alias)?.id !== item.id) {
        return undefined;
      }
      snapshots.set(item.id, {
        alias: item.alias,
        definition: item.definition_formal,
        type: item.cst_type,
        value: null,
        cells: 0
      });
    }
    const calculation: IncrementalCalculation = {
      schema,
      analyzer: schema.analyzer,
      analyzerRevision: schema.analyzer.contextRevision,
      calculator: this.calculator,
      astRevision: this.calculator.astRevision,
      order,
      dependencies,
      constituents: snapshots,
      cells: 0
    };
    return this.refreshCalculationSnapshot(calculation, [...snapshots.keys()]) ? calculation : undefined;
  }

  private refreshCalculationSnapshot(calculation: IncrementalCalculation, ids: number[]): boolean {
    // Bound the extra memory independently of the size of the original model and its results.
    const budget = { remaining: MAX_SNAPSHOT_CELLS - calculation.cells };
    for (const id of ids) {
      budget.remaining += calculation.constituents.get(id)!.cells;
    }
    for (const id of ids) {
      const snapshot = calculation.constituents.get(id)!;
      const before = budget.remaining;
      const value = snapshotValue(this.calculator.getValue(snapshot.alias), budget);
      if (value === undefined) {
        return false;
      }
      snapshot.value = value;
      snapshot.cells = before - budget.remaining;
    }
    calculation.cells = MAX_SNAPSHOT_CELLS - budget.remaining;
    return true;
  }

  private findChangedConstituents(previous: IncrementalCalculation, order: number[]): ChangedConstituents | undefined {
    const schema = this.schema!;
    if (
      previous.schema !== schema ||
      previous.analyzer !== schema.analyzer ||
      previous.analyzerRevision !== schema.analyzer.contextRevision ||
      previous.calculator !== this.calculator ||
      previous.astRevision !== this.calculator.astRevision ||
      this.calculator.hasValueSubscribers ||
      this.calculator.hasValuesOutside(schema.cstByAlias) ||
      order.length !== previous.order.length ||
      order.some((id, index) => id !== previous.order[index]) ||
      schema.cstByID.size !== previous.constituents.size
    ) {
      return undefined;
    }
    const changed: ChangedConstituents = { inputs: [], outputs: [] };
    for (const item of schema.cstByID.values()) {
      const snapshot = previous.constituents.get(item.id);
      if (
        snapshot?.alias !== item.alias ||
        snapshot.definition !== item.definition_formal ||
        snapshot.type !== item.cst_type ||
        schema.cstByAlias.get(item.alias)?.id !== item.id
      ) {
        return undefined;
      }
      const current = this.calculator.getValue(item.alias);
      if (isInferrable(item.cst_type)) {
        if (!this.calculatedSet.has(item.id) || !sameValue(current, snapshot.value)) {
          changed.outputs.push(item.id);
        }
      } else if (!sameValue(current, snapshot.value)) {
        changed.inputs.push(item.id);
      }
    }
    return changed;
  }

  private formatStructureType(type: ExpressionType | null): string {
    const format = this.services.formatStructureType ?? normalizeType;
    return type ? format(type) : INVALID_TYPE_MARKER;
  }

  /** Notify subscribers about value and status change of {@link Constituenta}. */
  private notifyCst(cstID: number) {
    this.notifyStatus(cstID);
    this.notifyValue(cstID);
    this.scheduleCoalescedEmitChange();
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
    this.scheduleCoalescedEmitChange();
  }

  private scheduleCoalescedEmitChange(): void {
    this.pendingChange = true;
    if (this.coalescedEmitTimeout !== null) {
      return;
    }
    this.coalescedEmitTimeout = setTimeout(
      function runCoalescedEmitChange(this: RSEngine) {
        this.coalescedEmitTimeout = null;
        if (!this.pendingChange) {
          return;
        }
        this.pendingChange = false;
        this.emitChange();
      }.bind(this),
      0
    );
  }

  private emitChange(): void {
    this.changeGeneration += 1;
    for (const cb of this.changeSubscribers) {
      cb();
    }
  }

  private prepareAst(): void {
    this.calculator.clearAllAst();
    const functions = this.schema!.items.filter(cst => isFunctional(cst.cst_type));
    for (const cst of functions) {
      if (!cst.analysis?.success) {
        continue;
      }
      const fullAnalysis = getAnalysisFor(cst.definition_formal, cst.cst_type, this.schema!);
      if (fullAnalysis.ast) {
        this.calculator.setAST(cst.alias, fullAnalysis.ast);
      }
    }
    this.preparedFunctions = {
      calculator: this.calculator,
      revision: this.calculator.astRevision,
      definitions: new Map(functions.map(({ id, alias, definition_formal }) => [id, { alias, definition_formal }]))
    };
  }

  private prepareValues(model: RSModel): void {
    this.basics.clear();
    this.invalidData.clear();
    this.calculatedSet.clear();
    this.calculator.clearAllValues();

    for (const item of model.items) {
      const cst = this.schema?.cstByID.get(item.id);
      if (!cst || item.type !== TYPE_BASIC) {
        continue;
      }
      if (!isBaseSet(cst.cst_type)) {
        this.invalidData.add(item.id);
        continue;
      }
      const data = item.value as BasicBinding;
      this.basics.set(cst.id, data);
      this.calculator.setValue(cst.alias, canonicalBasicIds(data));
    }
    for (const item of model.items) {
      const cst = this.schema?.cstByID.get(item.id);
      if (!cst || item.type === TYPE_BASIC) {
        continue;
      }
      const value = cloneStoredValue(item.value as Value);
      this.calculator.setValue(cst.alias, value);
      if (!cst.effectiveType || !this.calculator.validate(value, cst.effectiveType)) {
        this.invalidData.add(item.id);
      }
    }
    this.setupEmptySets();
  }

  /** Keep stored values attached to the constituent id when only its alias changes. */
  private rebindAliases(previousSchema: RSForm | null): void {
    if (!previousSchema || !this.schema) {
      return;
    }
    const moves: { from: string; to: string; value: Value }[] = [];
    const removed: string[] = [];
    for (const previous of previousSchema.items) {
      const next = this.schema.cstByID.get(previous.id);
      if (!next) {
        removed.push(previous.alias);
        continue;
      }
      if (next.alias === previous.alias) {
        continue;
      }
      const value = this.calculator.getValue(previous.alias);
      if (value !== null) {
        moves.push({ from: previous.alias, to: next.alias, value });
      } else {
        removed.push(previous.alias);
      }
    }
    for (const alias of removed) {
      this.calculator.resetValue(alias);
    }
    for (const move of moves) {
      this.calculator.resetValue(move.from);
    }
    for (const move of moves) {
      this.calculator.setValue(move.to, move.value);
    }
    this.revalidateStructuredValues();
  }

  /** Recompute {@link invalidData} after a schema-only reload moves or retypes stored values. */
  private revalidateStructuredValues(): void {
    if (!this.schema) {
      return;
    }
    for (const cst of this.schema.items) {
      if (cst.cst_type !== CstType.STRUCTURED) {
        continue;
      }
      const value = this.calculator.getValue(cst.alias);
      if (value === null) {
        continue;
      }
      if (cst.effectiveType !== null && this.calculator.validate(value, cst.effectiveType)) {
        this.invalidData.delete(cst.id);
      } else {
        this.invalidData.add(cst.id);
      }
    }
  }

  private commitBasicUpdate(
    cst: { id: number; alias: string },
    data: BasicBinding,
    newValue: number[],
    updateList: Parameters<RSEngineServices['setCstValue']>[0]['data'],
    resetList: number[]
  ): void {
    if (!this.schema) {
      return;
    }
    this.basics.set(cst.id, data);
    this.calculator.setValue(cst.alias, newValue);

    for (const item of resetList) {
      this.calculator.resetValue(this.schema.cstByID.get(item)!.alias);
      this.notifyCst(item);
    }
    for (const updateData of updateList) {
      if (updateData.target !== cst.id) {
        this.calculator.setValue(this.schema.cstByID.get(updateData.target)!.alias, updateData.data as Value);
        this.notifyCst(updateData.target);
      }
    }
    const changed = [...resetList, ...updateList.map(item => item.target)];
    for (const item of changed) {
      this.notifyCst(item);
    }
    this.cascadeReset(changed);
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

  private collectChanged(previousSchema: RSForm | null, nextSchema: RSForm): number[] {
    if (!previousSchema) {
      return [];
    }
    const changedIDs: number[] = [];
    for (const cst of nextSchema.items) {
      const prev = previousSchema.cstByID.get(cst.id);
      if (prev && (prev.definition_formal !== cst.definition_formal || prev.alias !== cst.alias)) {
        changedIDs.push(cst.id);
      }
    }
    return changedIDs;
  }

  private onChangeDefinitions(cstIDs: number[]): void {
    if (!this.schema || cstIDs.length === 0) {
      return;
    }
    for (const cstID of cstIDs) {
      const cst = this.schema.cstByID.get(cstID);
      if (!cst || !isInferrable(cst.cst_type)) {
        continue;
      }
      this.calculatedSet.delete(cstID);
      this.calculator.resetValue(cst.alias);
      this.notifyCst(cstID);
    }
    this.cascadeReset(cstIDs);
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
          const value = this.evaluateConstituentFast(cst);
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

  private recalculateInternal(affected?: number[], order?: number[]): void {
    const schema = this.schema!;
    const resetItems = affected ? affected.map(id => schema.cstByID.get(id)!) : schema.cstByID.values();
    for (const cst of resetItems) {
      if (isInferrable(cst.cst_type)) {
        this.calculator.resetValue(cst.alias);
      }
    }

    for (const cstID of affected ?? order ?? schema.graph.topologicalOrder()) {
      const cst = schema.cstByID.get(cstID)!;
      if (isInferrable(cst.cst_type)) {
        const value = this.evaluateConstituentFast(cst);
        this.calculatedSet.add(cstID);
        if (value !== null) {
          this.calculator.setValue(cst.alias, value);
        }
      }
    }
  }

  private evaluateConstituentFast(cst: Constituenta): Value | null {
    const analysis = this.getConstituentAnalysis(cst);
    return analysis.success && analysis.ast ? this.calculator.evaluateFast(analysis.ast) : null;
  }

  private getConstituentAnalysis(cst: Constituenta): AnalysisFull {
    const schema = this.schema!;
    const definition = cst.definition_formal;
    const cstType = cst.cst_type;
    // A fresh engine can be discarded after its first calculation.
    if (this.calculationPasses < 2) {
      return getAnalysisFor(definition, cstType, schema);
    }

    const analyzer = schema.analyzer;
    const revision = analyzer.contextRevision;
    let cache = this.constituentAnalysisCache;
    if (cache?.schema !== schema || cache.analyzer !== analyzer || cache.revision !== revision) {
      cache = { schema, analyzer, revision, entries: new WeakMap() };
      this.constituentAnalysisCache = cache;
    }

    const cached = cache.entries.get(cst);
    if (cached?.definition === definition && cached.cstType === cstType) {
      return cached.analysis;
    }

    const analysis = getAnalysisFor(definition, cstType, schema);
    // Diagnostics can depend on the current graph and are exposed to callers.
    if (analysis.success && analysis.ast && analysis.errors.length === 0) {
      cache.entries.set(cst, { definition, cstType, analysis });
    } else if (cached) {
      cache.entries.delete(cst);
    }
    return analysis;
  }
}

// ==== Internal functions ==== /

/** Evaluates an analyzed expression, including diagnostics from both stages. */
function evaluateAnalysis(parse: AnalysisFull, calculator: RSCalculator): CalculatorResult {
  if (!parse.success || !parse.ast) {
    return {
      value: null,
      iterations: 0,
      cacheHits: 0,
      errors: parse.errors
    };
  }
  const result = calculator.evaluateFull(parse.ast);
  return {
    value: result.value,
    iterations: result.iterations,
    cacheHits: result.cacheHits,
    errors: [...parse.errors, ...result.errors]
  };
}

function canonicalBasicIds(data: BasicBinding): number[] {
  const keys = Object.keys(data);
  const ids = createModelValueArray<number>(keys.length);
  for (let index = 0; index < keys.length; index++) {
    ids[index] = Number(keys[index]);
  }
  ids.sort((left, right) => left - right);
  return ids;
}

function cloneStoredValue(value: Value): Value {
  if (!Array.isArray(value)) {
    return value;
  }
  // Keep custom array mappers and species on the existing clone path.
  if (Object.getPrototypeOf(value) !== Array.prototype || Object.hasOwn(value, 'constructor')) {
    return cloneValue(value);
  }
  const map = value.map;
  if (map !== Array.prototype.map) {
    return Reflect.apply<Value[], [typeof cloneValue], Value[]>(map, value, [cloneValue]);
  }
  const copy = createModelValueArray(value.length);
  for (let index = 0; index < copy.length; index++) {
    if (index in value) {
      copy[index] = cloneStoredValue(value[index]);
    }
  }
  return copy;
}

function cloneValue(value: Value): Value {
  if (!Array.isArray(value)) {
    return value;
  }
  return value.map(cloneValue);
}

function snapshotValue(value: Value | null, budget: { remaining: number }, depth = 0): Value | null | undefined {
  if (budget.remaining-- <= 0 || depth > MAX_SNAPSHOT_DEPTH) {
    return undefined;
  }
  if (value === null) {
    return value;
  }
  if (typeof value === 'number') {
    // Recreating arrays separately can change comparisons of shared values that contain NaN.
    return Number.isNaN(value) ? undefined : value;
  }
  if (!Array.isArray(value) || value.length > budget.remaining) {
    return undefined;
  }
  const items: Value[] = [];
  for (const item of value) {
    const copy = snapshotValue(item, budget, depth + 1);
    if (copy === undefined || copy === null) {
      return undefined;
    }
    items.push(copy);
  }
  return items;
}

function sameValue(left: Value | null, right: Value | null): boolean {
  if (Object.is(left, right)) {
    return true;
  }
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
    return false;
  }
  for (let index = 0; index < left.length; index++) {
    if (!sameValue(left[index], right[index])) {
      return false;
    }
  }
  return true;
}
