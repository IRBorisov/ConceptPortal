'use client';

import { useForm } from '@tanstack/react-form';

import { urls, useConceptNavigation } from '@/app';

import { isAxiosError } from '@/backend/api-transport';
import { SubmitButton, TextURL } from '@/components/control';
import { type ErrorData } from '@/components/info-error';
import { TextInput } from '@/components/input';
import { useQueryStrings } from '@/hooks/use-query-strings';
import { resources } from '@/utils/constants';
import { rethrowIfStaleBundleError } from '@/utils/stale-bundle-error';

import { type IUserLoginDTO, schemaUserLogin } from '../backend/types';
import { useAuth } from '../backend/use-auth';
import { useLogin } from '../backend/use-login';
import { ExpectedAnonymous } from '../components/expected-anonymous';

export function LoginPage() {
  const router = useConceptNavigation();
  const query = useQueryStrings();
  const initialName = query.get('username') ?? '';

  const { isAnonymous } = useAuth();
  const { login, isPending, error: serverError, reset: clearServerError } = useLogin();

  const form = useForm({
    defaultValues: { username: initialName, password: '' } satisfies IUserLoginDTO,
    validators: {
      onChange: schemaUserLogin
    },
    onSubmit: async ({ value }) => {
      await login(value).then(() => {
        if (router.canBack()) {
          router.back();
        } else {
          router.push({ path: urls.library, force: true });
        }
      });
    }
  });

  function resetErrors() {
    clearServerError();
  }

  if (!isAnonymous) {
    return <ExpectedAnonymous />;
  }
  return (
    <form
      className='cc-column w-96 mx-auto pt-12 pb-6 px-6'
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      onChange={resetErrors}
    >
      <img alt='Концепт Портал' src={resources.logo} className='max-h-10 min-w-10 mb-3' />
      <form.Field name='username'>
        {field => (
          <TextInput
            id='username'
            autoComplete='username'
            label='Логин или email'
            autoFocus
            allowEnter
            spellCheck={false}
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : undefined}
          />
        )}
      </form.Field>
      <form.Field name='password'>
        {field => (
          <TextInput
            id='password'
            type='password'
            autoComplete='current-password'
            label='Пароль'
            allowEnter
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : undefined}
          />
        )}
      </form.Field>

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
  rethrowIfStaleBundleError(error);

  if (isAxiosError(error) && error.response?.status === 400) {
    return (
      <div className='text-sm select-text text-destructive'>
        На Портале отсутствует такое сочетание имени пользователя и пароля
      </div>
    );
  }
  throw error as Error;
}
