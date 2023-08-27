import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { useConceptTheme } from '../../context/ThemeContext';
import { LibraryFilterStrategy } from '../../utils/models';
import Dropdown from '../Common/Dropdown';
import DropdownButton from '../Common/DropdownButton';

interface UserDropdownProps {
  hideDropdown: () => void
}

function UserDropdown({ hideDropdown }: UserDropdownProps) {
  const { darkMode, toggleDarkMode } = useConceptTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigateProfile = () => {
    hideDropdown();
    navigate('/profile');
  };

  const logoutAndRedirect =
  () => {
    hideDropdown();
    logout(() => navigate('/login/'));
  };

  const navigateMyWork = () => {
    hideDropdown();
    navigate(`/library?filter=${LibraryFilterStrategy.PERSONAL}`);
  };

  return (
    <Dropdown widthClass='w-36' stretchLeft>
      <DropdownButton
        description='Профиль пользователя'
        onClick={navigateProfile}
      >
        {user?.username}
      </DropdownButton>
      <DropdownButton
        description='Переключение темы оформления'
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
