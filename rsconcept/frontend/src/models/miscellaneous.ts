/**
 * Module: Miscellaneous frontend model types. Future targets for refactoring aimed at extracting modules.
 */

import { Node } from 'reactflow';

import { LibraryItemType, LocationHead } from './library';
import { IOperation } from './oss';

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
 * Represents graph OSS node data.
 */
export interface OssNode extends Node {
  id: string;
  data: {
    label: string;
    operation: IOperation;
  };
  position: { x: number; y: number };
}

/**
 * Represents graph OSS node internal data.
 */
export interface OssNodeInternal {
  id: string;
  data: {
    label: string;
    operation: IOperation;
  };
  dragging: boolean;
  xPos: number;
  yPos: number;
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

  THESAURUS = 'thesaurus',

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
  UI_OSS_GRAPH = 'ui-oss-graph',

  CONCEPTUAL = 'concept',
  CC_SYSTEM = 'concept-rsform',
  CC_CONSTITUENTA = 'concept-constituenta',
  CC_RELATIONS = 'concept-relations',
  CC_SYNTHESIS = 'concept-synthesis',
  CC_OSS = 'concept-operations-schema',
  CC_PROPAGATION = 'concept-change-propagation',

  RSLANG = 'rslang',
  RSL_TYPES = 'rslang-types',
  RSL_CORRECT = 'rslang-correctness',
  RSL_INTERPRET = 'rslang-interpretation',
  RSL_OPERATIONS = 'rslang-operations',
  RSL_TEMPLATES = 'rslang-templates',

  TERM_CONTROL = 'terminology-control',
  ACCESS = 'access',
  VERSIONS = 'versions',

  INFO = 'documentation',
  INFO_RULES = 'rules',
  INFO_CONTRIB = 'contributors',
  INFO_PRIVACY = 'privacy',
  INFO_API = 'api',

  EXTEOR = 'exteor'
}

/**
 *  Manual topics hierarchy.
 */
export const topicParent = new Map<HelpTopic, HelpTopic>([
  [HelpTopic.MAIN, HelpTopic.MAIN],

  [HelpTopic.THESAURUS, HelpTopic.THESAURUS],

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
  [HelpTopic.UI_OSS_GRAPH, HelpTopic.INTERFACE],

  [HelpTopic.CONCEPTUAL, HelpTopic.CONCEPTUAL],
  [HelpTopic.CC_SYSTEM, HelpTopic.CONCEPTUAL],
  [HelpTopic.CC_CONSTITUENTA, HelpTopic.CONCEPTUAL],
  [HelpTopic.CC_RELATIONS, HelpTopic.CONCEPTUAL],
  [HelpTopic.CC_SYNTHESIS, HelpTopic.CONCEPTUAL],
  [HelpTopic.CC_OSS, HelpTopic.CONCEPTUAL],
  [HelpTopic.CC_PROPAGATION, HelpTopic.CONCEPTUAL],

  [HelpTopic.RSLANG, HelpTopic.RSLANG],
  [HelpTopic.RSL_TYPES, HelpTopic.RSLANG],
  [HelpTopic.RSL_CORRECT, HelpTopic.RSLANG],
  [HelpTopic.RSL_INTERPRET, HelpTopic.RSLANG],
  [HelpTopic.RSL_OPERATIONS, HelpTopic.RSLANG],
  [HelpTopic.RSL_TEMPLATES, HelpTopic.RSLANG],

  [HelpTopic.TERM_CONTROL, HelpTopic.TERM_CONTROL],
  [HelpTopic.ACCESS, HelpTopic.ACCESS],
  [HelpTopic.VERSIONS, HelpTopic.VERSIONS],

  [HelpTopic.INFO, HelpTopic.INFO],
  [HelpTopic.INFO_RULES, HelpTopic.INFO],
  [HelpTopic.INFO_CONTRIB, HelpTopic.INFO],
  [HelpTopic.INFO_PRIVACY, HelpTopic.INFO],
  [HelpTopic.INFO_API, HelpTopic.INFO],

  [HelpTopic.EXTEOR, HelpTopic.EXTEOR]
]);

/**
 *  Topics that can be folded.
 */
export const foldableTopics = [HelpTopic.INTERFACE, HelpTopic.RSLANG, HelpTopic.CONCEPTUAL, HelpTopic.INFO];

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
  type?: LibraryItemType;
  query?: string;

  folderMode?: boolean;
  path?: string;
  head?: LocationHead;
  location?: string;

  isVisible?: boolean;
  isOwned?: boolean;
  isEditor?: boolean;
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

/**
 * Represents XY Position.
 */
export interface Position2D {
  x: number;
  y: number;
}
