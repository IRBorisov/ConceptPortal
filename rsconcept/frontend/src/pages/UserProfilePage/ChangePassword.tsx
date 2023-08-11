import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import BackendError from '../../components/BackendError';
import TextInput from '../../components/Common/TextInput';
import { useAuth } from '../../context/AuthContext';
import { IUserUpdatePassword } from '../../utils/models';


export function ChangePassword() {
  const { updatePassword, error, loading } = useAuth();
    
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordRepeat, setNewPasswordRepeat] = useState('');
  const navigate = useNavigate();

  const colorClass = useMemo(() => {
    return !!newPassword && !!newPasswordRepeat && newPassword !== newPasswordRepeat ? 'bg-red-500' : '';
  }, [newPassword, newPasswordRepeat]);
  
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword !== newPasswordRepeat) {
      toast.error('Пароли не совпадают');
    }
    else {
    const data: IUserUpdatePassword = {
      old_password: oldPassword,
      new_password: newPassword,
    };
    updatePassword(data, () => {toast.success('Изменения сохранены'); navigate('/login')});
   }
  }

  return (
    <div className='flex-grow max-w-sm px-4'>
    <form onSubmit={handleSubmit} className='flex-grow min-h-full px-6 py-2 border min-w-fit bg-slate-200'>
        <TextInput id='old_password'
          type='password' 
          label='Введите старый пароль:'
          value={oldPassword}
          onChange={event => setOldPassword(event.target.value)}
        />
        <TextInput id='new_password'
          colorClass={colorClass}
          label="Введите новый пароль:"
          value={newPassword}
          onChange={event => {
            setNewPassword(event.target.value); 
          }}
        />
        <TextInput id='new_password_repeat'
          colorClass={colorClass}
          label="Повторите новый пароль:"
          value={newPasswordRepeat}
          onChange={event => {
            setNewPasswordRepeat(event.target.value); 
          }}
        />
        <div className='relative flex justify-center my-4 border'>
          <button 
            type='submit' 
            className='absolute bottom-0 px-2 py-1 bg-blue-500 border'
            disabled={loading}>
              <span>Сменить пароль</span>
          </button>
        </div>
        { error && <BackendError error={error} />}
    </form>   
    </div>  
  )}
