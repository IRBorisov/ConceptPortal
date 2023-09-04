import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import BackendError, { ErrorInfo } from '../components/BackendError';
import Form from '../components/Common/Form';
import SubmitButton from '../components/Common/SubmitButton';
import TextInput from '../components/Common/TextInput';
import TextURL from '../components/Common/TextURL';
import { useAuth } from '../context/AuthContext';
import { useConceptTheme } from '../context/ThemeContext';
import { IUserLoginData } from '../utils/models';

function ProcessError({error}: {error: ErrorInfo}): React.ReactElement {
  if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
    return (
      <div className='mt-2 text-sm select-text text-warning'>
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
  const navigate = useNavigate();
  const search = useLocation().search;
  const { user, login, loading, error, setError } = useAuth();
  
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
          navigate(-1);
        } else {
          navigate('/library');
        }
      });
    }
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
        <TextURL text='Выйти' href='/logout'/>
      </p>
    </div>}
    { !user &&
    <Form
      title='Вход в Портал'
      onSubmit={handleSubmit}
      widthClass='w-[24rem]'
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

      <div className='flex justify-center w-full gap-2 py-2 mt-4'>
        <SubmitButton
          text='Вход'
          widthClass='w-[12rem]'
          loading={loading}
        />
      </div>
      <div className='flex flex-col mt-2 text-sm'>
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
