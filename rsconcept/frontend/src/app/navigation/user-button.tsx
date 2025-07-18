import { useAuthSuspense } from '@/features/auth';

import { IconLogin, IconUser2 } from '@/components/icons';
import { usePreferencesStore } from '@/stores/preferences';
import { globalIDs } from '@/utils/constants';

import { NavigationButton } from './navigation-button';

interface UserButtonProps {
  onLogin: () => void;
  onClickUser: () => void;
  isOpen: boolean;
}

export function UserButton({ onLogin, onClickUser, isOpen }: UserButtonProps) {
  const { user, isAnonymous } = useAuthSuspense();
  const adminMode = usePreferencesStore(state => state.adminMode);
  if (isAnonymous) {
    return (
      <NavigationButton
        title='Перейти на страницу логина'
        icon={<IconLogin size='1.5rem' className='icon-primary' />}
        onClick={onLogin}
      />
    );
  } else {
    return (
      <NavigationButton
        title='Пользователь'
        hideTitle={isOpen}
        aria-haspopup='true'
        aria-expanded={isOpen}
        aria-controls={globalIDs.user_dropdown}
        icon={<IconUser2 size='1.5rem' className={adminMode && user.is_staff ? 'icon-primary' : ''} />}
        onClick={onClickUser}
      />
    );
  }
}
