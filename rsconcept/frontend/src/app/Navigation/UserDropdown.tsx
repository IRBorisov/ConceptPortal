import {
  IconAdmin,
  IconAdminOff,
  IconDarkTheme,
  IconDatabase,
  IconDBStructure,
  IconHelp,
  IconHelpOff,
  IconImage,
  IconLightTheme,
  IconLogout,
  IconRESTapi,
  IconUser
} from '@/components/Icons';
import { CProps } from '@/components/props';
import Dropdown from '@/components/ui/Dropdown';
import DropdownButton from '@/components/ui/DropdownButton';
import { useAuth } from '@/context/AuthContext';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { useConceptNavigation } from '@/context/NavigationContext';

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

  function gotoIcons(event: CProps.EventMouse) {
    hideDropdown();
    router.push(urls.icons, event.ctrlKey || event.metaKey);
  }

  function gotoRestApi() {
    hideDropdown();
    router.push(urls.rest_api, true);
  }

  function gotoDatabaseSchema(event: CProps.EventMouse) {
    hideDropdown();
    router.push(urls.database_schema, event.ctrlKey || event.metaKey);
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
        <DropdownButton
          text='REST API' // prettier: split-line
          icon={<IconRESTapi size='1rem' />}
          className='border-t'
          onClick={gotoRestApi}
        />
      ) : null}
      {user?.is_staff ? (
        <DropdownButton
          text='База данных' // prettier: split-line
          icon={<IconDatabase size='1rem' />}
          onClick={gotoAdmin}
        />
      ) : null}
      {user?.is_staff ? (
        <DropdownButton
          text='Иконки' // prettier: split-line
          icon={<IconImage size='1rem' />}
          onClick={gotoIcons}
        />
      ) : null}
      {user?.is_staff ? (
        <DropdownButton
          text='Структура БД' // prettier: split-line
          icon={<IconDBStructure size='1rem' />}
          onClick={gotoDatabaseSchema}
          className='border-b'
        />
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
