/**
 * Module: OSS data loading and processing.
 */

import { Graph } from '@/models/graph';
import { type RO } from '@/utils/meta';

import {
  type Block,
  NodeType,
  type Operation,
  type OperationSchema,
  type OperationSchemaStats,
  type OssItem
} from '../models/oss';
import { constructNodeID } from '../models/oss-api';
import { BLOCK_NODE_MIN_HEIGHT, BLOCK_NODE_MIN_WIDTH } from '../pages/oss-page/editor-oss-graph/graph/block-node';

import { type OperationSchemaDTO, OperationType } from './types';

/** Loads data into an {@link OperationSchema} based on {@link OperationSchemaDTO}. */
export class OssLoader {
  private oss: OperationSchema;
  private graph: Graph = new Graph();
  private hierarchy: Graph<string> = new Graph<string>();
  private operationByID = new Map<number, Operation>();
  private itemByNodeID = new Map<string, OssItem>();
  private blockByID = new Map<number, Block>();
  private schemaIDs: number[] = [];
  private extendedGraph = new Graph();

  constructor(input: RO<OperationSchemaDTO>) {
    this.oss = structuredClone(input) as unknown as OperationSchema;
  }

  produceOSS(): OperationSchema {
    const result = this.oss;
    this.prepareLookups();
    this.createGraph();
    this.extractSchemas();
    this.inferOperationAttributes();
    this.inferBlockAttributes();

    result.operationByID = this.operationByID;
    result.blockByID = this.blockByID;
    result.itemByNodeID = this.itemByNodeID;
    result.graph = this.graph;
    result.hierarchy = this.hierarchy;
    result.schemas = this.schemaIDs;
    result.stats = this.calculateStats();
    result.extendedGraph = this.extendedGraph;
    return result;
  }

  private prepareLookups() {
    this.oss.operations.forEach(operation => {
      operation.nodeID = constructNodeID(NodeType.OPERATION, operation.id);
      operation.nodeType = NodeType.OPERATION;
      this.itemByNodeID.set(operation.nodeID, operation);
      this.operationByID.set(operation.id, operation);
      this.graph.addNode(operation.id);
      this.extendedGraph.addNode(operation.id);
      this.hierarchy.addNode(operation.nodeID);
      if (operation.parent) {
        this.hierarchy.addEdge(constructNodeID(NodeType.BLOCK, operation.parent), operation.nodeID);
      }
    });
    this.oss.blocks.forEach(block => {
      block.nodeID = constructNodeID(NodeType.BLOCK, block.id);
      block.nodeType = NodeType.BLOCK;
      this.itemByNodeID.set(block.nodeID, block);
      this.blockByID.set(block.id, block);
      this.hierarchy.addNode(block.nodeID);
      if (block.parent) {
        this.hierarchy.addEdge(constructNodeID(NodeType.BLOCK, block.parent), block.nodeID);
      }
    });
  }

  private createGraph() {
    this.oss.arguments.forEach(argument => {
      this.graph.addEdge(argument.argument, argument.operation);
      this.extendedGraph.addEdge(argument.argument, argument.operation);
    });
    this.oss.replicas.forEach(reference => {
      this.extendedGraph.addEdge(reference.original, reference.replica);
    });
  }

  private extractSchemas() {
    this.schemaIDs = this.oss.operations.map(operation => operation.result).filter(item => item !== null);
  }

  private inferOperationAttributes() {
    const referenceCounts = new Map<number, number>();

    this.graph.topologicalOrder().forEach(operationID => {
      const operation = this.operationByID.get(operationID)!;
      const position = this.oss.layout.find(item => item.nodeID === operation.nodeID);
      operation.x = position?.x ?? 0;
      operation.y = position?.y ?? 0;
      switch (operation.operation_type) {
        case OperationType.INPUT:
          break;
        case OperationType.SYNTHESIS:
          operation.is_consolidation = this.inferConsolidation(operationID);
          operation.substitutions = this.oss.substitutions.filter(item => item.operation === operationID);
          operation.arguments = this.oss.arguments
            .filter(item => item.operation === operationID)
            .map(item => item.argument);
          break;
        case OperationType.REPLICA:
          const replication = this.oss.replicas.find(item => item.replica === operationID);
          const original = !!replication ? this.operationByID.get(replication.original) : null;
          if (!original || !replication) {
            throw new Error(`Replica ${operationID} not found`);
          }
          const refCount = (referenceCounts.get(original.id) ?? 0) + 1;
          referenceCounts.set(original.id, refCount);
          operation.target = replication.original;
          operation.alias = `[${refCount}] ${original.alias}`;
          operation.title = original.title;
          operation.description = original.description;
          break;
      }
    });
  }

  private inferBlockAttributes() {
    this.oss.blocks.forEach(block => {
      const geometry = this.oss.layout.find(item => item.nodeID === block.nodeID);
      block.x = geometry?.x ?? 0;
      block.y = geometry?.y ?? 0;
      block.width = geometry?.width ?? BLOCK_NODE_MIN_WIDTH;
      block.height = geometry?.height ?? BLOCK_NODE_MIN_HEIGHT;
    });
  }

  private inferConsolidation(operationID: number): boolean {
    const inputs = this.extendedGraph.expandInputs([operationID]);
    if (inputs.length === 0) {
      return false;
    }
    const ancestors = [...inputs];
    inputs.forEach(input => {
      ancestors.push(...this.extendedGraph.expandAllInputs([input]));
    });
    const unique = new Set(ancestors);
    return unique.size < ancestors.length;
  }

  private calculateStats(): OperationSchemaStats {
    const operations = this.oss.operations;
    return {
      count_all: this.oss.operations.length + this.oss.blocks.length,
      count_inputs: operations.filter(item => item.operation_type === OperationType.INPUT).length,
      count_synthesis: operations.filter(item => item.operation_type === OperationType.SYNTHESIS).length,
      count_schemas: this.schemaIDs.length,
      count_owned: operations.filter(
        item => !!item.result && (item.operation_type !== OperationType.INPUT || !item.is_import)
      ).length,
      count_block: this.oss.blocks.length,
      count_references: this.oss.replicas.length
    };
  }
}
