import { urls } from '@/app/urls';
import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NavigationContext';

import TextURL from '../ui/TextURL';

function ExpectedAnonymous() {
  const { user, logout } = useAuth();
  const router = useConceptNavigation();

  function logoutAndRedirect() {
    logout(() => router.push(urls.login));
  }

  return (
    <div className='cc-fade-in flex flex-col items-center gap-3 py-6'>
      <p className='font-semibold'>{`Вы вошли в систему как ${user?.username ?? ''}`}</p>
      <div className='flex gap-3'>
        <TextURL text='Новая схема' href='/library/create' />
        <span> | </span>
        <TextURL text='Библиотека' href='/library' />
        <span> | </span>
        <TextURL text='Справка' href='/manuals' />
        <span> | </span>
        <span className='cursor-pointer hover:underline text-sec-600' onClick={logoutAndRedirect}>
          Выйти
        </span>
      </div>
    </div>
  );
}

export default ExpectedAnonymous;
