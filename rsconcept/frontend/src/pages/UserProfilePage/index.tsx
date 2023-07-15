import BackendError from '../../components/BackendError';
import { Loader } from '../../components/Common/Loader';
import { useUserProfile } from '../../hooks/useUserProfile';
import { UserProfile } from './UserProfile';

function UserProfilePage() {
  const { user, error, loading } = useUserProfile();

  return (
    <div className='container'>
      { loading && <Loader /> }
      { error && <BackendError error={error} />}
      { user && <UserProfile profile={user} /> }
    </div>
  );
}

export default UserProfilePage;