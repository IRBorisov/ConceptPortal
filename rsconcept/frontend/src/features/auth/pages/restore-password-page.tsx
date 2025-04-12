'use client';

import { useState } from 'react';

import { isAxiosError } from '@/backend/api-transport';
import { SubmitButton, TextURL } from '@/components/control';
import { type ErrorData } from '@/components/info-error';
import { TextInput } from '@/components/input';

import { useRequestPasswordReset } from '../backend/use-request-password-reset';

export function Component() {
  const { requestPasswordReset, isPending, error: serverError, reset: clearServerError } = useRequestPasswordReset();

  const [isCompleted, setIsCompleted] = useState(false);
  const [email, setEmail] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isPending) {
      void requestPasswordReset({ email: email }).then(() => setIsCompleted(true));
    }
  }

  if (isCompleted) {
    return (
      <div className='cc-fade-in flex flex-col items-center gap-1 mt-3'>
        <p>На указанную почту отправлены инструкции по восстановлению пароля.</p>
        <TextURL text='Войти в Портал' href='/login' />
        <TextURL text='Начальная страница' href='/' />
      </div>
    );
  } else {
    return (
      <form className='cc-fade-in cc-column w-96 mx-auto px-6 mt-3' onSubmit={handleSubmit} onChange={clearServerError}>
        <TextInput
          id='email'
          autoComplete='email'
          required
          allowEnter
          label='Электронная почта'
          value={email}
          onChange={event => setEmail(event.target.value)}
        />

        <SubmitButton text='Запросить пароль' className='self-center w-48 mt-3' loading={isPending} disabled={!email} />
        {serverError ? <ServerError error={serverError} /> : null}
      </form>
    );
  }
}

// ====== Internals =========
function ServerError({ error }: { error: ErrorData }): React.ReactElement {
  if (isAxiosError(error) && error.response && error.response.status === 400) {
    return (
      <div className='mx-auto mt-6 text-sm select-text text-destructive'>Данный email не используется на Портале.</div>
    );
  }
  throw error as Error;
}
