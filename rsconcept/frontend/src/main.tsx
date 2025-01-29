import './index.css';

import { createRoot } from 'react-dom/client';

import App from './app';
import GlobalProviders from './app/GlobalProviders';

createRoot(document.getElementById('root')!).render(
  <GlobalProviders>
    <App />
  </GlobalProviders>
);
