import { useNavigate } from 'react-router-dom';
import TopSearch from './TopSearch';
import { EducationIcon, LibraryIcon } from '../Icons';
import NavigationButton from './NavigationButton';
import UserMenu from './UserMenu';
import { useAuth } from '../../context/AuthContext';
import UserTools from './UserTools';
import Logo from './Logo';
import { useState } from 'react';

function Navigation() {
  const {user} = useAuth();
  const navigate = useNavigate();
  const [isActive, setActive] = useState(true);

  const navigateCommon = () => navigate('/rsforms?filter=common');
  const navigateHelp = () => navigate('/manuals');
  
  return (
    <nav className='sticky top-0 left-0 right-0 z-50'>
      {isActive && 
      <button
        title='Скрыть навигацию'
        className='absolute top-0 right-0 z-[60] w-[1.2rem] h-[4rem] border-b-2 border-l-2 clr-nav rounded-none'
        onClick={() => setActive(!isActive)}
      >
        <p>{'>'}</p><p>{'>'}</p>
      </button>}
      {!isActive && 
      <button
        title='Показать навигацию'
        className='absolute top-0 right-0 z-[60] w-[4rem] h-[1.6rem] border-b-2 border-l-2 clr-nav  rounded-none'
        onClick={() => setActive(!isActive)}
      >
        {'∨∨∨'}
      </button>}
      {isActive && 
      <div className='pr-6 pl-2 py-2.5 h-[4rem] flex items-center justify-between border-b-2 clr-nav rounded-none'>
        <div className='flex items-start justify-start '>
          <Logo title='КонцептПортал' />
          <TopSearch placeholder='Поиск схемы...' />
        </div>
        <div className='flex items-center'>
          {user && <UserTools/>}
          <div className='flex items-center pl-2'>
            <NavigationButton icon={<LibraryIcon />} description='Общие схемы' onClick={navigateCommon} />
            <NavigationButton icon={<EducationIcon />} description='Справка' onClick={navigateHelp} />
            <UserMenu />
          </div>
        </div>
      </div>}
    </nav>
  );
}

export default Navigation;
