/** Validate operator configuration before opening the HTTP listener. */
export function sessionPolicyConfiguration(env: NodeJS.ProcessEnv) {
  const count = integer(env, 'RSTOOL_MAX_SESSIONS_PER_ACCOUNT');
  const seconds = integer(env, 'RSTOOL_SESSION_RETENTION_SECONDS');
  if (seconds !== undefined && !Number.isSafeInteger(seconds * 1000)) {
    throw new Error('RSTOOL_SESSION_RETENTION_SECONDS is too large');
  }
  return { maxStoredSessionsPerAccount: count, sessionRetentionMs: seconds === undefined ? undefined : seconds * 1000 };
}

function integer(env: NodeJS.ProcessEnv, key: string): number | undefined {
  const value = env[key];
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${key} must be a positive integer`);
  }
  return parsed;
}
