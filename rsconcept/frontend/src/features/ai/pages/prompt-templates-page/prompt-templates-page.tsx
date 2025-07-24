import { ErrorBoundary } from 'react-error-boundary';
import { isAxiosError } from 'axios';
import { z } from 'zod';

import { useBlockNavigation } from '@/app';
import { routes } from '@/app/urls';
import { RequireAuth } from '@/features/auth/components/require-auth';

import { TextURL } from '@/components/control';
import { type ErrorData } from '@/components/info-error';
import { useQueryStrings } from '@/hooks/use-query-strings';
import { useModificationStore } from '@/stores/modification';

import { PromptTabID, TemplatesTabs } from './templates-tabs';

const paramsSchema = z.strictObject({
  tab: z.preprocess(v => (v ? Number(v) : undefined), z.enum(PromptTabID).default(PromptTabID.LIST)),
  active: z.preprocess(v => (v ? Number(v) : undefined), z.number().nullable().default(null))
});

export function PromptTemplatesPage() {
  const query = useQueryStrings();

  const urlData = paramsSchema.parse({
    tab: query.get('tab'),
    active: query.get('active')
  });

  const { isModified } = useModificationStore();
  useBlockNavigation(isModified);

  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => <ProcessError error={error as ErrorData} itemID={urlData.active} />}
    >
      <RequireAuth>
        <TemplatesTabs activeID={urlData.active} tab={urlData.tab} />
      </RequireAuth>
    </ErrorBoundary>
  );
}

// ====== Internals =========
function ProcessError({ error, itemID }: { error: ErrorData; itemID?: number | null }): React.ReactElement | null {
  if (isAxiosError(error) && error.response) {
    if (error.response.status === 404) {
      return (
        <div className='flex flex-col items-center p-2 mx-auto'>
          <p>{`Шаблон запроса с указанным идентификатором ${itemID} отсутствует`}</p>
          <div className='flex justify-center'>
            <TextURL text='Список шаблонов' href={`/${routes.prompt_templates}`} />
          </div>
        </div>
      );
    }
  }
  throw error as Error;
}
