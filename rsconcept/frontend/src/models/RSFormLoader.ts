/**
 * Module: RSForm data loading and processing.
 */

import { Graph } from './Graph';
import { ConstituentaID, CstType, IConstituenta, IRSForm, IRSFormData, IRSFormStats } from './rsform';
import { inferClass, inferStatus, inferTemplate, isBaseSet, isFunctional } from './rsformAPI';
import { ParsingStatus, ValueClass } from './rslang';
import { extractGlobals, isSimpleExpression, splitTemplateDefinition } from './rslangAPI';

/**
 * Loads data into an {@link IRSForm} based on {@link IRSFormData}.
 *
 * @remarks
 * This function processes the provided input, initializes the IRSForm, and calculates statistics
 * based on the loaded data. It also establishes dependencies between concepts in the graph.
 */
export class RSFormLoader {
  private schema: IRSFormData;
  private graph: Graph = new Graph();
  private cstByAlias: Map<string, IConstituenta> = new Map();
  private cstByID: Map<ConstituentaID, IConstituenta> = new Map();

  constructor(input: IRSFormData) {
    this.schema = input;
  }

  produceRSForm(): IRSForm {
    this.prepareLookups();
    this.createGraph();
    this.inferCstAttributes();

    const result = this.schema as IRSForm;
    result.stats = this.calculateStats();
    result.graph = this.graph;
    result.cstByAlias = this.cstByAlias;
    result.cstByID = this.cstByID;
    return result;
  }

  private prepareLookups() {
    this.schema.items.forEach(cst => {
      this.cstByAlias.set(cst.alias, cst as IConstituenta);
      this.cstByID.set(cst.id, cst as IConstituenta);
      this.graph.addNode(cst.id);
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
    this.graph.topologicalOrder().forEach(cstID => {
      const cst = this.cstByID.get(cstID)!;
      cst.status = inferStatus(cst.parse.status, cst.parse.valueClass);
      cst.is_template = inferTemplate(cst.definition_formal);
      cst.cst_class = inferClass(cst.cst_type, cst.is_template);
      cst.children = [];
      cst.children_alias = [];
      cst.is_simple_expression = this.inferSimpleExpression(cst);
      if (!cst.is_simple_expression || cst.cst_type === CstType.STRUCTURED) {
        return;
      }
      cst.parent = this.inferParent(cst);
      if (cst.parent) {
        const parent = this.cstByID.get(cst.parent)!;
        cst.parent_alias = parent.alias;
        parent.children.push(cst.id);
        parent.children_alias.push(cst.alias);
      }
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

  private inferParent(target: IConstituenta): ConstituentaID | undefined {
    const sources = this.extractSources(target);
    if (sources.size !== 1 || sources.has(target.id)) {
      return undefined;
    }
    const parent_id = sources.values().next().value as ConstituentaID;
    const parent = this.cstByID.get(parent_id);
    if (parent && isBaseSet(parent.cst_type)) {
      return undefined;
    }
    return parent_id;
  }

  private extractSources(target: IConstituenta): Set<ConstituentaID> {
    const sources: Set<ConstituentaID> = new Set();
    if (!isFunctional(target.cst_type)) {
      const node = this.graph.at(target.id)!;
      node.inputs.forEach(id => {
        const parent = this.cstByID.get(id)!;
        if (!parent.is_template || !parent.is_simple_expression) {
          sources.add(parent.parent ?? id);
        }
      });
      return sources;
    }

    const expression = splitTemplateDefinition(target.definition_formal);
    const bodyDependencies = extractGlobals(expression.body);
    bodyDependencies.forEach(alias => {
      const parent = this.cstByAlias.get(alias);
      if (parent && (!parent.is_template || !parent.is_simple_expression)) {
        sources.add(this.cstByID.get(parent.id)!.parent ?? parent.id);
      }
    });
    const needCheckHead = () => {
      if (sources.size === 0) {
        return true;
      } else if (sources.size !== 1) {
        return false;
      } else {
        const base = this.cstByID.get(sources.values().next().value as ConstituentaID)!;
        return !isFunctional(base.cst_type) || splitTemplateDefinition(base.definition_formal).head !== expression.head;
      }
    };
    if (needCheckHead()) {
      const headDependencies = extractGlobals(expression.head);
      headDependencies.forEach(alias => {
        const parent = this.cstByAlias.get(alias);
        if (parent && !isBaseSet(parent.cst_type) && (!parent.is_template || !parent.is_simple_expression)) {
          sources.add(parent.parent ?? parent.id);
        }
      });
    }
    return sources;
  }

  private calculateStats(): IRSFormStats {
    const items = this.schema.items;
    return {
      count_all: items.length,
      count_errors: items.reduce((sum, cst) => sum + (cst.parse.status === ParsingStatus.INCORRECT ? 1 : 0), 0),
      count_property: items.reduce((sum, cst) => sum + (cst.parse.valueClass === ValueClass.PROPERTY ? 1 : 0), 0),
      count_incalculable: items.reduce(
        (sum, cst) =>
          sum + (cst.parse.status === ParsingStatus.VERIFIED && cst.parse.valueClass === ValueClass.INVALID ? 1 : 0),
        0
      ),

      count_text_term: items.reduce((sum, cst) => sum + (cst.term_raw ? 1 : 0), 0),
      count_definition: items.reduce((sum, cst) => sum + (cst.definition_raw ? 1 : 0), 0),
      count_convention: items.reduce((sum, cst) => sum + (cst.convention ? 1 : 0), 0),

      count_base: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.BASE ? 1 : 0), 0),
      count_constant: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.CONSTANT ? 1 : 0), 0),
      count_structured: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.STRUCTURED ? 1 : 0), 0),
      count_axiom: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.AXIOM ? 1 : 0), 0),
      count_term: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.TERM ? 1 : 0), 0),
      count_function: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.FUNCTION ? 1 : 0), 0),
      count_predicate: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.PREDICATE ? 1 : 0), 0),
      count_theorem: items.reduce((sum, cst) => sum + (cst.cst_type === CstType.THEOREM ? 1 : 0), 0)
    };
  }
}
