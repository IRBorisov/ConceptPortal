'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from 'react-error-boundary';
import { IntlProvider } from 'react-intl';

import { queryClient } from '@/backend/queryClient';

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
  <QueryClientProvider client={queryClient}>
  
    <ReactQueryDevtools initialIsOpen={false} />
    {children}
  
  </QueryClientProvider>
  </IntlProvider>
  </ErrorBoundary>);
}

export default GlobalProviders;
