import { IconLogin, IconUser2 } from '@/components/Icons';
import Loader from '@/components/ui/Loader';
import { useAuth } from '@/context/AuthContext';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { useConceptNavigation } from '@/context/NavigationContext';
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
      {loading ? <Loader circular scale={1.5} /> : null}
      {!user && !loading ? (
        <NavigationButton
          className='cc-fade-in'
          title='Перейти на страницу логина'
          icon={<IconLogin size='1.5rem' className='icon-primary' />}
          onClick={navigateLogin}
        />
      ) : null}
      {user ? (
        <NavigationButton
          className='cc-fade-in'
          icon={<IconUser2 size='1.5rem' className={adminMode && user.is_staff ? 'icon-primary' : ''} />}
          onClick={menu.toggle}
        />
      ) : null}
      <UserDropdown isOpen={!!user && menu.isOpen} hideDropdown={() => menu.hide()} />
    </div>
  );
}

export default UserMenu;
