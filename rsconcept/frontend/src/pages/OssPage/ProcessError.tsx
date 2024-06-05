'use client';
import axios from 'axios';
import { ErrorData } from '@/components/info/InfoError';
import TextURL from '@/components/ui/TextURL';

function ProcessError({ error }: { error: ErrorData }): React.ReactElement {
  if (axios.isAxiosError(error) && error.response) {
    if (error.response.status === 404) {
      return (
        <div className='p-2 text-center'>
          <p>{`Схема с указанным идентификатором отсутствует`}</p>
          <div className='flex justify-center'>
            <TextURL text='Библиотека' href='/library' />
          </div>
        </div>
      );
    } else if (error.response.status === 403) {
      return (
        <div className='p-2 text-center'>
          <p>Владелец ограничил доступ к данной схеме</p>
          <TextURL text='Библиотека' href='/library' />
        </div>
      );
    }
  }
  return <InfoError error={error} />;
}
