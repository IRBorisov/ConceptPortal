import BackendError from '../../components/BackendError';
import { Loader } from '../../components/Common/Loader';
import { useUserProfile } from '../../hooks/useUserProfile';
import { UserProfile } from './UserProfile';

function UserProfilePage() {
  const { user, error, loading } = useUserProfile();

  return (
    <div className='w-full'>
      { loading && <Loader /> }
      { error && <BackendError error={error} />}
      { user && <UserProfile /> }
    </div>
  );
}

export default UserProfilePage;
