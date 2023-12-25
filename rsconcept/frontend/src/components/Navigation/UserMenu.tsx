import { FaCircleUser } from 'react-icons/fa6';

import { InDoorIcon } from '@/components/Icons';
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
    {!user ?
    <NavigationButton
      title='Перейти на страницу логина'
      icon={<InDoorIcon size='1.5rem' className='clr-text-primary' />}
      onClick={navigateLogin}
    /> : null}
    {user ?
    <NavigationButton
      icon={<FaCircleUser size='1.5rem' />}
      onClick={menu.toggle}
    /> : null}
    <UserDropdown
      isOpen={!!user && menu.isOpen}
      hideDropdown={() => menu.hide()}
    />
  </div>);
}

export default UserMenu;