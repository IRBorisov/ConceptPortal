import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NavigationTextItem from './NavigationTextItem';
import { useTheme } from '../../context/ThemeContext';

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
    <div className='relative'>
      <div className='absolute right-0 z-10 flex flex-col items-stretch justify-start p-2 mt-4 text-sm origin-top-right bg-white border border-gray-100 divide-y rounded-md shadow-lg dark:border-gray-500 dark:bg-gray-900 w-36'>
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
      </div>
    </div>
  );
}

export default UserDropdown;