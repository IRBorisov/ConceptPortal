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
      tooltip='Профиль пользователя'
      onClick={navigateProfile}
    >
      {user?.username}
    </DropdownButton>
    <DropdownButton
      tooltip='Переключение темы оформления'
      onClick={toggleDarkMode}
    >
      {darkMode ? 'Светлая тема' : 'Темная тема'}
    </DropdownButton>
    <DropdownButton onClick={logoutAndRedirect}>
      <b>Выйти...</b>
    </DropdownButton>
  </Dropdown>);
}

export default UserDropdown;
