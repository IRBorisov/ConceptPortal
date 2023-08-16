import { useLayoutEffect, useState } from 'react';
import { toast } from 'react-toastify';

import TextInput from '../../components/Common/TextInput';
import { useUserProfile } from '../../context/UserProfileContext';
import { IUserUpdateData } from '../../utils/models';
import { ChangePassword } from './ChangePassword';


export function UserProfile() {
  const { updateUser, user, processing } = useUserProfile();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');

  useLayoutEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setFirstName(user.first_name);
      setLastName(user.last_name);
    }
  }, [user]);
  
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data: IUserUpdateData = {
      username: username,
      email: email,
      first_name: first_name,
      last_name: last_name,
    };
    updateUser(data, () => toast.success('Изменения сохранены'));
  }

  return (
    <div className='flex justify-center'>
      <div className='place-self-center'>
        <h1 className='flex justify-center py-2'> Учетные данные пользователя </h1>
        <div className='flex justify-center px-6 py-2 max-w-fit'>
          <div className='flex max-w-sm px-4'>
            <form onSubmit={handleSubmit} className='px-6 min-w-fit'>
              <div>
                <TextInput id='username' 
                  label='Логин:'
                  value={username}
                  onChange={event => setUsername(event.target.value)}
                />
                <TextInput id='first_name'
                  label="Имя:"
                  value={first_name}
                  onChange={event => setFirstName(event.target.value)}
                />
                <TextInput id='last_name' label="Фамилия:" value={last_name} onChange={event => setLastName(event.target.value)}/>
                <TextInput id='email' label="Электронная почта:" value={email} onChange={event => setEmail(event.target.value)}/>
              </div>  
              <div className='flex justify-center px-0 py-4'>
                <button 
                  type='submit' 
                  className={`px-2 py-1 border clr-btn-green`}
                  
                  disabled={processing}>
                    <span>Сохранить мои данные</span>
                </button>
              </div>  
            </form>   
          </div>
          <ChangePassword /> 
        </div>   
      </div>
    </div>
  )}
