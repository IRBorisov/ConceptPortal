'use client';

import { type SubmitEvent, useState } from 'react';

import { useTx } from '@/i18n/use-tx';

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
        <p>{tx('auth.restore.done', 'Password reset instructions were sent to that address.')}</p>
        <TextURL text={tx('auth.restore.loginLink', 'Sign in to the portal')} href='/login' />
        <TextURL text={tx('auth.restore.homeLink', 'Home page')} href='/' />
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
          label={tx('auth.restore.email', 'Email')}
          value={email}
          onChange={event => setEmail(event.target.value)}
        />

        <SubmitButton
          text={tx('auth.restore.submit', 'Request password reset')}
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
      <div className='mx-auto mt-6 text-sm select-text text-destructive'>
        {tx('auth.restore.emailNotRegistered', 'This email is not registered on the portal.')}
      </div>
    );
  }
  throw error as Error;
}
