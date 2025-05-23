/**
 * Module: Multi-graph for typifications.
 */

import { PARAMETER } from '@/utils/constants';
import { type RO } from '@/utils/meta';

import { type IArgumentInfo } from './rslang';

/**
 * Represents a single node of a {@link TypificationGraph}.
 */
export interface TypificationGraphNode {
  id: number;
  rank: number;
  text: string;
  parents: number[];
  annotations: string[];
}

/**
 * Represents a typification multi-graph.
 */
export class TypificationGraph {
  /** List of nodes. */
  nodes: TypificationGraphNode[] = [];
  /** Map of nodes by ID. */
  nodeById = new Map<number, TypificationGraphNode>();
  /** Map of nodes by alias. */
  nodeByAlias = new Map<string, TypificationGraphNode>();

  /**
   * Adds a constituent to the graph.
   *
   * @param alias - The alias of the constituent.
   * @param result - typification of the formal definition.
   * @param args - arguments for term or predicate function.
   */
  addConstituenta(alias: string, result: string, args: RO<IArgumentInfo[]>): void {
    const argsNode = this.processArguments(args);
    const resultNode = this.processResult(result);
    const combinedNode = this.combineResults(resultNode, argsNode);
    if (!combinedNode) {
      return;
    }
    this.addAliasAnnotation(combinedNode.id, alias);
  }

  addBaseNode(baseAlias: string): TypificationGraphNode {
    const existingNode = this.nodes.find(node => node.text === baseAlias);
    if (existingNode) {
      return existingNode;
    }

    const node: TypificationGraphNode = {
      id: this.nodes.length,
      text: baseAlias,
      rank: 0,
      parents: [],
      annotations: []
    };
    this.nodes.push(node);
    this.nodeById.set(node.id, node);
    return node;
  }

  addBooleanNode(parent: number): TypificationGraphNode {
    const existingNode = this.nodes.find(node => node.parents.length === 1 && node.parents[0] === parent);
    if (existingNode) {
      return existingNode;
    }

    const parentNode = this.nodeById.get(parent);
    if (!parentNode) {
      throw new Error(`Parent node ${parent} not found`);
    }

    const text = parentNode.parents.length === 1 ? `ℬ${parentNode.text}` : `ℬ(${parentNode.text})`;
    const node: TypificationGraphNode = {
      id: this.nodes.length,
      rank: parentNode.rank + 1,
      text: text,
      parents: [parent],
      annotations: []
    };
    this.nodes.push(node);
    this.nodeById.set(node.id, node);
    return node;
  }

  addCartesianNode(parents: number[]): TypificationGraphNode {
    const existingNode = this.nodes.find(
      node => node.parents.length === parents.length && node.parents.every((p, i) => p === parents[i])
    );
    if (existingNode) {
      return existingNode;
    }

    const parentNodes = parents.map(parent => this.nodeById.get(parent));
    if (parentNodes.some(parent => !parent) || parents.length < 2) {
      throw new Error(`Parent nodes ${parents.join(', ')} not found`);
    }

    const text = parentNodes.map(node => (node!.parents.length > 1 ? `(${node!.text})` : node!.text)).join('×');
    const node: TypificationGraphNode = {
      id: this.nodes.length,
      text: text,
      rank: Math.max(...parentNodes.map(parent => parent!.rank)) + 1,
      parents: parents,
      annotations: []
    };
    this.nodes.push(node);
    this.nodeById.set(node.id, node);
    return node;
  }

  addAliasAnnotation(node: number, alias: string): void {
    const nodeToAnnotate = this.nodeById.get(node);
    if (!nodeToAnnotate) {
      throw new Error(`Node ${node} not found`);
    }
    nodeToAnnotate.annotations.push(alias);
    this.nodeByAlias.set(alias, nodeToAnnotate);
  }

  private processArguments(args: RO<IArgumentInfo[]>): TypificationGraphNode | null {
    if (args.length === 0) {
      return null;
    }
    const argsNodes = args.map(argument => this.parseToNode(argument.typification));
    if (args.length === 1) {
      return argsNodes[0];
    }
    return this.addCartesianNode(argsNodes.map(node => node.id));
  }

  private processResult(result: string): TypificationGraphNode | null {
    if (!result || result === PARAMETER.logicLabel) {
      return null;
    }
    return this.parseToNode(result);
  }

  private combineResults(
    result: TypificationGraphNode | null,
    args: TypificationGraphNode | null
  ): TypificationGraphNode | null {
    if (!result && !args) {
      return null;
    }
    if (!result) {
      return this.addBooleanNode(args!.id);
    }
    if (!args) {
      return result;
    }
    const argsAndResult = this.addCartesianNode([args.id, result.id]);
    return this.addBooleanNode(argsAndResult.id);
  }

  private parseToNode(typification: string): TypificationGraphNode {
    const tokens = this.tokenize(typification);
    return this.parseTokens(tokens);
  }

  private tokenize(expression: string): string[] {
    const tokens = [];
    let currentToken = '';
    for (const char of expression) {
      if (['(', ')', '×', 'ℬ'].includes(char)) {
        if (currentToken) {
          tokens.push(currentToken);
          currentToken = '';
        }
        tokens.push(char);
      } else {
        currentToken += char;
      }
    }
    if (currentToken) {
      tokens.push(currentToken);
    }
    return tokens;
  }

  private parseTokens(tokens: string[], isBoolean: boolean = false): TypificationGraphNode {
    const stack: TypificationGraphNode[] = [];
    let isCartesian = false;
    while (tokens.length > 0) {
      const token = tokens.shift();
      if (!token) {
        throw new Error('Unexpected end of expression');
      }

      if (isBoolean && token === '(') {
        return this.parseTokens(tokens);
      }

      if (token === ')') {
        break;
      } else if (token === 'ℬ') {
        const innerNode = this.parseTokens(tokens, true);
        stack.push(this.addBooleanNode(innerNode.id));
      } else if (token === '×') {
        isCartesian = true;
      } else if (token === '(') {
        stack.push(this.parseTokens(tokens));
      } else {
        stack.push(this.addBaseNode(token));
      }
    }

    if (isCartesian) {
      return this.addCartesianNode(stack.map(node => node.id));
    } else {
      return stack.pop()!;
    }
  }
}
