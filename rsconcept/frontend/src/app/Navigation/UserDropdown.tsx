import { useAuthSuspense } from '@/features/auth';
import { useLogout } from '@/features/auth/backend/useLogout';

import { Dropdown, DropdownButton } from '@/components/Dropdown';
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
import { usePreferencesStore } from '@/stores/preferences';
import { globalIDs } from '@/utils/constants';

import { urls } from '../urls';

import { useConceptNavigation } from './NavigationContext';

interface UserDropdownProps {
  isOpen: boolean;
  hideDropdown: () => void;
}

export function UserDropdown({ isOpen, hideDropdown }: UserDropdownProps) {
  const router = useConceptNavigation();
  const { user } = useAuthSuspense();
  const { logout } = useLogout();

  const darkMode = usePreferencesStore(state => state.darkMode);
  const toggleDarkMode = usePreferencesStore(state => state.toggleDarkMode);
  const showHelp = usePreferencesStore(state => state.showHelp);
  const toggleShowHelp = usePreferencesStore(state => state.toggleShowHelp);
  const adminMode = usePreferencesStore(state => state.adminMode);
  const toggleAdminMode = usePreferencesStore(state => state.toggleAdminMode);

  function navigateProfile(event: React.MouseEvent<Element>) {
    hideDropdown();
    router.push({ path: urls.profile, newTab: event.ctrlKey || event.metaKey });
  }

  function logoutAndRedirect() {
    hideDropdown();
    void logout().then(() => router.push({ path: urls.login, force: true }));
  }

  function gotoAdmin() {
    hideDropdown();
    void logout().then(() => router.push({ path: urls.admin, force: true, newTab: true }));
  }

  function gotoIcons(event: React.MouseEvent<Element>) {
    hideDropdown();
    router.push({ path: urls.icons, newTab: event.ctrlKey || event.metaKey });
  }

  function gotoRestApi() {
    hideDropdown();
    router.push({ path: urls.rest_api, newTab: true });
  }

  function gotoDatabaseSchema(event: React.MouseEvent<Element>) {
    hideDropdown();
    router.push({ path: urls.database_schema, newTab: event.ctrlKey || event.metaKey });
  }

  function handleToggleDarkMode() {
    toggleDarkMode();
    hideDropdown();
  }

  return (
    <Dropdown id={globalIDs.user_dropdown} className='min-w-[18ch] max-w-48' stretchLeft isOpen={isOpen}>
      <DropdownButton
        text={user.username}
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
      {user.is_staff ? (
        <DropdownButton
          text={adminMode ? 'Админ: Вкл' : 'Админ: Выкл'}
          icon={adminMode ? <IconAdmin size='1rem' /> : <IconAdminOff size='1rem' />}
          title='Работа в режиме администратора'
          onClick={toggleAdminMode}
        />
      ) : null}
      {user.is_staff ? (
        <DropdownButton
          text='REST API' //
          icon={<IconRESTapi size='1rem' />}
          className='border-t'
          onClick={gotoRestApi}
        />
      ) : null}
      {user.is_staff ? (
        <DropdownButton
          text='База данных' //
          icon={<IconDatabase size='1rem' />}
          onClick={gotoAdmin}
        />
      ) : null}
      {user?.is_staff ? (
        <DropdownButton
          text='Иконки' //
          icon={<IconImage size='1rem' />}
          onClick={gotoIcons}
        />
      ) : null}
      {user.is_staff ? (
        <DropdownButton
          text='Структура БД' //
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
