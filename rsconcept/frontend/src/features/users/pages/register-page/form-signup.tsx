'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { urls, useConceptNavigation } from '@/app';
import { HelpTopic } from '@/features/help';

import { isAxiosError } from '@/backend/api-transport';
import { Tooltip } from '@/components/container';
import { Button, SubmitButton, TextURL } from '@/components/control';
import { IconHelp } from '@/components/icons';
import { type ErrorData } from '@/components/info-error';
import { Checkbox, TextInput } from '@/components/input';
import { PrettyJson } from '@/components/view';
import { globalIDs, patterns } from '@/utils/constants';

import { type IUserSignupDTO, schemaUserSignup } from '../../backend/types';
import { useSignup } from '../../backend/use-signup';

export function FormSignup() {
  const router = useConceptNavigation();
  const { signup, isPending, error: serverError, reset: clearServerError } = useSignup();
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptRules, setAcceptRules] = useState(false);

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors }
  } = useForm<IUserSignupDTO>({
    resolver: zodResolver(schemaUserSignup)
  });

  function resetErrors() {
    clearServerError();
    clearErrors();
  }

  function handleCancel() {
    if (router.canBack()) {
      router.back();
    } else {
      router.push({ path: urls.library });
    }
  }

  function onSubmit(data: IUserSignupDTO) {
    return signup(data).then(createdUser =>
      router.pushAsync({ path: urls.login_hint(createdUser.username), force: true })
    );
  }

  return (
    <form
      className='cc-column mx-auto w-144 px-6 py-3'
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      onChange={resetErrors}
    >
      <h1>Новый пользователь</h1>

      <div className='flex gap-12'>
        <fieldset className='cc-column w-60'>
          <legend className='sr-only'>Данные для входа</legend>

          <TextInput
            id='username'
            {...register('username')}
            autoComplete='username'
            label='Имя пользователя (логин)'
            spellCheck={false}
            pattern={patterns.login}
            title='Минимум 3 знака. Латинские буквы и цифры. Не может начинаться с цифры'
            error={errors.username}
          />
          <TextInput
            id='password'
            type='password'
            {...register('password')}
            autoComplete='new-password'
            label='Пароль'
            error={errors.password}
          />
          <TextInput
            id='password2'
            type='password'
            {...register('password2')}
            label='Повторите пароль'
            autoComplete='new-password'
            error={errors.password2}
          />
        </fieldset>

        <fieldset className='cc-column w-60 relative'>
          <legend className='sr-only'>Информация о пользователе</legend>

          <IconHelp
            id={globalIDs.email_tooltip}
            className='absolute top-0 right-0 text-muted-foreground hover:text-primary'
            size='1.25rem'
          />
          <Tooltip anchorSelect={`#${globalIDs.email_tooltip}`} offset={6}>
            электронная почта используется для восстановления пароля
          </Tooltip>
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
        </fieldset>
      </div>

      <div className='flex gap-1 text-sm'>
        <Checkbox id='accept_terms' label='Принимаю условия' value={acceptPrivacy} onChange={setAcceptPrivacy} />
        <TextURL text='обработки персональных данных...' href={urls.help_topic(HelpTopic.INFO_PRIVACY)} />
      </div>
      <div className='flex gap-1 text-sm'>
        <Checkbox id='accept_rules' label='Принимаю ' value={acceptRules} onChange={setAcceptRules} />
        <TextURL text='правила поведения на Портале...' href={urls.help_topic(HelpTopic.INFO_RULES)} />
      </div>

      <div className='flex justify-around mt-3'>
        <SubmitButton
          text='Регистрировать'
          className='min-w-40'
          loading={isPending}
          disabled={!acceptPrivacy || !acceptRules}
        />
        <Button text='Назад' className='min-w-40' onClick={() => handleCancel()} />
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
        <div className='mx-auto text-sm select-text text-destructive'>{error.response.data.email}</div>
      );
    } else if ('username' in error.response.data) {
      return (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        <div className='mx-auto text-sm select-text text-destructive'>{error.response.data.username}</div>
      );
    } else {
      return (
        <div className='mx-auto text-sm select-text text-destructive'>
          <PrettyJson data={error.response} />
        </div>
      );
    }
  }
  throw error as Error;
}
