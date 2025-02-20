import { createRoot } from 'react-dom/client';
import { scan } from 'react-scan';

import { GlobalProviders } from './app/GlobalProviders';
import { App } from './app';

import './index.css';

if (typeof window !== 'undefined') {
  scan({
    enabled: !!process.env.NODE_ENV && process.env.NODE_ENV === 'development'
  });
}

createRoot(document.getElementById('root')!).render(
  <GlobalProviders>
    <App />
  </GlobalProviders>
);
