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

createRoot(document.getElementById('root')!).render(
  <GlobalProviders>
    <App />
  </GlobalProviders>
);
