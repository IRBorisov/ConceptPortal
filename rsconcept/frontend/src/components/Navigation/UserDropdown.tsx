import Dropdown from '@/components/Common/Dropdown';
import DropdownButton from '@/components/Common/DropdownButton';
import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NagivationContext';
import { useConceptTheme } from '@/context/ThemeContext';

interface UserDropdownProps {
  hideDropdown: () => void
}

function UserDropdown({ hideDropdown }: UserDropdownProps) {
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
  <Dropdown dimensions='w-36' stretchLeft>
    <DropdownButton
      text={user?.username}
      tooltip='Профиль пользователя'
      onClick={navigateProfile}
    />
    <DropdownButton
      text={darkMode ? 'Светлая тема' : 'Темная тема'}
      tooltip='Переключение темы оформления'
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