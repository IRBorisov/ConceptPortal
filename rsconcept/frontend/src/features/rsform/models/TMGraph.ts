/**
 * Module: Multi-graph for typifications.
 */

import { PARAMETER } from '@/utils/constants';

import { IArgumentInfo } from './rslang';

/**
 * Represents a single node of a {@link TMGraph}.
 */
export interface TMGraphNode {
  id: number;
  rank: number;
  text: string;
  parents: number[];
  annotations: string[];
}

/**
 * Represents a typification multi-graph.
 */
export class TMGraph {
  /** List of nodes. */
  nodes: TMGraphNode[] = [];
  /** Map of nodes by ID. */
  nodeById = new Map<number, TMGraphNode>();
  /** Map of nodes by alias. */
  nodeByAlias = new Map<string, TMGraphNode>();

  /**
   * Adds a constituent to the graph.
   *
   * @param alias - The alias of the constituent.
   * @param result - typification of the formal definition.
   * @param args - arguments for term or predicate function.
   */
  addConstituenta(alias: string, result: string, args: IArgumentInfo[]): void {
    const argsNode = this.processArguments(args);
    const resultNode = this.processResult(result);
    const combinedNode = this.combineResults(resultNode, argsNode);
    if (!combinedNode) {
      return;
    }
    this.addAliasAnnotation(combinedNode.id, alias);
  }

  addBaseNode(baseAlias: string): TMGraphNode {
    const existingNode = this.nodes.find(node => node.text === baseAlias);
    if (existingNode) {
      return existingNode;
    }

    const node: TMGraphNode = {
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

  addBooleanNode(parent: number): TMGraphNode {
    const existingNode = this.nodes.find(node => node.parents.length === 1 && node.parents[0] === parent);
    if (existingNode) {
      return existingNode;
    }

    const parentNode = this.nodeById.get(parent);
    if (!parentNode) {
      throw new Error(`Parent node ${parent} not found`);
    }

    const text = parentNode.parents.length === 1 ? `ℬ${parentNode.text}` : `ℬ(${parentNode.text})`;
    const node: TMGraphNode = {
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

  addCartesianNode(parents: number[]): TMGraphNode {
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
    const node: TMGraphNode = {
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

  private processArguments(args: IArgumentInfo[]): TMGraphNode | null {
    if (args.length === 0) {
      return null;
    }
    const argsNodes = args.map(argument => this.parseToNode(argument.typification));
    if (args.length === 1) {
      return argsNodes[0];
    }
    return this.addCartesianNode(argsNodes.map(node => node.id));
  }

  private processResult(result: string): TMGraphNode | null {
    if (!result || result === PARAMETER.logicLabel) {
      return null;
    }
    return this.parseToNode(result);
  }

  private combineResults(result: TMGraphNode | null, args: TMGraphNode | null): TMGraphNode | null {
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

  private parseToNode(typification: string): TMGraphNode {
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

  private parseTokens(tokens: string[], isBoolean: boolean = false): TMGraphNode {
    const stack: TMGraphNode[] = [];
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
