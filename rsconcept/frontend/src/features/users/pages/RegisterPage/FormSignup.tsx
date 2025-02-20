'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';

import { urls, useBlockNavigation, useConceptNavigation } from '@/app';
import { HelpTopic } from '@/features/help';

import { isAxiosError } from '@/backend/apiTransport';
import { FlexColumn, Overlay, Tooltip } from '@/components/Container';
import { Button, SubmitButton, TextURL } from '@/components/Control';
import { IconHelp } from '@/components/Icons';
import { ErrorData } from '@/components/InfoError';
import { Checkbox, TextInput } from '@/components/Input';
import { PrettyJson } from '@/components/View';
import { globalIDs, patterns } from '@/utils/constants';

import { IUserSignupDTO, schemaUserSignup } from '../../backend/types';
import { useSignup } from '../../backend/useSignup';

export function FormSignup() {
  const router = useConceptNavigation();
  const { signup, isPending, error: serverError, reset: clearServerError } = useSignup();
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptRules, setAcceptRules] = useState(false);

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors, isDirty }
  } = useForm<IUserSignupDTO>({
    resolver: zodResolver(schemaUserSignup)
  });

  useBlockNavigation(isDirty);

  function resetErrors() {
    clearServerError();
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
    return signup(data).then(createdUser => router.push(urls.login_hint(createdUser.username)));
  }

  return (
    <form
      className={clsx('cc-fade-in cc-column', 'mx-auto w-[36rem]', 'px-6 py-3')}
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      onChange={resetErrors}
    >
      <h1>
        <span>Новый пользователь</span>
        <Overlay id={globalIDs.email_tooltip} position='top-[0.5rem] right-[1.75rem]'>
          <IconHelp size='1.25rem' className='icon-primary' />
        </Overlay>
        <Tooltip anchorSelect={`#${globalIDs.email_tooltip}`} offset={6}>
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
            title='электронная почта в корректном формате'
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
        <Checkbox id='accept_terms' label='Принимаю условия' value={acceptPrivacy} onChange={setAcceptPrivacy} />
        <TextURL text='обработки персональных данных...' href={urls.help_topic(HelpTopic.INFO_PRIVACY)} />
      </div>
      <div className='flex gap-1 text-sm'>
        <Checkbox id='accept_rules' label='Принимаю ' value={acceptRules} onChange={setAcceptRules} />
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

// ====== Internals =========
function ServerError({ error }: { error: ErrorData }): React.ReactElement {
  if (isAxiosError(error) && error.response && error.response.status === 400) {
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
