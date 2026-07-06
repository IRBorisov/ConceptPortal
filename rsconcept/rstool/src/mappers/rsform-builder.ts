import { Graph } from '@rsconcept/domain/graph/graph';
import { extractGlobals } from '@rsconcept/domain/rslang/api';
import { type ExpressionType, RSLangAnalyzer, type ValueClass } from '@rsconcept/domain/rslang';
import { assignSchemaDiagnostics } from '@rsconcept/domain/library';
import { isBasicConcept, isLogical, normalizeExpression } from '@rsconcept/domain/library/rsform-api';
import { type Constituenta, CstType, type RSForm } from '@rsconcept/domain/library/rsform';

import { type ConstituentaState, type SessionState } from '../models';

export interface EnrichedConstituenta {
  item: ConstituentaState;
  cst: Constituenta;
}

/** Build a domain {@link RSForm} view from session state (same shape as Portal loader output). */
export function buildRSFormFromSession(session: SessionState): RSForm {
  const graph = new Graph<number>();
  const cstByAlias = new Map<string, Constituenta>();
  const cstByID = new Map<number, Constituenta>();
  const analyzer = new RSLangAnalyzer();

  const items = session.items.map(item => {
    const cst = toFrontendConstituenta(item);
    cstByAlias.set(cst.alias, cst);
    cstByID.set(cst.id, cst);
    graph.addNode(cst.id);
    if (item.cstType === CstType.BASE) {
      analyzer.addBase(cst.alias);
    }
    if (cst.effectiveType) {
      analyzer.setGlobal(cst.alias, cst.effectiveType, cst.analysis.valueClass as ValueClass | null);
    }
    return cst;
  });

  for (const cst of items) {
    for (const alias of extractGlobals(cst.definition_formal)) {
      const source = cstByAlias.get(alias);
      if (source) {
        graph.addEdge(source.id, cst.id);
      }
    }
  }

  return {
    id: 0,
    items,
    cstByAlias,
    cstByID,
    graph,
    analyzer,
    inheritance: [],
    attribution: [],
    attribution_graph: graph.clone(),
    oss: [],
    models: [],
    editors: [],
    versions: [],
    is_produced: false,
    is_attributive: false,
    version: 'latest'
  } as unknown as RSForm;
}

/** Enrich session constituents with Portal-style schema metadata used for diagnostics. */
export function enrichSessionConstituents(session: SessionState): EnrichedConstituenta[] {
  const schema = buildRSFormFromSession(session);
  const normalizedDefinitions = new Map<number, string>();
  const resolveAlias = (id: number) => schema.cstByID.get(id)?.alias ?? String(id);

  for (const item of session.items) {
    const normalized = normalizeExpression(item.definitionFormal, item.cstType);
    if (normalized) {
      normalizedDefinitions.set(item.id, normalized);
    }
  }

  assignSchemaDiagnostics(schema.items, resolveAlias, normalizedDefinitions);

  return session.items.map(item => ({
    item,
    cst: schema.cstByID.get(item.id)!
  }));
}

function toFrontendConstituenta(item: ConstituentaState): Constituenta {
  const effectiveType = (item.analysis.type ?? null) as ExpressionType | null;
  return {
    id: item.id,
    alias: item.alias,
    cst_type: item.cstType,
    definition_formal: item.definitionFormal,
    definition_raw: item.definitionFormal,
    definition_resolved: item.definitionFormal,
    term_raw: item.term,
    term_resolved: item.term,
    term_forms: [],
    convention: item.convention,
    typification_manual: '',
    value_is_property: false,
    crucial: false,
    attributes: [],
    diagnostics: [],
    analysis: {
      success: item.analysis.success,
      type: effectiveType,
      valueClass: item.analysis.valueClass
    },
    effectiveType,
    is_type_mismatch: false,
    schema: 0,
    cst_class: 'derived',
    status: item.analysis.success ? 'verified' : 'incorrect',
    is_template: false,
    is_simple_expression: true,
    parent_schema_index: 0,
    parent_schema: null,
    is_inherited: false,
    has_inherited_children: false,
    spawn: [],
    spawn_alias: []
  } as unknown as Constituenta;
}

export function needsBasicMetadata(item: ConstituentaState): boolean {
  return isBasicConcept(item.cstType) && !isLogical(item.cstType);
}
