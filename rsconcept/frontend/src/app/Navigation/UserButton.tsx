import { useAuthSuspense } from '@/features/auth';

import { IconLogin, IconUser2 } from '@/components/Icons';
import { usePreferencesStore } from '@/stores/preferences';
import { globalIDs } from '@/utils/constants';

import { NavigationButton } from './NavigationButton';

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
