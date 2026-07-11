/**
 * Schema-level statistics and issue flags.
 */

import { TypeID, type Typification, ValueClass } from '../../rslang';
import { hasCstDiagnostic, RSDiagnosticCode } from '../diagnostics';
import { CstStatus, CstType, type RSForm, type RSFormStats } from '../rsform';

import { isBasicConcept, isLogical } from './cst-type';
import { type BasicTextCheckFields, type SchemaIssueFields, type StructureCapableFields } from './types';

/** Checks if an item is a schema issue. */
export function isSchemaIssue(cst: SchemaIssueFields): boolean {
  return (
    (cst.diagnostics?.length ?? 0) > 0 || cst.status === CstStatus.INCORRECT || cst.status === CstStatus.INCALCULABLE
  );
}

/** Calculate statistics for {@link RSForm}. */
export function calculateSchemaStats(target: RSForm): RSFormStats {
  const stats: RSFormStats = {
    count_all: target.items.length,
    count_crucial: 0,
    step_complexity: 0,
    count_problematic: 0,
    count_homonyms: 0,
    count_formal_duplicates: 0,
    count_missing_basic_text: 0,
    count_type_mismatch: 0,
    count_incorrect: 0,
    count_property: 0,
    count_incalculable: 0,
    count_inherited: 0,
    count_text_term: 0,
    count_definition: 0,
    count_convention: 0,
    count_comment: 0,
    count_base: 0,
    count_constant: 0,
    count_structured: 0,
    count_axiom: 0,
    count_term: 0,
    count_function: 0,
    count_predicate: 0,
    count_statement: 0,
    count_nominal: 0
  };

  for (const cst of target.items) {
    if (cst.crucial) {
      stats.count_crucial += 1;
    }
    stats.step_complexity += calculateStepComplexity(cst);

    if (isSchemaIssue(cst)) {
      stats.count_problematic += 1;
    }
    if (hasCstDiagnostic(cst, RSDiagnosticCode.schemaHomonym)) {
      stats.count_homonyms += 1;
    }
    if (hasCstDiagnostic(cst, RSDiagnosticCode.schemaFormalDuplicate)) {
      stats.count_formal_duplicates += 1;
    }
    if (isMissingBasicText(cst)) {
      stats.count_missing_basic_text += 1;
    }
    if (cst.is_type_mismatch) {
      stats.count_type_mismatch += 1;
    }
    if (cst.status === CstStatus.INCORRECT) {
      stats.count_incorrect += 1;
    }
    if (cst.analysis?.valueClass === ValueClass.PROPERTY) {
      stats.count_property += 1;
    }
    if (cst.analysis?.success && cst.analysis.valueClass === null) {
      stats.count_incalculable += 1;
    }
    if (cst.is_inherited) {
      stats.count_inherited += 1;
    }
    if (cst.term_raw) {
      stats.count_text_term += 1;
    }
    if (cst.definition_raw) {
      stats.count_definition += 1;
    }
    if (isBasicConcept(cst.cst_type) && cst.convention) {
      stats.count_convention += 1;
    }
    if (!isBasicConcept(cst.cst_type) && !cst.convention) {
      stats.count_comment += 1;
    }

    switch (cst.cst_type) {
      case CstType.BASE:
        stats.count_base += 1;
        break;
      case CstType.CONSTANT:
        stats.count_constant += 1;
        break;
      case CstType.STRUCTURED:
        stats.count_structured += 1;
        break;
      case CstType.AXIOM:
        stats.count_axiom += 1;
        break;
      case CstType.TERM:
        stats.count_term += 1;
        break;
      case CstType.FUNCTION:
        stats.count_function += 1;
        break;
      case CstType.PREDICATE:
        stats.count_predicate += 1;
        break;
      case CstType.STATEMENT:
        stats.count_statement += 1;
        break;
      case CstType.NOMINAL:
        stats.count_nominal += 1;
        break;
    }
  }

  return stats;
}

function calculateStepComplexity(cst: StructureCapableFields): number {
  if (cst.cst_type === CstType.AXIOM || cst.cst_type === CstType.NOMINAL || !isBasicConcept(cst.cst_type)) {
    return 0;
  }
  if (cst.cst_type === CstType.BASE || cst.cst_type === CstType.CONSTANT || !cst.effectiveType) {
    return 1;
  }

  const type = cst.effectiveType as Typification;
  return calculateTypificationComplexity(type) + 1;
}

function calculateTypificationComplexity(type: Typification): number {
  switch (type.typeID) {
    case TypeID.basic:
    case TypeID.integer:
    case TypeID.anyTypification:
      return 0;
    case TypeID.tuple:
      return (
        type.factors.length + type.factors.reduce((sum, factor) => sum + calculateTypificationComplexity(factor), 0)
      );
    case TypeID.collection:
      if (type.base.typeID === TypeID.tuple) {
        let sum = 0;
        type.base.factors.forEach(factor => {
          sum += calculateTypificationComplexity(factor);
        });
        return sum + type.base.factors.length;
      } else if (type.base.typeID === TypeID.collection) {
        return calculateTypificationComplexity(type.base) + 1;
      }
      return 0;
  }
}

/** Non-logical basic concept missing convention and/or resolved term (trimmed). */
function isMissingBasicText(cst: BasicTextCheckFields): boolean {
  if (!isBasicConcept(cst.cst_type) || isLogical(cst.cst_type)) {
    return false;
  }
  return !cst.convention.trim() || !cst.term_resolved.trim();
}
