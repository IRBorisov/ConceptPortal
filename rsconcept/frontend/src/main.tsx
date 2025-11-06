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
  window.addEventListener('error', (event: ErrorEvent) => {
    const error = event.error as Error;
    if (
      error instanceof Error &&
      typeof error.message === 'string' &&
      error.message.includes('Failed to fetch dynamically imported module')
    ) {
      console.warn('Detected stale bundle — reloading...');
      window.location.reload();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <GlobalProviders>
    <App />
  </GlobalProviders>
);
