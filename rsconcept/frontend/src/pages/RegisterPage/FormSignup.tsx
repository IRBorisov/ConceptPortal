'use client';

import axios from 'axios';
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { urls } from '@/app/urls';
import { IconHelp } from '@/components/Icons';
import InfoError, { ErrorData } from '@/components/info/InfoError';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import FlexColumn from '@/components/ui/FlexColumn';
import Overlay from '@/components/ui/Overlay';
import PrettyJson from '@/components/ui/PrettyJSON';
import SubmitButton from '@/components/ui/SubmitButton';
import TextInput from '@/components/ui/TextInput';
import TextURL from '@/components/ui/TextURL';
import Tooltip from '@/components/ui/Tooltip';
import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { HelpTopic } from '@/models/miscellaneous';
import { IUserSignupData } from '@/models/user';
import { globals, patterns } from '@/utils/constants';

function FormSignup() {
  const router = useConceptNavigation();
  const { signup, loading, error, setError } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptRules, setAcceptRules] = useState(false);

  const isValid = useMemo(
    () => acceptPrivacy && acceptRules && !!email && !!username,
    [acceptPrivacy, acceptRules, email, username]
  );

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
  return (
    <form className={clsx('cc-fade-in cc-column', 'mx-auto w-[36rem]', 'px-6 py-3')} onSubmit={handleSubmit}>
      <h1>
        <span>Новый пользователь</span>
        <Overlay id={globals.password_tooltip} position='top-[5.4rem] left-[3.5rem]'>
          <IconHelp size='1.25rem' className='icon-primary' />
        </Overlay>
        <Tooltip anchorSelect={`#${globals.password_tooltip}`} offset={6}>
          используйте уникальный пароль для каждого сайта
        </Tooltip>
        <Overlay id={globals.email_tooltip} position='top-[0.5rem] right-[1.75rem]'>
          <IconHelp size='1.25rem' className='icon-primary' />
        </Overlay>
        <Tooltip anchorSelect={`#${globals.email_tooltip}`} offset={6}>
          электронная почта используется для восстановления пароля
        </Tooltip>
      </h1>
      <div className='flex gap-12'>
        <FlexColumn>
          <TextInput
            id='username'
            autoComplete='username'
            required
            label='Имя пользователя (логин)'
            spellCheck={false}
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
            spellCheck={false}
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
        <TextURL text='обработки персональных данных...' href={urls.help_topic(HelpTopic.INFO_PRIVACY)} />
      </div>
      <div className='flex gap-1 text-sm'>
        <Checkbox id='accept_rules' label='Принимаю ' value={acceptRules} setValue={setAcceptRules} />
        <TextURL text='правила поведения на Портале...' href={urls.help_topic(HelpTopic.INFO_RULES)} />
      </div>

      <div className='flex justify-around my-3'>
        <SubmitButton text='Регистрировать' className='min-w-[10rem]' loading={loading} disabled={!isValid} />
        <Button text='Назад' className='min-w-[10rem]' onClick={() => handleCancel()} />
      </div>
      {error ? <ProcessError error={error} /> : null}
    </form>
  );
}

export default FormSignup;

// ====== Internals =========
function ProcessError({ error }: { error: ErrorData }): React.ReactElement {
  if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
    if ('email' in error.response.data) {
      return (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        <div className='mx-auto text-sm select-text clr-text-red'>{error.response.data.email}.</div>
      );
    } else if ('username' in error.response.data) {
      return (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        <div className='mx-auto text-sm select-text clr-text-red'>{error.response.data.username}.</div>
      );
    } else {
      return (
        <div className='mx-auto text-sm select-text clr-text-red'>
          <PrettyJson data={error.response} />
        </div>
      );
    }
  }
  return <InfoError error={error} />;
}
