import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import BackendError, { ErrorInfo } from '../components/BackendError';
import Form from '../components/common/Form';
import SubmitButton from '../components/common/SubmitButton';
import TextInput from '../components/common/TextInput';
import TextURL from '../components/common/TextURL';
import { useAuth } from '../context/AuthContext';
import { useConceptNavigation } from '../context/NagivationContext';
import { useConceptTheme } from '../context/ThemeContext';
import { IUserLoginData } from '../models/library';

function ProcessError({error}: {error: ErrorInfo}): React.ReactElement {
  if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
    return (
      <div className='text-sm select-text text-warning'>
        На Портале отсутствует такое сочетание имени пользователя и пароля
      </div>
    );
  } else {
    return ( <BackendError error={error} />);
  }
}

function LoginPage() {
  const {mainHeight} = useConceptTheme();
  const location = useLocation();
  const { navigateTo, navigateHistory } = useConceptNavigation();
  const search = useLocation().search;
  const { user, login, logout, loading, error, setError } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const name = new URLSearchParams(search).get('username');
    setUsername(name ?? '');
    setPassword('');
  }, [search]);

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
        if (location.key !== 'default') {
          navigateHistory(-1);
        } else {
          navigateTo('/library');
        }
      });
    }
  }

  function logoutAndRedirect() {
    logout(() => navigateTo('/login/'));
  }

  return (
  <div
    className='flex items-start justify-center w-full pt-8 select-none'
    style={{minHeight: mainHeight}}
  >
  {user ?
  <div className='flex flex-col items-center gap-2'>
    <p className='font-semibold'>{`Вы вошли в систему как ${user.username}`}</p>
    <p>
      <TextURL text='Создать схему' href='/rsform-create'/>
      <span> | </span>
      <TextURL text='Библиотека' href='/library'/>
      <span> | </span>
      <TextURL text='Справка' href='/manuals'/>
      <span> | </span>
      <span
        className='cursor-pointer hover:underline text-url'
        onClick={logoutAndRedirect}
      >
        Выйти
      </span>
    </p>
  </div> : null}
  {!user ?
  <Form
    onSubmit={handleSubmit}
    dimensions='w-[24rem]'
  >
    <img alt='Концепт Портал'
      src='/logo_full.svg'
      className='max-h-[2.5rem] min-w-[2.5rem] mt-2 mb-4'
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
      />
    </div>
    <div className='flex flex-col text-sm'>
      <TextURL text='Восстановить пароль...' href='/restore-password' />
      <TextURL text='Нет аккаунта? Зарегистрируйтесь...' href='/signup' />
    </div>
    {error ? <ProcessError error={error} /> : null}
  </Form> : null}
  </div>);
}

export default LoginPage;
