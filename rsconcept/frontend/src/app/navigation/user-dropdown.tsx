'use client';

import { localeLabel, useTx } from '@/i18n';

import { useAuth } from '@/features/auth';
import { useLogout } from '@/features/auth/backend/use-logout';

import { Dropdown, DropdownButton } from '@/components/dropdown';
import {
  IconAdmin,
  IconAdminOff,
  IconDarkTheme,
  IconDatabase,
  IconDBStructure,
  IconHelp,
  IconHelpOff,
  IconImage,
  IconLanguage,
  IconLightTheme,
  IconLogout,
  IconRESTapi,
  IconUser
} from '@/components/icons';
import { usePreferencesStore } from '@/stores/preferences';
import { globalIDs } from '@/utils/constants';

import { urls } from '../urls';

import { useConceptNavigation } from './navigation-context';

interface UserDropdownProps {
  isOpen: boolean;
  hideDropdown: () => void;
}

export function UserDropdown({ isOpen, hideDropdown }: UserDropdownProps) {
  const tx = useTx();
  const router = useConceptNavigation();
  const { user } = useAuth();
  const { logout } = useLogout();

  const locale = usePreferencesStore(state => state.locale);
  const setLocale = usePreferencesStore(state => state.setLocale);
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

  function pickLocale(next: typeof locale) {
    setLocale(next);
    hideDropdown();
  }

  return (
    <Dropdown id={globalIDs.user_dropdown} className='min-w-[18ch] max-w-48' stretchLeft isOpen={isOpen}>
      <DropdownButton
        text={user.username}
        title={tx('nav.user.profileTitle')}
        icon={<IconUser size='1rem' />}
        onClick={navigateProfile}
      />
      <DropdownButton
        text={darkMode ? tx('nav.theme.dark') : tx('nav.theme.light')}
        title={tx('nav.theme.toggleTitle')}
        icon={darkMode ? <IconDarkTheme size='1rem' /> : <IconLightTheme size='1rem' />}
        onClick={handleToggleDarkMode}
      />
      <DropdownButton
        text={showHelp ? tx('nav.help.on') : tx('nav.help.off')}
        title={tx('nav.help.toggleTitle')}
        icon={showHelp ? <IconHelp size='1rem' /> : <IconHelpOff size='1rem' />}
        onClick={toggleShowHelp}
      />
      {user.is_staff ? (
        <DropdownButton
          text={adminMode ? tx('nav.admin.on') : tx('nav.admin.off')}
          title={tx('nav.admin.toggleTitle')}
          icon={adminMode ? <IconAdmin size='1rem' /> : <IconAdminOff size='1rem' />}
          onClick={toggleAdminMode}
        />
      ) : null}
      <div className='px-3 py-1 text-muted-foreground border-t text-nowrap'>
        {tx('nav.language.label')}
      </div>
      <DropdownButton
        text={localeLabel('en')}
        title={localeLabel('en')}
        icon={<IconLanguage size='1rem' />}
        data-testid='locale-option-en'
        className={locale === 'en' ? 'bg-accent' : undefined}
        onClick={() => pickLocale('en')}
      />
      <DropdownButton
        text={localeLabel('fr')}
        title={localeLabel('fr')}
        icon={<IconLanguage size='1rem' />}
        data-testid='locale-option-fr'
        className={locale === 'fr' ? 'bg-accent' : undefined}
        onClick={() => pickLocale('fr')}
      />
      <DropdownButton
        text={localeLabel('ru')}
        title={localeLabel('ru')}
        icon={<IconLanguage size='1rem' />}
        data-testid='locale-option-ru'
        className={locale === 'ru' ? 'bg-accent' : undefined}
        onClick={() => pickLocale('ru')}
      />

      {user.is_staff ? (
        <DropdownButton
          text={tx('nav.link.restApi')}
          title={tx('nav.link.restApiTitle')}
          icon={<IconRESTapi size='1rem' />}
          className='border-t'
          onClick={gotoRestApi}
        />
      ) : null}
      {user.is_staff ? (
        <DropdownButton
          text={tx('nav.link.database')}
          title={tx('nav.link.databaseTitle')}
          icon={<IconDatabase size='1rem' />}
          onClick={gotoAdmin}
        />
      ) : null}
      {user?.is_staff ? (
        <DropdownButton
          text={tx('nav.link.icons')}
          title={tx('nav.link.iconsTitle')}
          icon={<IconImage size='1rem' />}
          onClick={gotoIcons}
        />
      ) : null}
      {user.is_staff ? (
        <DropdownButton
          text={tx('nav.link.dbStructure')}
          title={tx('nav.link.dbStructureTitle')}
          icon={<IconDBStructure size='1rem' />}
          onClick={gotoDatabaseSchema}
          className='border-b'
        />
      ) : null}
      <DropdownButton
        text={tx('nav.action.logout')}
        title={tx('nav.action.logoutTitle')}
        className='font-semibold'
        icon={<IconLogout size='1rem' />}
        onClick={logoutAndRedirect}
      />
    </Dropdown>
  );
}
