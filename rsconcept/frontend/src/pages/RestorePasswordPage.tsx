'use client';

import axios from 'axios';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

import InfoError, { ErrorData } from '@/components/info/InfoError';
import SubmitButton from '@/components/ui/SubmitButton';
import TextInput from '@/components/ui/TextInput';
import TextURL from '@/components/ui/TextURL';
import AnimateFade from '@/components/wrap/AnimateFade';
import { useAuth } from '@/context/AuthContext';
import { IRequestPasswordData } from '@/models/library';

function ProcessError({ error }: { error: ErrorData }): React.ReactElement {
  if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
    return <div className='mt-6 text-sm select-text clr-text-red'>Данный email не используется на Портале.</div>;
  } else {
    return <InfoError error={error} />;
  }
}

function RestorePasswordPage() {
  const { requestPasswordReset, loading, error, setError } = useAuth();

  const [isCompleted, setIsCompleted] = useState(false);
  const [email, setEmail] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loading) {
      const data: IRequestPasswordData = {
        email: email
      };
      requestPasswordReset(data, () => setIsCompleted(true));
    }
  }

  useEffect(() => {
    setError(undefined);
  }, [email, setError]);

  return (
    <AnimateFade>
      {!isCompleted ? (
        <form className={clsx('cc-column', 'w-[24rem]', 'px-6 mt-3')} onSubmit={handleSubmit}>
          <TextInput
            id='email'
            allowEnter
            label='Электронная почта'
            value={email}
            onChange={event => setEmail(event.target.value)}
          />

          <SubmitButton
            text='Запросить пароль'
            className='self-center w-[12rem] mt-3'
            loading={loading}
            disabled={!email}
          />
          {error ? <ProcessError error={error} /> : null}
        </form>
      ) : null}
      {isCompleted ? (
        <div className='flex flex-col items-center gap-1 mt-3'>
          <p>На указанную почту отправлены инструкции по восстановлению пароля.</p>
          <TextURL text='Войти в Портал' href='/login' />
          <TextURL text='Начальная страница' href='/' />
        </div>
      ) : null}
    </AnimateFade>
  );
}

export default RestorePasswordPage;
