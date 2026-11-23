import { Graph } from '../../graph';
import { type AstNode, getNodeIndices } from '../../parsing';
import { TokenID } from '../parser/token';

import { isModelValueArray } from './model-value-arrays';
import { TUPLE_ID, type Value, VALUE_FALSE, VALUE_TRUE, type ValueContext } from './value';

interface RelationImage {
  relation: string;
  source: number;
  target: number;
  calls: number;
}

interface IterationBudget {
  limit: number;
  call: number;
  recursion: number;
  quantifier: number;
}

/** For a universal no-return assertion, decide positive reachability by strongly connected components. */
export function tryEvaluateNoReturn(
  node: AstNode,
  values: ValueContext,
  functions: ReadonlyMap<string, AstNode>,
  budget: IterationBudget
): number | null {
  if (!hasShape(node, TokenID.QUANTOR_UNIVERSAL, 3)) {
    return null;
  }
  const [variable, domainNode, predicate] = node.children;
  const root = identifier(variable, TokenID.ID_LOCAL);
  const domainAlias = identifier(domainNode, TokenID.ID_GLOBAL);
  if (root === null || domainAlias === null || !hasShape(predicate, TokenID.SET_NOT_IN, 2)) {
    return null;
  }
  if (!isLocal(predicate.children[0], root)) {
    return null;
  }
  const closure = unaryFunction(predicate.children[1], root, functions);
  if (!hasShape(closure?.body, TokenID.NT_RECURSIVE_SHORT, 3)) {
    return null;
  }
  const [declaration, initial, body] = closure.body.children;
  const accumulated = identifier(declaration, TokenID.ID_LOCAL);
  if (accumulated === null || !hasShape(body, TokenID.SET_UNION, 2)) {
    return null;
  }
  let successor = body.children[1];
  if (!isLocal(body.children[0], accumulated)) {
    if (!isLocal(body.children[1], accumulated)) {
      return null;
    }
    successor = body.children[0];
  }
  const seed = relationImage(initial, closure.parameter, true, functions);
  const step = relationImage(successor, accumulated, false, functions);
  if (!seed || seed.relation !== step?.relation || seed.source !== step.source || seed.target !== step.target) {
    return null;
  }

  const domain = values.get(domainAlias);
  if (!isModelValueArray(domain)) {
    return null;
  }
  if (domain.length === 0) {
    return VALUE_TRUE;
  }

  // Each nonterminal step adds a distinct vertex, and the final step checks stability.
  // Bound the interpreter's work before allocating a graph beyond its iteration limit.
  const ticksPerInvocation = (1 + seed.calls) * budget.call + budget.quantifier;
  const ticksPerStep = budget.recursion + step.calls * budget.call;
  const maxSteps = Math.floor((Math.floor(budget.limit / domain.length) - ticksPerInvocation) / ticksPerStep);
  if (maxSteps < 1) {
    return null;
  }

  const roots = new Set<number>();
  for (let index = 0; index < domain.length; index++) {
    const value = ownElement(domain, index);
    if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
      return null;
    }
    roots.add(value);
  }
  const relation = values.get(seed.relation);
  if (
    !isModelValueArray(relation) ||
    Object.getPrototypeOf(relation) !== Array.prototype ||
    Object.hasOwn(relation, Symbol.iterator)
  ) {
    return null;
  }
  const graph = new Graph<number>();
  for (let index = 0; index < relation.length; index++) {
    const row = ownElement(relation, index);
    if (!isModelValueArray(row) || ownElement(row, 0) !== TUPLE_ID) {
      return null;
    }
    const from = ownElement(row, seed.source);
    const to = ownElement(row, seed.target);
    if (
      typeof from !== 'number' ||
      typeof to !== 'number' ||
      !Number.isSafeInteger(from) ||
      !Number.isSafeInteger(to)
    ) {
      return null;
    }
    // Repeated edges do not change SCC membership. Append without scanning earlier edges.
    graph.addNode(from).addOutput(to);
    graph.addNode(to).addInput(from);
    if (graph.nodes.size >= maxSteps) {
      return null;
    }
  }

  for (const component of graph.stronglyConnectedComponents()) {
    const cyclic = component.length > 1 || graph.hasEdge(component[0], component[0]);
    if (cyclic && component.some(vertex => roots.has(vertex))) {
      return VALUE_FALSE;
    }
  }
  return VALUE_TRUE;
}

function hasShape(node: AstNode | undefined, token: TokenID, arity: number): node is AstNode {
  return node?.typeID === token && !node.hasError && node.children.length === arity;
}

function identifier(node: AstNode | undefined, token: TokenID): string | null {
  return hasShape(node, token, 0) && node.data.dataType === 'string' && typeof node.data.value === 'string'
    ? node.data.value
    : null;
}

function isLocal(node: AstNode | undefined, alias: string): boolean {
  return identifier(node, TokenID.ID_LOCAL) === alias;
}

/** Leave holes and accessors to the interpreter so its original read order is preserved. */
function ownElement(array: Value[], index: number): Value | undefined {
  return Object.getOwnPropertyDescriptor(array, index)?.value as Value | undefined;
}

function unaryFunction(node: AstNode | undefined, input: string, functions: ReadonlyMap<string, AstNode>) {
  if (!hasShape(node, TokenID.NT_FUNC_CALL, 2) || !isLocal(node.children[1], input)) {
    return null;
  }
  const alias = identifier(node.children[0], TokenID.ID_FUNCTION);
  const definition = alias === null ? undefined : functions.get(alias);
  if (!hasShape(definition, TokenID.NT_FUNC_DEFINITION, 2)) {
    return null;
  }
  const [argumentsNode, body] = definition.children;
  if (!hasShape(argumentsNode, TokenID.NT_ARGUMENTS, 1)) {
    return null;
  }
  const declaration = argumentsNode.children[0];
  if (!hasShape(declaration, TokenID.NT_ARG_DECL, 2)) {
    return null;
  }
  const parameter = identifier(declaration.children[0], TokenID.ID_LOCAL);
  return parameter === null ? null : { parameter, body };
}

/** Recognize a unary projection of one filtered column, inline or in a unary function. */
function relationImage(
  node: AstNode | undefined,
  input: string,
  singleton: boolean,
  functions: ReadonlyMap<string, AstNode>
): RelationImage | null {
  const wrapper = unaryFunction(node, input, functions);
  const projection = wrapper?.body ?? node;
  const parameter = wrapper?.parameter ?? input;
  if (!hasShape(projection, TokenID.BIGPR, 1)) {
    return null;
  }
  const filter = projection.children[0];
  if (!hasShape(filter, TokenID.FILTER, 2)) {
    return null;
  }
  const [keys, relationNode] = filter.children;
  const relation = identifier(relationNode, TokenID.ID_GLOBAL);
  const from = getNodeIndices(filter);
  const to = getNodeIndices(projection);
  if (relation === null || from.length !== 1 || to.length !== 1 || from[0] < 1 || to[0] < 1) {
    return null;
  }
  const match = singleton
    ? hasShape(keys, TokenID.NT_ENUMERATION, 1) && isLocal(keys.children[0], parameter)
    : isLocal(keys, parameter);
  return match ? { relation, source: from[0], target: to[0], calls: wrapper ? 1 : 0 } : null;
}
