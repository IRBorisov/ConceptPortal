import './index.css';

import { createRoot } from 'react-dom/client';

import App from './app';
import GlobalProviders from './app/GlobalProviders';
import { authApi } from './backend/auth/api';
import { queryClient } from './backend/queryClient';

// Prefetch auth data
queryClient.prefetchQuery(authApi.getAuthQueryOptions()).catch(console.error);

createRoot(document.getElementById('root')!).render(
  <GlobalProviders>
    <App />
  </GlobalProviders>
);
