'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { urls, useConceptNavigation } from '@/app';

import { isAxiosError } from '@/backend/apiTransport';
import { SubmitButton, TextURL } from '@/components/Control';
import { type ErrorData } from '@/components/InfoError';
import { TextInput } from '@/components/Input';
import { useQueryStrings } from '@/hooks/useQueryStrings';
import { resources } from '@/utils/constants';

import { type IUserLoginDTO, schemaUserLogin } from '../backend/types';
import { useAuthSuspense } from '../backend/useAuth';
import { useLogin } from '../backend/useLogin';
import { ExpectedAnonymous } from '../components/ExpectedAnonymous';

export function LoginPage() {
  const router = useConceptNavigation();
  const query = useQueryStrings();
  const initialName = query.get('username') ?? '';

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schemaUserLogin),
    defaultValues: { username: initialName, password: '' }
  });

  const { isAnonymous } = useAuthSuspense();
  const { login, isPending, error: serverError, reset: clearServerError } = useLogin();

  function onSubmit(data: IUserLoginDTO) {
    return login(data).then(() => {
      if (router.canBack()) {
        router.back();
      } else {
        router.push({ path: urls.library, force: true });
      }
    });
  }

  function resetErrors() {
    clearServerError();
    clearErrors();
  }

  if (!isAnonymous) {
    return <ExpectedAnonymous />;
  }
  return (
    <form
      className='cc-column cc-fade-in w-96 mx-auto pt-12 pb-6 px-6'
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      onChange={resetErrors}
    >
      <img alt='Концепт Портал' src={resources.logo} className='max-h-10 min-w-10 mb-3' />
      <TextInput
        id='username'
        autoComplete='username'
        label='Логин или email'
        {...register('username')}
        autoFocus
        allowEnter
        spellCheck={false}
        defaultValue={initialName}
        error={errors.username}
      />
      <TextInput
        id='password'
        {...register('password')}
        type='password'
        autoComplete='current-password'
        label='Пароль'
        allowEnter
        error={errors.password}
      />

      <SubmitButton text='Войти' className='self-center w-48 mt-3' loading={isPending} />
      <div className='flex flex-col text-sm'>
        <TextURL text='Восстановить пароль...' href='/restore-password' />
        <TextURL text='Нет аккаунта? Зарегистрируйтесь...' href='/signup' />
      </div>
      {serverError ? <ServerError error={serverError} /> : null}
    </form>
  );
}

// ====== Internals =========
function ServerError({ error }: { error: ErrorData }): React.ReactElement | null {
  if (isAxiosError(error) && error.response && error.response.status === 400) {
    return (
      <div className='text-sm select-text text-warn-600'>
        На Портале отсутствует такое сочетание имени пользователя и пароля
      </div>
    );
  }
  throw error as Error;
}
