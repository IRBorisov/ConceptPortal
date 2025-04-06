/**
 * Module: OSS data loading and processing.
 */

import { type ILibraryItem } from '@/features/library';

import { Graph } from '@/models/graph';

import { type IOperation, type IOperationSchema, type IOperationSchemaStats } from '../models/oss';

import { type IOperationSchemaDTO, OperationType } from './types';

/**
 * Loads data into an {@link IOperationSchema} based on {@link IOperationSchemaDTO}.
 *
 */
export class OssLoader {
  private oss: IOperationSchema;
  private graph: Graph = new Graph();
  private operationByID = new Map<number, IOperation>();
  private schemaIDs: number[] = [];
  private items: ILibraryItem[];

  constructor(input: IOperationSchemaDTO, items: ILibraryItem[]) {
    this.oss = input as unknown as IOperationSchema;
    this.items = items;
  }

  produceOSS(): IOperationSchema {
    const result = this.oss;
    this.prepareLookups();
    this.createGraph();
    this.extractSchemas();
    this.inferOperationAttributes();

    result.operationByID = this.operationByID;
    result.graph = this.graph;
    result.schemas = this.schemaIDs;
    result.stats = this.calculateStats();
    return result;
  }

  private prepareLookups() {
    this.oss.operations.forEach(operation => {
      this.operationByID.set(operation.id, operation);
      this.graph.addNode(operation.id);
    });
  }

  private createGraph() {
    this.oss.arguments.forEach(argument => this.graph.addEdge(argument.argument, argument.operation));
  }

  private extractSchemas() {
    this.schemaIDs = this.oss.operations.map(operation => operation.result).filter(item => item !== null);
  }

  private inferOperationAttributes() {
    this.graph.topologicalOrder().forEach(operationID => {
      const operation = this.operationByID.get(operationID)!;
      const schema = this.items.find(item => item.id === operation.result);
      const position = this.oss.layout.operations.find(item => item.id === operationID);
      operation.x = position?.x ?? 0;
      operation.y = position?.y ?? 0;
      operation.is_consolidation = this.inferConsolidation(operationID);
      operation.is_owned = !schema || (schema.owner === this.oss.owner && schema.location === this.oss.location);
      operation.substitutions = this.oss.substitutions.filter(item => item.operation === operationID);
      operation.arguments = this.oss.arguments
        .filter(item => item.operation === operationID)
        .map(item => item.argument);
    });
  }

  private inferConsolidation(operationID: number): boolean {
    const inputs = this.graph.expandInputs([operationID]);
    if (inputs.length === 0) {
      return false;
    }
    const ancestors = [...inputs];
    inputs.forEach(input => {
      ancestors.push(...this.graph.expandAllInputs([input]));
    });
    const unique = new Set(ancestors);
    return unique.size < ancestors.length;
  }

  private calculateStats(): IOperationSchemaStats {
    const items = this.oss.operations;
    return {
      count_operations: items.length,
      count_inputs: items.filter(item => item.operation_type === OperationType.INPUT).length,
      count_synthesis: items.filter(item => item.operation_type === OperationType.SYNTHESIS).length,
      count_schemas: this.schemaIDs.length,
      count_owned: items.filter(item => !!item.result && item.is_owned).length
    };
  }
}
