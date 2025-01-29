'use client';

import axios from 'axios';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { useRequestPasswordReset } from '@/backend/auth/useRequestPasswordReset';
import { ErrorData } from '@/components/info/InfoError';
import SubmitButton from '@/components/ui/SubmitButton';
import TextInput from '@/components/ui/TextInput';
import TextURL from '@/components/ui/TextURL';

export function Component() {
  const { requestPasswordReset, isPending, error, reset } = useRequestPasswordReset();

  const [isCompleted, setIsCompleted] = useState(false);
  const [email, setEmail] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isPending) {
      requestPasswordReset({ email: email }, () => setIsCompleted(true));
    }
  }

  useEffect(() => {
    reset();
  }, [email, reset]);

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
      <form className={clsx('cc-fade-in cc-column', 'w-[24rem] mx-auto', 'px-6 mt-3')} onSubmit={handleSubmit}>
        <TextInput
          id='email'
          autoComplete='email'
          required
          allowEnter
          label='Электронная почта'
          value={email}
          onChange={event => setEmail(event.target.value)}
        />

        <SubmitButton
          text='Запросить пароль'
          className='self-center w-[12rem] mt-3'
          loading={isPending}
          disabled={!email}
        />
        {error ? <ProcessError error={error} /> : null}
      </form>
    );
  }
}

// ====== Internals =========
function ProcessError({ error }: { error: ErrorData }): React.ReactElement {
  if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
    return (
      <div className='mx-auto mt-6 text-sm select-text text-warn-600'>Данный email не используется на Портале.</div>
    );
  }
  throw error as Error;
}
