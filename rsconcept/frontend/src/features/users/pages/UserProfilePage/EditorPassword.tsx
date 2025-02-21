'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';

import { urls, useConceptNavigation } from '@/app';
import { useChangePassword } from '@/features/auth';
import { type IChangePasswordDTO, schemaChangePassword } from '@/features/auth/backend/types';

import { isAxiosError } from '@/backend/apiTransport';
import { FlexColumn } from '@/components/Container';
import { SubmitButton } from '@/components/Control';
import { type ErrorData } from '@/components/InfoError';
import { TextInput } from '@/components/Input';

export function EditorPassword() {
  const router = useConceptNavigation();
  const { changePassword, isPending, error: serverError, reset: clearServerError } = useChangePassword();
  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors }
  } = useForm<IChangePasswordDTO>({
    resolver: zodResolver(schemaChangePassword)
  });

  function resetErrors() {
    clearServerError();
    clearErrors();
  }

  function onSubmit(data: IChangePasswordDTO) {
    return changePassword(data).then(() => router.push(urls.login));
  }

  return (
    <form
      className={clsx('max-w-[16rem]', 'px-6 py-2 flex flex-col justify-between', 'border-l-2')}
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      onChange={resetErrors}
    >
      <FlexColumn>
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
      </FlexColumn>
      <SubmitButton text='Сменить пароль' className='self-center mt-2' loading={isPending} />
    </form>
  );
}

// ====== Internals =========
function ServerError({ error }: { error: ErrorData }): React.ReactElement {
  if (isAxiosError(error) && error.response && error.response.status === 400) {
    return <div className='text-sm select-text text-warn-600'>Неверно введен старый пароль</div>;
  }
  throw error as Error;
}
