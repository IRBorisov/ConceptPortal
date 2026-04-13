/**
 * Domain helpers: extract an expression subtree into a new constituenta definition
 * and replace the subtree with a call / alias reference.
 */

import { CstType, type RSForm } from '@/domain/library/rsform';
import { generateAlias } from '@/domain/library/rsform-api';
import { rslangParser, TokenID, TypeClass } from '@/domain/rslang';
import { getTypeClass } from '@/domain/rslang/semantic/typification-api';

import { buildTree, type FlatAST, type FlatAstNode, flattenAst } from '@/utils/parsing';

/** Flat AST with type/error annotations (same pipeline as formula editor). */
export function flatAstFromAnnotatedExpression(expression: string, schema: RSForm): FlatAST {
  const parse = schema.analyzer.checkFull(expression, { annotateTypes: true, annotateErrors: true });
  if (parse.ast) {
    return flattenAst(parse.ast);
  }
  const tree = rslangParser.parse(expression);
  return flattenAst(buildTree(tree.cursor()));
}

export interface SubtreeExtractionPlan {
  alias: string;
  cst_type: CstType;
  definition_formal: string;
  definition_raw: string;
  replaceFrom: number;
  replaceTo: number;
  paramOriginals: string[];
}

/**
 * Builds creation payload and splice range for replacing a selected subtree.
 * Returns null if the selection is invalid (e.g. root node).
 */
export function buildSubtreeExtractionPlan(
  expression: string,
  syntaxTree: FlatAST,
  selectedUid: number,
  schema: RSForm
): SubtreeExtractionPlan | null {
  const selectedNode = syntaxTree.find(node => node.uid === selectedUid);
  if (!selectedNode || selectedNode.parent === selectedNode.uid) {
    return null;
  }
  const subtreeExpression = expression.slice(selectedNode.from, selectedNode.to);
  if (!subtreeExpression.trim()) {
    return null;
  }

  const params = collectExternalParameters(selectedNode, syntaxTree, expression);
  const templated = mapToTemplate(subtreeExpression, params);
  const cstType = inferCstTypeForSubtree(templated, params.length > 0, schema);
  const alias = generateAlias(cstType, schema);

  return {
    alias,
    cst_type: cstType,
    definition_formal: templated,
    definition_raw: templated,
    replaceFrom: selectedNode.from,
    replaceTo: selectedNode.to,
    paramOriginals: params.map(p => p.original)
  };
}

/** Build call text after server returns the definitive alias. */
export function buildSubtreeReplacementCall(createdAlias: string, paramOriginals: readonly string[]): string {
  if (paramOriginals.length === 0) {
    return createdAlias;
  }
  return `${createdAlias}[${paramOriginals.join(',')}]`;
}

export function replaceExpressionRange(expression: string, from: number, to: number, insert: string): string {
  return expression.slice(0, from) + insert + expression.slice(to);
}

function mapToTemplate(expression: string, params: readonly { original: string; placeholder: string }[]): string {
  let result = expression;
  for (const item of params) {
    const pattern = new RegExp(`\\b${escapeRegExp(item.original)}\\b`, 'g');
    result = result.replaceAll(pattern, item.placeholder);
  }
  return result;
}

function collectExternalParameters(
  selectedNode: FlatAstNode,
  syntaxTree: FlatAST,
  expression: string
): { original: string; placeholder: string }[] {
  const names: string[] = [];
  for (const node of syntaxTree) {
    if (node.typeID !== TokenID.ID_LOCAL) {
      continue;
    }
    if (node.from < selectedNode.from || node.to > selectedNode.to) {
      continue;
    }
    const value = expression.slice(node.from, node.to).trim();
    if (!value || names.includes(value)) {
      continue;
    }
    names.push(value);
  }
  return names.map((name, index) => ({ original: name, placeholder: `R${index + 1}` }));
}

function inferCstTypeForSubtree(expression: string, hasExternalParameters: boolean, schema: RSForm): CstType {
  const result = schema.analyzer.checkFast(expression);
  if (result.success && result.type) {
    const typeClass = getTypeClass(result.type.typeID);
    if (typeClass === TypeClass.logic) {
      return hasExternalParameters ? CstType.PREDICATE : CstType.AXIOM;
    }
    return hasExternalParameters ? CstType.FUNCTION : CstType.TERM;
  }
  return hasExternalParameters ? CstType.FUNCTION : CstType.TERM;
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
