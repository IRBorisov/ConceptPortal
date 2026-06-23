import { useEffect } from 'react';
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-router';
import * as Sentry from '@sentry/react';

import { isViewTransitionAbortError } from '@/app/navigation/view-transition-error';

import { isAxiosError, isCsrfAxiosFailure } from '@/backend/api-transport';
import { buildConstants } from '@/utils/build-constants';
import { isStaleBundleError } from '@/utils/stale-bundle-error';

const LOGIN_ENDPOINT = '/users/api/login';
const LIBRARY_ITEM_DETAILS_PATTERN =
  /^\/api\/(?:rsforms\/\d+\/details|library\/\d+\/versions\/\d+|oss\/\d+\/details|models\/\d+\/details)/;
const LIBRARY_ITEM_PAGE_ROUTE_PATTERN = /^\/(?:rsforms|oss|models)\/\d+/;
const EXPECTED_LIBRARY_HTTP_STATUSES = new Set([403, 404]);

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
      if (isExpectedLoginValidationFailure(hint.originalException) || isExpectedLoginValidationEvent(event)) {
        return null;
      }
      if (isExpectedLibraryItemHttpError(hint.originalException) || isExpectedLibraryItemHttpSentryEvent(event)) {
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

// ======== Internal functions ========

function isViewTransitionAbortEvent(event: Sentry.Event): boolean {
  const exceptionText = event.exception?.values
    ?.map(value => [value.type, value.value].filter(Boolean).join(': '))
    .join('\n');

  return isViewTransitionAbortError([event.message, exceptionText].filter(Boolean).join('\n'));
}

function isExpectedLoginValidationFailure(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 400 && isLoginEndpoint(error.config?.url);
}

function isExpectedLoginValidationEvent(event: Sentry.Event): boolean {
  return Boolean(
    event.breadcrumbs?.some(
      breadcrumb =>
        breadcrumb.category === 'xhr' &&
        Number(breadcrumb.data?.status_code) === 400 &&
        isLoginEndpoint(breadcrumb.data?.url)
    )
  );
}

function isLoginEndpoint(url: unknown): boolean {
  return typeof url === 'string' && url.includes(LOGIN_ENDPOINT);
}

function isStaleBundleSentryEvent(event: Sentry.Event): boolean {
  const exceptionText = event.exception?.values
    ?.map(value => [value.type, value.value].filter(Boolean).join(': '))
    .join('\n');

  return isStaleBundleError([event.message, exceptionText].filter(Boolean).join('\n'));
}

function isExpectedLibraryItemHttpError(error: unknown): boolean {
  if (!isAxiosError(error) || !error.response) {
    return false;
  }
  if (!EXPECTED_LIBRARY_HTTP_STATUSES.has(error.response.status)) {
    return false;
  }
  if (error.response.status === 403 && isCsrfAxiosFailure(error)) {
    return false;
  }
  const url = error.config?.url;
  return typeof url === 'string' && isLibraryItemDetailsUrl(url);
}

function isExpectedLibraryItemHttpSentryEvent(event: Sentry.Event): boolean {
  const transaction = event.transaction;
  if (!transaction || !LIBRARY_ITEM_PAGE_ROUTE_PATTERN.test(transaction)) {
    return false;
  }
  if (!hasExpectedLibraryHttpStatus(event)) {
    return false;
  }
  return !hasCsrfFailureBreadcrumb(event);
}

function isLibraryItemDetailsUrl(url: string): boolean {
  const path = url.startsWith('http') ? extractPathname(url) : url.split('?')[0];
  return path !== undefined && LIBRARY_ITEM_DETAILS_PATTERN.test(path);
}

function extractPathname(url: string): string | undefined {
  try {
    return new URL(url).pathname;
  } catch {
    return undefined;
  }
}

function hasExpectedLibraryHttpStatus(event: Sentry.Event): boolean {
  const exceptionText = event.exception?.values
    ?.map(value => [value.type, value.value].filter(Boolean).join(': '))
    .join('\n');

  return exceptionText?.includes('status code 403') === true || exceptionText?.includes('status code 404') === true;
}

function hasCsrfFailureBreadcrumb(event: Sentry.Event): boolean {
  return Boolean(
    event.breadcrumbs?.some(
      breadcrumb =>
        breadcrumb.category === 'xhr' &&
        Number(breadcrumb.data?.status_code) === 403 &&
        typeof breadcrumb.data?.url === 'string' &&
        breadcrumb.data.url.toLowerCase().includes('csrf')
    )
  );
}
