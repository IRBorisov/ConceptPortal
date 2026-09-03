import { createRoot } from 'react-dom/client';
import { reactErrorHandler } from '@sentry/react';

import { initSentry } from '@/services/sentry';

import { captureResetTokenFromUrl } from '@/features/auth/models/password-reset-token';

import { GlobalProviders } from './app/global-providers';
import { handleViewTransitionAbortError } from './app/navigation/view-transition-error';
import { handleStaleBundleError } from './utils/stale-bundle-error';
import { App } from './app';

import './index.css';

// Must run before Sentry reads window.location: reset tokens never enter telemetry.
captureResetTokenFromUrl();
initSentry();

if (typeof window !== 'undefined' && import.meta.env.DEV) {
  void import('react-scan').then(module =>
    module.scan({
      enabled: true
    })
  );
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event: ErrorEvent) => {
    handleStaleBundleError(event.error);
  });

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    if (handleStaleBundleError(event.reason) || handleViewTransitionAbortError(event.reason)) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!, {
  onUncaughtError: reactErrorHandler(),
  onCaughtError: reactErrorHandler(),
  onRecoverableError: reactErrorHandler()
}).render(
  <GlobalProviders>
    <App />
  </GlobalProviders>
);
