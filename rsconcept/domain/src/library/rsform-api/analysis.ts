/**
 * Formal expression analysis against an RSForm schema.
 */

import { type Graph } from '../../graph';
import { type AnalysisFull, RSErrorCode, ValueClass } from '../../rslang';
import { extractGlobals } from '../../rslang/api';
import { basic, bool, constant } from '../../rslang/semantic/typification';
import { formatDependencyCycle, RSDiagnosticCode } from '../diagnostics';
import { CstType, type RSForm } from '../rsform';

import { canHaveFormalDefinition, typeClassForCstType } from './cst-type';

export function getAnalysisFor(expression: string, cstType: CstType, schema: RSForm, alias?: string): AnalysisFull {
  if (!canHaveFormalDefinition(cstType)) {
    if (expression.trim().length === 0) {
      const fallbackAlias = alias && alias.length > 0 ? alias : 'X0';
      const type = cstType === CstType.BASE ? bool(basic(fallbackAlias)) : bool(constant(fallbackAlias));
      return {
        success: true,
        type,
        valueClass: ValueClass.VALUE,
        errors: [],
        ast: null
      };
    }
    return {
      success: false,
      type: null,
      valueClass: null,
      errors: [
        {
          code: RSErrorCode.definitionNotAllowed,
          from: 0,
          to: Math.max(expression.length, 1),
          params: [cstType, alias ?? '']
        }
      ],
      ast: null
    };
  }
  const analysis = schema.analyzer.checkFull(expression, {
    expected: typeClassForCstType(cstType),
    isDomain: cstType === CstType.STRUCTURED
  });
  return refineAnalysisForDependencyCycles(analysis, expression, schema, alias);
}

/**
 * When an untyped / bare F·P reference names a constituent on a definition cycle with the
 * current expression, replace that error with {@link RSDiagnosticCode.schemaDependencyCycle}.
 *
 * Covers both semantic `globalNotTyped` (e.g. `F3[σ]`) and parser `globalFuncWithoutArgs`
 * (bare `P1` / `F1` treated as a call without arguments).
 *
 * Uses a draft dependency graph: incoming edges of the edited constituent are taken from
 * `expression`, so Check works before Save.
 */
export function refineAnalysisForDependencyCycles(
  analysis: AnalysisFull,
  expression: string,
  schema: RSForm,
  alias?: string
): AnalysisFull {
  if (analysis.errors.length === 0 || !schema.graph) {
    return analysis;
  }

  const currentId = alias ? schema.cstByAlias.get(alias)?.id : undefined;
  const expressionGlobals = extractGlobals(expression);
  const draftGraph =
    currentId !== undefined ? buildDraftDependencyGraph(schema, currentId, expressionGlobals) : schema.graph;

  let changed = false;
  const errors = analysis.errors.map(error => {
    if (error.code !== RSErrorCode.globalNotTyped && error.code !== RSErrorCode.globalFuncWithoutArgs) {
      return error;
    }
    const missingAlias = error.params?.[0];
    if (!missingAlias) {
      return error;
    }
    const missing = schema.cstByAlias.get(missingAlias);
    if (!missing) {
      return error;
    }
    const cycleText = resolveDependencyCycleText(schema, draftGraph, currentId, missing.id);
    if (!cycleText) {
      return error;
    }
    changed = true;
    return {
      ...error,
      code: RSErrorCode.schemaDependencyCycle,
      params: [cycleText]
    };
  });
  return changed ? { ...analysis, errors } : analysis;
}

/**
 * Clone the schema graph and replace dependencies of `currentId` with globals from the
 * expression under check (unsaved draft).
 */
function buildDraftDependencyGraph(schema: RSForm, currentId: number, expressionGlobals: ReadonlySet<string>): Graph {
  const graph = schema.graph.clone();
  const node = graph.at(currentId);
  if (node) {
    for (const parentId of [...node.inputs]) {
      graph.removeEdge(parentId, currentId);
    }
  } else {
    graph.addNode(currentId);
  }
  for (const globalAlias of expressionGlobals) {
    const source = schema.cstByAlias.get(globalAlias);
    if (source) {
      graph.addEdge(source.id, currentId);
    }
  }
  return graph;
}

/**
 * Resolve formatted cycle text for an untyped global reference in analysis.
 *
 * Uses `graph` (often a draft graph built from the expression under check). When
 * `currentId` is omitted, falls back to schema diagnostics on `missingId`.
 *
 * @returns Closed alias path such as `F3 → P1 → F3`, or `null` when no shared cycle exists.
 */
function resolveDependencyCycleText(
  schema: RSForm,
  graph: Graph,
  currentId: number | undefined,
  missingId: number
): string | null {
  for (const cycle of graph.findCycles()) {
    const members = new Set(cycle);
    if (!members.has(missingId)) {
      continue;
    }
    if (currentId !== undefined && !members.has(currentId)) {
      continue;
    }
    return formatDependencyCycle(cycle.map(id => schema.cstByID.get(id)?.alias ?? String(id)));
  }

  if (currentId === undefined) {
    const cycleDiag = schema.cstByID
      .get(missingId)
      ?.diagnostics.find(item => item.code === RSDiagnosticCode.schemaDependencyCycle);
    return cycleDiag?.params?.[0] ?? null;
  }

  return null;
}
