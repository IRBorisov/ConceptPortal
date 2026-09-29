import { useEffect } from 'react';
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-router';
import * as Sentry from '@sentry/react';

import { isViewTransitionAbortError } from '@/app/navigation/view-transition-error';
import { scrubResetTokenFromUrl } from '@/features/auth/models/password-reset-token';

import { isAbortedRequestError } from '@/backend/aborted-request-error';
import { isAxiosError, isCsrfAxiosFailure } from '@/backend/api-transport';
import { buildConstants } from '@/utils/build-constants';
import { isStaleBundleError } from '@/utils/stale-bundle-error';

import { redactCredentialFields, TELEMETRY_HEADER_DENY } from './scrub-telemetry';

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
    // v11 collects cookies, bodies, and inferred IPs unless told otherwise.
    // Keep the v10 posture. Explicit `setUser` still attaches Portal identity.
    // `csrftoken` is named even though the SDK also matches `csrf` and `token`:
    // `beforeSend` redacts it again, because HttpContext forwards event headers unfiltered.
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: {
        request: { deny: [...TELEMETRY_HEADER_DENY] },
        response: { deny: [...TELEMETRY_HEADER_DENY] }
      },
      httpBodies: [],
      urlQueryParams: { deny: [...TELEMETRY_HEADER_DENY] },
      genAI: { inputs: false, outputs: false },
      databaseQueryData: false,
      graphQL: { document: false, variables: false }
    },
    beforeSend(event, hint) {
      if (isViewTransitionAbortError(hint.originalException) || isViewTransitionAbortEvent(event)) {
        return null;
      }
      if (isAbortedRequestError(hint.originalException) || isAbortedRequestSentryEvent(event)) {
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
      return scrubSensitiveUrls(event);
    },
    beforeSendSpan(span) {
      return scrubSpanUrls(span);
    },
    beforeBreadcrumb(breadcrumb) {
      redactCredentialFields(breadcrumb.data);
      const data = breadcrumb.data;
      if (data) {
        for (const key of ['url', 'from', 'to']) {
          if (typeof data[key] === 'string') {
            data[key] = scrubResetTokenFromUrl(data[key]);
          }
        }
      }
      return breadcrumb;
    }
  });

  return true;
}

export function isSentryEnabled(): boolean {
  return Boolean(buildConstants.sentryDsn);
}

export { Sentry };

// ======== Internal functions ========

/** Defense in depth: bearer tokens are stripped before init, but scrub any URL residue anyway. */
function scrubSensitiveUrls<T extends Sentry.Event>(event: T): T {
  if (event.request?.url) {
    event.request.url = scrubResetTokenFromUrl(event.request.url);
  }
  if (event.request?.headers?.Referer) {
    event.request.headers.Referer = scrubResetTokenFromUrl(event.request.headers.Referer);
  }
  redactCredentialFields(event.request);
  redactCredentialFields(event.contexts);
  redactCredentialFields(event.extra);
  if (event.breadcrumbs) {
    for (const breadcrumb of event.breadcrumbs) {
      redactCredentialFields(breadcrumb.data);
    }
  }
  return event;
}

/** Span streaming replaced transactions. Scrub reset tokens from span names and attributes. */
function scrubSpanUrls<T extends { name: string; attributes: Record<string, unknown> }>(span: T): T {
  span.name = scrubResetTokenFromUrl(span.name);
  redactCredentialFields(span.attributes);
  for (const [key, value] of Object.entries(span.attributes)) {
    if (typeof value === 'string') {
      span.attributes[key] = scrubResetTokenFromUrl(value);
    } else if (isStringArray(value)) {
      span.attributes[key] = value.map(item => scrubResetTokenFromUrl(item));
    }
  }
  return span;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function isAbortedRequestSentryEvent(event: Sentry.Event): boolean {
  const exceptionText = event.exception?.values
    ?.map(value => [value.type, value.value].filter(Boolean).join(': '))
    .join('\n');

  return isAbortedRequestError([event.message, exceptionText].filter(Boolean).join('\n'));
}

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
