import clsx from 'clsx';
import { ZodError } from 'zod';

import { AxiosError, isAxiosError } from '@/backend/apiTransport';
import { isResponseHtml } from '@/utils/utils';

import { PrettyJson } from './View';

export type ErrorData = string | Error | AxiosError | ZodError | undefined | null;

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
        {error.stack && (
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              padding: '6px',
              overflowX: 'auto'
            }}
          >
            {error.stack}
          </pre>
        )}
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
        'cc-fade-in',
        'min-w-[25rem]',
        'px-3 py-2 flex flex-col',
        'text-warn-600 text-sm font-semibold',
        'select-text'
      )}
    >
      <div className='font-normal clr-text-default mb-6'>
        <p>Пожалуйста сделайте скриншот и отправьте вместе с описанием ситуации на почту portal@acconcept.ru</p>
        <br />
        <p>Для продолжения работы перезагрузите страницу</p>
      </div>

      <DescribeError error={error} />
    </div>
  );
}
