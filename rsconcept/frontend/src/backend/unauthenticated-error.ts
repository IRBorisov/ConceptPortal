import axios from 'axios';

import { isCsrfAxiosFailure } from './csrf-token';

/** DRF NotAuthenticated detail fragments (en / ru). */
const UNAUTHENTICATED_DETAIL_MARKERS = [
  'credentials were not provided',
  'учетные данные не были предоставлены',
  'authentication credentials',
  'not authenticated'
] as const;

function readErrorDetail(data: unknown): string | undefined {
  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }
  if (data && typeof data === 'object' && 'detail' in data) {
    const detail = data.detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail.trim();
    }
  }
  return undefined;
}

/**
 * True when the backend rejected the request because the session/credentials are missing
 * (DRF ``NotAuthenticated``), as opposed to CSRF failure or insufficient permissions.
 */
export function isUnauthenticatedAxiosError(error: unknown): boolean {
  if (!axios.isAxiosError(error) || !error.response) {
    return false;
  }

  const status = error.response.status;
  if (status === 401) {
    return true;
  }
  if (status !== 403 || isCsrfAxiosFailure(error)) {
    return false;
  }

  const detail = readErrorDetail(error.response.data as unknown)?.toLowerCase();
  if (!detail) {
    return false;
  }
  return UNAUTHENTICATED_DETAIL_MARKERS.some(marker => detail.includes(marker));
}
