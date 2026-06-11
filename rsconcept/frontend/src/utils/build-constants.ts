/**
 * Variable constants depending on build type.
 * Extracted as separate file because of bundler issues during tests
 */
function parseSampleRate(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback;
}

export const buildConstants = {
  backend: import.meta.env.VITE_PORTAL_BACKEND as string,
  sentryDsn: (import.meta.env.VITE_SENTRY_DSN as string | undefined) || undefined,
  sentryEnvironment: (import.meta.env.VITE_SENTRY_ENVIRONMENT as string | undefined) || import.meta.env.MODE,
  sentryRelease: (import.meta.env.VITE_SENTRY_RELEASE as string | undefined) || undefined,
  sentryTunnel: (import.meta.env.VITE_SENTRY_TUNNEL as string | undefined) || undefined,
  sentryTracesSampleRate: parseSampleRate(
    import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE as string | undefined,
    import.meta.env.PROD ? 0.2 : 1
  )
} as const;
