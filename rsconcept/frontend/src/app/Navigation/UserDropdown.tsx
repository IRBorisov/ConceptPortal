import { LuLogOut, LuMoon, LuSun } from 'react-icons/lu';

import { IconHelp, IconHelpOff, IconUser } from '@/components/Icons';
import Dropdown from '@/components/ui/Dropdown';
import DropdownButton from '@/components/ui/DropdownButton';
import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { useConceptOptions } from '@/context/OptionsContext';

import { urls } from '../urls';

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
    router.push(urls.profile);
  }

  function logoutAndRedirect() {
    hideDropdown();
    logout(() => router.push(urls.login));
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
        icon={<IconUser size='1rem' />}
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
        icon={showHelp ? <IconHelp size='1rem' /> : <IconHelpOff size='1rem' />}
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
