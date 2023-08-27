import { useNavigate } from 'react-router-dom';

import { useConceptTheme } from '../../context/ThemeContext';
import { EducationIcon, LibraryIcon } from '../Icons';
import Logo from './Logo'
import NavigationButton from './NavigationButton';
import UserMenu from './UserMenu';

function Navigation () {
  const navigate = useNavigate();
  const { noNavigation, toggleNoNavigation } = useConceptTheme();

  const navigateLibrary = () => navigate('/library');
  const navigateHelp = () => navigate('/manuals');

  return (
    <nav className='sticky top-0 left-0 right-0 z-50 select-none h-fit'>
      {!noNavigation &&
      <button
        title='Скрыть навигацию'
        className='absolute top-0 right-0 z-[60] w-[1.2rem] border-b-2 border-l-2 clr-nav rounded-none'
        onClick={toggleNoNavigation}
      >
        <p>{'>'}</p><p>{'>'}</p>
      </button>}
      {noNavigation &&
      <button
        title='Показать навигацию'
        className='absolute top-0 right-0 z-[60] px-1 h-[1.6rem] border-b-2 border-l-2 clr-nav  rounded-none'
        onClick={toggleNoNavigation}
      >
        {'∨∨∨'}
      </button>}
      {!noNavigation &&
      <div className='flex items-center justify-between py-1 pl-2 pr-6 border-b-2 rounded-none clr-nav'>
        <div className='flex items-center justify-start'>
          <Logo title='КонцептПортал' />
        </div>
        <div className='flex items-center'>
          <div className='flex items-center pl-2'>
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
        </div>
      </div>}
    </nav>
  );
}

export default Navigation;
