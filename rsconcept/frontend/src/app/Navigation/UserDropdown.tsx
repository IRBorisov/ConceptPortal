import { LuLightbulb, LuLightbulbOff, LuLogOut, LuMoon, LuSun, LuUserCircle2 } from 'react-icons/lu';

import Dropdown from '@/components/ui/Dropdown';
import DropdownButton from '@/components/ui/DropdownButton';
import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { useConceptOptions } from '@/context/OptionsContext';

interface UserDropdownProps {
  isOpen: boolean;
  hideDropdown: () => void;
}

function UserDropdown({ isOpen, hideDropdown }: UserDropdownProps) {
  const { darkMode, toggleDarkMode, showHelp, toggleShowHelp } = useConceptOptions();
  const router = useConceptNavigation();
  const { user, logout } = useAuth();

  function navigateProfile() {
    hideDropdown();
    router.push('/profile');
  }

  function logoutAndRedirect() {
    hideDropdown();
    logout(() => router.push('/login/'));
  }

  function handleToggleDarkMode() {
    hideDropdown();
    toggleDarkMode();
  }

  return (
    <Dropdown className='min-w-[18ch] max-w-[12rem]' stretchLeft isOpen={isOpen}>
      <DropdownButton
        text={user?.username}
        title='Профиль пользователя'
        icon={<LuUserCircle2 size='1rem' />}
        onClick={navigateProfile}
      />
      <DropdownButton
        text={darkMode ? 'Тема: Темная' : 'Тема: Светлая'}
        icon={darkMode ? <LuMoon size='1rem' /> : <LuSun size='1rem' />}
        title='Переключение темы оформления'
        onClick={handleToggleDarkMode}
      />
      <DropdownButton
        text={showHelp ? 'Помощь: Вкл' : 'Помощь: Выкл'}
        icon={showHelp ? <LuLightbulb size='1rem' /> : <LuLightbulbOff size='1rem' />}
        title='Отображение иконок подсказок'
        onClick={toggleShowHelp}
      />
      <DropdownButton
        text='Выйти...'
        className='font-semibold'
        icon={<LuLogOut size='1rem' />}
        onClick={logoutAndRedirect}
      />
    </Dropdown>
  );
}

export default UserDropdown;
