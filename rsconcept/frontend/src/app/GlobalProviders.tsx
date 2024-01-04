'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { IntlProvider } from 'react-intl';
import { pdfjs } from 'react-pdf';

import { AuthState } from '@/context/AuthContext';
import { LibraryState } from '@/context/LibraryContext';
import { ThemeState } from '@/context/ThemeContext';
import { UsersState } from '@/context/UsersContext';

import ErrorFallback from './ErrorFallback';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();

const resetState = () => {
  console.log('Resetting state after error fallback');
};

const logError = (error: Error, info: { componentStack?: string | null | undefined }) => {
  console.log('Error fallback: ' + error.message);
  if (info.componentStack) {
    console.log('Component stack: ' + info.componentStack);
  }
};

// prettier-ignore
function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
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

    {children}
    
  </LibraryState>
  </AuthState>
  </UsersState>
  </ThemeState>
  </IntlProvider>
  </ErrorBoundary>);
}

export default GlobalProviders;
