import { createRoot } from 'react-dom/client';

import { GlobalProviders } from './app/GlobalProviders';
import { App } from './app';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <GlobalProviders>
    <App />
  </GlobalProviders>
);
