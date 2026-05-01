import {
  NodeType,
  type Operation,
  OperationType,
  type OssItem,
  type SubstitutionErrorDescription,
  SubstitutionErrorType
} from '@/domain/library';
import { formatLabel } from '@/i18n';
import { ossLid } from '@/i18n/labels/oss-ui';

import { type RO } from '@/utils/meta';

const OPERATION_LABEL_LID: Record<OperationType, string> = {
  [OperationType.INPUT]: ossLid.operation.input,
  [OperationType.SYNTHESIS]: ossLid.operation.synthesis,
  [OperationType.REPLICA]: ossLid.operation.replica
};

const OPERATION_DESC_LID: Record<OperationType, string> = {
  [OperationType.INPUT]: ossLid.operationDesc.input,
  [OperationType.SYNTHESIS]: ossLid.operationDesc.synthesis,
  [OperationType.REPLICA]: ossLid.operationDesc.replica
};

/** Retrieves label for {@link OperationType}. */
export function labelOperationType(itemType: OperationType): string {
  const id = OPERATION_LABEL_LID[itemType];
  return id ? formatLabel(id) : formatLabel(ossLid.fallback.unknownOperationType, { type: String(itemType) });
}

/** Retrieves description for {@link OperationType}. */
export function describeOperationType(itemType: OperationType): string {
  const id = OPERATION_DESC_LID[itemType];
  return id ? formatLabel(id) : formatLabel(ossLid.fallback.unknownOperationType, { type: String(itemType) });
}

/** Generates error description for {@link SubstitutionErrorDescription}. */
export function describeSubstitutionError(error: RO<SubstitutionErrorDescription>): string {
  const from = error.params[0] ?? '';
  const to = error.params[1] ?? '';
  switch (error.errorType) {
    case SubstitutionErrorType.invalidIDs:
      return formatLabel(ossLid.substitution.invalidIDs);
    case SubstitutionErrorType.incorrectCst:
      return formatLabel(ossLid.substitution.incorrectCst, { from, to });
    case SubstitutionErrorType.invalidBasic:
      return formatLabel(ossLid.substitution.invalidBasic, { from, to });
    case SubstitutionErrorType.invalidConstant:
      return formatLabel(ossLid.substitution.invalidConstant, { from, to });
    case SubstitutionErrorType.invalidNominal:
      return formatLabel(ossLid.substitution.invalidNominal, { from, to });
    case SubstitutionErrorType.invalidClasses:
      return formatLabel(ossLid.substitution.invalidClasses, { from, to });
    case SubstitutionErrorType.typificationCycle:
      return formatLabel(ossLid.substitution.typificationCycle, { detail: error.params[0] ?? '' });
    case SubstitutionErrorType.baseSubstitutionNotSet:
      return formatLabel(ossLid.substitution.baseSubstitutionNotSet, { from, to: error.params[1] ?? '' });
    case SubstitutionErrorType.unequalTypification:
      return formatLabel(ossLid.substitution.unequalTypification, { from, to });
    case SubstitutionErrorType.unequalArgsCount:
      return formatLabel(ossLid.substitution.unequalArgsCount, { from, to });
    case SubstitutionErrorType.unequalArgs:
      return formatLabel(ossLid.substitution.unequalArgs, { from, to });
    case SubstitutionErrorType.unequalExpressions:
      return formatLabel(ossLid.substitution.unequalExpressions, { from, to });
    default:
      return formatLabel(ossLid.fallback.unknownSubstitutionError);
  }
}

/** Retrieves label for {@link OssItem}. */
export function labelOssItem(item: RO<OssItem>): string {
  if (item.nodeType === NodeType.OPERATION) {
    return `${(item as Operation).alias}: ${item.title}`;
  } else {
    return formatLabel(ossLid.item.blockTitle, { title: item.title });
  }
}
