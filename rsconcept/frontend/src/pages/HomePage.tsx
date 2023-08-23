import { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { TIMEOUT_UI_REFRESH } from '../utils/constants';

function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useLayoutEffect(() => {
    if (!user) {
      setTimeout(() => {
        navigate('/manuals');
      }, TIMEOUT_UI_REFRESH);
    } else if(!user.is_staff) {
      setTimeout(() => {
        navigate('/library?filter=personal');
      }, TIMEOUT_UI_REFRESH);
    }
  }, [navigate, user])

  return (
    <div className='flex flex-col items-center justify-center w-full py-2'>
      <p>Лендинг находится в разработке. Данная страница видна только пользователям с правами администратора.</p>
    </div>
  );
}

export default HomePage;
