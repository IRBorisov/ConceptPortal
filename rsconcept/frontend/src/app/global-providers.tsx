import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryClient } from '@/backend/query-client';

import { IntlPreferencesProvider } from './intl-provider';

// prettier-ignore
export function GlobalProviders({ children }: React.PropsWithChildren) {
  return (
    <IntlPreferencesProvider>
      <QueryClientProvider client={queryClient}>
        {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
        {children}
      </QueryClientProvider>
    </IntlPreferencesProvider>);
}
