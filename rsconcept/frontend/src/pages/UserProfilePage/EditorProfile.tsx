'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import InfoError, { ErrorData } from '@/components/info/InfoError';
import SubmitButton from '@/components/ui/SubmitButton';
import TextInput from '@/components/ui/TextInput';
import { useBlockNavigation } from '@/context/NavigationContext';
import { useUserProfile } from '@/context/UserProfileContext';
import { IUserUpdateData } from '@/models/user';
import { information } from '@/utils/labels';

function EditorProfile() {
  const { updateUser, user, errorProcessing, processing } = useUserProfile();

  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [first_name, setFirstName] = useState(user?.first_name ?? '');
  const [last_name, setLastName] = useState(user?.last_name ?? '');

  const isModified =
    user != undefined && (user.email !== email || user.first_name !== first_name || user.last_name !== last_name);

  useBlockNavigation(isModified);

  useEffect(() => {
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
      last_name: last_name
    };
    updateUser(data, () => toast.success(information.changesSaved));
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
      {errorProcessing ? <ProcessError error={errorProcessing} /> : null}
      <SubmitButton
        className='self-center mt-6'
        text='Сохранить данные'
        loading={processing}
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
        <div className='text-sm select-text clr-text-red'>{error.response.data.email}.</div>
      );
    }
  }
  return <InfoError error={error} />;
}
