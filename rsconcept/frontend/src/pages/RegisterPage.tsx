'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import Button from '@/components/Common/Button';
import Checkbox from '@/components/Common/Checkbox';
import ConceptTooltip from '@/components/Common/ConceptTooltip';
import Overlay from '@/components/Common/Overlay';
import SubmitButton from '@/components/Common/SubmitButton';
import TextInput from '@/components/Common/TextInput';
import TextURL from '@/components/Common/TextURL';
import ExpectedAnonymous from '@/components/ExpectedAnonymous';
import { HelpIcon } from '@/components/Icons';
import InfoError from '@/components/InfoError';
import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NagivationContext';
import { type IUserSignupData } from '@/models/library';
import { globalIDs, patterns } from '@/utils/constants';

function RegisterPage() {
  const router = useConceptNavigation();
  const { user, signup, loading, error, setError } = useAuth();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  useEffect(() => {
    setError(undefined);
  }, [username, email, password, password2, setError]);

  function handleCancel() {
    if (router.canBack()) {
      router.back();
    } else {
      router.push('/library');
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
        router.push(`/login?username=${createdUser.username}`);
        toast.success(`Пользователь успешно создан: ${createdUser.username}`);
      });
    }
  }

  if (user) {
    return (<ExpectedAnonymous />);
  }
  return (
  <form
    className='flex flex-col gap-3 px-6 py-3 h-fit'
    onSubmit={handleSubmit}
  >
    <h1>Новый пользователь</h1>
    <div className='flex gap-12'>
      <div className='flex flex-col gap-3'>
        <div className='absolute'>
          <Overlay
            id={globalIDs.password_tooltip}
            position='top-[4.8rem] left-[3.4rem] absolute'
          >
            <HelpIcon color='clr-text-primary' size={5} />
          </Overlay>
          <ConceptTooltip
            anchorSelect={`#${globalIDs.password_tooltip}`}
            offset={6}
          >
            <p>- используйте уникальный пароль</p>
            <p>- портал функционирует в тестовом режиме</p>
          </ConceptTooltip>
        </div>

        <TextInput id='username' required
          label='Имя пользователя (логин)'
          pattern={patterns.login}
          tooltip='Минимум 3 знака. Латинские буквы и цифры. Не может начинаться с цифры'
          value={username}
          dimensions='w-[15rem]'
          onChange={event => setUsername(event.target.value)}
        />
        <TextInput id='password' type='password' required
          label='Пароль'
          dimensions='w-[15rem]'
          value={password}
          onChange={event => setPassword(event.target.value)}
        />
        <TextInput id='password2' required type='password'
          label='Повторите пароль'
          dimensions='w-[15rem]'
          value={password2}
          onChange={event => setPassword2(event.target.value)}
        />
      </div>

      <div className='flex flex-col gap-3 w-[15rem]'>
        <TextInput id='email' required
          label='Электронная почта (email)'
          tooltip='электронная почта в корректном формате, например: i.petrov@mycompany.ru.com'
          value={email}
          onChange={event => setEmail(event.target.value)}
        />
        <TextInput id='first_name'
          label='Отображаемое имя'
          value={firstName}
          onChange={event => setFirstName(event.target.value)}
        />
        <TextInput id='last_name'
          label='Отображаемая фамилия'
          value={lastName}
          onChange={event => setLastName(event.target.value)}
        />
      </div>
    </div>
    
    <div className='flex text-sm'>
      <Checkbox
        label='Принимаю условия'
        value={acceptPrivacy}
        setValue={setAcceptPrivacy}
      />
      <TextURL 
        text='обработки персональных данных...'
        href={'/manuals?topic=privacy'}
      />
    </div>

    <div className='flex items-center justify-around w-full my-3'>
      <SubmitButton
        text='Регистрировать' 
        dimensions='min-w-[10rem]'
        loading={loading}
        disabled={!acceptPrivacy}
      />
      <Button 
        text='Назад'
        dimensions='min-w-[10rem]'
        onClick={() => handleCancel()}
      />
    </div>
    {error ? <InfoError error={error} /> : null}
  </form>);
}

export default RegisterPage;