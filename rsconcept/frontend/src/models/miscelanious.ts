// Module: Miscellanious frontend model types.

import { IConstituenta, IRSForm } from './rsform'

// Constituenta edit mode
export enum EditMode {
  TEXT = 'text',
  RSLANG = 'rslang'
}

// Dependency mode for schema analysis
export enum DependencyMode {
  ALL = 0,
  EXPRESSION,
  OUTPUTS,
  INPUTS,
  EXPAND_OUTPUTS,
  EXPAND_INPUTS
}

// Help manual topic compare mode
export enum HelpTopic {
  MAIN = 'main',
  LIBRARY = 'library',
  RSFORM = 'rsform',
  CSTLIST = 'cstlist',
  CONSTITUENTA = 'constituenta',
  GRAPH_TERM = 'graph-term',
  RSLANG = 'rslang',
  TERM_CONTROL = 'terminology-control',
  EXTEOR = 'exteor',
  API = 'api'
}

// Constituent compare mode
export enum CstMatchMode {
  ALL = 1,
  EXPR,
  TERM,
  TEXT,
  NAME
}

export interface ILibraryFilter {
  query?: string
  is_personal?: boolean
  is_owned?: boolean
  is_common?: boolean
  is_canonical?: boolean
  is_subscribed?: boolean
}

// Library premade filters
export enum LibraryFilterStrategy {
  MANUAL = 'manual',
  PERSONAL = 'personal',
  COMMON = 'common',
  SUBSCRIBE = 'subscribe',
  CANONICAL = 'canonical',
  OWNED = 'owned'
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

