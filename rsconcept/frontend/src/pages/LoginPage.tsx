import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import BackendError, { ErrorInfo } from '../components/BackendError';
import Form from '../components/Common/Form';
import SubmitButton from '../components/Common/SubmitButton';
import TextInput from '../components/Common/TextInput';
import TextURL from '../components/Common/TextURL';
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
    <div className='flex items-start justify-center w-full pt-4 select-none' style={{minHeight: mainHeight}}>
    { user &&
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
    </div>}
    { !user &&
    <Form
      title='Вход в Портал'
      onSubmit={handleSubmit}
      dimensions='w-[24rem]'
    >
      <TextInput id='username'
        label='Имя пользователя'
        required
        type='text'
        value={username}
        autoFocus
        onChange={event => setUsername(event.target.value)}
      />
      <TextInput id='password'
        label='Пароль'
        required
        type='password'
        value={password}
        onChange={event => setPassword(event.target.value)}
      />

      <div className='flex justify-center w-full gap-2 py-2'>
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
      { error && <ProcessError error={error} />}
    </Form>
    }
  </div>
  );
}

export default LoginPage;
