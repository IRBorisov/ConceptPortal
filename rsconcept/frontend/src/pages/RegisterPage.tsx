import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import BackendError from '../components/BackendError';
import Button from '../components/common/Button';
import Form from '../components/common/Form';
import SubmitButton from '../components/common/SubmitButton';
import TextInput from '../components/common/TextInput';
import { useAuth } from '../context/AuthContext';
import { useConceptNavigation } from '../context/NagivationContext';
import { type IUserSignupData } from '../models/library';

function RegisterPage() {
  const location = useLocation();
  const { navigateTo, navigateHistory } = useConceptNavigation();
  const { user, signup, loading, error, setError } = useAuth();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    setError(undefined);
  }, [username, email, password, password2, setError]);

  function handleCancel() {
    if (location.key !== 'default') {
      navigateHistory(-1);
    } else {
      navigateTo('/library');
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loading) {
      const data: IUserSignupData = {
        username,
        email,
        password,
        password2,
        first_name: firstName,
        last_name: lastName
      };
      signup(data, createdUser => {
        navigateTo(`/login?username=${createdUser.username}`);
        toast.success(`Пользователь успешно создан: ${createdUser.username}`);
      });
    }
  }

  return (
  <div className='flex justify-center w-full py-2'>
    {user ? <b>{`Вы вошли в систему как ${user.username}`}</b> : null}
    {!user ?
    <Form
      title='Регистрация'
      onSubmit={handleSubmit}
      dimensions='w-[24rem]'
    >
      <TextInput id='username' required
        label='Имя пользователя'
        value={username}
        onChange={event => setUsername(event.target.value)}
      />
      <TextInput id='password' type='password' required
        label='Пароль' 
        value={password}
        onChange={event => setPassword(event.target.value)}
      />
      <TextInput id='password2' required type='password'
        label='Повторите пароль'
        value={password2}
        onChange={event => setPassword2(event.target.value)}
      />
      <div className='text-sm'>
        <p>- используйте уникальный пароль</p>
        <p>- портал функционирует в тестовом режиме</p>
        <p className='font-semibold text-warning'>- безопасность информации не гарантируется</p>
        {/* <p>- минимум 8 символов</p>
        <p>- большие, маленькие буквы, цифры</p>
        <p>- минимум 1 спец. символ</p> */}
      </div>
      <TextInput id='email' required
        label='email'
        value={email}
        onChange={event => setEmail(event.target.value)}
      />
      <TextInput id='first_name'
        label='Имя'
        value={firstName}
        onChange={event => setFirstName(event.target.value)}
      />
      <TextInput id='last_name'
        label='Фамилия'
        value={lastName}
        onChange={event => setLastName(event.target.value)}
      />

      <div className='flex items-center justify-center w-full gap-4 my-4'>
        <SubmitButton
          text='Регистрировать' 
          dimensions='min-w-[10rem]'
          loading={loading}
        />
        <Button 
          text='Отмена'
          dimensions='min-w-[10rem]'
          onClick={() => handleCancel()}
        />
      </div>
      {error ? <BackendError error={error} /> : null}
    </Form> : null}
  </div>);
}

export default RegisterPage;
