'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { IntlPreferencesProvider } from '@/i18n/intl-provider';

import { queryClient } from '@/backend/query-client';
import { usePreferencesSync } from '@/stores/use-preferences-sync';

// prettier-ignore
export function GlobalProviders({ children }: React.PropsWithChildren) {
  usePreferencesSync();

  return (
    <IntlPreferencesProvider>
      <QueryClientProvider client={queryClient}>
        {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
        {children}
      </QueryClientProvider>
    </IntlPreferencesProvider>);
}
