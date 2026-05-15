/**
 * Module: Dependency metadata and per-run memoization for RSLang evaluation.
 */

import { type AstNode, getNodeIndices, getNodeText } from '@/utils/parsing';

import { TokenID } from '../parser/token';

import { type Value } from './value';

/** Static metadata for one AST node. */
export interface EvalNodeInfo {
  /** Local aliases this expression reads (for dependency stamping). */
  reads: ReadonlySet<string>;
  /** Stable key shared by structurally equivalent expressions. */
  structuralKey: string;
  /** Whether the node may be memoized for the current evaluation run. */
  cacheable: boolean;
}

/** Per-evaluator cache of immutable AST dependency metadata (no runtime values). */
export class EvaluationMetadata {
  private readonly byNode = new WeakMap<AstNode, EvalNodeInfo>();

  get(node: AstNode): EvalNodeInfo {
    let info = this.byNode.get(node);
    if (!info) {
      info = analyzeNode(node, new Set());
      this.byNode.set(node, info);
    }
    return info;
  }
}

/** Per-run memo of computed values (cleared on each {@link Evaluator.run}). */
export class EvaluationCache {
  private entries = new Map<string, CacheEntry>();

  /** Cache hits in the current evaluation run (for tests/diagnostics). */
  hits = 0;

  /** Returns cached value, or `undefined` on miss or stamp mismatch. */
  lookup(structuralKey: string, stamp: string): Value | undefined {
    const entry = this.entries.get(structuralKey);
    if (entry?.stamp !== stamp) {
      return undefined;
    }
    this.hits++;
    return entry.value;
  }

  /** Stores one value per structural key (replaces previous stamp). */
  store(structuralKey: string, stamp: string, value: Value): void {
    this.entries.set(structuralKey, { stamp, value });
  }

  clear(): void {
    this.entries.clear();
    this.hits = 0;
  }
}

interface CacheEntry {
  stamp: string;
  value: Value;
}

function analyzeNode(node: AstNode, bound: Set<string>): EvalNodeInfo {
  const reads = collectReads(node, bound);
  const structuralKey = buildStructuralKey(node);
  const cacheable = isCacheableNode(node);
  return { reads, structuralKey, cacheable };
}

function isCacheableNode(node: AstNode): boolean {
  switch (node.typeID) {
    case TokenID.ASSIGN:
    case TokenID.ITERATE:
    case TokenID.NT_IMPERATIVE_EXPR:
    case TokenID.NT_DECLARATIVE_EXPR:
    case TokenID.NT_RECURSIVE_FULL:
    case TokenID.NT_RECURSIVE_SHORT:
    case TokenID.QUANTOR_UNIVERSAL:
    case TokenID.QUANTOR_EXISTS:
    case TokenID.LOGIC_AND:
    case TokenID.LOGIC_OR:
    case TokenID.LOGIC_IMPLICATION:
    case TokenID.NT_FUNC_DEFINITION:
    case TokenID.LIT_INTEGER:
    case TokenID.LIT_EMPTYSET:
    case TokenID.LIT_WHOLE_NUMBERS:
    case TokenID.ID_LOCAL:
    case TokenID.ID_RADICAL:
    case TokenID.ID_GLOBAL:
      return false;
    default:
      return !node.hasError;
  }
}

function buildStructuralKey(node: AstNode): string {
  switch (node.typeID) {
    case TokenID.ID_GLOBAL:
    case TokenID.ID_LOCAL:
    case TokenID.ID_RADICAL:
    case TokenID.LIT_INTEGER:
    case TokenID.LIT_EMPTYSET:
    case TokenID.LIT_WHOLE_NUMBERS:
      return `${node.typeID}:${nodeTextKey(node)}`;

    case TokenID.NT_FUNC_CALL:
      return `${node.typeID}:${nodeTextKey(node.children[0])}(${node.children
        .slice(1)
        .map(buildStructuralKey)
        .join(',')})`;

    case TokenID.BIGPR:
    case TokenID.SMALLPR:
    case TokenID.FILTER:
      return `${node.typeID}:${indicesKey(node)}(${node.children.map(buildStructuralKey).join(',')})`;

    default:
      return `${node.typeID}(${node.children.map(buildStructuralKey).join(',')})`;
  }
}

function nodeTextKey(node: AstNode): string {
  if (node.data.dataType === 'number') {
    return String(node.data.value);
  }
  return getNodeText(node);
}

function indicesKey(node: AstNode): string {
  return getNodeIndices(node).join('.');
}

function collectReads(node: AstNode, bound: Set<string>): Set<string> {
  const reads = new Set<string>();
  collectReadsImpl(node, bound, reads);
  return reads;
}

function collectReadsImpl(node: AstNode, bound: Set<string>, reads: Set<string>): void {
  switch (node.typeID) {
    case TokenID.ID_LOCAL:
    case TokenID.ID_RADICAL: {
      reads.add(getNodeText(node));
      return;
    }

    case TokenID.QUANTOR_UNIVERSAL:
    case TokenID.QUANTOR_EXISTS: {
      collectReadsImpl(node.children[1], bound, reads);
      const innerBound = extendBound(bound, node.children[0]);
      collectReadsImpl(node.children[2], innerBound, reads);
      return;
    }

    case TokenID.NT_DECLARATIVE_EXPR: {
      collectReadsImpl(node.children[1], bound, reads);
      const innerBound = extendBound(bound, node.children[0]);
      collectReadsImpl(node.children[2], innerBound, reads);
      return;
    }

    case TokenID.ITERATE: {
      collectReadsImpl(node.children[1], bound, reads);
      return;
    }

    case TokenID.ASSIGN: {
      collectReadsImpl(node.children[1], bound, reads);
      return;
    }

    case TokenID.NT_IMPERATIVE_EXPR: {
      const innerBound = new Set(bound);
      collectReadsImpl(node.children[0], innerBound, reads);
      for (let i = 1; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.typeID === TokenID.ITERATE) {
          extendBoundInPlace(innerBound, child.children[0]);
          collectReadsImpl(child.children[1], innerBound, reads);
        } else if (child.typeID === TokenID.ASSIGN) {
          collectReadsImpl(child.children[1], innerBound, reads);
          extendBoundInPlace(innerBound, child.children[0]);
        } else {
          collectReadsImpl(child, innerBound, reads);
        }
      }
      return;
    }

    case TokenID.NT_RECURSIVE_FULL:
    case TokenID.NT_RECURSIVE_SHORT: {
      collectReadsImpl(node.children[1], bound, reads);
      const innerBound = extendBound(bound, node.children[0]);
      if (node.typeID === TokenID.NT_RECURSIVE_FULL) {
        collectReadsImpl(node.children[2], innerBound, reads);
        collectReadsImpl(node.children[3], innerBound, reads);
      } else {
        collectReadsImpl(node.children[2], innerBound, reads);
      }
      return;
    }

    case TokenID.NT_FUNC_DEFINITION: {
      const innerBound = extendBound(bound, node.children[0]);
      collectReadsImpl(node.children[1], innerBound, reads);
      return;
    }

    case TokenID.NT_FUNC_CALL: {
      for (let i = 1; i < node.children.length; i++) {
        collectReadsImpl(node.children[i], bound, reads);
      }
      return;
    }

    case TokenID.LOGIC_AND:
    case TokenID.LOGIC_OR:
    case TokenID.LOGIC_IMPLICATION: {
      collectReadsImpl(node.children[0], bound, reads);
      collectReadsImpl(node.children[1], bound, reads);
      return;
    }

    default:
      for (const child of node.children) {
        collectReadsImpl(child, bound, reads);
      }
  }
}

function extendBound(bound: Set<string>, declNode: AstNode): Set<string> {
  const next = new Set(bound);
  extendBoundInPlace(next, declNode);
  return next;
}

function extendBoundInPlace(bound: Set<string>, declNode: AstNode): void {
  switch (declNode.typeID) {
    case TokenID.ID_LOCAL:
    case TokenID.ID_RADICAL:
      bound.add(getNodeText(declNode));
      break;
    case TokenID.NT_TUPLE_DECL:
    case TokenID.NT_ENUM_DECL:
      for (const child of declNode.children) {
        extendBoundInPlace(bound, child);
      }
      break;
    case TokenID.NT_ARG_DECL:
      extendBoundInPlace(bound, declNode.children[0]);
      break;
  }
}
