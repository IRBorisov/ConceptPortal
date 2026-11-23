/**
 * Module: RSForm data loading and processing.
 */

import { Graph } from '@rsconcept/domain/graph/graph';
import { assignSchemaDiagnostics, type Constituenta, CstType, type RSForm } from '@rsconcept/domain/library';
import { analyzeSchemaConstituents, buildFormalDependencyGraph } from '@rsconcept/domain/library/rsform-api';
import { RSLangAnalyzer } from '@rsconcept/domain/rslang';

import { type RSFormDTO } from './types';

/** Loads data into an {@link RSForm} based on {@link RSFormDTO}. */
export function loadRSForm(data: RSFormDTO) {
  return new RSFormLoader(data).produceRSForm();
}

/** Loads data into an {@link RSForm} based on {@link RSFormDTO}. */
export class RSFormLoader {
  private schema: RSForm;
  private graph: Graph = new Graph();
  private association_graph: Graph = new Graph();
  private cstByAlias = new Map<string, Constituenta>();
  private cstByID = new Map<number, Constituenta>();
  private analyzer = new RSLangAnalyzer();

  constructor(input: RSFormDTO) {
    this.schema = structuredClone(input) as unknown as RSForm;
    this.schema.version = input.version ?? 'latest';
  }

  produceRSForm(): RSForm {
    this.prepareLookups();
    this.graph = buildFormalDependencyGraph(this.schema.items);
    this.inferCstAttributes();
    const normalizedDefinitions = analyzeSchemaConstituents({
      graph: this.graph,
      analyzer: this.analyzer,
      cstByID: this.cstByID,
      cstByAlias: this.cstByAlias
    });
    this.collectDiagnostics(normalizedDefinitions);

    const result = this.schema;
    result.analyzer = this.analyzer;
    result.graph = this.graph;
    result.cstByAlias = this.cstByAlias;
    result.cstByID = this.cstByID;
    result.attribution_graph = this.association_graph;
    result.is_attributive = result.attribution.length > 0 || result.items.some(cst => cst.cst_type === CstType.NOMINAL);
    return result;
  }

  private prepareLookups() {
    for (const cst of this.schema.items) {
      this.cstByAlias.set(cst.alias, cst);
      this.cstByID.set(cst.id, cst);
      this.association_graph.addNode(cst.id);
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
      cst.spawn = [];
      cst.attributes = [];
      cst.spawn_alias = [];
      cst.typification_manual = cst.typification_manual ?? '';
      cst.value_is_property = cst.value_is_property ?? false;
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

  private collectDiagnostics(normalizedDefinitions: Map<number, string>): void {
    const resolveAlias = (id: number) => this.cstByID.get(id)?.alias ?? String(id);
    assignSchemaDiagnostics(this.schema.items, resolveAlias, normalizedDefinitions, this.graph);
  }
}
