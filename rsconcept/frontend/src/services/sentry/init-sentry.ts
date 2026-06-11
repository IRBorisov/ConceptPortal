import { useEffect } from 'react';
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-router';
import * as Sentry from '@sentry/react';

import { buildConstants } from '@/utils/build-constants';

function resolveTracePropagationTargets(): (string | RegExp)[] {
  const targets: (string | RegExp)[] = [/^\//];
  try {
    targets.push(new URL(buildConstants.backend).origin);
  } catch {
    // ignore invalid backend URL
  }
  return targets;
}

export function initSentry(): boolean {
  const dsn = buildConstants.sentryDsn;
  if (!dsn) {
    return false;
  }

  Sentry.init({
    dsn,
    environment: buildConstants.sentryEnvironment,
    release: buildConstants.sentryRelease,
    tunnel: buildConstants.sentryTunnel,
    integrations: [
      Sentry.reactRouterV7BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes
      }),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true
      })
    ],
    tracesSampleRate: buildConstants.sentryTracesSampleRate,
    tracePropagationTargets: resolveTracePropagationTargets(),
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    enableLogs: true
  });

  return true;
}

export function isSentryEnabled(): boolean {
  return Boolean(buildConstants.sentryDsn);
}

export { Sentry };
