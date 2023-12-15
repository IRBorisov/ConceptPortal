'use client';

import axios from 'axios';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

import SubmitButton from '@/components/Common/SubmitButton';
import TextInput from '@/components/Common/TextInput';
import TextURL from '@/components/Common/TextURL';
import ExpectedAnonymous from '@/components/ExpectedAnonymous';
import InfoError, { ErrorData } from '@/components/InfoError';
import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NagivationContext';
import useQueryStrings from '@/hooks/useQueryStrings';
import { IUserLoginData } from '@/models/library';
import { resources } from '@/utils/constants';


function ProcessError({error}: { error: ErrorData }): React.ReactElement {
  if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
    return (
    <div className='text-sm select-text clr-text-warning'>
      На Портале отсутствует такое сочетание имени пользователя и пароля
    </div>);
  } else {
    return (
    <InfoError
      error={error}
    />);
  }
}

function LoginPage() {
  const router = useConceptNavigation();
  const query = useQueryStrings();
  const userQuery = query.get('username');

  const { user, login, loading, error, setError } = useAuth();
  
  const [username, setUsername] = useState(userQuery || '');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setError(undefined);
  }, [username, password, setError]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loading) {
      const data: IUserLoginData = {
        username: username,
        password: password
      };
      login(data, () => {
        if (router.canBack()) {
          router.back();
        } else {
          router.push('/library');
        }
      });
    }
  }

  if (user) {
    return (<ExpectedAnonymous />);
  }
  return (
  <form
    className={clsx(
      'w-[24rem]', 
      'pt-12 pb-6 px-6 flex flex-col gap-3'
    )}
    onSubmit={handleSubmit}
  >
    <img alt='Концепт Портал'
      src={resources.logo}
      className='max-h-[2.5rem] min-w-[2.5rem] mb-3'
    />
    <TextInput id='username' autoFocus required allowEnter
      label='Имя пользователя'
      value={username}
      onChange={event => setUsername(event.target.value)}
    />
    <TextInput id='password' type='password' required allowEnter
      label='Пароль'
      value={password}
      onChange={event => setPassword(event.target.value)}
    />

    <div className='flex justify-center w-full py-2'>
      <SubmitButton
        text='Войти'
        dimensions='w-[12rem]'
        loading={loading}
        disabled={!username || !password}
      />
    </div>
    <div className='flex flex-col text-sm'>
      <TextURL text='Восстановить пароль...' href='/restore-password' />
      <TextURL text='Нет аккаунта? Зарегистрируйтесь...' href='/signup' />
    </div>
    {error ? <ProcessError error={error} /> : null}
  </form>);
}

export default LoginPage;