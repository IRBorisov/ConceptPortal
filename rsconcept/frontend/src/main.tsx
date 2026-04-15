import { createRoot } from 'react-dom/client';

import { GlobalProviders } from './app/global-providers';
import { handleStaleBundleError } from './utils/stale-bundle-error';
import { App } from './app';

import './index.css';

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
    if (handleStaleBundleError(event.reason)) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <GlobalProviders>
    <App />
  </GlobalProviders>
);
