import clsx from 'clsx';
import { ZodError } from 'zod';

import { type AxiosError, isAxiosError } from '@/backend/api-transport';
import { isResponseHtml } from '@/utils/utils';

import { PrettyJson } from './view';

export type ErrorData = string | Error | AxiosError | ZodError;

interface InfoErrorProps {
  error: ErrorData;
}

export function DescribeError({ error }: { error: ErrorData }) {
  if (!error) {
    return <p>Ошибки отсутствуют</p>;
  } else if (typeof error === 'string') {
    return <p>{error}</p>;
  } else if (error instanceof ZodError) {
    return (
      <div>
        <p>Ошибка валидации данных</p>
        {/* eslint-disable-next-line @typescript-eslint/no-base-to-string */}
        <PrettyJson data={JSON.parse(error.toString()) as unknown} />;
      </div>
    );
  } else if (!isAxiosError(error)) {
    return (
      <div>
        <p>
          <b>Error:</b> {error.name}
        </p>
        <p>
          <b>Message:</b> {error.message}
        </p>
        {error.stack && <pre className='whitespace-pre-wrap p-2 overflow-x-auto break-words'>{error.stack}</pre>}
      </div>
    );
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
  if (error.response.status === 403 && error.message.includes('CSRF')) {
    return (
      <div>
        <p>{'Соединение с сервером потеряно. Перезагрузите страницу'}</p>
        <PrettyJson data={error} />
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

export function InfoError({ error }: InfoErrorProps) {
  return (
    <div
      className={clsx(
        'min-w-100', //
        'px-3 py-2 flex flex-col',
        'text-destructive text-sm font-semibold',
        'select-text'
      )}
    >
      <div className='font-normal text-foreground mb-6'>
        <p>Пожалуйста сделайте скриншот и отправьте вместе с описанием ситуации на почту portal@acconcept.ru</p>
        <br />
        <p>Для продолжения работы перезагрузите страницу</p>
      </div>

      <DescribeError error={error} />
    </div>
  );
}
