import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NavigationTextItem from './NavigationTextItem';
import { useTheme } from '../../context/ThemeContext';
import Dropdown from '../Common/Dropdown';

interface UserDropdownProps {
  hideDropdown: Function
}

function UserDropdown({hideDropdown}: UserDropdownProps) {
  const {darkMode, toggleDarkMode} = useTheme();
  const navigate = useNavigate();
  const {user, logout} = useAuth();

  const navigateProfile = () => {
    hideDropdown()
    navigate('/profile');
  };

  const logoutAndRedirect = () => {
    hideDropdown()
    logout(() => {navigate('/login/');})
  };

  const navigateMyWork = () => {
    hideDropdown()
    navigate('/rsforms?filter=personal');
  };

  return (
    <Dropdown widthClass='w-36' stretchLeft >
      <NavigationTextItem description='Профиль пользователя'
        text={user?.username}
        onClick={navigateProfile}
      />
      <NavigationTextItem description='Переключение темы оформления'
        text={darkMode ? 'Светлая тема' : 'Темная тема'} 
        onClick={toggleDarkMode}
      />
      <NavigationTextItem text={'Мои схемы'} onClick={navigateMyWork} />
      <NavigationTextItem text={'Выйти...'} bold onClick={logoutAndRedirect} />
    </Dropdown>
  );
}

export default UserDropdown;