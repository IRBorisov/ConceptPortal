import './index.css'

import React from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary';
import { IntlProvider } from 'react-intl';

import App from './App.tsx'
import ErrorFallback from './components/ErrorFallback.tsx';
import { AuthState } from './context/AuthContext.tsx';
import { LibraryState } from './context/LibraryContext.tsx';
import { ThemeState } from './context/ThemeContext.tsx';
import { UsersState } from './context/UsersContext.tsx';

const resetState = () => {
  console.log('Resetting state after error fallback')
};

const logError = (error: Error, info: { componentStack?: string | null | undefined }) => {
  console.log('Error fallback: ' + error.message);
  if (info.componentStack) {
    console.log('Component stack: ' + info.componentStack);
  }
};

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onReset={resetState}
    onError={logError}
  >
  <IntlProvider locale='ru' defaultLocale='ru'>
  <ThemeState>
  <UsersState>
  <AuthState>
  <LibraryState>
  
    <App />
  
  </LibraryState>
  </AuthState>
  </UsersState>
  </ThemeState>
  </IntlProvider>
  </ErrorBoundary>
  </React.StrictMode>
)
