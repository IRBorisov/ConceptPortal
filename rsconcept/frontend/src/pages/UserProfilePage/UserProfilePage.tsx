import RequireAuth from '@/components/wrap/RequireAuth';
import { UserProfileState } from '@/context/UserProfileContext';

import UserTabs from './UserTabs';

function UserProfilePage() {
  return (
    <RequireAuth>
      <UserProfileState>
        <UserTabs />
      </UserProfileState>
    </RequireAuth>
  );
}

export default UserProfilePage;
