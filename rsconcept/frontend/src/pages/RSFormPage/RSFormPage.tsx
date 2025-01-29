'use client';

import axios from 'axios';
import { ErrorBoundary } from 'react-error-boundary';
import { useParams } from 'react-router';

import { useBlockNavigation, useConceptNavigation } from '@/app/Navigation/NavigationContext';
import { urls } from '@/app/urls';
import { ErrorData } from '@/components/info/InfoError';
import Divider from '@/components/ui/Divider';
import TextURL from '@/components/ui/TextURL';
import useQueryStrings from '@/hooks/useQueryStrings';
import { LibraryItemID } from '@/models/library';
import { useModificationStore } from '@/stores/modification';

import { RSEditState, RSTabID } from './RSEditContext';
import RSTabs from './RSTabs';

export function RSFormPage() {
  const router = useConceptNavigation();
  const query = useQueryStrings();
  const params = useParams();
  const itemID = params.id ? Number(params.id) : undefined;
  const version = query.get('v') ? Number(query.get('v')) : undefined;
  const activeTab = query.get('tab') ? (Number(query.get('tab')) as RSTabID) : RSTabID.CARD;

  const { isModified } = useModificationStore();
  useBlockNavigation(isModified);

  if (!itemID) {
    router.replace(urls.page404);
    return null;
  }
  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <ProcessError error={error as ErrorData} isArchive={!!version} itemID={itemID} />
      )}
    >
      <RSEditState itemID={itemID} activeVersion={version} activeTab={activeTab}>
        <RSTabs />
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
  itemID?: LibraryItemID;
}): React.ReactElement | null {
  if (axios.isAxiosError(error) && error.response) {
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
