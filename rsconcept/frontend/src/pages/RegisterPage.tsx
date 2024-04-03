'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { urls } from '@/app/urls';
import { IconHelp } from '@/components/Icons';
import InfoError from '@/components/info/InfoError';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import FlexColumn from '@/components/ui/FlexColumn';
import Overlay from '@/components/ui/Overlay';
import SubmitButton from '@/components/ui/SubmitButton';
import TextInput from '@/components/ui/TextInput';
import TextURL from '@/components/ui/TextURL';
import Tooltip from '@/components/ui/Tooltip';
import AnimateFade from '@/components/wrap/AnimateFade';
import ExpectedAnonymous from '@/components/wrap/ExpectedAnonymous';
import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { type IUserSignupData } from '@/models/library';
import { globals, patterns } from '@/utils/constants';

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
      router.push(urls.library);
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
        router.push(urls.login_hint(createdUser.username));
        toast.success(`Пользователь успешно создан: ${createdUser.username}`);
      });
    }
  }

  if (user) {
    return (
      <AnimateFade>
        <ExpectedAnonymous />
      </AnimateFade>
    );
  }
  return (
    <AnimateFade>
      <form className={clsx('cc-column', 'px-6 py-3')} onSubmit={handleSubmit}>
        <h1>Новый пользователь</h1>
        <div className='flex gap-12'>
          <FlexColumn>
            <div className='absolute'>
              <Overlay id={globals.password_tooltip} position='top-[4.8rem] left-[3.4rem] absolute'>
                <IconHelp size='1.25rem' className='icon-primary' />
              </Overlay>
              <Tooltip anchorSelect={`#${globals.password_tooltip}`} offset={6}>
                <p>- используйте уникальный пароль</p>
                <p>- портал функционирует в тестовом режиме</p>
              </Tooltip>
            </div>

            <TextInput
              id='username'
              autoComplete='username'
              required
              label='Имя пользователя (логин)'
              pattern={patterns.login}
              title='Минимум 3 знака. Латинские буквы и цифры. Не может начинаться с цифры'
              value={username}
              className='w-[15rem]'
              onChange={event => setUsername(event.target.value)}
            />
            <TextInput
              id='password'
              type='password'
              autoComplete='new-password'
              required
              label='Пароль'
              className='w-[15rem]'
              value={password}
              onChange={event => setPassword(event.target.value)}
            />
            <TextInput
              id='password2'
              type='password'
              label='Повторите пароль'
              autoComplete='new-password'
              required
              className='w-[15rem]'
              value={password2}
              onChange={event => setPassword2(event.target.value)}
            />
          </FlexColumn>

          <FlexColumn className='w-[15rem]'>
            <TextInput
              id='email'
              autoComplete='email'
              required
              label='Электронная почта (email)'
              title='электронная почта в корректном формате, например: i.petrov@mycompany.ru.com'
              value={email}
              onChange={event => setEmail(event.target.value)}
            />
            <TextInput
              id='first_name'
              label='Отображаемое имя'
              autoComplete='given-name'
              value={firstName}
              onChange={event => setFirstName(event.target.value)}
            />
            <TextInput
              id='last_name'
              label='Отображаемая фамилия'
              autoComplete='family-name'
              value={lastName}
              onChange={event => setLastName(event.target.value)}
            />
          </FlexColumn>
        </div>

        <div className='flex gap-1 text-sm'>
          <Checkbox id='accept_terms' label='Принимаю условия' value={acceptPrivacy} setValue={setAcceptPrivacy} />
          <TextURL text='обработки персональных данных...' href={'/manuals?topic=privacy'} />
        </div>

        <div className='flex justify-around my-3'>
          <SubmitButton text='Регистрировать' className='min-w-[10rem]' loading={loading} disabled={!acceptPrivacy} />
          <Button text='Назад' className='min-w-[10rem]' onClick={() => handleCancel()} />
        </div>
        {error ? <InfoError error={error} /> : null}
      </form>
    </AnimateFade>
  );
}

export default RegisterPage;
