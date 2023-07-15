import axios, { AxiosError } from 'axios';
import PrettyJson from './Common/PrettyJSON';

export type ErrorInfo = string | Error | AxiosError | undefined;

interface BackendErrorProps {
  error: ErrorInfo
}

function DescribeError(error: ErrorInfo) {
  if (!error) {
    return <p>Ошибки отсутствуют</p>;
  } else if (typeof error === 'string') {
    return <p>{error}</p>;
  } else if (axios.isAxiosError(error)) {
    if (!error?.response) {
      return <p>Нет ответа от сервера</p>;
    }
    if (error.response.status === 404) {
      return (
        <div className='flex flex-col justify-start'>
          <p>{`Обращение к несуществующему API`}</p>
          <PrettyJson data={error} />
        </div>
      );
    }
    return (
      <div className='flex flex-col justify-start'>
        <p className='underline'>Ошибка</p>
        <p>{error.message}</p>
        {error.response.data && (<>
          <p className='mt-2 underline'>Описание</p>
          <PrettyJson data={error.response.data} />
        </>)}
      </div>
    );
  } else {
    return <PrettyJson data={error} />;
  }
}

function BackendError({error}: BackendErrorProps) {
  return (
    <div className='py-2 text-sm font-semibold text-red-600 dark:text-red-400'>
      {DescribeError(error)}
    </div>
  );
}

export default BackendError;