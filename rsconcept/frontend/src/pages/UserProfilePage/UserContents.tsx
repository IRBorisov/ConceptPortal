'use client';

import AnimateFade from '@/components/wrap/AnimateFade';
import DataLoader from '@/components/wrap/DataLoader';
import { useUserProfile } from '@/context/UserProfileContext';

import EditorPassword from './EditorPassword';
import EditorProfile from './EditorProfile';

function UserContents() {
  const { user, error, loading } = useUserProfile();

  return (
    <DataLoader
      id='profile-page' // prettier: split lines
      isLoading={loading}
      error={error}
      hasNoData={!user}
    >
      <AnimateFade className='flex gap-6 py-2 mx-auto w-fit'>
        <div className='w-fit'>
          <h1 className='mb-4 select-none'>Учетные данные пользователя</h1>
          <div className='flex py-2'>
            <EditorProfile />
            <EditorPassword />
          </div>
        </div>
      </AnimateFade>
    </DataLoader>
  );
}

export default UserContents;
