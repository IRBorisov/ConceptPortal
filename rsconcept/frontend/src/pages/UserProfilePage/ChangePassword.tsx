import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import TextInput from '../../components/Common/TextInput';
import { useUserProfile } from '../../context/UserProfileContext';
import { IUserUpdatePassword } from '../../utils/models';


export function ChangePassword() {
  const { updatePassword, processing } = useUserProfile();
    
  const [old_password, setOldPassword] = useState('');
  const [new_password, setNewPassword] = useState('');
  const [new_password_repeat, setNewPasswordRepeat] = useState('');
  const [password_equal, setPasswordEqual] = useState(true);
  const navigate = useNavigate();

  const input_class: string = `flex-grow max-w-xl px-3 py-2 border center min-w-full  ${password_equal ? "" : "text-red-500"}`
  
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (new_password !== new_password_repeat) {
      setPasswordEqual(false);
      toast.error('Пароли не совпадают');
    }
    else {
    const data: IUserUpdatePassword = {
      old_password: old_password,
      new_password: new_password,
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
          value={old_password}
          onChange={event => (setOldPassword(event.target.value))}
        />
        <TextInput id='new_password'
          className={input_class}
          label="Введите новый пароль:"
          value={new_password}
          onChange={event => (setNewPassword(event.target.value), setPasswordEqual(true))}
        />
        <TextInput id='new_password'
          className={input_class}
          label="Повторите новый пароль:"
          value={new_password_repeat}
          onChange={event => (setNewPasswordRepeat(event.target.value), setPasswordEqual(true))}
        />
        <div className='relative flex justify-center my-4 border'>
          <button 
            type='submit' 
            className='absolute bottom-0 px-2 py-1 bg-blue-500 border'
            disabled={processing}>
              <span>Сменить пароль</span>
          </button>
        </div>
         
    </form>   
    </div>  
  )}