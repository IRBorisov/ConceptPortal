import RequireAuth from '@/components/RequireAuth';

import EditorPassword from './EditorPassword';
import EditorProfile from './EditorProfile';

function UserProfilePage() {
  return (
    <RequireAuth>
      <div className='cc-fade-in flex flex-col py-2 mx-auto w-fit'>
        <h1 className='mb-2 select-none'>Учетные данные пользователя</h1>
        <div className='flex py-2'>
          <EditorProfile />
          <EditorPassword />
        </div>
      </div>
    </RequireAuth>
  );
}

export default UserProfilePage;
