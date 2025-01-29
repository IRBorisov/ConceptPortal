'use client';

import axios from 'axios';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { useConceptNavigation } from '@/app/Navigation/NavigationContext';
import { urls } from '@/app/urls';
import { IResetPasswordDTO } from '@/backend/auth/api';
import { useResetPassword } from '@/backend/auth/useResetPassword';
import InfoError, { ErrorData } from '@/components/info/InfoError';
import Loader from '@/components/ui/Loader';
import SubmitButton from '@/components/ui/SubmitButton';
import TextInput from '@/components/ui/TextInput';
import useQueryStrings from '@/hooks/useQueryStrings';

function PasswordChangePage() {
  const router = useConceptNavigation();
  const token = useQueryStrings().get('token');

  const { validateToken, resetPassword, isPending, error, reset } = useResetPassword();

  const [isTokenValid, setIsTokenValid] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordRepeat, setNewPasswordRepeat] = useState('');

  const passwordColor =
    !!newPassword && !!newPasswordRepeat && newPassword !== newPasswordRepeat ? 'bg-warn-100' : 'clr-input';

  const canSubmit = !!newPassword && !!newPasswordRepeat && newPassword === newPasswordRepeat;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isPending) {
      const data: IResetPasswordDTO = {
        password: newPassword,
        token: token!
      };
      resetPassword(data, () => {
        router.replace(urls.home);
        router.push(urls.login);
      });
    }
  }

  useEffect(() => {
    reset();
  }, [newPassword, newPasswordRepeat, reset]);

  useEffect(() => {
    validateToken({ token: token ?? '' }, () => setIsTokenValid(true));
  }, [token, validateToken]);

  if (error) {
    return <ProcessError error={error} />;
  }

  if (isPending || !isTokenValid) {
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
    </form>
  );
}

export default PasswordChangePage;

// ====== Internals =========
function ProcessError({ error }: { error: ErrorData }): React.ReactElement {
  if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
    return <div className='mx-auto mt-6 text-sm select-text text-warn-600'>Данная ссылка не действительна</div>;
  } else {
    return <InfoError error={error} />;
  }
}
