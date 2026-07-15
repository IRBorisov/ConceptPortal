/** Constituent opened during Sandbox concept-editor demos (alias S1 in starter bundles). */
export const SANDBOX_TOUR_CST_ID = 27850;

/** Sandbox-only overview tour. */
export const SandboxTourID = {
  INTRO: 'sandbox-intro'
} as const;

export type SandboxTourID = (typeof SandboxTourID)[keyof typeof SandboxTourID];

/**
 * Shared editor tours reused by Sandbox, schema (`/rsforms/...`), and model (`/models/...`).
 * Not sandbox-specific — keep ids and anchors/copy context-neutral.
 */
export const EditorTourID = {
  CONSTITUENTS_LIST: 'constituents-list',
  CONCEPT_EDITOR: 'concept-editor',
  TERM_GRAPH: 'term-graph'
} as const;

export type EditorTourID = (typeof EditorTourID)[keyof typeof EditorTourID];

/** Passport tours — one per library item type (plus a slim Sandbox variant). */
export const PassportTourID = {
  SCHEMA: 'schema-passport',
  MODEL: 'model-passport',
  OSS: 'oss-passport',
  SANDBOX: 'sandbox-passport'
} as const;

export type PassportTourID = (typeof PassportTourID)[keyof typeof PassportTourID];

/** Library browser tour. */
export const LibraryTourID = {
  INTRO: 'library-intro'
} as const;

export type LibraryTourID = (typeof LibraryTourID)[keyof typeof LibraryTourID];

/** OSS graph tour (composition canvas; passport stays in `oss-passport`). */
export const OssTourID = {
  GRAPH: 'oss-graph'
} as const;

export type OssTourID = (typeof OssTourID)[keyof typeof OssTourID];

/**
 * Model data / evaluation tours — Sandbox and library models only
 * (schemas under `/rsforms` have no Data or Evaluation tabs).
 */
export const ModelTourID = {
  VALUE: 'model-value',
  EVALUATOR: 'model-evaluator'
} as const;

export type ModelTourID = (typeof ModelTourID)[keyof typeof ModelTourID];

/** Routes where shared list/concept/graph editor tours may run. */
export const EDITOR_TOUR_ROUTES = ['/sandbox', '/rsforms', '/models'] as const;

/** Routes where model data / evaluation tours may run. */
export const MODEL_TOUR_ROUTES = ['/sandbox', '/models'] as const;

/**
 * Dialog tours started from modal BadgeHelp while the dialog is open.
 * Not auto-started — anchors live inside the modal.
 */
export const DialogTourID = {
  FORMULA_TREE: 'formula-tree',
  STRUCTURE_PLANNER: 'structure-planner',
  CST_TEMPLATE: 'cst-template',
  RELOCATE_CST: 'relocate-cst',
  CREATE_SYNTHESIS: 'create-synthesis'
} as const;

export type DialogTourID = (typeof DialogTourID)[keyof typeof DialogTourID];
