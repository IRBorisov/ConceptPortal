import {
  NodeType,
  type Operation,
  OperationType,
  type OssItem,
  type SubstitutionErrorDescription,
  SubstitutionErrorType
} from '@/domain/library';
import { globalTx } from '@/i18n';

import { type RO } from '@/utils/meta';

const OPERATION_LABEL_LID: Record<OperationType, string> = {
  [OperationType.INPUT]: 'tx.lib.operation.type.input',
  [OperationType.SYNTHESIS]: 'tx.lib.operation.type.synthesis',
  [OperationType.REPLICA]: 'tx.lib.operation.type.replica'
};

const OPERATION_DESC_LID: Record<OperationType, string> = {
  [OperationType.INPUT]: 'tx.lib.operation.type.input.hint',
  [OperationType.SYNTHESIS]: 'tx.lib.operation.type.synthesis.hint',
  [OperationType.REPLICA]: 'tx.lib.operation.type.replica.hint'
};

/** Retrieves label for {@link OperationType}. */
export function labelOperationType(itemType: OperationType): string {
  const id = OPERATION_LABEL_LID[itemType];
  return id ? globalTx(id) : 'UNKNOWN OPERATION TYPE: ' + String(itemType);
}

/** Retrieves description for {@link OperationType}. */
export function describeOperationType(itemType: OperationType): string {
  const id = OPERATION_DESC_LID[itemType];
  return id ? globalTx(id) : 'UNKNOWN OPERATION TYPE: ' + String(itemType);
}

/** Generates error description for {@link SubstitutionErrorDescription}. */
export function describeSubstitutionError(error: RO<SubstitutionErrorDescription>): string {
  const from = error.params[0] ?? '';
  const to = error.params[1] ?? '';
  switch (error.errorType) {
    case SubstitutionErrorType.invalidIDs:
      return globalTx('labels.oss.substitution.invalidIDs');
    case SubstitutionErrorType.incorrectCst:
      return globalTx('labels.oss.substitution.incorrectCst', { from, to });
    case SubstitutionErrorType.invalidBasic:
      return globalTx('labels.oss.substitution.invalidBasic', { from, to });
    case SubstitutionErrorType.invalidConstant:
      return globalTx('labels.oss.substitution.invalidConstant', { from, to });
    case SubstitutionErrorType.invalidNominal:
      return globalTx('labels.oss.substitution.invalidNominal', { from, to });
    case SubstitutionErrorType.invalidClasses:
      return globalTx('labels.oss.substitution.invalidClasses', { from, to });
    case SubstitutionErrorType.typificationCycle:
      return globalTx('labels.oss.substitution.typificationCycle', { detail: error.params[0] ?? '' });
    case SubstitutionErrorType.baseSubstitutionNotSet:
      return globalTx('labels.oss.substitution.baseSubstitutionNotSet', { from, to: error.params[1] ?? '' });
    case SubstitutionErrorType.unequalTypification:
      return globalTx('labels.oss.substitution.unequalTypification', { from, to });
    case SubstitutionErrorType.unequalArgsCount:
      return globalTx('labels.oss.substitution.unequalArgsCount', { from, to });
    case SubstitutionErrorType.unequalArgs:
      return globalTx('labels.oss.substitution.unequalArgs', { from, to });
    case SubstitutionErrorType.unequalExpressions:
      return globalTx('labels.oss.substitution.unequalExpressions', { from, to });
    default:
      return 'UNKNOWN ERROR';
  }
}

/** Retrieves label for {@link OssItem}. */
export function labelOssItem(item: RO<OssItem>): string {
  if (item.nodeType === NodeType.OPERATION) {
    return `${(item as Operation).alias}: ${item.title}`;
  } else {
    return globalTx('labels.oss.item.blockTitle', { title: item.title });
  }
}
