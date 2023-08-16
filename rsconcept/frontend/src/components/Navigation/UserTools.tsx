import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import ConceptTooltip from '../Common/ConceptTooltip';
import TextURL from '../Common/TextURL';
import { PlusIcon, SquaresIcon } from '../Icons';
import NavigationButton from './NavigationButton';

function UserTools() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const navigateCreateRSForm = () => navigate('/rsform-create');
  const navigateMyWork = () => navigate('/library?filter=personal');

  return (
    <div className='flex items-center px-2 border-r-2 border-gray-400 dark:border-gray-300'>
      <span>
        { user && 
        <NavigationButton 
          description='Новая схема'
          icon={<PlusIcon />}
          onClick={navigateCreateRSForm}
          colorClass='text-blue-500 hover:text-blue-700 dark:text-orange-500 dark:hover:text-orange-300'
        />}
        { !user &&
        <NavigationButton id='items-nav-help'
          icon={<PlusIcon />}
        />}
        <ConceptTooltip anchorSelect='#items-nav-help' clickable>
          <div className='flex flex-col cursor-default'>
            <p>Создание и редактирование концептуальных схем</p>
            <p>доступно только <b>зарегистрированным пользователям</b></p>
            <div className='flex flex-col self-center'>
              <TextURL text='Войти в систему' href='/login'/>
              <TextURL text='Зарегистрироваться' href='/signup'/>
            </div>
          </div>
        </ConceptTooltip>
      </span>
      { user && <NavigationButton icon={<SquaresIcon />} description='Мои схемы' onClick={navigateMyWork} /> }
    </div>
  );
}

export default UserTools;
