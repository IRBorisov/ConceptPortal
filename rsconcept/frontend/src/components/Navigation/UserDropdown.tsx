import Dropdown from '@/components/Common/Dropdown';
import DropdownButton from '@/components/Common/DropdownButton';
import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NagivationContext';
import { useConceptTheme } from '@/context/ThemeContext';

interface UserDropdownProps {
  isOpen: boolean
  hideDropdown: () => void
}

function UserDropdown({ isOpen, hideDropdown }: UserDropdownProps) {
  const { darkMode, toggleDarkMode } = useConceptTheme();
  const router = useConceptNavigation();
  const { user, logout } = useAuth();

  const navigateProfile = () => {
    hideDropdown();
    router.push('/profile');
  };

  const logoutAndRedirect =
  () => {
    hideDropdown();
    logout(() => router.push('/login/'));
  };

  return (
  <Dropdown className='w-36' stretchLeft isOpen={isOpen}>
    <DropdownButton
      text={user?.username}
      title='Профиль пользователя'
      onClick={navigateProfile}
    />
    <DropdownButton
      text={darkMode ? 'Светлая тема' : 'Темная тема'}
      title='Переключение темы оформления'
      onClick={toggleDarkMode}
    />
    <DropdownButton
      text='Выйти...'
      className='font-semibold'
      onClick={logoutAndRedirect}
    />
  </Dropdown>);
}

export default UserDropdown;