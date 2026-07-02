import clsx from 'clsx';
import DOMPurify from 'dompurify';
import { ZodError } from 'zod';

import { useTx } from '@/i18n';

import { type AxiosError, isAxiosError, isCsrfAxiosFailure } from '@/backend/api-transport';
import { isResponseHtml } from '@/utils/utils';

import { PrettyJson } from './view';

/** Supported error shapes for {@link DescribeError} and {@link InfoError}. */
export type ErrorData = string | Error | AxiosError | ZodError;

interface DescribeErrorProps {
  /** Error to describe in human-readable form. */
  error: ErrorData;
}

/** Renders a human-readable description for API, validation, and generic errors. */
export function DescribeError({ error }: DescribeErrorProps) {
  const tx = useTx();
  if (!error) {
    return <p>{tx('tx.shell.error.none')}</p>;
  } else if (typeof error === 'string') {
    return <p>{error}</p>;
  } else if (error instanceof ZodError) {
    const lines = error.issues.map(issue => issue.message);
    return (
      <div>
        <p>{tx('tx.shell.error.dataValidation')}</p>
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
          <b>{tx('tx.general.error')}:</b> {error.name}
        </p>
        <p>
          <b>{tx('tx.lib.description')}:</b> {error.message}
        </p>
        {error.stack && <pre className='whitespace-pre-wrap p-2 overflow-x-auto wrap-break-word'>{error.stack}</pre>}
      </div>
    );
  }
  if (!error?.response) {
    return <p>{tx('tx.shell.error.noServerResponse')}</p>;
  }
  if (error.response.status === 404) {
    return (
      <div>
        <p>{tx('tx.shell.error.api404')}</p>
        <PrettyJson data={error} />
      </div>
    );
  }
  if (isCsrfAxiosFailure(error)) {
    return (
      <div>
        <p>{tx('tx.shell.error.csrfLost')}</p>
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
      <p className='underline'>{tx('tx.general.error')}</p>
      <p>{error.message}</p>
      {error.response.data && (
        <>
          <p className='mt-2 underline'>{tx('tx.general.details')}</p>
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

/** Displays an error panel with user guidance and a detailed {@link DescribeError} section. */
export function InfoError({ error }: DescribeErrorProps) {
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
        <p>{tx('tx.shell.error.contactIntro')}</p>
        <br />
        <p>{tx('tx.shell.error.reload.hint')}</p>
      </div>

      <DescribeError error={error} />
    </div>
  );
}
