'use client';

import { IntlProvider } from 'react-intl';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryClient } from '@/backend/queryClient';

// prettier-ignore
export function GlobalProviders({ children }: React.PropsWithChildren) {
  return (
  <IntlProvider locale='ru' defaultLocale='ru'>
  <QueryClientProvider client={queryClient}>
  
    <ReactQueryDevtools initialIsOpen={false} />
    {children}
  
  </QueryClientProvider>
  </IntlProvider>);
}
