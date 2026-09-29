/**
 * Credential fields that must not leave the browser in Sentry payloads.
 *
 * SDK 11's built-in denylist already matches `csrf` and `token` inside `x-csrftoken`,
 * but `HttpContext` copies headers already present on an event without filtering them.
 * These snippets are applied again in `beforeSend` / `beforeSendSpan` / `beforeBreadcrumb`.
 * Match is a case-insensitive substring, same as the SDK.
 */
const CREDENTIAL_KEY_SNIPPETS = ['csrftoken', 'authorization', 'cookie'] as const;

const MAX_REDACTION_DEPTH = 8;

export const FILTERED_TELEMETRY_VALUE = '[Filtered]';

/**
 * Terms passed to `dataCollection` header and query denylists.
 * The first five mirror Sentry's documented identity-header extension.
 * The rest name secrets this app actually sends.
 */
export const TELEMETRY_HEADER_DENY = [
  'forwarded',
  '-ip',
  'remote-',
  'via',
  '-user',
  'csrftoken',
  'authorization',
  'cookie'
] as const;

export function isCredentialTelemetryKey(key: string): boolean {
  const lower = key.toLowerCase();
  return CREDENTIAL_KEY_SNIPPETS.some(snippet => lower.includes(snippet));
}

/** Replace values whose keys name a credential. Mutates plain objects and arrays in place. */
export function redactCredentialFields(value: unknown, depth = 0): void {
  if (depth > MAX_REDACTION_DEPTH || value == null) {
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      redactCredentialFields(item, depth + 1);
    }
    return;
  }
  if (!isPlainRecord(value)) {
    return;
  }
  for (const key of Object.keys(value)) {
    if (isCredentialTelemetryKey(key)) {
      value[key] = FILTERED_TELEMETRY_VALUE;
      continue;
    }
    redactCredentialFields(value[key], depth + 1);
  }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
