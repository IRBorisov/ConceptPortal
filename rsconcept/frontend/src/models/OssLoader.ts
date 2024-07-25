/**
 * Module: OSS data loading and processing.
 */

import { Graph } from './Graph';
import { LibraryItemID } from './library';
import {
  IOperation,
  IOperationSchema,
  IOperationSchemaData,
  IOperationSchemaStats,
  OperationID,
  OperationType
} from './oss';

/**
 * Loads data into an {@link IOperationSchema} based on {@link IOperationSchemaData}.
 *
 */
export class OssLoader {
  private oss: IOperationSchemaData;
  private graph: Graph = new Graph();
  private operationByID: Map<OperationID, IOperation> = new Map();
  private schemas: LibraryItemID[] = [];

  constructor(input: IOperationSchemaData) {
    this.oss = input;
  }

  produceOSS(): IOperationSchema {
    const result = this.oss as IOperationSchema;
    this.prepareLookups();
    this.createGraph();
    this.extractSchemas();

    result.operationByID = this.operationByID;
    result.graph = this.graph;
    result.schemas = this.schemas;
    result.stats = this.calculateStats();
    return result;
  }

  private prepareLookups() {
    this.oss.items.forEach(operation => {
      this.operationByID.set(operation.id, operation);
      this.graph.addNode(operation.id);
    });
  }

  private createGraph() {
    this.oss.arguments.forEach(argument => this.graph.addEdge(argument.argument, argument.operation));
  }

  private extractSchemas() {
    this.schemas = this.oss.items.map(operation => operation.result as LibraryItemID).filter(item => item !== null);
  }

  private calculateStats(): IOperationSchemaStats {
    const items = this.oss.items;
    return {
      count_operations: items.length,
      count_inputs: items.filter(item => item.operation_type === OperationType.INPUT).length,
      count_synthesis: items.filter(item => item.operation_type === OperationType.SYNTHESIS).length,
      count_schemas: this.schemas.length
    };
  }
}
