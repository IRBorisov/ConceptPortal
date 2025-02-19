'use client';

import { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useParams } from 'react-router';
import { z } from 'zod';

import { urls, useBlockNavigation, useConceptNavigation } from '@/app';

import { isAxiosError } from '@/backend/apiTransport';
import { TextURL } from '@/components/Control';
import { ErrorData } from '@/components/InfoError';
import { useQueryStrings } from '@/hooks/useQueryStrings';
import { useModificationStore } from '@/stores/modification';

import { OssEditState, OssTabID } from './OssEditContext';
import { OssTabs } from './OssTabs';

const paramsSchema = z.object({
  id: z.coerce.number(),
  tab: z.preprocess(v => (v ? Number(v) : undefined), z.nativeEnum(OssTabID).default(OssTabID.GRAPH))
});

export function OssPage() {
  const router = useConceptNavigation();
  const params = useParams();
  const query = useQueryStrings();

  const urlData = paramsSchema.parse({
    id: params.id,
    tab: query.get('tab')
  });

  const { isModified, setIsModified } = useModificationStore();
  useBlockNavigation(isModified);

  useEffect(() => setIsModified(false), [setIsModified]);

  if (!urlData.id) {
    router.replace(urls.page404);
    return null;
  }

  return (
    <ErrorBoundary FallbackComponent={ProcessError}>
      <OssEditState itemID={urlData.id}>
        <OssTabs activeTab={urlData.tab} />
      </OssEditState>
    </ErrorBoundary>
  );
}

// ====== Internals =========
function ProcessError({ error }: { error: ErrorData }): React.ReactElement {
  if (isAxiosError(error) && error.response) {
    if (error.response.status === 404) {
      return (
        <div className='flex flex-col items-center p-2 mx-auto'>
          <p>{`Операционная схема с указанным идентификатором отсутствует`}</p>
          <div className='flex justify-center'>
            <TextURL text='Библиотека' href='/library' />
          </div>
        </div>
      );
    } else if (error.response.status === 403) {
      return (
        <div className='flex flex-col items-center p-2 mx-auto'>
          <p>Владелец ограничил доступ к данной схеме</p>
          <TextURL text='Библиотека' href='/library' />
        </div>
      );
    }
  }
  throw error as Error;
}
