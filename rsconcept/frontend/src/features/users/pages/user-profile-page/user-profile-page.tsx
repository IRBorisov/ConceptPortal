import { RequireAuth } from '@/features/auth/components';

import { EditorPassword } from './editor-password';
import { EditorProfile } from './editor-profile';

export function UserProfilePage() {
  return (
    <RequireAuth>
      <div className='flex flex-col py-2 mx-auto w-fit'>
        <h1 className='mb-2 select-none'>Учетные данные пользователя</h1>
        <div className='flex py-2'>
          <EditorProfile />
          <EditorPassword />
        </div>
      </div>
    </RequireAuth>
  );
}
