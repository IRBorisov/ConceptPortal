import {
  NodeType,
  OperationType,
  type OssItem,
  type SubstitutionErrorDescription,
  SubstitutionErrorType
} from '@rsconcept/domain/library';
import { globalTx } from '@/i18n';


const OPERATION_LABEL_LID: Record<OperationType, string> = {
  [OperationType.INPUT]: 'tx.oss.input',
  [OperationType.SYNTHESIS]: 'tx.synthesis.short',
  [OperationType.REPLICA]: 'tx.oss.replica'
};

/** Retrieves label for {@link OperationType}. */
export function labelOperationType(itemType: OperationType): string {
  const id = OPERATION_LABEL_LID[itemType];
  return id ? globalTx(id) : 'UNKNOWN OPERATION TYPE: ' + String(itemType);
}

/** Generates error description for {@link SubstitutionErrorDescription}. */
export function describeSubstitutionError(error: SubstitutionErrorDescription): string {
  const from = error.params[0] ?? '';
  const to = error.params[1] ?? '';
  switch (error.errorType) {
    case SubstitutionErrorType.invalidIDs:
      return globalTx('tx.substitution.error.invalidIDs');
    case SubstitutionErrorType.incorrectCst:
      return globalTx('tx.substitution.error.incorrectCst', { from, to });
    case SubstitutionErrorType.invalidBasic:
      return globalTx('tx.substitution.error.invalidBasic', { from, to });
    case SubstitutionErrorType.invalidConstant:
      return globalTx('tx.substitution.error.invalidConstant', { from, to });
    case SubstitutionErrorType.invalidNominal:
      return globalTx('tx.substitution.error.invalidNominal', { from, to });
    case SubstitutionErrorType.invalidClasses:
      return globalTx('tx.substitution.error.invalidClasses', { from, to });
    case SubstitutionErrorType.typificationCycle:
      return globalTx('tx.substitution.error.typificationCycle', { detail: error.params[0] ?? '' });
    case SubstitutionErrorType.baseSubstitutionNotSet:
      return globalTx('tx.substitution.error.baseSubstitutionNotSet', { from, to: error.params[1] ?? '' });
    case SubstitutionErrorType.unequalTypification:
      return globalTx('tx.substitution.error.unequalTypification', { from, to });
    case SubstitutionErrorType.unequalArgsCount:
      return globalTx('tx.substitution.error.unequalArgsCount', { from, to });
    case SubstitutionErrorType.unequalArgs:
      return globalTx('tx.substitution.error.unequalArgs', { from, to });
    case SubstitutionErrorType.unequalExpressions:
      return globalTx('tx.substitution.error.unequalExpressions', { from, to });
    default:
      return 'UNKNOWN ERROR';
  }
}

/** Retrieves label for {@link OssItem}. */
export function labelOssItem(item: OssItem): string {
  if (item.nodeType === NodeType.OPERATION) {
    return `${item.alias}${globalTx('tx.general.colon')}${item.title}`;
  } else {
    return globalTx('tx.oss.block') + ': ' + item.title;
  }
}
