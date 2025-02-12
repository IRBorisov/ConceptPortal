import { useAuthSuspense } from '@/features/auth';

import { IconLogin, IconUser2 } from '@/components/Icons';
import { usePreferencesStore } from '@/stores/preferences';

import NavigationButton from './NavigationButton';

interface UserButtonProps {
  onLogin: () => void;
  onClickUser: () => void;
}

function UserButton({ onLogin, onClickUser }: UserButtonProps) {
  const { user, isAnonymous } = useAuthSuspense();
  const adminMode = usePreferencesStore(state => state.adminMode);
  if (isAnonymous) {
    return (
      <NavigationButton
        className='cc-fade-in'
        title='Перейти на страницу логина'
        icon={<IconLogin size='1.5rem' className='icon-primary' />}
        onClick={onLogin}
      />
    );
  } else {
    return (
      <NavigationButton
        className='cc-fade-in'
        icon={<IconUser2 size='1.5rem' className={adminMode && user.is_staff ? 'icon-primary' : ''} />}
        onClick={onClickUser}
      />
    );
  }
}

export default UserButton;
