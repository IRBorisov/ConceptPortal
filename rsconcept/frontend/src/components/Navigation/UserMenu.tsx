import { Link } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import useDropdown from '../../hooks/useDropdown';
import { UserIcon } from '../Icons';
import NavigationButton from './NavigationButton';
import UserDropdown from './UserDropdown';

function LoginRef() {
  return (
    <Link to='login' className='inline-block h-full px-1 py-2 font-semibold rounded-lg hover:underline clr-btn-nav text-primary'>
      Войти...
    </Link>
  );
}

function UserMenu() {
  const { user } = useAuth();
  const menu = useDropdown();
  return (
    <div ref={menu.ref}>
      <div className='w-[4.2rem] flex justify-end'>
      { !user && <LoginRef />}
      { user &&
      <NavigationButton
        icon={<UserIcon />}
        description={`Пользователь ${user?.username}`}
        onClick={menu.toggle}
      />}
      </div>
      { user && menu.isActive &&
      <UserDropdown
        hideDropdown={() => { menu.hide(); }}
      />}
    </div>
  );
}

export default UserMenu;
