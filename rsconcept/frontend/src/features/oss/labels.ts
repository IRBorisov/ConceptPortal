import { globalTx } from '@/i18n';
import {
  NodeType,
  OperationType,
  type OssItem,
  type SubstitutionErrorDescription
} from '@rsconcept/domain/library';

import { describeDiagnostic } from '@/features/rsform/labels';

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
  return describeDiagnostic(error);
}

/** Retrieves label for {@link OssItem}. */
export function labelOssItem(item: OssItem): string {
  if (item.nodeType === NodeType.OPERATION) {
    return `${item.alias}${globalTx('tx.general.colon')}${item.title}`;
  } else {
    return globalTx('tx.oss.block') + ': ' + item.title;
  }
}
