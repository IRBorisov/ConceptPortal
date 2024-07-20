import RequireAuth from '@/components/wrap/RequireAuth';
import { UserProfileState } from '@/context/UserProfileContext';

import UserContents from './UserContents';

function UserProfilePage() {
  return (
    <RequireAuth>
      <UserProfileState>
        <UserContents />
      </UserProfileState>
    </RequireAuth>
  );
}

export default UserProfilePage;
