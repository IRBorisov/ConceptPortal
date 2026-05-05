import clsx from 'clsx';
import DOMPurify from 'dompurify';
import { ZodError } from 'zod';

import { formatZodIssueMessage, useTx } from '@/i18n';

import { type AxiosError, isAxiosError } from '@/backend/api-transport';
import { isResponseHtml } from '@/utils/utils';

import { PrettyJson } from './view';

export type ErrorData = string | Error | AxiosError | ZodError;

interface InfoErrorProps {
  error: ErrorData;
}

export function DescribeError({ error }: { error: ErrorData }) {
  const tx = useTx();
  if (!error) {
    return <p>{tx('labels.errorDetail.noErrors')}</p>;
  } else if (typeof error === 'string') {
    return <p>{error}</p>;
  } else if (error instanceof ZodError) {
    const lines = error.issues.map(issue => formatZodIssueMessage(issue));
    return (
      <div>
        <p>{tx('labels.errorDetail.validationTitle')}</p>
        <ul className='list-disc pl-5 mt-2 space-y-1'>
          {lines.map(function lineItem(text, i) {
            return <li key={i}>{text}</li>;
          })}
        </ul>
      </div>
    );
  } else if (!isAxiosError(error)) {
    return (
      <div>
        <p>
          <b>{tx('semantic.term.error')}:</b> {error.name}
        </p>
        <p>
          <b>{tx('semantic.term.description')}:</b> {error.message}
        </p>
        {error.stack && <pre className='whitespace-pre-wrap p-2 overflow-x-auto wrap-break-word'>{error.stack}</pre>}
      </div>
    );
  }
  if (!error?.response) {
    return <p>{tx('labels.errorDetail.noServerResponse')}</p>;
  }
  if (error.response.status === 404) {
    return (
      <div>
        <p>{tx('labels.errorDetail.api404')}</p>
        <PrettyJson data={error} />
      </div>
    );
  }
  if (error.response.status === 403 && error.message.includes('CSRF')) {
    return (
      <div>
        <p>{tx('labels.errorDetail.csrfLost')}</p>
        <PrettyJson data={error} />
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const isHtml = isResponseHtml(error.response);
  let sanitizedHtml: string | null = null;
  if (isHtml) {
    sanitizedHtml = DOMPurify.sanitize(error.response.data as string, {
      USE_PROFILES: { html: true },
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'ul', 'li', 'br', 'p'],
      ALLOWED_ATTR: []
    });
  }
  return (
    <div>
      <p className='underline'>{tx('semantic.term.error')}</p>
      <p>{error.message}</p>
      {error.response.data && (
        <>
          <p className='mt-2 underline'>{tx('labels.errorDetail.responseDescription')}</p>
          {isHtml && sanitizedHtml ? (
            <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
          ) : typeof error.response.data === 'string' ? (
            <pre className='whitespace-pre-wrap p-2 overflow-x-auto wrap-break-words'>{error.response.data}</pre>
          ) : (
            <PrettyJson data={error.response.data as object} />
          )}
        </>
      )}
    </div>
  );
}

export function InfoError({ error }: InfoErrorProps) {
  const tx = useTx();
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
        <p>{tx('labels.errorDetail.contactIntro')}</p>
        <br />
        <p>{tx('labels.errorDetail.reloadHint')}</p>
      </div>

      <DescribeError error={error} />
    </div>
  );
}
