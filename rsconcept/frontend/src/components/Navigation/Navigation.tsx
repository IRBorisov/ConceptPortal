import clsx from 'clsx';

import { EducationIcon, LibraryIcon, PlusIcon } from '@/components/Icons';
import { useConceptNavigation } from '@/context/NagivationContext';
import { useConceptTheme } from '@/context/ThemeContext';

import Logo from './Logo';
import NavigationButton from './NavigationButton';
import ToggleNavigationButton from './ToggleNavigationButton';
import UserMenu from './UserMenu';

function Navigation () {
  const router = useConceptNavigation();
  const { noNavigation } = useConceptTheme();

  const navigateHome = () => router.push('/');
  const navigateLibrary = () => router.push('/library');
  const navigateHelp = () => router.push('/manuals');
  const navigateCreateNew = () => router.push('/library/create');

  return (
  <nav className={clsx(
    'z-navigation',
    'sticky top-0 left-0 right-0', 
    'clr-app',
    'select-none'
  )}>
    <ToggleNavigationButton />
    {!noNavigation ?
    <div
      className={clsx(
        'pl-2 pr-[0.8rem] h-[3rem]',
        'flex justify-between',
        'border-b-2 rounded-none'
      )}
    >
      <div className='flex items-center mr-2 cursor-pointer' onClick={navigateHome} tabIndex={-1}>
        <Logo />
      </div>
      <div className='flex'>
        <NavigationButton
          text='Новая схема'
          description='Создать новую схему'
          icon={<PlusIcon />}
          onClick={navigateCreateNew}
        />
        <NavigationButton
          text='Библиотека'
          description='Библиотека концептуальных схем'
          icon={<LibraryIcon />}
          onClick={navigateLibrary}
        />
        <NavigationButton
          text='Справка'
          description='Справочные материалы и обучение'
          icon={<EducationIcon />}
          onClick={navigateHelp}
        />
        <UserMenu />
      </div>
    </div> : null}
  </nav>);
}

export default Navigation;