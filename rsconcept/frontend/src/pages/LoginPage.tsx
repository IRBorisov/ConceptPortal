'use client';

import axios from 'axios';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { useConceptNavigation } from '@/app/Navigation/NavigationContext';
import { urls } from '@/app/urls';
import { useAuth } from '@/backend/auth/useAuth';
import { useLogin } from '@/backend/auth/useLogin';
import InfoError, { ErrorData } from '@/components/info/InfoError';
import SubmitButton from '@/components/ui/SubmitButton';
import TextInput from '@/components/ui/TextInput';
import TextURL from '@/components/ui/TextURL';
import ExpectedAnonymous from '@/components/wrap/ExpectedAnonymous';
import useQueryStrings from '@/hooks/useQueryStrings';
import { resources } from '@/utils/constants';

function LoginPage() {
  const router = useConceptNavigation();
  const query = useQueryStrings();
  const userQuery = query.get('username');

  const { isAnonymous } = useAuth();
  const { login, isPending, error, reset } = useLogin();

  const [username, setUsername] = useState(userQuery || '');
  const [password, setPassword] = useState('');

  useEffect(() => {
    reset();
  }, [username, password, reset]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isPending) {
      login(username, password, () => {
        if (router.canBack()) {
          router.back();
        } else {
          router.push(urls.library);
        }
      });
    }
  }

  if (!isAnonymous) {
    return <ExpectedAnonymous />;
  }
  return (
    <form className={clsx('cc-column cc-fade-in', 'w-[24rem] mx-auto', 'pt-12 pb-6 px-6')} onSubmit={handleSubmit}>
      <img alt='Концепт Портал' src={resources.logo} className='max-h-[2.5rem] min-w-[2.5rem] mb-3' />
      <TextInput
        id='username'
        label='Логин или email'
        autoComplete='username'
        autoFocus
        required
        allowEnter
        spellCheck={false}
        value={username}
        onChange={event => setUsername(event.target.value)}
      />
      <TextInput
        id='password'
        type='password'
        label='Пароль'
        autoComplete='current-password'
        required
        allowEnter
        value={password}
        onChange={event => setPassword(event.target.value)}
      />

      <SubmitButton
        text='Войти'
        className='self-center w-[12rem] mt-3'
        loading={isPending}
        disabled={!username || !password}
      />
      <div className='flex flex-col text-sm'>
        <TextURL text='Восстановить пароль...' href='/restore-password' />
        <TextURL text='Нет аккаунта? Зарегистрируйтесь...' href='/signup' />
      </div>
      {error ? <ProcessError error={error} /> : null}
    </form>
  );
}

export default LoginPage;

// ====== Internals =========
function ProcessError({ error }: { error: ErrorData }): React.ReactElement {
  if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
    return (
      <div className='text-sm select-text text-warn-600'>
        На Портале отсутствует такое сочетание имени пользователя и пароля
      </div>
    );
  } else {
    return <InfoError error={error} />;
  }
}
