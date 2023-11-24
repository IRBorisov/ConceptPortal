import { useLayoutEffect } from 'react';

import { useAuth } from '../context/AuthContext';
import { useConceptNavigation } from '../context/NagivationContext';
import { TIMEOUT_UI_REFRESH } from '../utils/constants';

function HomePage() {
  const { navigateTo } = useConceptNavigation();
  const { user } = useAuth();
  
  useLayoutEffect(() => {
    if (!user) {
      setTimeout(() => {
        navigateTo('/manuals');
      }, TIMEOUT_UI_REFRESH);
    } else {
      setTimeout(() => {
        navigateTo('/library');
      }, TIMEOUT_UI_REFRESH);
    }
  }, [navigateTo, user])

  return (
    <div className='flex flex-col items-center justify-center w-full px-4 py-2'>
      { user?.is_staff && <p>Лендинг находится в разработке. Данная страница видна только пользователям с правами администратора.</p> }
    </div>
  );
}

export default HomePage;
