import { IntlProvider } from 'react-intl';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryClient } from '@/backend/query-client';

// prettier-ignore
export function GlobalProviders({ children }: React.PropsWithChildren) {
  return (
    <IntlProvider locale='ru' defaultLocale='ru'>
      <QueryClientProvider client={queryClient}>


        {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
        {children}

      </QueryClientProvider>
    </IntlProvider>);
}
