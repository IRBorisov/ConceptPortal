import { useEffect } from 'react';
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-router';
import * as Sentry from '@sentry/react';

import { isViewTransitionAbortError } from '@/app/navigation/view-transition-error';

import { buildConstants } from '@/utils/build-constants';
import { isStaleBundleError } from '@/utils/stale-bundle-error';

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
    enableLogs: true,
    beforeSend(event, hint) {
      if (isViewTransitionAbortError(hint.originalException) || isViewTransitionAbortEvent(event)) {
        return null;
      }
      if (isStaleBundleError(hint.originalException) || isStaleBundleSentryEvent(event)) {
        return null;
      }
      return event;
    }
  });

  return true;
}

export function isSentryEnabled(): boolean {
  return Boolean(buildConstants.sentryDsn);
}

export { Sentry };

function isViewTransitionAbortEvent(event: Sentry.Event): boolean {
  const exceptionText = event.exception?.values
    ?.map(value => [value.type, value.value].filter(Boolean).join(': '))
    .join('\n');

  return isViewTransitionAbortError([event.message, exceptionText].filter(Boolean).join('\n'));
}

function isStaleBundleSentryEvent(event: Sentry.Event): boolean {
  const exceptionText = event.exception?.values
    ?.map(value => [value.type, value.value].filter(Boolean).join(': '))
    .join('\n');

  return isStaleBundleError([event.message, exceptionText].filter(Boolean).join('\n'));
}
