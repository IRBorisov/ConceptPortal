import { useConceptNavigation } from '@/context/NagivationContext';
import { useConceptTheme } from '@/context/ThemeContext';

import { EducationIcon, LibraryIcon, PlusIcon } from '@/components/Icons';
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
  <nav className='sticky top-0 left-0 right-0 select-none clr-app z-navigation'>
    <ToggleNavigationButton />
    {!noNavigation ?
    <div className='flex items-stretch justify-between pl-2 pr-[0.8rem] border-b-2 rounded-none h-[3rem]'>
      <div className='flex items-center mr-2 cursor-pointer' onClick={navigateHome} tabIndex={-1}>
        <Logo />
      </div>
      <div className='flex items-center h-full'>
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
