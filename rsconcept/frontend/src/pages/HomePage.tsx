import { useLayoutEffect } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { TIMEOUT_UI_REFRESH } from '@/utils/constants';

function HomePage() {
  const router = useConceptNavigation();
  const { user } = useAuth();
  
  useLayoutEffect(() => {
    if (!user) {
      setTimeout(() => {
        router.push('/manuals');
      }, TIMEOUT_UI_REFRESH);
    } else {
      setTimeout(() => {
        router.push('/library');
      }, TIMEOUT_UI_REFRESH);
    }
  }, [router, user])

  return (
  <div className='flex flex-col items-center justify-center px-4 py-2'>
    {user?.is_staff ?
    <p>
      Лендинг находится в разработке. Данная страница видна только пользователям с правами администратора.
    </p>: null}
  </div>);
}

export default HomePage;