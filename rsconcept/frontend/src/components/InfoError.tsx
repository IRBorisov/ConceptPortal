import axios, { type AxiosError } from 'axios';
import clsx from 'clsx';

import { urls } from '@/utils/constants';
import { isResponseHtml } from '@/utils/utils';

import AnimateFade from './AnimateFade';
import PrettyJson from './ui/PrettyJSON';
import TextURL from './ui/TextURL';

export type ErrorData = string | Error | AxiosError | undefined;

interface InfoErrorProps {
  error: ErrorData;
}

function DescribeError({ error }: { error: ErrorData }) {
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
      <div>
        <p>{'Обращение к несуществующему API'}</p>
        <PrettyJson data={error} />
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const isHtml = isResponseHtml(error.response);
  return (
    <div>
      <p className='underline'>Ошибка</p>
      <p>{error.message}</p>
      {error.response.data && (
        <>
          <p className='mt-2 underline'>Описание</p>
          {isHtml ? <div dangerouslySetInnerHTML={{ __html: error.response.data as TrustedHTML }} /> : null}
          {!isHtml ? <PrettyJson data={error.response.data as object} /> : null}
        </>
      )}
    </div>
  );
}

function InfoError({ error }: InfoErrorProps) {
  return (
    <AnimateFade
      className={clsx(
        'min-w-[25rem] w-full',
        'px-3 py-2 flex flex-col',
        'clr-text-red',
        'text-sm font-semibold',
        'select-text'
      )}
    >
      <p className='clr-text-default font-normal'>
        Пожалуйста сделайте скриншот и отправьте вместе с описанием ситуации на почту{' '}
        <TextURL href={urls.mail_portal} text='portal@acconcept.ru' />
        <br />
        Для продолжения работы перезагрузите страницу
      </p>
      <DescribeError error={error} />
    </AnimateFade>
  );
}

export default InfoError;
