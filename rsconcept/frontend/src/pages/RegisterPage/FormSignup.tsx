'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import clsx from 'clsx';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useConceptNavigation } from '@/app/Navigation/NavigationContext';
import { urls } from '@/app/urls';
import { IUserSignupDTO, UserSignupSchema } from '@/backend/users/api';
import { useSignup } from '@/backend/users/useSignup';
import { IconHelp } from '@/components/Icons';
import { ErrorData } from '@/components/info/InfoError';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import FlexColumn from '@/components/ui/FlexColumn';
import Overlay from '@/components/ui/Overlay';
import PrettyJson from '@/components/ui/PrettyJSON';
import SubmitButton from '@/components/ui/SubmitButton';
import TextInput from '@/components/ui/TextInput';
import TextURL from '@/components/ui/TextURL';
import Tooltip from '@/components/ui/Tooltip';
import { HelpTopic } from '@/models/miscellaneous';
import { globals, patterns } from '@/utils/constants';

function FormSignup() {
  const router = useConceptNavigation();
  const { signup, isPending, error: serverError, reset } = useSignup();
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptRules, setAcceptRules] = useState(false);

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors }
  } = useForm<IUserSignupDTO>({
    resolver: zodResolver(UserSignupSchema)
  });

  function resetErrors() {
    reset();
    clearErrors();
  }

  function handleCancel() {
    if (router.canBack()) {
      router.back();
    } else {
      router.push(urls.library);
    }
  }

  function onSubmit(data: IUserSignupDTO) {
    signup(data, createdUser => router.push(urls.login_hint(createdUser.username)));
  }

  return (
    <form
      className={clsx('cc-fade-in cc-column', 'mx-auto w-[36rem]', 'px-6 py-3')}
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      onChange={resetErrors}
    >
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
            {...register('username')}
            autoComplete='username'
            label='Имя пользователя (логин)'
            spellCheck={false}
            pattern={patterns.login}
            title='Минимум 3 знака. Латинские буквы и цифры. Не может начинаться с цифры'
            className='w-[15rem]'
            error={errors.username}
          />
          <TextInput
            id='password'
            type='password'
            {...register('password')}
            autoComplete='new-password'
            label='Пароль'
            className='w-[15rem]'
            error={errors.password}
          />
          <TextInput
            id='password2'
            type='password'
            {...register('password2')}
            label='Повторите пароль'
            autoComplete='new-password'
            className='w-[15rem]'
            error={errors.password2}
          />
        </FlexColumn>

        <FlexColumn className='w-[15rem]'>
          <TextInput
            id='email'
            {...register('email')}
            autoComplete='email'
            required
            spellCheck={false}
            label='Электронная почта (email)'
            title='электронная почта в корректном формате, например: i.petrov@mycompany.ru.com'
            error={errors.email}
          />
          <TextInput
            id='first_name'
            {...register('first_name')}
            label='Отображаемое имя'
            autoComplete='given-name'
            error={errors.first_name}
          />
          <TextInput
            id='last_name'
            {...register('last_name')}
            label='Отображаемая фамилия'
            autoComplete='family-name'
            error={errors.last_name}
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
        <SubmitButton
          text='Регистрировать'
          className='min-w-[10rem]'
          loading={isPending}
          disabled={!acceptPrivacy || !acceptRules}
        />
        <Button text='Назад' className='min-w-[10rem]' onClick={() => handleCancel()} />
      </div>
      {serverError ? <ServerError error={serverError} /> : null}
    </form>
  );
}

export default FormSignup;

// ====== Internals =========
function ServerError({ error }: { error: ErrorData }): React.ReactElement {
  if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
    if ('email' in error.response.data) {
      return (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        <div className='mx-auto text-sm select-text text-warn-600'>{error.response.data.email}</div>
      );
    } else if ('username' in error.response.data) {
      return (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        <div className='mx-auto text-sm select-text text-warn-600'>{error.response.data.username}</div>
      );
    } else {
      return (
        <div className='mx-auto text-sm select-text text-warn-600'>
          <PrettyJson data={error.response} />
        </div>
      );
    }
  }
  throw error as Error;
}
