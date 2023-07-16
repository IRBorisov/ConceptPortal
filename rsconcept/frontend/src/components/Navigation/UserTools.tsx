import { useNavigate } from 'react-router-dom';
import NavigationButton from './NavigationButton';
import { PlusIcon, SquaresIcon } from '../Icons';

function UserTools() {
  const navigate = useNavigate();;
  
  const navigateCreateRSForm = () => {
    navigate('/rsform-create');
  };

  const navigateMyWork = () => {
    navigate('/rsforms?filter=personal');
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
      <NavigationButton icon={<SquaresIcon />} description='Рабочие схемы' onClick={navigateMyWork} />
    </div>
  );
}

export default UserTools;