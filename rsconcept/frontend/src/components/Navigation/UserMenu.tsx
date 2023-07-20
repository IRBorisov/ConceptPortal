import { UserIcon } from '../Icons';
import { useAuth } from '../../context/AuthContext';
import UserDropdown from './UserDropdown';
import NavigationButton from './NavigationButton';
import { Link } from 'react-router-dom';
import useDropdown from '../../hooks/useDropdown';

function LoginRef() {
  return (
    <Link to='login' className='inline-block text-sm font-bold hover:underline'>
      Войти...
    </Link>
  );
}

function UserMenu() {
  const {user} = useAuth();
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
        hideDropdown={() => menu.hide()}
      />}
    </div>
  );
}

export default UserMenu;