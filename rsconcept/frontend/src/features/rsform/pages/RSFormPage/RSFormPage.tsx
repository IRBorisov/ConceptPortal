'use client';

import { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useParams } from 'react-router';
import { z } from 'zod';

import { urls, useBlockNavigation, useConceptNavigation } from '@/app';

import { isAxiosError } from '@/backend/apiTransport';
import { Divider } from '@/components/Container';
import { TextURL } from '@/components/Control';
import { type ErrorData } from '@/components/InfoError';
import { useQueryStrings } from '@/hooks/useQueryStrings';
import { useModificationStore } from '@/stores/modification';

import { RSEditState, RSTabID } from './RSEditContext';
import { RSTabs } from './RSTabs';

const paramsSchema = z.object({
  id: z.coerce.number(),
  version: z.coerce
    .number()
    .nullish()
    .transform(v => v ?? undefined),
  tab: z.preprocess(v => (v ? Number(v) : undefined), z.nativeEnum(RSTabID).default(RSTabID.CARD)),
  activeID: z.coerce
    .number()
    .nullish()
    .transform(v => v ?? undefined)
});

export function RSFormPage() {
  const router = useConceptNavigation();
  const params = useParams();
  const query = useQueryStrings();

  const urlData = paramsSchema.parse({
    id: params.id,
    version: query.get('v'),
    tab: query.get('tab'),
    activeID: query.get('active')
  });

  const { isModified, setIsModified } = useModificationStore();
  useBlockNavigation(isModified);

  useEffect(() => setIsModified(false), [setIsModified]);

  if (!urlData.id) {
    router.replace({ path: urls.page404, force: true });
    return null;
  }
  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <ProcessError error={error as ErrorData} isArchive={!!urlData.version} itemID={urlData.id} />
      )}
    >
      <RSEditState itemID={urlData.id} activeVersion={urlData.version} activeTab={urlData.tab}>
        <RSTabs activeID={urlData.activeID} activeTab={urlData.tab} />
      </RSEditState>
    </ErrorBoundary>
  );
}

// ====== Internals =========
function ProcessError({
  error,
  isArchive,
  itemID
}: {
  error: ErrorData;
  isArchive: boolean;
  itemID?: number;
}): React.ReactElement | null {
  if (isAxiosError(error) && error.response) {
    if (error.response.status === 404) {
      return (
        <div className='flex flex-col items-center p-2 mx-auto'>
          <p>{`Концептуальная схема с указанным идентификатором ${isArchive ? 'и версией ' : ''}отсутствует`}</p>
          <div className='flex justify-center'>
            <TextURL text='Библиотека' href='/library' />
            {isArchive ? <Divider vertical margins='mx-3' /> : null}
            {isArchive ? <TextURL text='Актуальная версия' href={`/rsforms/${itemID}`} /> : null}
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
