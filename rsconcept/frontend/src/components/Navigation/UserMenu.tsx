import { Link } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import useDropdown from '../../hooks/useDropdown';
import { UserIcon } from '../Icons';
import NavigationButton from './NavigationButton';
import UserDropdown from './UserDropdown';

function LoginRef() {
  return (
    <Link to='login' className='inline-block text-sm font-bold hover:underline'>
      Войти...
    </Link>
  );
}

function UserMenu() {
  const { user } = useAuth();
  const menu = useDropdown();
  return (
    <div ref={menu.ref}>
      { !user && <LoginRef />}
      { user &&
      <NavigationButton
        icon={<UserIcon />}
        description={`Пользователь ${user?.username}`}
        onClick={menu.toggle}
      />}
      { user && menu.isActive &&
      <UserDropdown
        hideDropdown={() => { menu.hide(); }}
      />}
    </div>
  );
}

export default UserMenu;
