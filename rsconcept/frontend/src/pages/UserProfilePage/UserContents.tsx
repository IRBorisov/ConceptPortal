'use client';

import DataLoader from '@/components/wrap/DataLoader';
import { useUserProfile } from '@/context/UserProfileContext';

import EditorPassword from './EditorPassword';
import EditorProfile from './EditorProfile';

function UserContents() {
  const { user, error, loading } = useUserProfile();

  return (
    <DataLoader isLoading={loading} error={error} hasNoData={!user}>
      <div className='cc-fade-in flex gap-6 py-2 mx-auto w-fit'>
        <h1 className='mb-4 select-none'>Учетные данные пользователя</h1>
        <div className='flex py-2'>
          <EditorProfile />
          <EditorPassword />
        </div>
      </div>
    </DataLoader>
  );
}

export default UserContents;
