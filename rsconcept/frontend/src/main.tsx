import { createRoot } from 'react-dom/client';

import { GlobalProviders } from './app/global-providers';
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
  function handleStaleBundleError(error: unknown): boolean {
    if (error instanceof Error && error.message.includes('Failed to fetch dynamically imported module')) {
      console.warn('Detected stale bundle — reloading...');
      window.location.reload();
      return true;
    }
    if (typeof error === 'string' && error.includes('Failed to fetch dynamically imported module')) {
      console.warn('Detected stale bundle — reloading...');
      window.location.reload();
      return true;
    }
    return false;
  }

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
