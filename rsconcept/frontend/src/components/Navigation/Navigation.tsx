import { useNavigate } from 'react-router-dom';
import TopSearch from './TopSearch';
import { EducationIcon, LibraryIcon } from '../Icons';
import NavigationButton from './NavigationButton';
import UserMenu from './UserMenu';
import { useAuth } from '../../context/AuthContext';
import UserTools from './UserTools';
import Logo from './Logo';

function Navigation() {
  const {user} = useAuth();
  const navigate = useNavigate();

  const navigateCommon = () => navigate('/rsforms?filter=common');
  const navigateHelp = () => navigate('/manuals');
  
  return (
    <nav className='bg-white dark:bg-gray-700 border-b-2 border-gray-400 rounded dark:border-gray-300 px-4 py-2.5 sticky top-0 left-0 right-0 z-50 h-[4rem]'>
      <div className='flex items-center justify-between '>
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
      </div>
    </nav>
  );
}

export default Navigation;
