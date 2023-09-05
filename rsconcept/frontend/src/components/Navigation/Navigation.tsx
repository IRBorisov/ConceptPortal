import { useConceptNavigation } from '../../context/NagivationContext';
import { useConceptTheme } from '../../context/ThemeContext';
import { EducationIcon, LibraryIcon, PlusIcon } from '../Icons';
import Logo from './Logo'
import NavigationButton from './NavigationButton';
import UserMenu from './UserMenu';

function Navigation () {
  const { navigateTo } = useConceptNavigation();
  const { noNavigation, toggleNoNavigation } = useConceptTheme();

  const navigateLibrary = () => navigateTo('/library');
  const navigateHelp = () => navigateTo('/manuals');
  const navigateCreateNew = () => navigateTo('/rsform-create');

  return (
    <nav className='sticky top-0 left-0 right-0 select-none z-navigation h-fit'>
      {!noNavigation &&
      <button
        title='Скрыть навигацию'
        className='absolute top-0 right-0 z-navigation w-[1.2rem] h-[3rem] border-b-2 border-l-2 clr-btn-nav rounded-none'
        onClick={toggleNoNavigation}
        tabIndex={-1}
      >
        <p>{'>'}</p><p>{'>'}</p>
      </button>}
      {noNavigation &&
      <button
        title='Показать навигацию'
        className='absolute top-0 right-0 z-navigation px-1 h-[1.6rem] border-b-2 border-l-2 clr-btn-nav rounded-none'
        onClick={toggleNoNavigation}
        tabIndex={-1}
      >
        {'∨∨∨'}
      </button>}
      {!noNavigation &&
      <div className='flex items-stretch justify-between pl-2 pr-[0.8rem] border-b-2 rounded-none h-[3rem]'>
        <div className='flex items-center justify-start'>
          <Logo title='КонцептПортал' />
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
      </div>}
    </nav>
  );
}

export default Navigation;
