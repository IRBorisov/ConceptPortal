import { useAuth } from '../../context/AuthContext';
import { useConceptNavigation } from '../../context/NagivationContext';
import useDropdown from '../../hooks/useDropdown';
import { InDoor, UserIcon } from '../Icons';
import NavigationButton from './NavigationButton';
import UserDropdown from './UserDropdown';

function UserMenu() {
  const { navigateTo } = useConceptNavigation();
  const { user } = useAuth();
  const menu = useDropdown();

  const navigateLogin = () => navigateTo('/login');
  return (
    <div ref={menu.ref} className='h-full'>
      <div className='flex items-center justify-end h-full w-fit'>
      { !user && 
      <NavigationButton
        text='Войти...'
        description='Перейти на страницу логина'
        icon={<InDoor />}
        onClick={navigateLogin}
      />}
      { user &&
      <NavigationButton
        icon={<UserIcon />}
        description={`Пользователь ${user?.username}`}
        onClick={menu.toggle}
      />}
      </div>
      { user && menu.isActive &&
      <UserDropdown
        hideDropdown={() => menu.hide()}
      />}
    </div>
  );
}

export default UserMenu;
