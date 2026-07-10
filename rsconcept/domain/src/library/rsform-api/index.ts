/**
 * Module: API for formal representation for systems of concepts.
 */

export {
  addAliasReference,
  applyMappingToConstituents,
  argumentValuesToMapping,
  generateAlias,
  removeAliasReference,
  validateAliasFormat,
  validateNewAlias
} from './alias';
export { getAnalysisFor, refineAnalysisForDependencyCycles } from './analysis';
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
export { restoreConstituentOrder } from './formal-graph';
export { calculateSchemaStats, isSchemaIssue } from './stats';
export { findCstByStructure, getStructureName, inferNewSpawnPosition } from './structure';
export { sortItemsForInlineSynthesis } from './synthesis';
