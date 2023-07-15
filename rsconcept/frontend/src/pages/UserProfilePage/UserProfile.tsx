import { IUserProfile } from '../../models';

interface UserProfileProps {
  profile: IUserProfile
}

export function UserProfile({profile}: UserProfileProps) {
    return (
        <div className='flex justify-center'>
            <p>username: {profile.username}</p>
            <p>email: {profile.email}</p>
        </div>
    );
}
