import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAuth } from '../../context/AuthContext';
import { BellIcon, PlusIcon, SquaresIcon } from '../Icons';
import NavigationButton from './NavigationButton';

function UserTools() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const navigateCreateRSForm = () => { navigate('/rsform-create'); };
  const navigateMyWork = () => { navigate('/library?filter=personal'); };

  const handleNotifications = () => {
    toast.info('Уведомления в разработке');
  };

  return (
    <div className='flex items-center px-2 border-r-2 border-gray-400 dark:border-gray-300'>
      <span>
        <NavigationButton description='Новая схема'
          icon={<PlusIcon />}
          onClick={navigateCreateRSForm}
          colorClass='text-blue-500 hover:text-blue-700 dark:text-orange-500 dark:hover:text-orange-300'
        />
      </span>
      <NavigationButton icon={<SquaresIcon />} description='Мои схемы' onClick={navigateMyWork} />
      { user && user.is_staff && <NavigationButton icon={<BellIcon />} description='Уведомления' onClick={handleNotifications} />}
    </div>
  );
}

export default UserTools;
