/**
 * Module: Multi-graph for typifications.
 */

import { TypeID, type Typification } from '@/features/rslang';
import { labelType } from '@/features/rslang/labels';
import {
  bool,
  type EchelonCollection,
  type EchelonTuple,
  type ExpressionType,
  tuple
} from '@/features/rslang/semantic/typification';

/** Represents a single node of a {@link TypificationGraph}. */
export interface TypificationNodeData extends Record<string, unknown> {
  id: number;
  rank: number;
  text: string;
  parents: number[];
  annotations: string[];
}

/** Represents a typification multi-graph. */
export class TypificationGraph {
  /** List of nodes. */
  nodes: TypificationNodeData[] = [];
  /** Map of nodes by ID. */
  nodeById = new Map<number, TypificationNodeData>();
  /** Map of nodes by alias. */
  nodeByAlias = new Map<string, TypificationNodeData>();

  /** Adds an element to the graph. */
  addElement(alias: string, type: ExpressionType): void {
    const node = this.processType(type);
    if (!node) {
      return;
    }
    this.addAliasAnnotation(node.id, alias);
  }

  private processType(type: ExpressionType): TypificationNodeData | null {
    switch (type.typeID) {
      case TypeID.logic:
        return null;

      case TypeID.anyTypification:
      case TypeID.integer:
      case TypeID.basic:
        return this.addBaseNode(type);

      case TypeID.collection: return this.addBooleanNode(type);
      case TypeID.tuple: return this.addCartesianNode(type);

      case TypeID.function:
      case TypeID.predicate:
        const combined = convertFunctionToTypification(type);
        if (!combined) {
          return null;
        }
        return this.processType(combined);
    }
  }

  private addBaseNode(type: Typification): TypificationNodeData {
    const text = labelType(type);
    const existingNode = this.nodes.find(node => node.text === text);
    if (existingNode) {
      return existingNode;
    }

    const node: TypificationNodeData = {
      id: this.nodes.length,
      text: text,
      rank: 0,
      parents: [],
      annotations: []
    };
    this.nodes.push(node);
    this.nodeById.set(node.id, node);
    return node;
  }

  private addBooleanNode(type: EchelonCollection): TypificationNodeData | null {
    const baseNode = this.processType(type.base);
    if (!baseNode) {
      return null;
    }

    const existingNode = this.nodes.find(node => node.parents.length === 1 && node.parents[0] === baseNode.id);
    if (existingNode) {
      return existingNode;
    }

    const node: TypificationNodeData = {
      id: this.nodes.length,
      rank: baseNode.rank + 1,
      text: labelType(type),
      parents: [baseNode.id],
      annotations: []
    };
    this.nodes.push(node);
    this.nodeById.set(node.id, node);
    return node;
  }

  private addCartesianNode(type: EchelonTuple): TypificationNodeData | null {
    const factors = type.factors.map(factor => this.processType(factor)).filter(factor => factor !== null);
    if (factors.length !== type.factors.length) {
      return null;
    }

    const existingNode = this.nodes.find(
      node => node.parents.length === factors.length && node.parents.every((p, i) => p === factors[i].id)
    );
    if (existingNode) {
      return existingNode;
    }

    const node: TypificationNodeData = {
      id: this.nodes.length,
      text: labelType(type),
      rank: Math.max(...factors.map(factor => factor.rank)) + 1,
      parents: factors.map(factor => factor.id),
      annotations: []
    };
    this.nodes.push(node);
    this.nodeById.set(node.id, node);
    return node;
  }

  private addAliasAnnotation(node: number, alias: string): void {
    const nodeToAnnotate = this.nodeById.get(node);
    if (!nodeToAnnotate) {
      throw new Error(`Node ${node} not found`);
    }
    nodeToAnnotate.annotations.push(alias);
    this.nodeByAlias.set(alias, nodeToAnnotate);
  }
}

function convertFunctionToTypification(type: ExpressionType): Typification | null {
  if (!('args' in type) || type.args.length === 0) {
    return null;
  }
  const args = type.args.length === 1 ? type.args[0].type : tuple(type.args.map(arg => arg.type));
  if (type.result.typeID === TypeID.logic) {
    return bool(args);
  } else {
    return bool(tuple([type.result, args]));
  }
}