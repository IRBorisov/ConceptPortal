import {
  IconAdmin,
  IconAdminOff,
  IconDarkTheme,
  IconDatabase,
  IconHelp,
  IconHelpOff,
  IconLightTheme,
  IconLogout,
  IconUser
} from '@/components/Icons';
import { CProps } from '@/components/props';
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
  const { darkMode, adminMode, toggleAdminMode, toggleDarkMode, showHelp, toggleShowHelp } = useConceptOptions();
  const router = useConceptNavigation();
  const { user, logout } = useAuth();

  function navigateProfile(event: CProps.EventMouse) {
    hideDropdown();
    router.push(urls.profile, event.ctrlKey || event.metaKey);
  }

  function logoutAndRedirect() {
    hideDropdown();
    logout(() => router.push(urls.login));
  }

  function gotoAdmin() {
    hideDropdown();
    logout(() => router.push(urls.admin, true));
  }

  function handleToggleDarkMode() {
    hideDropdown();
    toggleDarkMode();
  }

  return (
    <Dropdown className='mt-[1.5rem] min-w-[18ch] max-w-[12rem]' stretchLeft isOpen={isOpen}>
      <DropdownButton
        text={user?.username}
        title='Профиль пользователя'
        icon={<IconUser size='1rem' />}
        onClick={navigateProfile}
      />
      <DropdownButton
        text={darkMode ? 'Тема: Темная' : 'Тема: Светлая'}
        icon={darkMode ? <IconDarkTheme size='1rem' /> : <IconLightTheme size='1rem' />}
        title='Переключение темы оформления'
        onClick={handleToggleDarkMode}
      />
      <DropdownButton
        text={showHelp ? 'Помощь: Вкл' : 'Помощь: Выкл'}
        icon={showHelp ? <IconHelp size='1rem' /> : <IconHelpOff size='1rem' />}
        title='Отображение иконок подсказок'
        onClick={toggleShowHelp}
      />
      {user?.is_staff ? (
        <DropdownButton
          text={adminMode ? 'Админ: Вкл' : 'Админ: Выкл'}
          icon={adminMode ? <IconAdmin size='1rem' /> : <IconAdminOff size='1rem' />}
          title='Работа в режиме администратора'
          onClick={toggleAdminMode}
        />
      ) : null}
      {user?.is_staff ? (
        <DropdownButton text='База данных' icon={<IconDatabase size='1rem' />} onClick={gotoAdmin} />
      ) : null}
      <DropdownButton
        text='Выйти...'
        className='font-semibold'
        icon={<IconLogout size='1rem' />}
        onClick={logoutAndRedirect}
      />
    </Dropdown>
  );
}

export default UserDropdown;
