import axios, { type AxiosError,AxiosHeaderValue } from 'axios';

import PrettyJson from './Common/PrettyJSON';

export type ErrorInfo = string | Error | AxiosError | undefined;

interface BackendErrorProps {
  error: ErrorInfo
}

function DescribeError(error: ErrorInfo) {
  reportError(error);
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
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const isHtml = (() => {
    if (!error.response) {
      return false;
    }
    const header = error.response.headers['content-type'] as AxiosHeaderValue;
    if (!header) {
      return false;
    }
    if (typeof header === 'number' || typeof header === 'boolean') {
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return header.includes('text/html');
  })();
  return (
    <div className='flex flex-col justify-start'>
      <p className='underline'>Ошибка</p>
      <p>{error.message}</p>
      {error.response.data && (<>
        <p className='mt-2 underline'>Описание</p>
        { isHtml && <div dangerouslySetInnerHTML={{ __html: error.response.data as TrustedHTML }} /> }
        { !isHtml && <PrettyJson data={error.response.data as object} />}
      </>)}
    </div>
  );
}

function BackendError({ error }: BackendErrorProps) {
  return (
    <div className='px-3 py-2 min-w-[15rem] text-sm font-semibold select-text text-warning'>
      {DescribeError(error)}
    </div>
  );
}

export default BackendError;
