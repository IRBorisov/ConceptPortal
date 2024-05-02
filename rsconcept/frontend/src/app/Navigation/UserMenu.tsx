import { AnimatePresence } from 'framer-motion';

import { IconLogin, IconUser2 } from '@/components/Icons';
import Loader from '@/components/ui/Loader';
import AnimateFade from '@/components/wrap/AnimateFade';
import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { useConceptOptions } from '@/context/OptionsContext';
import useDropdown from '@/hooks/useDropdown';

import { urls } from '../urls';
import NavigationButton from './NavigationButton';
import UserDropdown from './UserDropdown';

function UserMenu() {
  const router = useConceptNavigation();
  const { user, loading } = useAuth();
  const { adminMode } = useConceptOptions();
  const menu = useDropdown();

  const navigateLogin = () => router.push(urls.login);
  return (
    <div ref={menu.ref} className='h-full w-[4rem] flex items-center justify-center'>
      <AnimatePresence mode='wait'>
        {loading ? (
          <AnimateFade key='nav_user_badge_loader'>
            <Loader circular size={3} />
          </AnimateFade>
        ) : null}
        {!user && !loading ? (
          <AnimateFade key='nav_user_badge_login' className='h-full'>
            <NavigationButton
              title='Перейти на страницу логина'
              icon={<IconLogin size='1.5rem' className='icon-primary' />}
              onClick={navigateLogin}
            />
          </AnimateFade>
        ) : null}
        {user ? (
          <AnimateFade key='nav_user_badge_profile' className='h-full'>
            <NavigationButton
              icon={<IconUser2 size='1.5rem' className={adminMode && user.is_staff ? 'icon-primary' : ''} />}
              onClick={menu.toggle}
            />
          </AnimateFade>
        ) : null}
      </AnimatePresence>
      <UserDropdown isOpen={!!user && menu.isOpen} hideDropdown={() => menu.hide()} />
    </div>
  );
}

export default UserMenu;
