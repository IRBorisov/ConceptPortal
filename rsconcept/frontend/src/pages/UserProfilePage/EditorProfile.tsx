'use client';

import { useLayoutEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import SubmitButton from '@/components/Common/SubmitButton';
import TextInput from '@/components/Common/TextInput';
import { useBlockNavigation } from '@/context/NagivationContext';
import { useUserProfile } from '@/context/UserProfileContext';
import { IUserUpdateData } from '@/models/library';

function EditorProfile() {
  const { updateUser, user, processing } = useUserProfile();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');

  const isModified: boolean = useMemo(
  () => {
    if (!user) {
      return false;
    }
    return (
      user.email !== email ||
      user.first_name !== first_name ||
      user.last_name !== last_name
    );
  }, [user, email, first_name, last_name]);
  useBlockNavigation(isModified);

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
  <form
    onSubmit={handleSubmit}
    className='px-6 py-2 flex flex-col gap-3 min-w-[18rem]'
  >
    <TextInput id='username' disabled
      label='Логин'
      tooltip='Логин изменить нельзя'
      value={username}
    />
    <TextInput id='first_name' allowEnter
      label='Имя'
      value={first_name}
      onChange={event => setFirstName(event.target.value)}
    />
    <TextInput id='last_name' allowEnter
      label='Фамилия'
      value={last_name}
      onChange={event => setLastName(event.target.value)}
    />
    <TextInput id='email' allowEnter
      label='Электронная почта'
      value={email}
      onChange={event => setEmail(event.target.value)}
    /> 
    <SubmitButton
      className='self-center mt-6'
      text='Сохранить данные'
      loading={processing}
      disabled={!isModified}
    /> 
  </form>);
}

export default EditorProfile;