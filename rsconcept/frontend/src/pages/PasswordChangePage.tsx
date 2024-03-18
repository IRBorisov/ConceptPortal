'use client';

import axios from 'axios';
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';

import DataLoader from '@/components/DataLoader';
import InfoError, { ErrorData } from '@/components/InfoError';
import SubmitButton from '@/components/ui/SubmitButton';
import TextInput from '@/components/ui/TextInput';
import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import useQueryStrings from '@/hooks/useQueryStrings';
import { IPasswordTokenData, IResetPasswordData } from '@/models/library';
import { classnames } from '@/utils/constants';

function ProcessError({ error }: { error: ErrorData }): React.ReactElement {
  if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
    return <div className='mt-6 text-sm select-text clr-text-red'>Данная ссылка не действительна</div>;
  } else {
    return <InfoError error={error} />;
  }
}

function PasswordChangePage() {
  const router = useConceptNavigation();
  const token = useQueryStrings().get('token');

  const { validateToken, resetPassword, loading, error, setError } = useAuth();

  const [isTokenValid, setIsTokenValid] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordRepeat, setNewPasswordRepeat] = useState('');

  const passwordColor = useMemo(() => {
    if (!!newPassword && !!newPasswordRepeat && newPassword !== newPasswordRepeat) {
      return 'clr-warning';
    } else {
      return 'clr-input';
    }
  }, [newPassword, newPasswordRepeat]);

  const canSubmit = useMemo(() => {
    return !!newPassword && !!newPasswordRepeat && newPassword === newPasswordRepeat;
  }, [newPassword, newPasswordRepeat]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loading) {
      const data: IResetPasswordData = {
        password: newPassword,
        token: token!
      };
      resetPassword(data, () => {
        router.replace('/');
        router.push('/login');
      });
    }
  }

  useEffect(() => {
    setError(undefined);
  }, [newPassword, newPasswordRepeat, setError]);

  useEffect(() => {
    const data: IPasswordTokenData = {
      token: token ?? ''
    };
    validateToken(data, () => setIsTokenValid(true));
  }, [token, validateToken]);

  if (error) {
    return <ProcessError error={error} />;
  }
  return (
    <DataLoader
      id='password-change-page' //
      isLoading={loading}
      hasNoData={!isTokenValid}
    >
      <form className={clsx('w-[24rem]', 'px-6 mt-3', classnames.flex_col)} onSubmit={handleSubmit}>
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
          loading={loading}
          disabled={!canSubmit}
        />
        {error ? <ProcessError error={error} /> : null}
      </form>
    </DataLoader>
  );
}

export default PasswordChangePage;
