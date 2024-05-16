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
  UI_LIBRARY = 'ui-library',
  UI_RS_MENU = 'ui-rsform-menu',
  UI_RS_CARD = 'ui-rsform-card',
  UI_RS_LIST = 'ui-rsform-list',
  UI_RS_EDITOR = 'ui-rsform-editor',
  UI_GRAPH_TERM = 'ui-graph-term',
  UI_FORMULA_TREE = 'ui-formula-tree',
  UI_CST_STATUS = 'ui-rsform-cst-status',
  UI_CST_CLASS = 'ui-rsform-cst-class',

  CONCEPTUAL = 'concept',
  CC_SYSTEM = 'rslang-rsform',
  CC_CONSTITUENTA = 'rslang-cst',
  CC_RELATIONS = 'rslang-relations',
  CC_SYNTHESIS = 'rslang-synthesis',

  RSLANG = 'rslang',
  RSL_TYPES = 'rslang-types',
  RSL_CORRECT = 'rslang-correctness',
  RSL_INTERPRET = 'rslang-interpretation',
  RSL_OPERATIONS = 'rslang-operations',
  RSL_TEMPLATES = 'rslang-templates',

  TERM_CONTROL = 'terminology-control',
  VERSIONS = 'versions',
  EXTEOR = 'exteor',
  API = 'api',
  PRIVACY = 'privacy'
}

/**
 *  Manual topics hierarchy.
 */
export const topicParent: Map<HelpTopic, HelpTopic> = new Map([
  [HelpTopic.MAIN, HelpTopic.MAIN],

  [HelpTopic.INTERFACE, HelpTopic.INTERFACE],
  [HelpTopic.UI_LIBRARY, HelpTopic.INTERFACE],
  [HelpTopic.UI_RS_MENU, HelpTopic.INTERFACE],
  [HelpTopic.UI_RS_CARD, HelpTopic.INTERFACE],
  [HelpTopic.UI_RS_LIST, HelpTopic.INTERFACE],
  [HelpTopic.UI_RS_EDITOR, HelpTopic.INTERFACE],
  [HelpTopic.UI_GRAPH_TERM, HelpTopic.INTERFACE],
  [HelpTopic.UI_FORMULA_TREE, HelpTopic.INTERFACE],
  [HelpTopic.UI_CST_STATUS, HelpTopic.INTERFACE],
  [HelpTopic.UI_CST_CLASS, HelpTopic.INTERFACE],

  [HelpTopic.CONCEPTUAL, HelpTopic.CONCEPTUAL],
  [HelpTopic.CC_SYSTEM, HelpTopic.CONCEPTUAL],
  [HelpTopic.CC_CONSTITUENTA, HelpTopic.CONCEPTUAL],
  [HelpTopic.CC_RELATIONS, HelpTopic.CONCEPTUAL],
  [HelpTopic.CC_SYNTHESIS, HelpTopic.CONCEPTUAL],

  [HelpTopic.RSLANG, HelpTopic.RSLANG],
  [HelpTopic.RSL_TYPES, HelpTopic.RSLANG],
  [HelpTopic.RSL_CORRECT, HelpTopic.RSLANG],
  [HelpTopic.RSL_INTERPRET, HelpTopic.RSLANG],
  [HelpTopic.RSL_OPERATIONS, HelpTopic.RSLANG],
  [HelpTopic.RSL_TEMPLATES, HelpTopic.RSLANG],

  [HelpTopic.TERM_CONTROL, HelpTopic.TERM_CONTROL],
  [HelpTopic.VERSIONS, HelpTopic.VERSIONS],
  [HelpTopic.EXTEOR, HelpTopic.EXTEOR],
  [HelpTopic.API, HelpTopic.API],
  [HelpTopic.PRIVACY, HelpTopic.PRIVACY]
]);

/**
 *  Topics that can be folded.
 */
export const foldableTopics = [HelpTopic.INTERFACE, HelpTopic.RSLANG, HelpTopic.CONCEPTUAL];

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
