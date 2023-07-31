import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import BackendError from '../components/BackendError';
import Form from '../components/Common/Form';
import SubmitButton from '../components/Common/SubmitButton';
import TextInput from '../components/Common/TextInput';
import TextURL from '../components/Common/TextURL';
import InfoMessage from '../components/InfoMessage';
import { useAuth } from '../context/AuthContext';
import { IUserLoginData } from '../utils/models';

function LoginPage() {
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
      login(data, () => { navigate('/library?filter=personal'); });
    }
  }

  return (
    <div className='w-full py-2'> { user
      ? <InfoMessage message={`Вы вошли в систему как ${user.username}`} />
      : <Form title='Ввод данных пользователя' onSubmit={handleSubmit} widthClass='w-[20rem]'>
        <TextInput id='username'
          label='Имя пользователя'
          required
          type='text'
          value={username}
          autoFocus
          onChange={event => { setUsername(event.target.value); }}
        />
        <TextInput id='password'
          label='Пароль'
          required
          type='password'
          value={password}
          onChange={event => { setPassword(event.target.value); }}
        />

        <div className='flex items-center justify-between mt-4'>
          <SubmitButton text='Вход' loading={loading}/>
          <TextURL text='Восстановить пароль...' href='/restore-password' />
        </div>
        <div className='mt-2'>
          <TextURL text='Нет аккаунта? Зарегистрируйтесь...' href='/signup' />
        </div>
        { error && <BackendError error={error} />}
      </Form>
  }</div>
  );
}

export default LoginPage;
