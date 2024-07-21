/**
 * Module: OSS data loading and processing.
 */

import { Graph } from './Graph';
import { IOperation, IOperationSchema, IOperationSchemaData, OperationID } from './oss';

/**
 * Loads data into an {@link IOperationSchema} based on {@link IOperationSchemaData}.
 *
 */
export class OssLoader {
  private oss: IOperationSchemaData;
  private graph: Graph = new Graph();
  private operationByID: Map<OperationID, IOperation> = new Map();

  constructor(input: IOperationSchemaData) {
    this.oss = input;
  }

  produceOSS(): IOperationSchema {
    const result = this.oss as IOperationSchema;
    this.prepareLookups();
    this.createGraph();

    result.operationByID = this.operationByID;
    result.graph = this.graph;
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
}
