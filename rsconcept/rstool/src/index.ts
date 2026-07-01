/**
 * Public API for `@rsconcept/rstool`.
 *
 * Primary entry points: {@link RSToolAgent} (in-process) and {@link RSToolWrapperClient}
 * (stdio child process). Types describe the v2 agent contract.
 */
export { toPublicAnalysis, toPublicError, type DomainAnalysisLike, type DomainErrorLike } from './mappers/types';
export {
  CONTRACT_VERSION,
  CstType,
  EvalStatus,
  RSErrorCode,
  RSToolAgent,
  ValueClass,
  type AgentConstituentaPatch,
  type AnalysisResult,
  type AnalyzeExpressionInput,
  type ApplySchemaPatchInput,
  type ApplySchemaPatchResult,
  type BasicBinding,
  type ConstituentaDraft,
  type ConstituentaState,
  type DiagnosticRecord,
  type EvaluateInput,
  type EvaluationResult,
  type ExportFormat,
  type ExportPortalInput,
  type ExportPortalResult,
  type ImportDataKind,
  type ListDiagnosticsFilters,
  type ModelValueState,
  PORTAL_JSON_CONTRACT_VERSION,
  type PortalExportKind,
  type PortalImportMetadata,
  type PortalModelImportData,
  type PortalRsformDetails,
  type PortalSchemaConstituenta,
  type PortalSchemaImportData,
  type PortalTermForm,
  type RecalculateModelResult,
  type RSToolAgentContract,
  type RSToolAgentOptions,
  type RSToolErrorDescription,
  type RSToolValue,
  type SessionHandle,
  type SessionModelState,
  type SessionRevision,
  type SessionStateDetail,
  type SessionStateResult,
  type SessionSummary,
  type SessionSummaryItem,
  type SessionState,
  type SetConstituentaValueInput,
  type SetModelValuesInput
} from './models';
export { RSToolWrapperClient, type RSToolWrapperClientOptions, type WrapperResponse } from './wrapper/client';
