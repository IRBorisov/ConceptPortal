'use client';

import { useTx } from '@/i18n';

import { RequireAuth } from '@/features/auth/components/require-auth';

import { EditorPassword } from './editor-password';
import { EditorProfile } from './editor-profile';

export function UserProfilePage() {
  const tx = useTx();
  return (
    <RequireAuth>
      <div className='flex flex-col py-2 mx-auto w-fit'>
        <h1 className='mb-2 select-none'>{tx('ui.users.profile.title')}</h1>
        <div className='flex py-2'>
          <EditorProfile />
          <EditorPassword />
        </div>
      </div>
    </RequireAuth>
  );
}
