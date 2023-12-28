import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NavigationContext';

import TextURL from './Common/TextURL';

function ExpectedAnonymous() {
  const { user, logout } = useAuth();
  const router = useConceptNavigation();

  function logoutAndRedirect() {
    logout(() => router.push('/login/'));
  }

  return (
    <div className='flex flex-col items-center gap-3 py-6'>
      <p className='font-semibold'>{`Вы вошли в систему как ${user?.username ?? ''}`}</p>
      <div className='flex gap-3'>
        <TextURL text='Новая схема' href='/library/create' />
        <span> | </span>
        <TextURL text='Библиотека' href='/library' />
        <span> | </span>
        <TextURL text='Справка' href='/manuals' />
        <span> | </span>
        <span className='cursor-pointer hover:underline clr-text-url' onClick={logoutAndRedirect}>
          Выйти
        </span>
      </div>
    </div>
  );
}

export default ExpectedAnonymous;
