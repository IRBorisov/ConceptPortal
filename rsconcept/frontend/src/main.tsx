import { createRoot } from 'react-dom/client';

import { GlobalProviders } from './app/global-providers';
import { App } from './app';

import './index.css';

if (typeof window !== 'undefined' && !!process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
  void import('react-scan').then(module =>
    module.scan({
      enabled: true
    })
  );
}

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

createRoot(document.getElementById('root')!).render(
  <GlobalProviders>
    <App />
  </GlobalProviders>
);
