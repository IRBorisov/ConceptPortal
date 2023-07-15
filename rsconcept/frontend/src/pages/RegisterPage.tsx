import { useEffect, useState } from 'react';

import TextInput from '../components/Common/TextInput';
import Form from '../components/Common/Form';
import { useAuth } from '../context/AuthContext';
import SubmitButton from '../components/Common/SubmitButton';
import BackendError from '../components/BackendError';
import { IUserSignupData } from '../models';
import InfoMessage from '../components/InfoMessage';
import TextURL from '../components/Common/TextURL';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [success, setSuccess] = useState(false);
  const { user, signup, loading, error, setError } = useAuth()

  useEffect(() => {
    setError(undefined);
  }, [username, email, password, password2, setError]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loading) {
      const data: IUserSignupData  = {
        'username': username,
        'email': email,
        'password': password,
        'password2': password2,
        'first_name': firstName,
        'last_name': lastName,
      };
      signup(data, () => { setSuccess(true); });
    }
  };

  return (
    <div className='container py-2'> 
    { success && 
      <div className='flex flex-col items-center'>
        <InfoMessage message={`Вы успешно зарегистрировали пользователя ${username}`}/>
        <TextURL text='Войти в аккаунт' href={`/login?username=${username}`}/>
      </div>}
    { !success && user &&
      <InfoMessage message={`Вы вошли в систему как ${user.username}. Если хотите зарегистрировать нового пользователя, выйдите из системы (меню в правом верхнем углу экрана)`} /> }
    { !success && !user && 
      <Form title='Регистрация пользователя' onSubmit={handleSubmit}>
        <TextInput id='username' label='Имя пользователя' type='text'
          required
          value={username}
          onChange={event => setUsername(event.target.value)} 
        />
        <TextInput id='password' label='Пароль' type='password' 
          required
          value={password}
          onChange={event => setPassword(event.target.value)}
        />
        <TextInput id='password2' label='Повторите пароль' type='password'
          required
          value={password2}
          onChange={event => setPassword2(event.target.value)} 
        />
        <div className='text-sm'>
          <p>- минимум 8 символов</p>
          <p>- большие, маленькие буквы, цифры</p>
          <p>- минимум 1 спец. символ</p>
        </div>
        <TextInput id='email' label='email' type='text'
          required
          value={email}
          onChange={event => setEmail(event.target.value)}
        />
        <TextInput id='first_name' label='Имя' type='text'
          value={firstName}
          onChange={event => setFirstName(event.target.value)}
        />
        <TextInput id='last_name' label='Фамилия' type='text'
          value={lastName}
          onChange={event => setLastName(event.target.value)}
        />

        <div className='flex items-center justify-between my-4'>
          <SubmitButton text='Регистрировать' loading={loading}/>
        </div>
        { error && <BackendError error={error} />}
      </Form>
    }
    </div>
  );
}

export default RegisterPage;