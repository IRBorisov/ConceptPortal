'use client';

import axios from 'axios';
import clsx from 'clsx';
import { useState } from 'react';

import { useConceptNavigation } from '@/app/Navigation/NavigationContext';
import { urls } from '@/app/urls';
import { UserLoginSchema } from '@/backend/auth/api';
import { useAuthSuspense } from '@/backend/auth/useAuth';
import { useLogin } from '@/backend/auth/useLogin';
import ExpectedAnonymous from '@/components/ExpectedAnonymous';
import { ErrorData } from '@/components/info/InfoError';
import SubmitButton from '@/components/ui/SubmitButton';
import TextInput from '@/components/ui/TextInput';
import TextURL from '@/components/ui/TextURL';
import useQueryStrings from '@/hooks/useQueryStrings';
import { resources } from '@/utils/constants';

function LoginPage() {
  const router = useConceptNavigation();
  const query = useQueryStrings();
  const initialName = query.get('username') ?? '';

  const { isAnonymous } = useAuthSuspense();
  const { login, isPending, error: loginError, reset } = useLogin();
  const [validationError, setValidationError] = useState<ErrorData | undefined>(undefined);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isPending) {
      const formData = new FormData(event.currentTarget);
      const result = UserLoginSchema.safeParse({
        username: formData.get('username'),
        password: formData.get('password')
      });

      if (!result.success) {
        setValidationError(result.error);
      } else {
        login(result.data, () => {
          if (router.canBack()) {
            router.back();
          } else {
            router.push(urls.library);
          }
        });
      }
    }
  }

  function resetErrors() {
    reset();
    setValidationError(undefined);
  }

  if (!isAnonymous) {
    return <ExpectedAnonymous />;
  }
  return (
    <form className={clsx('cc-column cc-fade-in', 'w-[24rem] mx-auto', 'pt-12 pb-6 px-6')} onSubmit={handleSubmit}>
      <img alt='Концепт Портал' src={resources.logo} className='max-h-[2.5rem] min-w-[2.5rem] mb-3' />
      <TextInput
        id='username'
        name='username'
        autoComplete='username'
        label='Логин или email'
        autoFocus
        required
        allowEnter
        spellCheck={false}
        defaultValue={initialName}
        onChange={resetErrors}
      />
      <TextInput
        id='password'
        name='password'
        type='password'
        autoComplete='current-password'
        label='Пароль'
        required
        allowEnter
        onChange={resetErrors}
      />

      <SubmitButton text='Войти' className='self-center w-[12rem] mt-3' loading={isPending} />
      <div className='flex flex-col text-sm'>
        <TextURL text='Восстановить пароль...' href='/restore-password' />
        <TextURL text='Нет аккаунта? Зарегистрируйтесь...' href='/signup' />
      </div>
      {!!loginError || !!validationError ? <ProcessError error={loginError ?? validationError} /> : null}
    </form>
  );
}

export default LoginPage;

// ====== Internals =========
function ProcessError({ error }: { error: ErrorData }): React.ReactElement {
  if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
    return (
      <div className='text-sm select-text text-warn-600'>
        На Портале отсутствует такое сочетание имени пользователя и пароля
      </div>
    );
  }
  throw error as Error;
}
