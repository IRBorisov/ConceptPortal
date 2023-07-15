import { useEffect, useState } from 'react';

import TextInput from '../components/Common/TextInput';
import Form from '../components/Common/Form';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import SubmitButton from '../components/Common/SubmitButton';
import BackendError from '../components/BackendError';
import InfoMessage from '../components/InfoMessage';
import TextURL from '../components/Common/TextURL';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { user, login, loading, error, setError } = useAuth()
  
  const navigate = useNavigate();
  const search = useLocation().search;

  useEffect(() => {
    const name = new URLSearchParams(search).get('username');
    setUsername(name || '');
  }, [search]);

  useEffect(() => {
    setError(undefined);
  }, [username, password, setError]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loading) {
      login(username, password, () => { navigate('/rsforms?filter=owned'); });
    }
  };

  return (
    <div className='container py-2'> { user ? 
      <InfoMessage message={`Вы вошли в систему как ${user.username}`} /> 
      :
      <Form title='Ввод данных пользователя' onSubmit={handleSubmit} widthClass='max-w-sm'>
        <TextInput id='username'
          label='Имя пользователя'
          required
          type='text'
          value={username}
          onChange={event => setUsername(event.target.value)} 
        />
        <TextInput id='password'
          label='Пароль'
          required
          type='password'
          onChange={event => setPassword(event.target.value)}
        />

        <div className='flex items-center justify-between mt-4 mb-2'>
          <SubmitButton text='Вход' loading={loading}/>
          <TextURL text='Восстановить пароль...' href='restore-password' />
        </div>
        <TextURL text='Нет аккаунта? Зарегистрируйтесь...' href='/signup' />
        { error && <BackendError error={error} />}
      </Form>
  }</div>
  );
}

export default LoginPage;