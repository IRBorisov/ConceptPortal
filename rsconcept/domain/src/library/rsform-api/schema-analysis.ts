import { type AstNode, getNodeIndices } from '../../parsing';
import { makeTypePath, TokenID, TypeID, type TypePath } from '../../rslang';
import { extractGlobals, isSimpleExpression, splitTemplateDefinition } from '../../rslang/api';
import { type ExpressionType } from '../../rslang/semantic/typification';
import { type Constituenta, CstStatus, CstType, type RSForm } from '../rsform';

import { inferClass, isBaseSet, isFunctional } from './cst-type';
import { analyzeConstituentType } from './effective-type';
import { inferStatus, inferTemplate, normalizeExpression } from './expression';

type SchemaAnalysisContext = Pick<RSForm, 'graph' | 'analyzer' | 'cstByID' | 'cstByAlias'>;

/** Analyze a schema in dependency order and infer its constituent structure links. */
export function analyzeSchemaConstituents(schema: SchemaAnalysisContext): Map<number, string> {
  return new SchemaAnalysis(schema).analyze();
}

class SchemaAnalysis {
  private readonly schema: SchemaAnalysisContext;

  constructor(schema: SchemaAnalysisContext) {
    this.schema = schema;
  }

  public analyze(): Map<number, string> {
    const normalizedDefinitions = new Map<number, string>();
    const order = this.schema.graph.topologicalOrder();
    for (const id of order) {
      const cst = this.schema.cstByID.get(id)!;
      cst.is_template = inferTemplate(cst.definition_formal);
      cst.cst_class = inferClass(cst.cst_type, cst.is_template);
      delete cst.spawner;
      delete cst.spawner_alias;
      delete cst.spawner_path;
      cst.spawn = [];
      cst.spawn_alias = [];
    }
    for (const cstID of order) {
      const cst = this.schema.cstByID.get(cstID)!;
      cst.is_simple_expression = this.inferSimpleExpression(cst);
      const { parse, effectiveType, isManualMismatch } = analyzeConstituentType(cst, this.schema.analyzer);
      cst.analysis = {
        success: parse.success,
        type: parse.type,
        valueClass: parse.valueClass
      };

      cst.effectiveType = effectiveType;
      cst.is_type_mismatch = isManualMismatch;
      const normalized = normalizeExpression(cst.definition_formal, cst.cst_type, parse.ast);
      if (normalized) {
        normalizedDefinitions.set(cst.id, normalized);
      }
      cst.status =
        cst.cst_type === CstType.NOMINAL
          ? CstStatus.UNKNOWN
          : inferStatus(cst.analysis.success, cst.analysis.valueClass);

      if (cst.is_simple_expression && cst.cst_type !== CstType.STRUCTURED && !!parse.ast && parse.type) {
        const spawner = this.inferParent(cst);
        const parents = this.schema.graph.expandInputs([cstID]);
        const parent = this.schema.cstByID.get(parents.at(-1)!);
        const parentType = parent?.effectiveType;
        const path = parent && parentType ? extractTypePath(parse.ast, parentType) : null;
        if (path && parent) {
          cst.spawner = spawner;
          if (spawner === parent.id) {
            cst.spawner_path = path;
          } else if (parent.spawner_path) {
            // Drop the local collection root marker and keep any reduction steps.
            const suffix = path[0] === 0 ? path.slice(1) : path;
            cst.spawner_path = makeTypePath([...parent.spawner_path, ...suffix]);
          }
        }
      }
    }
    for (const cstID of order) {
      const cst = this.schema.cstByID.get(cstID)!;
      if (cst.spawner != null) {
        const parent = this.schema.cstByID.get(cst.spawner)!;
        cst.spawner_alias = parent.alias;
        parent.spawn.push(cst.id);
        parent.spawn_alias.push(cst.alias);
      }
    }
    return normalizedDefinitions;
  }

  private inferSimpleExpression(target: Constituenta): boolean {
    if (target.cst_type === CstType.STRUCTURED || isBaseSet(target.cst_type)) {
      return false;
    }
    const dependencies = this.schema.graph.at(target.id)!.inputs;
    const hasComplexDependency = dependencies.some(id => {
      const cst = this.schema.cstByID.get(id)!;
      return cst.is_template && !cst.is_simple_expression;
    });
    if (hasComplexDependency) {
      return false;
    }
    const expression = isFunctional(target.cst_type)
      ? splitTemplateDefinition(target.definition_formal).body
      : target.definition_formal;
    return isSimpleExpression(expression);
  }

  private inferParent(target: Constituenta): number | undefined {
    const sources = this.extractSources(target);
    if (sources.size !== 1 || sources.has(target.id)) {
      return undefined;
    }
    const parent_id = sources.values().next().value!;
    const parent = this.schema.cstByID.get(parent_id);
    if (parent && isBaseSet(parent.cst_type)) {
      return undefined;
    }
    return parent_id;
  }

  private extractSources(target: Constituenta): Set<number> {
    const sources = new Set<number>();
    if (!isFunctional(target.cst_type)) {
      const node = this.schema.graph.at(target.id)!;
      for (const id of node.inputs) {
        const parent = this.schema.cstByID.get(id)!;
        if (!parent.is_template || !parent.is_simple_expression) {
          sources.add(parent.spawner ?? id);
        }
      }
      return sources;
    }

    const expression = splitTemplateDefinition(target.definition_formal);
    const bodyDependencies = extractGlobals(expression.body);
    for (const alias of bodyDependencies) {
      const parent = this.schema.cstByAlias.get(alias);
      if (parent && (!parent.is_template || !parent.is_simple_expression)) {
        sources.add(parent.spawner ?? parent.id);
      }
    }
    const needCheckHead = () => {
      if (sources.size === 0) {
        return true;
      } else if (sources.size !== 1) {
        return false;
      } else {
        const cstID = sources.values().next().value!;
        const base = this.schema.cstByID.get(cstID)!;
        return !isFunctional(base.cst_type) || splitTemplateDefinition(base.definition_formal).head !== expression.head;
      }
    };
    if (needCheckHead()) {
      const headDependencies = extractGlobals(expression.head);
      for (const alias of headDependencies) {
        const parent = this.schema.cstByAlias.get(alias);
        if (parent && !isBaseSet(parent.cst_type) && (!parent.is_template || !parent.is_simple_expression)) {
          sources.add(parent.spawner ?? parent.id);
        }
      }
    }
    return sources;
  }
}

// ====== Internals =========

function extractTypePath(node: AstNode, type: ExpressionType): TypePath | null {
  const result: number[] = [];
  const isSet =
    type.typeID === TypeID.function ? type.result.typeID === TypeID.collection : type.typeID === TypeID.collection;
  let current = node;
  while (true) {
    switch (current.typeID) {
      default:
        return null;
      case TokenID.NT_FUNC_DEFINITION:
        current = current.children[1];
        break;
      case TokenID.NT_FUNC_CALL:
      case TokenID.ID_GLOBAL:
        if (isSet) {
          result.push(0);
        }
        return makeTypePath(result.reverse());
      case TokenID.REDUCE:
        result.push(0);
        current = current.children[0];
        break;
      case TokenID.SMALLPR:
      case TokenID.BIGPR:
        const indices = getNodeIndices(current);
        if (indices.length !== 1) {
          return null;
        }
        current = current.children[0];
        result.push(indices[0]);
        break;
    }
  }
}
