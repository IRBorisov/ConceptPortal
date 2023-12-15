import './index.css';

import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import GlobalProviders from './GlobalProviders';

createRoot(document.getElementById('root')!).render(
  <GlobalProviders>
  
    <App />
  
  </GlobalProviders>
)