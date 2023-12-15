import axios, { type AxiosError } from 'axios';

import { isResponseHtml } from '@/utils/utils';

import PrettyJson from './Common/PrettyJSON';

export type ErrorData = string | Error | AxiosError | undefined;

interface InfoErrorProps {
  error: ErrorData
}

function DescribeError({error} : {error: ErrorData}) {
  if (!error) {
    return <p>Ошибки отсутствуют</p>;
  } else if (typeof error === 'string') {
    return <p>{error}</p>;
  } else if (!axios.isAxiosError(error)) {
    return <PrettyJson data={error} />;
  }
  if (!error?.response) {
    return <p>Нет ответа от сервера</p>;
  }
  if (error.response.status === 404) {
    return (
    <div className='flex flex-col justify-start'>
      <p>{'Обращение к несуществующему API'}</p>
      <PrettyJson data={error} />
    </div>);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const isHtml = isResponseHtml(error.response);
  return (
    <div className='flex flex-col justify-start'>
      <p className='underline'>Ошибка</p>
      <p>{error.message}</p>
      {error.response.data && (<>
        <p className='mt-2 underline'>Описание</p>
        {isHtml ? <div dangerouslySetInnerHTML={{ __html: error.response.data as TrustedHTML }} /> : null}
        {!isHtml ? <PrettyJson data={error.response.data as object} /> : null}
      </>)}
    </div>
  );
}

function InfoError({ error }: InfoErrorProps) {
  return (
  <div className='px-3 py-2 min-w-[15rem] text-sm font-semibold select-text clr-text-warning'>
    <DescribeError error={error} />
  </div>);
}

export default InfoError;