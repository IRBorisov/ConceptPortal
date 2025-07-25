'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { useParams } from 'react-router';
import { z } from 'zod';

import { urls, useBlockNavigation, useConceptNavigation } from '@/app';
import { ConstituentaTooltip } from '@/features/rsform/components/constituenta-tooltip';

import { isAxiosError } from '@/backend/api-transport';
import { TextURL } from '@/components/control';
import { type ErrorData } from '@/components/info-error';
import { useQueryStrings } from '@/hooks/use-query-strings';
import { useResetModification } from '@/hooks/use-reset-modification';
import { useModificationStore } from '@/stores/modification';

import { OperationTooltip } from '../../components/tooltip-oss-item';

import { OssTabID } from './oss-edit-context';
import { OssEditState } from './oss-edit-state';
import { OssTabs } from './oss-tabs';

const paramsSchema = z.strictObject({
  id: z.coerce.number(),
  tab: z.preprocess(v => (v ? Number(v) : undefined), z.enum(OssTabID).default(OssTabID.GRAPH))
});

export function OssPage() {
  useResetModification();

  const router = useConceptNavigation();
  const params = useParams();
  const query = useQueryStrings();

  const urlData = paramsSchema.parse({
    id: params.id,
    tab: query.get('tab')
  });

  const isModified = useModificationStore(state => state.isModified);
  useBlockNavigation(isModified);

  if (!urlData.id) {
    router.replace({ path: urls.page404, force: true });
    return null;
  }

  return (
    <ErrorBoundary FallbackComponent={ProcessError}>
      <OperationTooltip />
      <ConstituentaTooltip />
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
