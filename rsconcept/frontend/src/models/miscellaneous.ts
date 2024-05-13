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

  INTERFACE = 'user-interface',
  LIBRARY = 'ui-library',
  RSFORM_UI = 'ui-rsform',
  RSFORM_CARD = 'ui-rsform-card',
  RSFORM_LIST = 'ui-rsform-list',
  RSFORM_EDITOR = 'ui-rsform-editor',
  GRAPH_TERM = 'ui-rsform-graph',
  CST_STATUS = 'ui-rsform-cst-status',
  CST_CLASS = 'ui-rsform-cst-class',

  CONCEPTUAL = 'concept',
  CC_SYSTEM = 'rslang-rsform',
  CC_CONSTITUENTA = 'rslang-cst',
  CC_RELATIONS = 'rslang-relations',

  RSLANG = 'rslang',
  RSL_TYPES = 'rslang-types',
  RSL_CORRECT = 'rslang-correctness',
  RSL_INTERPRET = 'rslang-interpretation',
  RSL_TEMPLATES = 'rslang-templates',
  RSL_OPERATIONS = 'rslang-operations',

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
