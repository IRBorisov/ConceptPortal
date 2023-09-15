import { useAuth } from '../../context/AuthContext';
import { useConceptNavigation } from '../../context/NagivationContext';
import { useConceptTheme } from '../../context/ThemeContext';
import { LibraryFilterStrategy } from '../../models/miscelanious';
import Dropdown from '../Common/Dropdown';
import DropdownButton from '../Common/DropdownButton';

interface UserDropdownProps {
  hideDropdown: () => void
}

function UserDropdown({ hideDropdown }: UserDropdownProps) {
  const { darkMode, toggleDarkMode } = useConceptTheme();
  const { navigateTo } = useConceptNavigation();
  const { user, logout } = useAuth();

  const navigateProfile = () => {
    hideDropdown();
    navigateTo('/profile');
  };

  const logoutAndRedirect =
  () => {
    hideDropdown();
    logout(() => navigateTo('/login/'));
  };

  const navigateMyWork = () => {
    hideDropdown();
    navigateTo(`/library?filter=${LibraryFilterStrategy.PERSONAL}`);
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
      <DropdownButton onClick={navigateMyWork}>
        Мои схемы
      </DropdownButton>
      <DropdownButton onClick={logoutAndRedirect}>
        <b>Выйти...</b>
      </DropdownButton>
    </Dropdown>
  );
}

export default UserDropdown;
