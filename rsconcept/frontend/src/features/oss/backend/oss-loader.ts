/**
 * Module: OSS data loading and processing.
 */

import { type ILibraryItem } from '@/features/library';

import { Graph } from '@/models/graph';

import { type IBlock, type IOperation, type IOperationSchema, type IOperationSchemaStats } from '../models/oss';

import { type IOperationSchemaDTO, OperationType } from './types';

export const DEFAULT_BLOCK_WIDTH = 100;
export const DEFAULT_BLOCK_HEIGHT = 100;

/** Loads data into an {@link IOperationSchema} based on {@link IOperationSchemaDTO}. */
export class OssLoader {
  private oss: IOperationSchema;
  private graph: Graph = new Graph();
  private hierarchy: Graph = new Graph();
  private operationByID = new Map<number, IOperation>();
  private blockByID = new Map<number, IBlock>();
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
    this.inferBlockAttributes();

    result.operationByID = this.operationByID;
    result.blockByID = this.blockByID;
    result.graph = this.graph;
    result.hierarchy = this.hierarchy;
    result.schemas = this.schemaIDs;
    result.stats = this.calculateStats();
    return result;
  }

  private prepareLookups() {
    this.oss.operations.forEach(operation => {
      this.operationByID.set(operation.id, operation);
      this.graph.addNode(operation.id);
      this.hierarchy.addNode(operation.id);
      if (operation.parent) {
        this.hierarchy.addEdge(-operation.parent, operation.id);
      }
    });
    this.oss.blocks.forEach(block => {
      this.blockByID.set(block.id, block);
      this.hierarchy.addNode(-block.id);
      if (block.parent) {
        this.graph.addEdge(-block.parent, -block.id);
      }
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

  private inferBlockAttributes() {
    this.oss.blocks.forEach(block => {
      const geometry = this.oss.layout.blocks.find(item => item.id === block.id);
      block.x = geometry?.x ?? 0;
      block.y = geometry?.y ?? 0;
      block.width = geometry?.width ?? DEFAULT_BLOCK_WIDTH;
      block.height = geometry?.height ?? DEFAULT_BLOCK_HEIGHT;
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
    const operations = this.oss.operations;
    return {
      count_all: this.oss.operations.length + this.oss.blocks.length,
      count_inputs: operations.filter(item => item.operation_type === OperationType.INPUT).length,
      count_synthesis: operations.filter(item => item.operation_type === OperationType.SYNTHESIS).length,
      count_schemas: this.schemaIDs.length,
      count_owned: operations.filter(item => !!item.result && item.is_owned).length,
      count_block: this.oss.blocks.length
    };
  }
}
