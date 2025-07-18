'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { urls, useConceptNavigation } from '@/app';
import { type IChangePasswordDTO, schemaChangePassword } from '@/features/auth';
import { useChangePassword } from '@/features/auth/backend/use-change-password';

import { isAxiosError } from '@/backend/api-transport';
import { SubmitButton } from '@/components/control';
import { type ErrorData } from '@/components/info-error';
import { TextInput } from '@/components/input';

export function EditorPassword() {
  const router = useConceptNavigation();
  const { changePassword, isPending, error: serverError, reset: clearServerError } = useChangePassword();
  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors }
  } = useForm<IChangePasswordDTO>({
    resolver: zodResolver(schemaChangePassword),
    mode: 'onChange'
  });

  function resetErrors() {
    clearServerError();
    clearErrors();
  }

  function onSubmit(data: IChangePasswordDTO) {
    return changePassword(data).then(() => router.pushAsync({ path: urls.login, force: true }));
  }

  return (
    <form
      className='max-w-64 px-6 py-2 flex flex-col gap-2 justify-between border-l-2'
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      onChange={resetErrors}
    >
      <div className='cc-column'>
        <TextInput
          id='old_password'
          type='password'
          {...register('old_password')}
          label='Старый пароль'
          autoComplete='current-password'
          allowEnter
          error={errors.old_password}
        />
        <TextInput
          id='new_password'
          type='password'
          {...register('new_password')}
          label='Новый пароль'
          autoComplete='new-password'
          allowEnter
          error={errors.new_password}
        />
        <TextInput
          id='new_password2'
          type='password'
          {...register('new_password2')}
          label='Повторите новый'
          autoComplete='new-password'
          allowEnter
          error={errors.new_password2}
        />
        {serverError ? <ServerError error={serverError} /> : null}
      </div>
      <SubmitButton text='Сменить пароль' className='self-center' loading={isPending} />
    </form>
  );
}

// ====== Internals =========
function ServerError({ error }: { error: ErrorData }): React.ReactElement {
  if (isAxiosError(error) && error.response && error.response.status === 400) {
    return <div className='text-sm select-text text-destructive'>Неверно введен старый пароль</div>;
  }
  throw error as Error;
}
