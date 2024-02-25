'use client';

import axios from 'axios';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

import AnimateFade from '@/components/AnimateFade';
import InfoError, { ErrorData } from '@/components/InfoError';
import SubmitButton from '@/components/ui/SubmitButton';
import TextInput from '@/components/ui/TextInput';
import TextURL from '@/components/ui/TextURL';
import { useAuth } from '@/context/AuthContext';
import { IRequestPasswordData } from '@/models/library';
import { classnames } from '@/utils/constants';

function ProcessError({ error }: { error: ErrorData }): React.ReactElement {
  if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
    return (
      <div className='mt-6 text-sm select-text clr-text-warning'>
        На Портале отсутствует пользователь с таким email.
      </div>
    );
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
        <form className={clsx('w-[24rem]', 'px-6 mt-3', classnames.flex_col)} onSubmit={handleSubmit}>
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
