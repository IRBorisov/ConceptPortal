'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';

import { urls, useConceptNavigation } from '@/app';

import { isAxiosError } from '@/backend/apiTransport';
import { SubmitButton } from '@/components/Control';
import { type ErrorData, InfoError } from '@/components/InfoError';
import { TextInput } from '@/components/Input';
import { Loader } from '@/components/Loader';
import { useQueryStrings } from '@/hooks/useQueryStrings';

import { useResetPassword } from '../backend/useResetPassword';

export function Component() {
  const router = useConceptNavigation();
  const token = useQueryStrings().get('token') ?? '';

  const { validateToken, resetPassword, isPending, error: serverError } = useResetPassword();

  const [isTokenValidating, setIsTokenValidating] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordRepeat, setNewPasswordRepeat] = useState('');

  const passwordColor =
    !!newPassword && !!newPasswordRepeat && newPassword !== newPasswordRepeat ? 'bg-warn-100' : 'clr-input';

  const canSubmit = !!newPassword && !!newPasswordRepeat && newPassword === newPasswordRepeat;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isPending) {
      void resetPassword({
        password: newPassword,
        token: token
      }).then(() => {
        router.replace(urls.home);
        router.push(urls.login);
      });
    }
  }

  useEffect(() => {
    if (!isTokenValidating && !isPending) {
      void validateToken({ token: token });
      setIsTokenValidating(true);
    }
  }, [token, validateToken, isTokenValidating, isPending]);

  if (isPending) {
    return <Loader />;
  }

  return (
    <form className={clsx('cc-fade-in cc-column', 'w-[24rem] mx-auto', 'px-6 mt-3')} onSubmit={handleSubmit}>
      <TextInput
        id='new_password'
        type='password'
        label='Новый пароль'
        autoComplete='new-password'
        allowEnter
        colors={passwordColor}
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
        colors={passwordColor}
        value={newPasswordRepeat}
        onChange={event => {
          setNewPasswordRepeat(event.target.value);
        }}
      />

      <SubmitButton
        text='Установить пароль'
        className='self-center w-[12rem] mt-3'
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
    return <div className='mx-auto mt-6 text-sm select-text text-warn-600'>Данная ссылка не действительна</div>;
  }
  return <InfoError error={error} />;
}
