'use client';

import { useTx } from '@/i18n/use-tx';

import { useAuth } from '@/features/auth';

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
  const tx = useTx();
  const { user, isAnonymous } = useAuth();
  const adminMode = usePreferencesStore(state => state.adminMode);
  if (isAnonymous) {
    return (
      <NavigationButton
        title={tx('nav.user.loginTitle', 'Go to login page')}
        icon={<IconLogin size='1.25rem' className='icon-primary' />}
        onClick={onLogin}
      />
    );
  } else {
    return (
      <NavigationButton
        title={tx('nav.user.menuTitle', 'User account')}
        hideTitle={isOpen}
        aria-haspopup='true'
        aria-expanded={isOpen}
        aria-controls={globalIDs.user_dropdown}
        icon={<IconUser2 size='1.25rem' className={adminMode && user.is_staff ? 'icon-primary' : ''} />}
        onClick={onClickUser}
      />
    );
  }
}
