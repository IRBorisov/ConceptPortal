'use client';

import { type SubmitEvent, useState } from 'react';

import { useTx } from '@/i18n';

import { isAxiosError } from '@/backend/api-transport';
import { SubmitButton, TextURL } from '@/components/control';
import { type ErrorData } from '@/components/info-error';
import { TextInput } from '@/components/input';
import { rethrowIfStaleBundleError } from '@/utils/stale-bundle-error';

import { useRequestPasswordReset } from '../backend/use-request-password-reset';

export function Component() {
  const tx = useTx();
  const { requestPasswordReset, isPending, error: serverError, reset: clearServerError } = useRequestPasswordReset();

  const [isCompleted, setIsCompleted] = useState(false);
  const [email, setEmail] = useState('');

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isPending) {
      void requestPasswordReset({ email: email }).then(() => setIsCompleted(true));
    }
  }

  if (isCompleted) {
    return (
      <div className='cc-fade-in flex flex-col items-center gap-1 mt-3'>
        <p>{tx('tx.shell.auth.restore.done')}</p>
        <TextURL text={tx('tx.general.login.hint')} href='/login' />
        <TextURL text={tx('tx.general.home')} href='/' />
      </div>
    );
  } else {
    return (
      <form className='cc-column w-96 mx-auto px-6 mt-3' onSubmit={handleSubmit} onChange={clearServerError}>
        <TextInput
          id='email'
          type='email'
          autoComplete='email'
          required
          allowEnter
          label={tx('tx.general.email')}
          value={email}
          onChange={event => setEmail(event.target.value)}
        />

        <SubmitButton
          text={tx('tx.shell.auth.restore.submit')}
          className='self-center w-48 mt-3'
          loading={isPending}
          disabled={!email}
        />
        {serverError ? <ServerError error={serverError} /> : null}
      </form>
    );
  }
}

// ====== Internals =========
function ServerError({ error }: { error: ErrorData }): React.ReactElement {
  const tx = useTx();
  rethrowIfStaleBundleError(error);

  if (isAxiosError(error) && error.response?.status === 400) {
    return (
      <div className='mx-auto mt-6 text-sm select-text text-destructive'>{tx('tx.shell.auth.validation.email')}</div>
    );
  }
  throw error as Error;
}
