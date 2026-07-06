import { type CstDiagnostic, DiagnosticKind, RSDiagnosticCode } from '@rsconcept/domain/library';

export {
  type Diagnostic,
  type DiagnosticSeverity,
  type DiagnosticTarget,
  expandCstDiagnostic,
  expressionDiagnostic,
  getDiagnosticName,
  getDiagnosticSeverity,
  modelStatusDiagnostic
} from '../mappers/diagnostic-assembly';

export { type CstDiagnostic, DiagnosticKind, RSDiagnosticCode };

/** Filters for {@link RSToolAgent.listDiagnostics}. */
export interface ListDiagnosticsFilters {
  constituentId?: number;
  kind?: DiagnosticKind;
  severity?: import('../mappers/diagnostic-assembly').DiagnosticSeverity;
}
