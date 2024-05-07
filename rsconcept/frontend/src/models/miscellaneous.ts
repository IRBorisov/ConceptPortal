/**
 * Module: Miscellaneous frontend model types. Future targets for refactoring aimed at extracting modules.
 */

/**
 * Represents user access mode.
 */
export enum UserAccessMode {
  READER = 0,
  OWNER,
  ADMIN
}

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
 * Represents graph node coloring scheme.
 */
export type GraphColoring = 'none' | 'status' | 'type';

/**
 * Represents graph node sizing scheme.
 */
export type GraphSizing = 'none' | 'complex' | 'derived';

/**
 * Represents font styles.
 */
export type FontStyle = 'controls' | 'main' | 'math' | 'math2';

/**
 * Represents manuals topic.
 */
export enum HelpTopic {
  MAIN = 'main',
  LIBRARY = 'library',
  RSFORM = 'rsform',
  CST_LIST = 'cst-list',
  CST_EDITOR = 'cst-editor',
  GRAPH_TERM = 'graph-term',
  RSTEMPLATES = 'rstemplates',
  RSLANG = 'rslang',
  CST_ATTRIBUTES = 'cst-type',
  TERM_CONTROL = 'terminology-control',
  VERSIONS = 'versions',
  EXTEOR = 'exteor',
  API = 'api',
  PRIVACY = 'privacy'
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
  query?: string;
  is_owned?: boolean;
  is_common?: boolean;
  is_canonical?: boolean;
  is_subscribed?: boolean;
}

/**
 * Represents filtering strategy for Library.
 */
export enum LibraryFilterStrategy {
  MANUAL = 'manual',
  COMMON = 'common',
  SUBSCRIBE = 'subscribe',
  CANONICAL = 'canonical',
  OWNED = 'owned'
}

/**
 * Represents parameters for GraphEditor.
 */
export interface GraphFilterParams {
  noHermits: boolean;
  noTransitive: boolean;
  noTemplates: boolean;
  noText: boolean;
  foldDerived: boolean;

  focusShowInputs: boolean;
  focusShowOutputs: boolean;

  allowBase: boolean;
  allowStruct: boolean;
  allowTerm: boolean;
  allowAxiom: boolean;
  allowFunction: boolean;
  allowPredicate: boolean;
  allowConstant: boolean;
  allowTheorem: boolean;
}
