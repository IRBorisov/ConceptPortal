import { UserIcon } from '../Icons';
import { useAuth } from '../../context/AuthContext';
import { useRef, useState } from 'react';
import UserDropdown from './UserDropdown';
import { useClickedOutside } from '../../hooks/useClickedOutside';
import NavigationButton from './NavigationButton';
import { Link } from 'react-router-dom';

function LoginRef() {
  return (
    <Link to='login' className='inline-block text-sm font-bold hover:underline'>
      Войти...
    </Link>
  );
}

function UserMenu() {
  const {user} = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const toggleUserDropdown = () => setShowUserDropdown(!showUserDropdown);
  const hideDropdown = () => setShowUserDropdown(false);
  useClickedOutside({ref: dropdownRef, callback: hideDropdown})

  return (
    <div ref={dropdownRef}>
      { !user && <LoginRef />}
      { user && 
      <NavigationButton
        icon={<UserIcon />}
        description={`Пользователь ${user?.username}`}
        onClick={toggleUserDropdown} 
      />}
      { user && showUserDropdown && <UserDropdown hideDropdown={hideDropdown} /> }
    </div>
  );
}

export default UserMenu;