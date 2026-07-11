/**
 * Module: API for formal representation for systems of concepts.
 */

export {
  addAliasReference,
  allocateImportAliases,
  applyMappingToConstituents,
  argumentValuesToMapping,
  buildSequentialAliasMapping,
  generateAlias,
  type MappableFields,
  maxAliasIndex,
  removeAliasReference,
  validateAliasFormat,
  validateNewAlias
} from './alias';
export { getAnalysisFor, refineAnalysisForDependencyCycles } from './analysis';
export { filterAttributions, importAttributions, remapAttributionsUnderSubstitution } from './attribution';
export {
  canHaveManualTypification,
  canProduceStructure,
  getCstTypePrefix,
  guessCstType,
  inferClass,
  isBaseSet,
  isBasicConcept,
  isFunctional,
  isLogical,
  isTemplateCst,
  typeClassForCstType
} from './cst-type';
export { applyFilterCategory, inferStatus, inferTemplate, inferTemplatedType, normalizeExpression } from './expression';
export { buildFormalDependencyGraph, restoreConstituentOrder } from './formal-graph';
export { calculateSchemaStats, isSchemaIssue } from './stats';
export { findCstByStructure, getStructureName, inferNewSpawnPosition } from './structure';
export { applyConstituentSubstitutions, remapSubstitutionsAfterImport, type SubstitutionResult } from './substitution';
export {
  inlineSynthesis,
  type InlineSynthesisInput,
  type InlineSynthesisResult,
  sortItemsForInlineSynthesis,
  type SynthesizableFields
} from './synthesis';
export {
  buildDefinitionReferenceGraph,
  buildTermReferenceGraph,
  resolveAllConstituentTexts,
  resolveConstituentTextChange,
  type TextChangeOptions
} from './text-resolution';
export { insertItemAfter, moveIdsInOrder, reorderItemsByIds } from './transforms';
export type {
  AliasTypedFields,
  BasicTextCheckFields,
  DescribableFields,
  DiagnosticSourceFields,
  FormalOrderFields,
  ModelEvalFields,
  SchemaIssueFields,
  SearchableFields,
  SemanticRelations,
  SpawnPathFields,
  StructureCapableFields,
  TemplateParamSourceFields,
  TemplateSourceFields,
  TextResolvableFields
} from './types';
