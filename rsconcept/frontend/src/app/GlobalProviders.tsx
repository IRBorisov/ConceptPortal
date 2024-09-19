'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { IntlProvider } from 'react-intl';

import { AuthState } from '@/context/AuthContext';
import { OptionsState } from '@/context/ConceptOptionsContext';
import { GlobalOssState } from '@/context/GlobalOssContext';
import { LibraryState } from '@/context/LibraryContext';
import { UsersState } from '@/context/UsersContext';

import ErrorFallback from './ErrorFallback';

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
function GlobalProviders({ children }: React.PropsWithChildren) {
  return (
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onReset={resetState}
    onError={logError}
  >
  <IntlProvider locale='ru' defaultLocale='ru'>
  <OptionsState>
  <UsersState>
  <AuthState>
  <LibraryState>
  <GlobalOssState>

    {children}
  
  </GlobalOssState>
  </LibraryState>
  </AuthState>
  </UsersState>
  </OptionsState>
  </IntlProvider>
  </ErrorBoundary>);
}

export default GlobalProviders;
