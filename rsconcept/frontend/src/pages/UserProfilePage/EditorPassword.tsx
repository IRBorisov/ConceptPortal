'use client';

import axios from 'axios';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { urls } from '@/app/urls';
import InfoError, { ErrorData } from '@/components/info/InfoError';
import FlexColumn from '@/components/ui/FlexColumn';
import SubmitButton from '@/components/ui/SubmitButton';
import TextInput from '@/components/ui/TextInput';
import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { IUserUpdatePassword } from '@/models/user';
import { errors, information } from '@/utils/labels';

function EditorPassword() {
  const router = useConceptNavigation();
  const { updatePassword, error, setError, loading } = useAuth();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordRepeat, setNewPasswordRepeat] = useState('');

  const passwordColor =
    !!newPassword && !!newPasswordRepeat && newPassword !== newPasswordRepeat ? 'bg-warn-100' : 'clr-input';

  const canSubmit = !!oldPassword && !!newPassword && !!newPasswordRepeat && newPassword === newPasswordRepeat;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword !== newPasswordRepeat) {
      toast.error(errors.passwordsMismatch);
      return;
    }
    const data: IUserUpdatePassword = {
      old_password: oldPassword,
      new_password: newPassword
    };
    updatePassword(data, () => {
      toast.success(information.changesSaved);
      router.push(urls.login);
    });
  }

  useEffect(() => {
    setError(undefined);
  }, [newPassword, oldPassword, newPasswordRepeat, setError]);

  return (
    <form
      className={clsx('max-w-[14rem]', 'px-6 py-2 flex flex-col justify-between', 'border-l-2')}
      onSubmit={handleSubmit}
    >
      <FlexColumn>
        <TextInput
          id='old_password'
          type='password'
          label='Старый пароль'
          autoComplete='current-password'
          allowEnter
          value={oldPassword}
          onChange={event => setOldPassword(event.target.value)}
        />
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
        {error ? <ProcessError error={error} /> : null}
      </FlexColumn>
      <SubmitButton text='Сменить пароль' className='self-center' disabled={!canSubmit} loading={loading} />
    </form>
  );
}

export default EditorPassword;

// ====== Internals =========
function ProcessError({ error }: { error: ErrorData }): React.ReactElement {
  if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
    return <div className='text-sm select-text text-warn-600'>Неверно введен старый пароль</div>;
  } else {
    return <InfoError error={error} />;
  }
}
