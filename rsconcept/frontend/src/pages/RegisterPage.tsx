import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import BackendError from '../components/BackendError';
import Form from '../components/Common/Form';
import SubmitButton from '../components/Common/SubmitButton';
import TextInput from '../components/Common/TextInput';
import { useAuth } from '../context/AuthContext';
import { type IUserSignupData } from '../utils/models';

function RegisterPage() {
  const navigate = useNavigate();
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
        navigate(`/login?username=${createdUser.username}`);
        toast.success(`Пользователь успешно создан: ${createdUser.username}`);
      });
    }
  }

  return (
    <div className='w-full py-2'>
    { user &&
      <b>{`Вы вошли в систему как ${user.username}. Если хотите зарегистрировать нового пользователя, выйдите из системы (меню в правом верхнем углу экрана)`}</b>}
    { !user &&
      <Form title='Регистрация пользователя' onSubmit={handleSubmit}>
        <TextInput id='username' label='Имя пользователя' type='text'
          required
          value={username}
          onChange={event => { setUsername(event.target.value); }}
        />
        <TextInput id='password' label='Пароль' type='password'
          required
          value={password}
          onChange={event => { setPassword(event.target.value); }}
        />
        <TextInput id='password2' label='Повторите пароль' type='password'
          required
          value={password2}
          onChange={event => { setPassword2(event.target.value); }}
        />
        <div className='text-sm'>
          <p>- минимум 8 символов</p>
          <p>- большие, маленькие буквы, цифры</p>
          <p>- минимум 1 спец. символ</p>
        </div>
        <TextInput id='email' label='email' type='text'
          required
          value={email}
          onChange={event => { setEmail(event.target.value); }}
        />
        <TextInput id='first_name' label='Имя' type='text'
          value={firstName}
          onChange={event => { setFirstName(event.target.value); }}
        />
        <TextInput id='last_name' label='Фамилия' type='text'
          value={lastName}
          onChange={event => { setLastName(event.target.value); }}
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
