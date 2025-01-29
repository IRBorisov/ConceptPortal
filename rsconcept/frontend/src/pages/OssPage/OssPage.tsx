'use client';

import axios from 'axios';
import { ErrorBoundary } from 'react-error-boundary';
import { useParams } from 'react-router';

import { useBlockNavigation, useConceptNavigation } from '@/app/Navigation/NavigationContext';
import { urls } from '@/app/urls';
import { ErrorData } from '@/components/info/InfoError';
import TextURL from '@/components/ui/TextURL';
import { useModificationStore } from '@/stores/modification';

import { OssEditState } from './OssEditContext';
import OssTabs from './OssTabs';

export function OssPage() {
  const router = useConceptNavigation();
  const params = useParams();
  const itemID = params.id ? Number(params.id) : undefined;

  const { isModified } = useModificationStore();
  useBlockNavigation(isModified);

  if (!itemID) {
    router.replace(urls.page404);
    return null;
  }

  return (
    <ErrorBoundary FallbackComponent={ProcessError}>
      <OssEditState itemID={itemID}>
        <OssTabs />
      </OssEditState>
    </ErrorBoundary>
  );
}

// ====== Internals =========
function ProcessError({ error }: { error: ErrorData }): React.ReactElement {
  if (axios.isAxiosError(error) && error.response) {
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
