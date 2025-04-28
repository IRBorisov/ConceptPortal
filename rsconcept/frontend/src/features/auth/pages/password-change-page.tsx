'use client';

import { useState } from 'react';

import { urls, useConceptNavigation } from '@/app';

import { isAxiosError } from '@/backend/api-transport';
import { SubmitButton } from '@/components/control';
import { type ErrorData, InfoError } from '@/components/info-error';
import { TextInput } from '@/components/input';
import { Loader } from '@/components/loader';
import { useQueryStrings } from '@/hooks/use-query-strings';

import { useResetPassword } from '../backend/use-reset-password';

function useTokenValidation(token: string, isPending: boolean) {
  const { validateToken } = useResetPassword();
  const [isTokenValidating, setIsTokenValidating] = useState(false);

  const validate = async () => {
    if (!isTokenValidating && !isPending) {
      await validateToken({ token });
      setIsTokenValidating(true);
    }
  };
  return { isTokenValidating, validate };
}

export function Component() {
  const router = useConceptNavigation();
  const token = useQueryStrings().get('token') ?? '';

  const { resetPassword, isPending, error: serverError } = useResetPassword();
  const { isTokenValidating, validate } = useTokenValidation(token, isPending);

  const [newPassword, setNewPassword] = useState('');
  const [newPasswordRepeat, setNewPasswordRepeat] = useState('');

  const canSubmit = !!newPassword && !!newPasswordRepeat && newPassword === newPasswordRepeat;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isPending) {
      void resetPassword({
        password: newPassword,
        token: token
      }).then(() => {
        router.replace({ path: urls.home });
        router.push({ path: urls.login });
      });
    }
  }

  if (!isTokenValidating && !isPending) {
    void validate();
  }

  if (isPending) {
    return <Loader />;
  }

  return (
    <form className='cc-fade-in cc-column w-96 mx-auto px-6 mt-3' onSubmit={handleSubmit}>
      <TextInput
        id='new_password'
        type='password'
        label='Новый пароль'
        autoComplete='new-password'
        allowEnter
        value={newPassword}
        onChange={event => {
          setNewPassword(event.target.value);
        }}
      />
      <TextInput
        id='new_password_repeat'
        type='password'
        label='Повторите новый'
        autoComplete='new-password'
        allowEnter
        value={newPasswordRepeat}
        onChange={event => {
          setNewPasswordRepeat(event.target.value);
        }}
      />

      <SubmitButton
        text='Установить пароль'
        className='self-center w-48 mt-3'
        loading={isPending}
        disabled={!canSubmit}
      />
      {serverError ? <ServerError error={serverError} /> : null}
    </form>
  );
}

// ====== Internals =========
function ServerError({ error }: { error: ErrorData }): React.ReactElement {
  if (isAxiosError(error) && error.response && error.response.status === 404) {
    return <div className='mx-auto mt-6 text-sm select-text text-destructive'>Данная ссылка не действительна</div>;
  }
  return <InfoError error={error} />;
}
