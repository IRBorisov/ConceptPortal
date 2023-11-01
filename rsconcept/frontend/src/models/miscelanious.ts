// Module: Miscellanious frontend model types.

import { IConstituenta, IRSForm } from './rsform'

/**
 * Represents graph dependency mode.
*/
export enum DependencyMode {
  ALL = 0,
  EXPRESSION,
  OUTPUTS,
  INPUTS,
  EXPAND_OUTPUTS,
  EXPAND_INPUTS
}

/**
 * Represents manuals topic.
*/
export enum HelpTopic {
  MAIN = 'main',
  LIBRARY = 'library',
  RSFORM = 'rsform',
  CSTLIST = 'cstlist',
  CONSTITUENTA = 'constituenta',
  GRAPH_TERM = 'graph-term',
  RSTEMPLATES = 'rstemplates',
  RSLANG = 'rslang',
  TERM_CONTROL = 'terminology-control',
  EXTEOR = 'exteor',
  API = 'api'
}

/**
 * Represents {@link IConstituenta} matching mode.
*/
export enum CstMatchMode {
  ALL = 1,
  EXPR,
  TERM,
  TEXT,
  NAME
}

/**
 * Represents Library filter parameters.
*/
export interface ILibraryFilter {
  query?: string
  is_personal?: boolean
  is_owned?: boolean
  is_common?: boolean
  is_canonical?: boolean
  is_subscribed?: boolean
}

/**
 * Represents filtering strategy for Library.
*/
export enum LibraryFilterStrategy {
  MANUAL = 'manual',
  PERSONAL = 'personal',
  COMMON = 'common',
  SUBSCRIBE = 'subscribe',
  CANONICAL = 'canonical',
  OWNED = 'owned'
}

/**
 * Represents parameters for GraphEditor.
*/
export interface GraphEditorParams {
  noHermits: boolean
  noTransitive: boolean
  noTemplates: boolean
  noTerms: boolean

  allowBase: boolean
  allowStruct: boolean
  allowTerm: boolean
  allowAxiom: boolean
  allowFunction: boolean
  allowPredicate: boolean
  allowConstant: boolean
  allowTheorem: boolean
}

// ================== API ====================
export function applyGraphFilter(schema: IRSForm, start: number, mode: DependencyMode): IConstituenta[] {
  if (mode === DependencyMode.ALL) {
    return schema.items
  }
  let ids: number[] | undefined = undefined
  switch (mode) {
    case DependencyMode.OUTPUTS: { ids = schema.graph.nodes.get(start)?.outputs; break} 
    case DependencyMode.INPUTS: { ids = schema.graph.nodes.get(start)?.inputs; break} 
    case DependencyMode.EXPAND_OUTPUTS: { ids = schema.graph.expandOutputs([start]); break} 
    case DependencyMode.EXPAND_INPUTS: { ids = schema.graph.expandInputs([start]); break} 
  }
  if (!ids) {
    return schema.items
  } else {
    return schema.items.filter(cst => ids!.find(id => id === cst.id))
  }
}

