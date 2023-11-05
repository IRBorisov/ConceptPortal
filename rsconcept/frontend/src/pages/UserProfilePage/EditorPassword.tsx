import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import BackendError, { ErrorInfo } from '../../components/BackendError';
import SubmitButton from '../../components/Common/SubmitButton';
import TextInput from '../../components/Common/TextInput';
import { useAuth } from '../../context/AuthContext';
import { useConceptNavigation } from '../../context/NagivationContext';
import { IUserUpdatePassword } from '../../models/library';

function ProcessError({error}: {error: ErrorInfo}): React.ReactElement {
  if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
    return (
      <div className='text-sm select-text text-warning'>
        Неверно введен старый пароль
      </div>
    );
  } else {
    return (<BackendError error={error} />);
  }
}

function EditorPassword() {
  const { navigateTo } = useConceptNavigation();
  const { updatePassword, error, setError, loading } = useAuth();
    
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordRepeat, setNewPasswordRepeat] = useState('');

  const passwordColor = useMemo(
  () => {
    return !!newPassword && !!newPasswordRepeat && newPassword !== newPasswordRepeat ? 'clr-warning' : 'clr-input';
  }, [newPassword, newPasswordRepeat]);

  const canSubmit = useMemo(
    () => {
      return !!oldPassword && !!newPassword && !!newPasswordRepeat && newPassword === newPasswordRepeat;
    }, [newPassword, newPasswordRepeat, oldPassword]);
  
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword !== newPasswordRepeat) {
      toast.error('Пароли не совпадают');
      return;
    }
    const data: IUserUpdatePassword = {
      old_password: oldPassword,
      new_password: newPassword,
    };
    updatePassword(data, () => {
      toast.success('Изменения сохранены');
      navigateTo('/login');
    });
  }

  useEffect(() => {
    setError(undefined);
  }, [newPassword, oldPassword, newPasswordRepeat, setError]);

  return (
    <div className='flex py-2 border-l-2 max-w-[14rem]'>
      <form onSubmit={handleSubmit} className='flex flex-col justify-between px-6'>
        <div className='flex flex-col gap-3'>
          <TextInput id='old_password'
            type='password' 
            label='Старый пароль'
            value={oldPassword}
            onChange={event => setOldPassword(event.target.value)}
          />
          <TextInput id='new_password' type='password' 
            colors={passwordColor}
            label='Новый пароль'
            value={newPassword}
            onChange={event => {
              setNewPassword(event.target.value); 
            }}
          />
          <TextInput id='new_password_repeat' type='password' 
            colors={passwordColor}
            label='Повторите новый'
            value={newPasswordRepeat}
            onChange={event => {
              setNewPasswordRepeat(event.target.value); 
            }}
          />          
        </div>
        { error && <ProcessError error={error} />}
        <div className='flex justify-center w-full'>
          <SubmitButton
            disabled={!canSubmit}
            loading={loading}
            text='Сменить пароль'
          />
        </div>
      </form>
    </div>   
  )
}

export default EditorPassword;
