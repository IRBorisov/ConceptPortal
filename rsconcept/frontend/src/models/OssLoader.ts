/**
 * Module: OSS data loading and processing.
 */

import { Graph } from './Graph';
import { ILibraryItem, LibraryItemID } from './library';
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
  private operationByID = new Map<OperationID, IOperation>();
  private schemaIDs: LibraryItemID[] = [];
  private items: ILibraryItem[];

  constructor(input: IOperationSchemaData, items: ILibraryItem[]) {
    this.oss = input;
    this.items = items;
  }

  produceOSS(): IOperationSchema {
    const result = this.oss as IOperationSchema;
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
    this.oss.items.forEach(operation => {
      this.operationByID.set(operation.id, operation as IOperation);
      this.graph.addNode(operation.id);
    });
  }

  private createGraph() {
    this.oss.arguments.forEach(argument => this.graph.addEdge(argument.argument, argument.operation));
  }

  private extractSchemas() {
    this.schemaIDs = this.oss.items.map(operation => operation.result).filter(item => item !== null);
  }

  private inferOperationAttributes() {
    this.graph.topologicalOrder().forEach(operationID => {
      const operation = this.operationByID.get(operationID)!;
      const schema = this.items.find(item => item.id === operation.result);
      operation.is_owned = !schema || (schema.owner === this.oss.owner && schema.location === this.oss.location);
      operation.substitutions = this.oss.substitutions.filter(item => item.operation === operationID);
      operation.arguments = this.oss.arguments
        .filter(item => item.operation === operationID)
        .map(item => item.argument);
    });
  }

  private calculateStats(): IOperationSchemaStats {
    const items = this.oss.items;
    return {
      count_operations: items.length,
      count_inputs: items.filter(item => item.operation_type === OperationType.INPUT).length,
      count_synthesis: items.filter(item => item.operation_type === OperationType.SYNTHESIS).length,
      count_schemas: this.schemaIDs.length
    };
  }
}
