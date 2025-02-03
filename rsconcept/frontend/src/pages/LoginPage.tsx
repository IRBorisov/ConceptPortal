'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';

import { useConceptNavigation } from '@/app/Navigation/NavigationContext';
import { urls } from '@/app/urls';
import { IUserLoginDTO, UserLoginSchema } from '@/backend/auth/api';
import { useAuthSuspense } from '@/backend/auth/useAuth';
import { useLogin } from '@/backend/auth/useLogin';
import ExpectedAnonymous from '@/components/ExpectedAnonymous';
import { ErrorData } from '@/components/info/InfoError';
import ErrorField from '@/components/ui/ErrorField';
import SubmitButton from '@/components/ui/SubmitButton';
import TextInput from '@/components/ui/TextInput';
import TextURL from '@/components/ui/TextURL';
import useQueryStrings from '@/hooks/useQueryStrings';
import { resources } from '@/utils/constants';

function LoginPage() {
  const router = useConceptNavigation();
  const query = useQueryStrings();
  const initialName = query.get('username') ?? '';

  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    resetField,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(UserLoginSchema),
    defaultValues: { username: initialName, password: '' }
  });

  const { isAnonymous } = useAuthSuspense();
  const { login, isPending, error: loginError, reset } = useLogin();

  function onSubmit(data: IUserLoginDTO) {
    login(
      data,
      () => {
        resetField('password');
        if (router.canBack()) {
          router.back();
        } else {
          router.push(urls.library);
        }
      },
      error => {
        if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
          setError('root', { message: 'На Портале отсутствует такое сочетание имени пользователя и пароля' });
        }
      }
    );
  }

  function resetErrors() {
    reset();
    clearErrors();
  }

  if (!isAnonymous) {
    return <ExpectedAnonymous />;
  }
  return (
    <form
      className={clsx('cc-column cc-fade-in', 'w-[24rem] mx-auto', 'pt-12 pb-6 px-6')}
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      onChange={resetErrors}
    >
      <img alt='Концепт Портал' src={resources.logo} className='max-h-[2.5rem] min-w-[2.5rem] mb-3' />
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

      <SubmitButton text='Войти' className='self-center w-[12rem] mt-3' loading={isPending} />
      <div className='flex flex-col text-sm'>
        <TextURL text='Восстановить пароль...' href='/restore-password' />
        <TextURL text='Нет аккаунта? Зарегистрируйтесь...' href='/signup' />
      </div>
      <ErrorField error={errors.root} />
      <EscalateError error={loginError} />
    </form>
  );
}

export default LoginPage;

// ====== Internals =========
function EscalateError({ error }: { error: ErrorData }): React.ReactElement | null {
  // TODO: rework error escalation mechanism. Probably make it global.
  if (!error) {
    return null;
  }
  if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
    return null;
  }
  throw error as Error;
}
