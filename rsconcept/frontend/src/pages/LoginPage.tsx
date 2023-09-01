import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import BackendError from '../components/BackendError';
import Form from '../components/Common/Form';
import SubmitButton from '../components/Common/SubmitButton';
import TextInput from '../components/Common/TextInput';
import TextURL from '../components/Common/TextURL';
import { useAuth } from '../context/AuthContext';
import { IUserLoginData } from '../utils/models';

function LoginPage() {
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
        if (location.key !== "default") {
          navigate(-1);
        } else {
          navigate('/library');
        }
      });
    }
  }

  return (
    <div className='flex justify-center w-full'>
    <div className='py-2'> { user
      ? <b>{`Вы вошли в систему как ${user.username}`}</b>
      : 
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
        { error && <BackendError error={error} />}
      </Form>
  }</div>
  </div>
  );
}

export default LoginPage;
