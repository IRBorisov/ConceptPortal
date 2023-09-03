import { useLayoutEffect, useState } from 'react';
import { toast } from 'react-toastify';

import SubmitButton from '../../components/Common/SubmitButton';
import TextInput from '../../components/Common/TextInput';
import { useUserProfile } from '../../context/UserProfileContext';
import useModificationPrompt from '../../hooks/useModificationPrompt';
import { IUserUpdateData } from '../../utils/models';

function EditorProfile() {
  const { updateUser, user, processing } = useUserProfile();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');

  const { isModified, setIsModified } = useModificationPrompt();

  useLayoutEffect(() => {
    if (!user) {
      setIsModified(false);
      return;
    }
    setIsModified(
      user.email !== email ||
      user.first_name !== first_name ||
      user.last_name !== last_name
    );
  }, [user, user?.email, user?.first_name, user?.last_name, email, first_name, last_name, setIsModified]);

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
    <div className='flex py-2'>
      <form onSubmit={handleSubmit} className='px-6 min-w-[18rem]'>
        <div>
          <TextInput id='username' 
            label='Логин'
            tooltip='Логин изменить нельзя'
            disabled={true}
            value={username}
            onChange={event => setUsername(event.target.value)}
          />
          <TextInput id='first_name'
            label='Имя'
            value={first_name}
            onChange={event => setFirstName(event.target.value)}
          />
          <TextInput id='last_name' label='Фамилия' value={last_name} onChange={event => setLastName(event.target.value)}/>
          <TextInput id='email' label='Электронная почта' value={email} onChange={event => setEmail(event.target.value)}/>
        </div>  
        <div className='flex justify-center w-full mt-10'>
          <SubmitButton
            text='Сохранить данные'
            loading={processing}
            disabled={!isModified}
          />
        </div>  
      </form>   
    </div>
  )
}

  export default EditorProfile;
  