import { useLayoutEffect, useState } from 'react';
import { toast } from 'react-toastify';

import TextInput from '../../components/Common/TextInput';
import { useUserProfile } from '../../hooks/useUserProfile';
import { IUserUpdateData } from '../../utils/models';


export function UserProfile() {
  const { updateUser, user} = useUserProfile();
  
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
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data: IUserUpdateData = {
      username: username,
      email: email,
      first_name: first_name,
      last_name: last_name,
    };
    updateUser(data, () => toast.success('Изменения сохранены'));
  };

  // console.log(user)
  return (
    <form onSubmit={handleSubmit} className='flex-grow max-w-xl px-4 py-2 border min-w-fit'>
    <div className='flex flex-col items-center justify-center px-2 py-2 border'>
        <TextInput id='username' label="Логин:" value={username} onChange={event => { setUsername(event.target.value); }}/>
        <TextInput id='first_name' label="Имя:" value={first_name} onChange={event => { setFirstName(event.target.value); }}/>
        <TextInput id='last_name' label="Фамилия:" value={last_name} onChange={event => { setLastName(event.target.value); }}/>
        <TextInput id='email' label="Электронная почта:" value={email} onChange={event => { setEmail(event.target.value); }}/>
        <div className='flex items-center justify-between my-4'>
          <button className='px-2 py-1 bg-green-500 border' type='submit'>Сохранить</button>
        </div>
         
    </div>
    </form>    
  )}