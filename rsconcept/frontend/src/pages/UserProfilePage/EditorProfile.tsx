'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';

import { useBlockNavigation } from '@/app/Navigation/NavigationContext';
import { IUpdateProfileDTO } from '@/backend/users/api';
import { useProfileSuspense } from '@/backend/users/useProfile';
import { useUpdateProfile } from '@/backend/users/useUpdateProfile';
import InfoError, { ErrorData } from '@/components/info/InfoError';
import SubmitButton from '@/components/ui/SubmitButton';
import TextInput from '@/components/ui/TextInput';

function EditorProfile() {
  const { profile } = useProfileSuspense();
  const { updateProfile, isPending, error } = useUpdateProfile();

  const [username, setUsername] = useState(profile.username);
  const [email, setEmail] = useState(profile.email);
  const [first_name, setFirstName] = useState(profile.first_name);
  const [last_name, setLastName] = useState(profile.last_name);

  const isModified = profile.email !== email || profile.first_name !== first_name || profile.last_name !== last_name;

  useBlockNavigation(isModified);

  useEffect(() => {
    setUsername(profile.username);
    setEmail(profile.email);
    setFirstName(profile.first_name);
    setLastName(profile.last_name);
  }, [profile]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data: IUpdateProfileDTO = {
      username: username,
      email: email,
      first_name: first_name,
      last_name: last_name
    };
    updateProfile(data);
  }

  return (
    <form onSubmit={handleSubmit} className='cc-column w-[18rem] px-6 py-2'>
      <TextInput
        id='username'
        autoComplete='username'
        disabled
        label='Логин'
        title='Логин изменить нельзя'
        value={username}
      />
      <TextInput
        id='first_name'
        autoComplete='off'
        allowEnter
        label='Имя'
        value={first_name}
        onChange={event => setFirstName(event.target.value)}
      />
      <TextInput
        id='last_name'
        autoComplete='off'
        allowEnter
        label='Фамилия'
        value={last_name}
        onChange={event => setLastName(event.target.value)}
      />
      <TextInput
        id='email'
        autoComplete='off'
        allowEnter
        label='Электронная почта'
        value={email}
        onChange={event => setEmail(event.target.value)}
      />
      {error ? <ProcessError error={error} /> : null}
      <SubmitButton
        className='self-center mt-6'
        text='Сохранить данные'
        loading={isPending}
        disabled={!isModified || email == ''}
      />
    </form>
  );
}

export default EditorProfile;

// ====== Internals =========
function ProcessError({ error }: { error: ErrorData }): React.ReactElement {
  if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
    if ('email' in error.response.data) {
      return (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        <div className='text-sm select-text text-warn-600'>{error.response.data.email}.</div>
      );
    }
  }
  return <InfoError error={error} />;
}
