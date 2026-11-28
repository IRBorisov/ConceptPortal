import { isAxiosError } from 'axios';

import { globalTx } from '@/i18n';

import { isCsrfAxiosFailure } from '@/backend/csrf-token';
import { extractErrorMessage } from '@/utils/utils';

const AUDIENCE_DETAIL = 'The result cannot be shared more widely than its source schemas.';
const SOURCE_DETAIL = 'Every source schema must be readable.';

/** Localized explanation for a failed relativization save, including a 403 from the operation schema. */
export function describeRelativizationRequestError(error: unknown): string {
  const messageId = relativizationFailureMessageId(error);
  if (messageId) {
    return globalTx(messageId);
  }
  if (error instanceof Error) {
    return extractErrorMessage(error);
  }
  return globalTx('tx.oss.relativization.compute.fail');
}

/** Message id for an access refusal, or null when the dialog should keep the usual error text. */
export function relativizationFailureMessageId(error: unknown): string | null {
  if (!isAxiosError(error) || error.response?.status !== 403 || isCsrfAxiosFailure(error)) {
    return null;
  }
  const detail = responseDetail(error.response.data);
  if (detail === AUDIENCE_DETAIL) {
    return 'tx.oss.relativization.access.audience';
  }
  if (detail === SOURCE_DETAIL) {
    return 'tx.oss.relativization.access.source';
  }
  return 'tx.oss.relativization.access.forbidden';
}

function responseDetail(data: unknown): string {
  if (!data || typeof data !== 'object' || !('detail' in data)) {
    return '';
  }
  const detail = data.detail;
  return typeof detail === 'string' ? detail.trim() : '';
}
