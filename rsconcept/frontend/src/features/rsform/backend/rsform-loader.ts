/**
 * Module: RSForm data loading and processing.
 */

import { Graph } from '@/domain/graph/graph';
import { type Constituenta, CstStatus, CstType, type RSForm } from '@/domain/library';
import {
  inferClass,
  inferStatus,
  inferTemplate,
  isBaseSet,
  isBasicConcept,
  isFunctional,
  typeClassForCstType
} from '@/domain/library/rsform-api';
import { type AnalysisFast, makeTypePath, RSLangAnalyzer, TokenID, TypeID, type TypePath } from '@/domain/rslang';
import {
  extractGlobals,
  generateExpressionFromAst,
  isSimpleExpression,
  splitTemplateDefinition
} from '@/domain/rslang/api';
import { type ExpressionType } from '@/domain/rslang/semantic/typification';

import { type RO } from '@/utils/meta';
import { type AstNode, getNodeIndices } from '@/utils/parsing';

import { type RSFormDTO } from './types';

/** Loads data into an {@link RSForm} based on {@link RSFormDTO}. */
export function loadRSForm(data: RO<RSFormDTO>) {
  return new RSFormLoader(data).produceRSForm();
}

/** Loads data into an {@link RSForm} based on {@link RSFormDTO}. */
export class RSFormLoader {
  private schema: RSForm;
  private graph: Graph = new Graph();
  private association_graph: Graph = new Graph();
  private cstByAlias = new Map<string, Constituenta>();
  private cstByID = new Map<number, Constituenta>();
  private normalizedDefinitions = new Map<number, string>();
  private analyzer = new RSLangAnalyzer();

  constructor(input: RO<RSFormDTO>) {
    this.schema = structuredClone(input) as unknown as RSForm;
    this.schema.version = input.version ?? 'latest';
  }

  produceRSForm(): RSForm {
    this.prepareLookups();
    this.createGraph();
    this.inferCstAttributes();
    this.parseItems();
    this.markFormalDuplicates();
    this.markHomonyms();

    const result = this.schema;
    result.analyzer = this.analyzer;
    result.graph = this.graph;
    result.cstByAlias = this.cstByAlias;
    result.cstByID = this.cstByID;
    result.attribution_graph = this.association_graph;
    return result;
  }

  private prepareLookups() {
    for (const cst of this.schema.items) {
      this.cstByAlias.set(cst.alias, cst);
      this.cstByID.set(cst.id, cst);
      this.graph.addNode(cst.id);
      this.association_graph.addNode(cst.id);
    }
  }

  private createGraph() {
    for (const cst of this.schema.items) {
      for (const alias of extractGlobals(cst.definition_formal)) {
        const source = this.cstByAlias.get(alias);
        if (source) {
          this.graph.addEdge(source.id, cst.id);
        }
      }
    }
  }

  private inferCstAttributes() {
    const schemaByCst = new Map<number, number>();
    const parents: number[] = [];
    for (const item of this.schema.inheritance) {
      if (item.child_source === this.schema.id) {
        schemaByCst.set(item.child, item.parent_source);
        if (!parents.includes(item.parent_source)) {
          parents.push(item.parent_source);
        }
      }
    }
    const inherit_children = new Set(this.schema.inheritance.map(item => item.child));
    const inherit_parents = new Set(this.schema.inheritance.map(item => item.parent));
    const order = this.graph.topologicalOrder();
    for (const cstID of order) {
      const cst = this.cstByID.get(cstID)!;
      cst.schema = this.schema.id;
      cst.is_template = inferTemplate(cst.definition_formal);
      cst.cst_class = inferClass(cst.cst_type, cst.is_template);
      cst.spawn = [];
      cst.attributes = [];
      cst.spawn_alias = [];
      cst.parent_schema = schemaByCst.get(cst.id) ?? null;
      cst.parent_schema_index = cst.parent_schema ? parents.indexOf(cst.parent_schema) + 1 : 0;
      cst.is_inherited = inherit_children.has(cst.id);
      cst.has_inherited_children = inherit_parents.has(cst.id);
    }
    for (const attrib of this.schema.attribution) {
      const container = this.cstByID.get(attrib.container)!;
      container.attributes.push(attrib.attribute);
      this.association_graph.addEdge(attrib.container, attrib.attribute);
    }
  }

  private parseItems(): void {
    this.normalizedDefinitions.clear();
    const order = this.graph.topologicalOrder();
    for (const cstID of order) {
      const cst = this.cstByID.get(cstID)!;
      cst.is_simple_expression = this.inferSimpleExpression(cst);
      const parse = parseCst(cst, this.analyzer);
      cst.analysis = {
        success: parse.success,
        type: parse.type,
        valueClass: parse.valueClass
      };
      if (!isBasicConcept(cst.cst_type) || cst.cst_type === CstType.AXIOM) {
        let normalized = '';
        if (parse.ast && !parse.ast.hasError) {
          normalized = generateExpressionFromAst(parse.ast, { normalize: true });
        } else {
          normalized = cst.definition_formal;
        }
        normalized = normalized.replace(/\s+/g, '');
        if (normalized !== '') {
          this.normalizedDefinitions.set(cst.id, normalized);
        }
      }
      cst.status =
        cst.cst_type === CstType.NOMINAL
          ? CstStatus.UNKNOWN
          : inferStatus(cst.analysis.success, cst.analysis.valueClass);

      if (cst.is_simple_expression && cst.cst_type !== CstType.STRUCTURED && !!parse.ast && parse.type) {
        const spawner = this.inferParent(cst);
        const parents = this.graph.expandInputs([cstID]);
        const parent = this.cstByID.get(parents.at(-1)!);
        const path = parent ? extractTypePath(parse.ast, parent.analysis.type!) : null;
        if (path && parent) {
          cst.spawner = spawner;
          if (spawner !== parent.id) {
            if (parent.spawner_path) {
              cst.spawner_path = [...parent.spawner_path, ...path] as TypePath;
            }
          } else {
            cst.spawner_path = path;
          }
        }
      }
    }
    for (const cstID of order) {
      const cst = this.cstByID.get(cstID)!;
      if (cst.spawner) {
        const parent = this.cstByID.get(cst.spawner)!;
        cst.spawner_alias = parent.alias;
        parent.spawn.push(cst.id);
        parent.spawn_alias.push(cst.alias);
      }
    }
  }

  private markHomonyms(): void {
    const byTerm = new Map<string, Constituenta[]>();
    for (const cst of this.schema.items) {
      const key = cst.term_resolved.trim().toLocaleLowerCase();
      if (key === '') {
        continue;
      }
      let group = byTerm.get(key);
      if (!group) {
        group = [];
        byTerm.set(key, group);
      }
      group.push(cst);
    }
    for (const cst of this.schema.items) {
      cst.homonyms = [];
    }
    for (const group of byTerm.values()) {
      if (group.length > 1) {
        for (const cst of group) {
          cst.homonyms = group.filter(groupItem => groupItem.id !== cst.id).map(item => item.id);
        }
      }
    }
  }

  private markFormalDuplicates(): void {
    const byDefinition = new Map<string, Constituenta[]>();
    for (const cst of this.schema.items) {
      cst.formalDuplicates = [];

      const key = this.normalizedDefinitions.get(cst.id);
      if (!key) {
        continue;
      }

      let group = byDefinition.get(key);
      if (!group) {
        group = [];
        byDefinition.set(key, group);
      }
      group.push(cst);
    }

    for (const group of byDefinition.values()) {
      if (group.length > 1) {
        for (const cst of group) {
          cst.formalDuplicates = group.filter(groupItem => groupItem.id !== cst.id).map(item => item.id);
        }
      }
    }
  }

  private inferSimpleExpression(target: Constituenta): boolean {
    if (target.cst_type === CstType.STRUCTURED || isBaseSet(target.cst_type)) {
      return false;
    }
    const dependencies = this.graph.at(target.id)!.inputs;
    const hasComplexDependency = dependencies.some(id => {
      const cst = this.cstByID.get(id)!;
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
    const parent = this.cstByID.get(parent_id);
    if (parent && isBaseSet(parent.cst_type)) {
      return undefined;
    }
    return parent_id;
  }

  private extractSources(target: Constituenta): Set<number> {
    const sources = new Set<number>();
    if (!isFunctional(target.cst_type)) {
      const node = this.graph.at(target.id)!;
      for (const id of node.inputs) {
        const parent = this.cstByID.get(id)!;
        if (!parent.is_template || !parent.is_simple_expression) {
          sources.add(parent.spawner ?? id);
        }
      }
      return sources;
    }

    const expression = splitTemplateDefinition(target.definition_formal);
    const bodyDependencies = extractGlobals(expression.body);
    for (const alias of bodyDependencies) {
      const parent = this.cstByAlias.get(alias);
      if (parent && (!parent.is_template || !parent.is_simple_expression)) {
        sources.add(this.cstByID.get(parent.id)!.spawner ?? parent.id);
      }
    }
    const needCheckHead = () => {
      if (sources.size === 0) {
        return true;
      } else if (sources.size !== 1) {
        return false;
      } else {
        const cstID = sources.values().next().value!;
        const base = this.cstByID.get(cstID)!;
        return !isFunctional(base.cst_type) || splitTemplateDefinition(base.definition_formal).head !== expression.head;
      }
    };
    if (needCheckHead()) {
      const headDependencies = extractGlobals(expression.head);
      for (const alias of headDependencies) {
        const parent = this.cstByAlias.get(alias);
        if (parent && !isBaseSet(parent.cst_type) && (!parent.is_template || !parent.is_simple_expression)) {
          sources.add(parent.spawner ?? parent.id);
        }
      }
    }
    return sources;
  }
}

// ====== Internals =========

/** Parse {@link Constituenta} for {@link RSForm}. */
function parseCst(target: Constituenta, analyzer: RSLangAnalyzer): AnalysisFast {
  const cType = target.cst_type;
  if (cType === CstType.NOMINAL) {
    return { success: false, type: null, valueClass: null, ast: null };
  }
  if (cType === CstType.BASE || cType === CstType.CONSTANT) {
    analyzer.addBase(target.alias, cType === CstType.CONSTANT);
    return analyzer.checkFast(target.alias);
  } else {
    const parse = analyzer.checkFast(target.definition_formal, {
      expected: typeClassForCstType(cType),
      isDomain: cType === CstType.STRUCTURED
    });
    analyzer.setGlobal(target.alias, parse.type, parse.valueClass);
    return parse;
  }
}

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
