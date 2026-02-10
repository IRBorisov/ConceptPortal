/**
 * Module: RSForm data loading and processing.
 */

import { type AnalysisBase, RSLangAnalyzer } from '@/features/rslang';
import { extractGlobals, isSimpleExpression, splitTemplateDefinition } from '@/features/rslang/api';

import { Graph } from '@/models/graph';
import { type RO } from '@/utils/meta';

import { CstStatus, CstType, type IConstituenta, type IRSForm } from '../models/rsform';
import { inferClass, inferStatus, inferTemplate, isBaseSet, isFunctional, typeClassForCstType } from '../models/rsform-api';

import { type IRSFormDTO } from './types';

/**
 * Loads data into an {@link IRSForm} based on {@link IRSFormDTO}.
 *
 * @remarks
 * This function processes the provided input, initializes the IRSForm, and calculates statistics
 * based on the loaded data. It also establishes dependencies between concepts in the graph.
 */
export class RSFormLoader {
  private schema: IRSForm;
  private graph: Graph = new Graph();
  private association_graph: Graph = new Graph();
  private cstByAlias = new Map<string, IConstituenta>();
  private cstByID = new Map<number, IConstituenta>();
  private analyzer = new RSLangAnalyzer();

  constructor(input: RO<IRSFormDTO>) {
    this.schema = structuredClone(input) as unknown as IRSForm;
    this.schema.version = input.version ?? 'latest';
  }

  produceRSForm(): IRSForm {
    this.prepareLookups();
    this.createGraph();
    this.inferCstAttributes();
    this.parseItems();

    const result = this.schema;
    result.analyzer = this.analyzer;
    result.graph = this.graph;
    result.cstByAlias = this.cstByAlias;
    result.cstByID = this.cstByID;
    result.attribution_graph = this.association_graph;
    return result;
  }

  private prepareLookups() {
    this.schema.items.forEach(cst => {
      this.cstByAlias.set(cst.alias, cst);
      this.cstByID.set(cst.id, cst);
      this.graph.addNode(cst.id);
      this.association_graph.addNode(cst.id);
    });
  }

  private createGraph() {
    this.schema.items.forEach(cst => {
      const dependencies = extractGlobals(cst.definition_formal);
      dependencies.forEach(alias => {
        const source = this.cstByAlias.get(alias);
        if (source) {
          this.graph.addEdge(source.id, cst.id);
        }
      });
    });
  }

  private inferCstAttributes() {
    const schemaByCst = new Map<number, number>();
    const parents: number[] = [];
    this.schema.inheritance.forEach(item => {
      if (item.child_source === this.schema.id) {
        schemaByCst.set(item.child, item.parent_source);
        if (!parents.includes(item.parent_source)) {
          parents.push(item.parent_source);
        }
      }
    });
    const inherit_children = new Set(this.schema.inheritance.map(item => item.child));
    const inherit_parents = new Set(this.schema.inheritance.map(item => item.parent));
    const order = this.graph.topologicalOrder();
    order.forEach(cstID => {
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
      cst.is_simple_expression = this.inferSimpleExpression(cst);
      if (cst.is_simple_expression && cst.cst_type !== CstType.STRUCTURED) {
        cst.spawner = this.inferParent(cst);
      }
    });
    order.forEach(cstID => {
      const cst = this.cstByID.get(cstID)!;
      if (cst.spawner) {
        const parent = this.cstByID.get(cst.spawner)!;
        cst.spawner_alias = parent.alias;
        parent.spawn.push(cst.id);
        parent.spawn_alias.push(cst.alias);
      }
    });
    this.schema.attribution.forEach(attrib => {
      const container = this.cstByID.get(attrib.container)!;
      container.attributes.push(attrib.attribute);
      this.association_graph.addEdge(attrib.container, attrib.attribute);
    });
  }

  private inferSimpleExpression(target: IConstituenta): boolean {
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

  private inferParent(target: IConstituenta): number | undefined {
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

  private extractSources(target: IConstituenta): Set<number> {
    const sources = new Set<number>();
    if (!isFunctional(target.cst_type)) {
      const node = this.graph.at(target.id)!;
      node.inputs.forEach(id => {
        const parent = this.cstByID.get(id)!;
        if (!parent.is_template || !parent.is_simple_expression) {
          sources.add(parent.spawner ?? id);
        }
      });
      return sources;
    }

    const expression = splitTemplateDefinition(target.definition_formal);
    const bodyDependencies = extractGlobals(expression.body);
    bodyDependencies.forEach(alias => {
      const parent = this.cstByAlias.get(alias);
      if (parent && (!parent.is_template || !parent.is_simple_expression)) {
        sources.add(this.cstByID.get(parent.id)!.spawner ?? parent.id);
      }
    });
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
      headDependencies.forEach(alias => {
        const parent = this.cstByAlias.get(alias);
        if (parent && !isBaseSet(parent.cst_type) && (!parent.is_template || !parent.is_simple_expression)) {
          sources.add(parent.spawner ?? parent.id);
        }
      });
    }
    return sources;
  }

  private parseItems(): void {
    const order = this.graph.topologicalOrder();
    order.forEach(cstID => {
      const cst = this.cstByID.get(cstID)!;
      cst.analysis = parseCst(cst, this.analyzer);
      cst.status = cst.cst_type === CstType.NOMINAL ? CstStatus.UNKNOWN : inferStatus(cst.analysis.success, cst.analysis.valueClass);
    });
  }
}

// ======= Internals ========
function parseCst(target: IConstituenta, analyzer: RSLangAnalyzer): AnalysisBase {
  const cType = target.cst_type;
  if (cType === CstType.NOMINAL) {
    return { success: false, type: null, valueClass: null };
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