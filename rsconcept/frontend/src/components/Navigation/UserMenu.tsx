import { InDoorIcon, UserIcon } from '@/components/Icons';
import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NagivationContext';
import useDropdown from '@/hooks/useDropdown';

import NavigationButton from './NavigationButton';
import UserDropdown from './UserDropdown';

function UserMenu() {
  const router = useConceptNavigation();
  const { user } = useAuth();
  const menu = useDropdown();

  const navigateLogin = () => router.push('/login');
  return (
  <div ref={menu.ref} className='h-full'>
    <div className='flex items-center justify-end h-full w-fit'>
    {!user ?
    <NavigationButton
      description='Перейти на страницу логина'
      icon={<InDoorIcon />}
      onClick={navigateLogin}
    /> : null}
    {user ?
    <NavigationButton
      description={`Пользователь ${user?.username}`}
      icon={<UserIcon />}
      onClick={menu.toggle}
    /> : null}
    </div>
    {(user && menu.isActive) ?
    <UserDropdown
      hideDropdown={() => menu.hide()}
    /> : null}
  </div>);
}

export default UserMenu;
